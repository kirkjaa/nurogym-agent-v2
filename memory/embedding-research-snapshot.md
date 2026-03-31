# Embedding research snapshot — SearXNG workflow run

_Last updated: 2026-03-31_

This note records a **nurogym-searxng-research** workflow run: CLI queries against the default instance (`https://xng.quest.ac`), then **fallback** sources when the metasearch returns no rows. It is meant for **RAG alongside** `curriculum/` (e.g. “how we stay current” and where to look when live search fails).

---

## Step 1 — SearXNG CLI (executed)

Commands run from repo root:

```text
node scripts/searxng-search.mjs "WHO physical activity disability guidelines"
node scripts/searxng-search.mjs "neurodivergent exercise research 2024"
```

**Outcome:** **0 results** for both queries. **Unresponsive engines** included: Brave (too many requests), Duckduckgo (CAPTCHA), Startpage (CAPTCHA), Wikipedia (access denied). This matches the caveats in `curriculum/12-research-sources-and-web-search.md` for public instances.

---

## Step 2 — Synthesis (Nurogym-safe, plain language)

- **Staying current:** For **time-sensitive** “latest research” questions, NuroCoach can use **`SEARXNG_URL`** at runtime when engines respond; for **stable** teaching content, prefer **curriculum** plus periodic **manual** checks of WHO and peer-reviewed indexes.
- **No change to core safety:** Disability and neurodivergent activity guidance in **`curriculum/07`** and related modules remains the **authoritative** layer for RAG; this snapshot does **not** replace clinical advice.
- **Practical takeaway for content updates:** When SearXNG is empty, use **PubMed** / **WHO** / national disability organisations to draft new sections, then **summarize** and **cite** — do not paste long copyrighted text.

---

## Sources consulted (authoritative fallbacks — not from SearXNG this run)

| Source | Role |
|--------|------|
| [WHO — Every move counts (2020 news)](https://www.who.int/news/item/25-11-2020-every-move-counts-towards-better-health-says-who) | Public framing of global physical activity and sedentary behaviour guidelines |
| [PubMed — WHO guidelines PMID 33395628](https://pubmed.ncbi.nlm.nih.gov/33395628/) | Academic entry point for the 2020 guideline publication |
| [PubMed](https://pubmed.ncbi.nlm.nih.gov/) | Ongoing “autism exercise systematic review”, “Down syndrome resistance training”, “cerebral palsy adults physical activity” style searches |
| `curriculum/12-research-sources-and-web-search.md` | Project policy on SearXNG, RAG layers, and limits |

---

## Step 3 — Re-embed

After edits to `curriculum/` or `memory/`, run **`npm run seed`** or **`./deploy.sh seed`** with Chroma available.
