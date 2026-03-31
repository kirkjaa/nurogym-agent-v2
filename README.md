# NuroGym AI Agent — NuroCoach

NuroCoach is a neuro-inclusive AI fitness and wellness companion built on the Coach Agent Template. It is designed specifically for individuals with **autism, Down syndrome, and cerebral palsy**, as well as their **caregivers and support workers**.

NuroCoach provides personalised exercise guidance, mood-aware wellness support, and bilingual (English / Thai) interactions — all in plain, accessible language.

---

## Features

- **Neuro-Inclusive Design**: Plain language, no jargon, every fitness term explained
- **RAG Knowledge Base**: Domain-specific knowledge covering adaptive exercise, sensory-friendly movement, mental wellness, caregiver support, and nutrition
- **Bilingual**: Full English and Thai (ภาษาไทย) support — users and caregivers can communicate in either language
- **Mood-Aware Wellness**: Responds with empathy to emotional state; provides breathing exercises and motivational support
- **Safety Guardrails**: Configured rules for seizure safety, overexertion, pain, and mental health crisis
- **Web Search**: Augments responses with current research and news about neurodivergent fitness
- **Streaming Responses**: Real-time token streaming via Vercel AI SDK
- **Multi-LLM Support**: Google Gemini (default), OpenAI, Azure OpenAI, OpenRouter
- **Public REST API**: Non-streaming and streaming (SSE) endpoints for external integrations
- **Embeddable**: Standalone `/embed` page for iframe integration into NuroGym or other platforms
- **Multi-User Ready**: Browser-local chat history — each user session is isolated

---

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/kirkjaa/nurogym-agent-v2.git
cd nurogym-agent-v2

# Copy environment template
cp .env.example .env
# Edit .env — add your Google Gemini API key (minimum required)
```

### 2. Set Your API Key

The default LLM provider is **Google Gemini**. In `.env`:

```
GOOGLE_API_KEY=your-gemini-api-key-here
SERVICE_PROVIDER=gemini
```

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh deploy
```

The app will be available at `http://localhost:3003`.

---

## Manual Setup (without Docker)

```bash
# Install dependencies
npm install

# Start ChromaDB locally
pip install chromadb
chroma run --path ./chromadb --port 8003

# Seed the NuroGym knowledge base
npm run seed

# Run dev server
npm run dev
```

---

## NuroGym Knowledge Base (RAG + ChromaDB)

The **RAG knowledge base** lives in **`curriculum/`** at the project root. Markdown files there are chunked, embedded with Gemini, and stored in **ChromaDB**; `/api/chat` retrieves relevant chunks for each user message.

| File (under `curriculum/`) | Contents |
|------|----------|
| `01`–`06` | Core modules: welcome, exercise, mental wellness, caregivers, sensory-friendly movement, nutrition |
| `07`–`12` | WHO disability activity guidelines, condition-specific evidence (autism, Down syndrome, CP, IDD), research sources and web search |

See **`curriculum/README.md`** for a full module index (including 07–12).

**Workspace memory:** optional long-lived notes in **`memory/`** (e.g. `WORKSPACE.md`, `PROGRESS.md`, research snapshots) can be embedded into the same collection by setting `DOCUMENTS_FOLDER=curriculum,memory` (default in `.env.example`).

To add or update knowledge: edit or add `.md` files under those folders, then run `./deploy.sh seed` or `npm run seed`.

**Cursor / research workflow:** **`AGENTS.md`** describes a short SearXNG → curriculum workflow. **`npm run searxng -- "query"`** calls `scripts/searxng-search.mjs` against `SEARXNG_URL` (default `https://xng.quest.ac`) for embedding prep; see `.cursor/skills/nurogym-searxng-research/SKILL.md`.

The older `docs/knowledge/` tree is retained for reference; prefer **`curriculum/`** for new content.

---

## Coach Configuration

The NuroCoach configuration is in `config/nurogym.json`. Key settings:

```json
{
  "identity": {
    "name": "NuroCoach",
    "persona": "warm, patient, neuro-inclusive fitness and wellness companion",
    "createdBy": "NuroGym",
    "defaultLanguage": "en"
  },
  "expertise": {
    "domain": "Neurodivergent Fitness & Wellness",
    "areas": [
      "Adaptive Exercise",
      "Sensory-Friendly Movement",
      "Mental Wellness & Motivation",
      "Caregiver & Support Worker Guidance",
      "Nutrition & Recovery"
    ]
  }
}
```

See the full file for all safety rules, terminology glossary, and behavior settings.

---

## Environment Variables

| Variable | Description | NuroGym Default |
|----------|-------------|-----------------|
| `COACH_CONFIG_PATH` | Path to coach config JSON | `./config/nurogym.json` |
| `SERVICE_PROVIDER` | LLM provider | `gemini` |
| `GOOGLE_API_KEY` | Google Gemini API key | — |
| `NEXT_PUBLIC_COACH_NAME` | Display name | `NuroCoach` |
| `NEXT_PUBLIC_COACH_DOMAIN` | Domain label | `Neurodivergent Fitness & Wellness` |
| `CHROMA_COLLECTION_NAME` | ChromaDB collection | `nurogym_knowledge` |
| `DOCUMENTS_FOLDER` | Comma-separated folders embedded into Chroma (RAG) | `curriculum,memory` |
| `SEARXNG_URL` | SearXNG web search URL | `https://xng.quest.ac` |
| `V1_API_KEY` | Optional API auth key for `/api/v1/*` | — |
| `ALLOWED_ORIGINS` | CORS origins | `*` |

See `.env.example` for all options.

---

## Public REST API

