export const runtime = 'nodejs';

import { initialiseDb, getEnvVar, parseChromaUrl } from '@/scripts/initialiseDb';
import { ChromaClient } from 'chromadb';
import { NextApiRequest, NextApiResponse } from 'next';

const chromaApiUrl = getEnvVar('CHROMA_DATABASE_URL');
const chromaConfig = parseChromaUrl(chromaApiUrl);
const chromaClient = new ChromaClient(chromaConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { queryText } = req.body;

  try {
    const collection = await initialiseDb(chromaClient);
    const queryResult = await collection.query({
      queryTexts: [queryText],
      nResults: 7,
    });

    const docsArray = queryResult.documents.flat();
    res.status(200).json({ documents: docsArray });
  } catch (err) {
    console.error('Error accessing/querying the database:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}