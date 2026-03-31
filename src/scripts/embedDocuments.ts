import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { initialiseDb, getEnvVar, parseChromaUrl } from './initialiseDb';
import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as dotenv from 'dotenv';

dotenv.config();

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const chromaApiUrl = getEnvVar('CHROMA_DATABASE_URL');
const chromaConfig = parseChromaUrl(chromaApiUrl);

export const chromaClient = new ChromaClient(chromaConfig);

const chunkSize = Number(getEnvVar('CHUNK_SIZE')) || 512;
const chunkOverlap = Number(getEnvVar('CHUNK_OVERLAP')) || 100;

/** Comma-separated folders, e.g. `curriculum` or `curriculum,memory` */
function parseDocumentFolders(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

async function getDocumentsFromDirectory(dir: string, folderLabel: string): Promise<{ documents: string[], ids: string[] }> {
  const entries = await readdir(dir);
  const mdFiles = entries.filter((f) => f.endsWith('.md')).sort();

  if (mdFiles.length === 0) {
    return { documents: [], ids: [] };
  }

  const documents: string[] = await Promise.all(
    mdFiles.map((file) => readFile(path.join(dir, file), 'utf8'))
  );

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const chunkedDocuments: string[] = [];
  const expandedIds: string[] = [];

  for (const [index, doc] of documents.entries()) {
    const docChunks = await splitter.splitText(doc);
    chunkedDocuments.push(...docChunks);
    const fileName = mdFiles[index];
    expandedIds.push(...docChunks.map((_, chunkIndex) => `${folderLabel}/${fileName}#${chunkIndex}`));
  }

  return { documents: chunkedDocuments, ids: expandedIds };
}

async function collectFromAllFolders(folderPaths: string[]): Promise<{ documents: string[], ids: string[] }> {
  const allDocuments: string[] = [];
  const allIds: string[] = [];

  for (const rawPath of folderPaths) {
    const resolved = path.resolve(process.cwd(), rawPath);
    if (!fs.existsSync(resolved)) {
      console.warn(`Skipping missing folder: ${resolved}`);
      continue;
    }
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      console.warn(`Skipping non-directory: ${resolved}`);
      continue;
    }
    const label = path.basename(resolved);
    const { documents, ids } = await getDocumentsFromDirectory(resolved, label);
    if (documents.length === 0) {
      console.warn(`No .md files found in: ${resolved}`);
      continue;
    }
    console.log(`Loaded ${documents.length} chunks from ${resolved}`);
    allDocuments.push(...documents);
    allIds.push(...ids);
  }

  if (allDocuments.length === 0) {
    throw new Error(
      'No markdown documents found. Add .md files under DOCUMENTS_FOLDER paths (e.g. curriculum/, memory/).'
    );
  }

  return { documents: allDocuments, ids: allIds };
}

async function main() {
  try {
    const rawFolders = getEnvVar('DOCUMENTS_FOLDER');
    const folderPaths = parseDocumentFolders(rawFolders);
    if (folderPaths.length === 0) {
      throw new Error('DOCUMENTS_FOLDER must list at least one folder (e.g. curriculum or curriculum,memory).');
    }

    const collection = await initialiseDb(chromaClient);
    const { documents, ids } = await collectFromAllFolders(folderPaths);
    const BATCH_SIZE = 100;

    console.log(`Starting to upsert ${documents.length} document chunks in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batchDocuments = documents.slice(i, i + BATCH_SIZE);
      const batchIds = ids.slice(i, i + BATCH_SIZE);
      await collection.upsert({ documents: batchDocuments, ids: batchIds });
      console.log(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log('Finished upserting all documents');
  } catch (err) {
    console.error('Error during embedding and upserting:', err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
