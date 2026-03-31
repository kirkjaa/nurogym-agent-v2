import { ChromaClient } from "chromadb";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";
import * as dotenv from 'dotenv';

dotenv.config();

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const googleApiKey = getEnvVar('GOOGLE_API_KEY');
process.env.GEMINI_API_KEY = googleApiKey;
const embeddingModel = getEnvVar('GOOGLE_EMBEDDING_MODEL') || 'gemini-embedding-001';
const collectionName = getEnvVar('CHROMA_COLLECTION_NAME');

export function parseChromaUrl(url: string): { host: string; port: number; ssl: boolean } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : (parsed.protocol === 'https:' ? 443 : 8000),
    ssl: parsed.protocol === 'https:',
  };
}

export async function initialiseDb(client: ChromaClient) {
  try {
    const embeddingFunction = new GoogleGeminiEmbeddingFunction({
      apiKey: googleApiKey,
      modelName: embeddingModel,
    });
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: embeddingFunction,
    });
    return collection;
  } catch (err) {
    console.error('Error during database setup:', err);
    throw err;
  }
}