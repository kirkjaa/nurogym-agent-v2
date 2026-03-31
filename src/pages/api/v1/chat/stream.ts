export const runtime = 'nodejs';

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChromaClient } from 'chromadb';
import { initialiseDb, getEnvVar, parseChromaUrl } from '@/scripts/initialiseDb';
import { createTemplate } from '@/templates/systemPrompt';
import { getCoachConfig } from '@/lib/config/coachConfig';

function getTimeSensitivePattern(): RegExp {
    const config = getCoachConfig();
    const patterns = config.webSearch.timeSensitivePatterns;

    // Default patterns if none configured
    const defaultPatterns = ['latest', 'recent', 'current', '2024', '2025', '2026', 'who\\s+won', 'ranking', 'rankings', 'upcoming', 'news', 'champion', 'result', 'schedule'];

    const allPatterns = patterns.length > 0 ? patterns : defaultPatterns;
    return new RegExp(`\\b(${allPatterns.join('|')})\\b`, 'i');
}

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['*'];

function setCors(req: NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin || '*';
    const allowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
    res.setHeader('Access-Control-Allow-Origin', allowed ? origin : ALLOWED_ORIGINS[0]);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400');
}

function validateApiKey(req: NextApiRequest): boolean {
    const requiredKey = process.env.V1_API_KEY;
    if (!requiredKey) return true;
    const providedKey = req.headers['x-api-key'];
    return providedKey === requiredKey;
}

async function queryChromaDB(queryText: string): Promise<string> {
    try {
        const chromaApiUrl = getEnvVar('CHROMA_DATABASE_URL');
        const chromaConfig = parseChromaUrl(chromaApiUrl);
        const client = new ChromaClient(chromaConfig);
        const collection = await initialiseDb(client);
        const result = await collection.query({ queryTexts: [queryText], nResults: 7 });
        return JSON.stringify(result.documents.flat());
    } catch (err) {
        console.error('ChromaDB query error:', err);
        return '';
    }
}

async function searchWeb(query: string): Promise<string> {
    try {
        const config = getCoachConfig();
        const searxngUrl = process.env.SEARXNG_URL || 'https://xng.quest.ac';

        // Build search query with configurable prefix
        const queryPrefix = config.webSearch.queryPrefix;
        const searchQuery = queryPrefix ? `${queryPrefix} ${query}` : query;

        const params = new URLSearchParams({
            q: searchQuery,
            format: 'json',
            categories: 'general',
        });

        const response = await fetch(`${searxngUrl}/search?${params.toString()}`, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) return '';
        const data = await response.json();
        const results = (data.results || []).slice(0, 5);
        if (results.length === 0) return '';

        return results
            .map((r: { title: string; content: string; url: string }) =>
                `**${r.title}**\n${r.content}\nSource: ${r.url}`
            )
            .join('\n\n---\n\n');
    } catch {
        return '';
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    setCors(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!validateApiKey(req)) {
        return res.status(401).json({ error: 'Invalid or missing API key' });
    }

    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const docContext = await queryChromaDB(message);
        const config = getCoachConfig();

        let webSearchContext: string | undefined;
        if (config.webSearch.enabled && getTimeSensitivePattern().test(message)) {
            const result = await searchWeb(message);
            if (result) webSearchContext = result;
        }

        const template = createTemplate({ docContext, webSearchContext, userMessage: message });

        const geminiApiKey = process.env.GOOGLE_API_KEY;
        if (!geminiApiKey) {
            res.write(`data: ${JSON.stringify({ error: 'Server configuration error' })}\n\n`);
            res.end();
            return;
        }

        const chatModel = process.env.GEMINI_CHAT_MODEL || 'gemini-3-flash-preview';
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: chatModel,
            systemInstruction: template.content,
        });

        let historyMessages: { role: string; content: string }[] = history || [];
        while (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
            historyMessages = historyMessages.slice(1);
        }

        const geminiHistory = historyMessages.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessageStream(message);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    } catch (err) {
        console.error('V1 Stream API error:', err);
        res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
        res.end();
    }
}
