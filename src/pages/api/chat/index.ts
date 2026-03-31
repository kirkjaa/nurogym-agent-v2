export const runtime = 'edge';

import { StreamingTextResponse, OpenAIStream } from 'ai';
import { createTemplate } from '@/templates/systemPrompt';
import { NextResponse } from 'next/server';
import { callLLM } from './llm';

// Default time-sensitive patterns (config is loaded server-side only, so we use defaults in edge runtime)
const DEFAULT_TIME_SENSITIVE_PATTERNS = /\b(latest|recent|current|2024|2025|2026|who\s+won|ranking|rankings|upcoming|news|champion|result|schedule)\b/i;

function isTimeSensitiveQuery(message: string): boolean {
  return DEFAULT_TIME_SENSITIVE_PATTERNS.test(message);
}

async function fetchWebSearch(baseUrl: string, query: string): Promise<string> {
  try {
    const searchUrl = `${baseUrl}/api/search`;
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, numResults: 5, timeRange: 'month' }),
    });

    if (!response.ok) return '';

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) return '';

    return results
      .map((r: { title: string; content: string; url: string }) =>
        `**${r.title}**\n${r.content}\nSource: ${r.url}`
      )
      .join('\n\n---\n\n');
  } catch (err) {
    console.error('Web search fetch error:', err);
    return '';
  }
}

async function handler(req: Request) {
  const serviceProvider = process.env.SERVICE_PROVIDER;
  console.log(`Service provider: ${serviceProvider}`);

  const clientUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/chroma`
    : null;

  const searchBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || '';

  if (!clientUrl) {
    console.error('NEXT_PUBLIC_FRONTEND_URL is not defined in environment variables.');
    return NextResponse.json({ error: 'Required environment variables not defined' }, { status: 500 });
  }

  let chatModel;

  try {
    if (!serviceProvider) {
      throw new Error('SERVICE_PROVIDER is not defined in environment variables.');
    }

    if (serviceProvider === 'openai') {
      chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-3.5-turbo';
    } else if (serviceProvider === 'azure_openai') {
      chatModel = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-3.5-turbo';
    } else if (serviceProvider === 'openrouter') {
      chatModel = process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-3.5-turbo';
    } else if (serviceProvider === 'gemini') {
      chatModel = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
    } else {
      throw new Error('Unsupported service provider');
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred');
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }

  try {
    const { messages } = await req.json();
    const lastMessageObject = messages[messages.length - 1];

    if (typeof lastMessageObject?.content !== 'string' || lastMessageObject.role !== 'user') {
      throw new Error('Invalid message format or non-user message');
    }

    const lastMessage = lastMessageObject.content;
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    let docContext = '';
    try {
      const response = await fetch(clientUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: lastMessage }),
      });

      if (!response.ok) {
        throw new Error('Error fetching document context from Chroma API');
      }

      const data = await response.json();
      docContext = JSON.stringify(data.documents);
    } catch (err) {
      console.error('Error querying the Chroma API:', err);
      docContext = '';
    }

    let webSearchContext: string | undefined;
    if (isTimeSensitiveQuery(lastMessage)) {
      console.log('Time-sensitive query detected, fetching web search results...');
      const searchResult = await fetchWebSearch(searchBaseUrl, lastMessage);
      if (searchResult) {
        webSearchContext = searchResult;
      }
    }

    const template = createTemplate({ docContext, webSearchContext, userMessage: lastMessage });
    console.log(`Message sent to LLM (length: ${template.content.length} chars)`);

    let recentMessages = messages.slice(-10);
    while (recentMessages.length > 1 && recentMessages[0].role !== 'user') {
      recentMessages = recentMessages.slice(1);
    }

    const response = await callLLM({
      messages: recentMessages,
      serviceProvider,
      template,
      chatModel
    });

    let stream;
    if (serviceProvider === 'openrouter') {
      const messageContent = response.choices[0].message.content;
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(messageContent));
          controller.close();
        }
      });
      stream = readableStream;
    } else if (serviceProvider === 'gemini') {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const chunkText = chunk.text();
              controller.enqueue(encoder.encode(chunkText));
            }
          } catch (err) {
            console.error('Error processing Gemini stream:', err);
          } finally {
            controller.close();
          }
        }
      });
      stream = readableStream;
    } else {
      stream = OpenAIStream(response);
    }

    return new StreamingTextResponse(stream);

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error('Unknown error occurred');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}

export default handler;
