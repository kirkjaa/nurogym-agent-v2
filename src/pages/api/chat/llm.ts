/* eslint-disable @typescript-eslint/no-explicit-any */

import { OpenAI, AzureOpenAI } from 'openai/index.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMConfig {
  messages: any[];
  serviceProvider: string;
  template: any;
  chatModel: string;
}

export async function callLLM({ messages, serviceProvider, template, chatModel }: LLMConfig) {
  switch (serviceProvider) {
    case 'openai':
      const openAiApiKey = process.env.OPENAI_API_KEY;

      if (!openAiApiKey) {
        console.error('OPENAI_API_KEY is not defined in environment variables.');
        throw new Error('Required environment variables not defined');
      }

      const openai = new OpenAI({ apiKey: openAiApiKey });
      return openai.chat.completions.create({
        model: chatModel,
        stream: true,
        messages: [template, ...messages],
      });

    case 'azure_openai':
      const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
      const apiEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT;
      const apiVersion = process.env.AZURE_OPENAI_CHAT_API_VERSION;
      const deploymentName = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME;

      if (!azureApiKey || !apiEndpoint || !apiVersion || !deploymentName) {
        console.error('One or more Azure OpenAI environment variables are not defined.');
        throw new Error('Required environment variables not defined');
      }

      const azureOpenAi = new AzureOpenAI({
        apiKey: azureApiKey,
        apiVersion,
        endpoint: apiEndpoint,
        deployment: deploymentName,
      });

      return azureOpenAi.chat.completions.create({
        model: chatModel,
        stream: true,
        messages: [template, ...messages],
      });

    case 'openrouter':
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      

      if (!openRouterApiKey) {
        console.error('OPENROUTER_API_KEY is not defined in environment variables.');
        throw new Error('Required environment variables not defined');
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: chatModel,
          messages: [template, ...messages],
        }),
      });

      if (!response.ok) {
        throw new Error('Error calling OpenRouter API');
      }

      return response.json();
      
    case 'gemini':
      const geminiApiKey = process.env.GOOGLE_API_KEY;

      if (!geminiApiKey) {
        console.error('GOOGLE_API_KEY is not defined in environment variables.');
        throw new Error('Required environment variables not defined');
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: chatModel || 'gemini-3-flash-preview',
        systemInstruction: template.content,
      });

      let historyMessages = messages.slice(0, -1);
      while (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
        historyMessages = historyMessages.slice(1);
      }

      const geminiHistory = historyMessages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const lastUserMessage = messages[messages.length - 1];
      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessageStream(lastUserMessage.content);
      return result.stream;

    default:
      throw new Error('Unsupported service provider');
  }
}
