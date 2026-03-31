# Cursor agents — Nurogym Coach repo

## Research subagent (SearXNG → embeddings)

When the task is to **find latest web information or news** to support **Nurogym RAG content** (`curriculum/`, `memory/`), treat this as a **short, repeatable workflow**:

1. **Search** — Run `node scripts/searxng-search.mjs "<query>"` from the project root. Default engine base is `https://xng.quest.ac`; override with `SEARXNG_URL` if needed.
2. **Interpret** — If the CLI prints empty results or lists suspended engines, say so honestly and use authoritative offline sources from `curriculum/12-research-sources-and-web-search.md` (PubMed, WHO, etc.).
3. **Write** — Add or edit markdown under `curriculum/` or `memory/`, with a **Sources consulted** section and links. Match tone and safety framing of existing modules.
4. **Embed** — Remind to run `npm run seed` or `./deploy.sh seed` after substantive markdown changes.

**Skill reference:** `.cursor/skills/nurogym-searxng-research/SKILL.md` — full steps and constraints.