### Authentication

If `V1_API_KEY` is set, include the header:
```
X-API-Key: your-api-key-here
```

### POST /api/v1/chat — Non-Streaming

```bash
curl -X POST http://localhost:3003/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What exercise can I do if I use a wheelchair?"}'
```

### POST /api/v1/chat/stream — Streaming (SSE)

Returns a Server-Sent Events stream of text chunks.

---

## Iframe Embedding

```html
<iframe
  src="http://localhost:3003/embed"
  width="100%"
  height="600"
  style="border: none; border-radius: 15px;"
  allow="clipboard-write"
></iframe>
```

---

## deploy.sh Commands

Requires **Docker** and a **`.env`** file (copy from `.env.example`). Show full usage anytime:

```bash
./deploy.sh help
# same: ./deploy.sh -h   ./deploy.sh --help   ./deploy.sh   (no arguments)
```

| Command | Description |
|---------|-------------|
| `./deploy.sh deploy` | Build images, start ChromaDB, seed `curriculum/` + `memory/`, start frontend (`http://localhost:3003`) |
| `./deploy.sh seed` | Re-embed markdown into ChromaDB (starts Chroma if needed) |
| `./deploy.sh build` | Build Docker images only (incremental; uses cache) |
| `./deploy.sh quick` | Same as **`build`** — quick image build without starting containers |
| `./deploy.sh rebuild` | `docker compose down`, `build --no-cache`, seed, start frontend (full clean rebuild) |
| `./deploy.sh backup` | Create `backups/nurogym-coach_backup_YYYYMMDD_HHMMSS.tar.gz` with `chromadb/`, `curriculum/`, `memory/`, `config/`, `.env` |
| `./deploy.sh restore <file>` | Extract archive in project root, restart ChromaDB + frontend. Omit `<file>` to list `backups/*.tar.gz`. Confirms before overwrite; **non-interactive:** `DEPLOY_RESTORE_YES=1 ./deploy.sh restore <file>` |

---

## Backup and restore

- **Backup:** `./deploy.sh backup` — archives local vector data and the same RAG folders the seed script uses, plus coach config and environment.
- **Restore:** `./deploy.sh restore backups/nurogym-coach_backup_YYYYMMDD_HHMMSS.tar.gz` — stops Compose services, extracts files, brings services back. Use `DEPLOY_RESTORE_YES=1` when you must not prompt (e.g. automation).
- After restore, if the app misbehaves, check Docker logs: `docker compose logs chromadb` and `docker compose logs frontend`.

---

## Project Structure

```
nurogym-agent-v2/
├── AGENTS.md                   # Cursor agent notes (SearXNG research workflow)
├── config/
│   ├── nurogym.json            # NuroGym coach configuration
│   └── coach.sample.json       # Generic template config (reference only)
├── curriculum/                 # RAG knowledge base (embedded into ChromaDB)
├── memory/                     # Optional workspace memory (.md) for the same RAG index
├── scripts/
│   └── searxng-search.mjs      # CLI: query SearXNG JSON API (embedding research)
├── docs/
│   └── knowledge/              # Legacy reference copies (use curriculum/ for RAG)
├── src/
│   ├── lib/
│   │   ├── config/             # Config loader and types
│   │   └── i18n/               # EN + TH translations
│   ├── templates/
│   │   └── systemPrompt.ts     # Config-driven system prompt builder
│   ├── pages/
│   │   ├── index.js            # Landing page
│   │   ├── chat.js             # Chat page
│   │   ├── embed.js            # Embeddable widget
│   │   └── api/
│   │       ├── chat/           # Internal streaming chat API
│   │       ├── v1/chat/        # Public REST API (non-streaming + SSE)
│   │       ├── chroma/         # ChromaDB proxy
│   │       └── search/         # Web search proxy
│   └── components/             # React UI components
├── docker-compose.yml
├── Dockerfile
├── deploy.sh
└── .env.example
```

---

## Safety Features

NuroCoach has 5 built-in safety rules:

| Rule | Trigger | Response |
|------|---------|---------|
| Medical Clearance | New exercise, pain, injury | Recommend doctor/physiotherapist consultation |
| Seizure Safety | Epilepsy, seizure history | Supervised exercise guidance, environment safety |
| Pain Stop | Pain, dizziness, chest pain | Stop immediately, rest, seek help if needed |
| Mental Health Crisis | Hopelessness, self-harm language | Empathetic response + crisis hotline numbers |
| Overexertion | Exhaustion, overwhelm, giving up | Acknowledge feelings, suggest rest or easier option |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| ChromaDB not ready | Check logs: `docker compose logs chromadb` |
| NuroCoach not responding | Verify `SERVICE_PROVIDER` and API key in `.env` |
| Web search not working | Check `SEARXNG_URL` is reachable |
| Empty or generic responses | Run `./deploy.sh seed` to embed the knowledge base |
| Config not loading | Check `COACH_CONFIG_PATH` points to `./config/nurogym.json` |
| Thai language not working | Ensure `NEXT_PUBLIC_COACH_DOMAIN` is set correctly |

---

## About NuroGym

NuroGym is a full-stack, neurodivergent-friendly fitness application. People with disabilities are **three times more likely** to face chronic diseases due to physical inactivity. NuroGym bridges this gap with neuro-inclusive design, AI-powered personalisation, and accessible interfaces — shifting the mindset of exercise from a "chore" to a fun and rewarding activity.

**NuroCoach is the AI heart of NuroGym** — a companion that understands neurodivergent needs, speaks plainly, and meets every user exactly where they are.

---

## License

MIT License — built on the Coach Agent Template.
