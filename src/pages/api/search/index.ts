export const runtime = 'nodejs';

import { NextApiRequest, NextApiResponse } from 'next';
import { getCoachConfig } from '@/lib/config/coachConfig';

const SEARXNG_URL = process.env.SEARXNG_URL || 'https://xng.quest.ac';

interface SearxResult {
  title: string;
  content: string;
  url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, numResults = 5, timeRange } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter' });
  }

  // Build search query with configurable prefix
  const config = getCoachConfig();
  const queryPrefix = config.webSearch.queryPrefix;
  const searchQuery = queryPrefix ? `${queryPrefix} ${query}` : query;

  const params = new URLSearchParams({
    q: searchQuery,
    format: 'json',
    categories: 'general',
  });

  if (timeRange) {
    params.set('time_range', timeRange);
  }

  try {
    const response = await fetch(`${SEARXNG_URL}/search?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`SearXNG returned status ${response.status}`);
    }

    const data = await response.json();
    const results: SearxResult[] = (data.results || [])
      .slice(0, numResults)
      .map((r: SearxResult) => ({
        title: r.title || 'No title',
        content: r.content || 'No content',
        url: r.url || '',
      }));

    res.status(200).json({ results });
  } catch (err) {
    console.error('SearXNG search error:', err);
    res.status(200).json({ results: [], error: 'Web search unavailable' });
  }
}
