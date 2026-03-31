---
name: nurogym-searxng-research
description: Fetches current public web snippets via the project SearXNG instance (https://xng.quest.ac) for Nurogym curriculum and memory embedding. Use when the user asks for latest research, news, or sources to add to curriculum/, memory/, or to refresh RAG; when they mention SearXNG, xng.quest.ac, or web search for embedding prep.
---

# Nurogym SearXNG research (embedding prep)

## Goal

Pull **recent, citation-friendly snippets** from the configured **SearXNG** metasearch, then turn them into **markdown suitable for `curriculum/` or `memory/`** and **`npm run seed`**.

## Instance and API

- **Base URL:** `https://xng.quest.ac` (override with `SEARXNG_URL` — same as app `SEARXNG_URL` in README).
- **JSON API:** `GET /search?q=<query>&format=json`

## Step 1 — Run the CLI (required)

From the repo root, run (agent should execute this in the terminal):

```bash
node scripts/searxng-search.mjs "your search phrase"
```

For machine-readable output only:

```bash
node scripts/searxng-search.mjs --raw "your search phrase"
```

If results are **empty** or engines show **CAPTCHA / suspended**, note that in the user’s summary (this is normal on some public instances — see `curriculum/12-research-sources-and-web-search.md`). Suggest **PubMed**, **WHO**, or organisation sites from that module as fallbacks.

## Step 2 — Synthesize for Nurogym (not raw SEO text)

- Prefer **plain language**, **safety-aware** framing aligned with `config/nurogym.json` and existing curriculum tone.
- **Do not** copy long copyrighted text; **summarize** and **link** sources.
- Add **“Sources consulted”** with URLs from the SearXNG result lines.

## Step 3 — Where to put new text

| Location | Use when |
|----------|----------|
| `curriculum/*.md` | Durable teaching content for all users |
| `memory/*.md` | Project notes, glossaries, pilot constraints (if `DOCUMENTS_FOLDER` includes `memory`) |

After edits: `./deploy.sh seed` or `npm run seed`.

## Query tips

- Use **specific** phrases: e.g. “autism exercise systematic review 2024”, “Down syndrome resistance training guidelines”, “cerebral palsy adults physical activity review”.
- If JSON returns no rows, try **narrower** or **broader** terms, or switch to manual PubMed/WHO search and paste findings into a new curriculum section.
