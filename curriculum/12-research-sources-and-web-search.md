# Module 12: Research Sources, Web Search, and How NuroGym Stays Current

This module explains **how NuroCoach combines** (1) the **curriculum knowledge base** embedded in ChromaDB, (2) the **coach configuration** (`config/nurogym.json`), and (3) **optional web search** — including the project’s **SearXNG** settings — so users understand **where information comes from** and **limits**.

---

## 12.1 Three Layers of Knowledge

| Layer | What it is | Role |
|-------|------------|------|
| **Curriculum (this folder)** | Markdown files chunked and embedded in **ChromaDB** | Stable, NuroGym-specific guidance: conditions, safety, routines, caregiver tips |
| **System prompt + coach config** | Identity, safety rules, terminology, prohibitions | Tone, boundaries, crisis language |
| **Web search (when triggered)** | Fetches **recent** public web snippets | Time-sensitive or “latest research” style questions |

---

## 12.2 SearXNG and `SEARXNG_URL`

- The application can call a **SearXNG** instance via **`SEARXNG_URL`** (see `.env.example`; default example in README: `https://xng.quest.ac`).  
- **SearXNG** aggregates search results from multiple engines **without** tracking a single commercial profile — it is a **privacy-respecting metasearch** tool.  
- The chat API uses web search when the user message matches **time-sensitive patterns** (e.g. “latest,” “news,” “research”) — see `src/pages/api/chat/index.ts`.

**Important:** Public SearXNG instances can be **slow**, **rate-limited**, or return **empty results** if upstream engines block automated queries (CAPTCHA, etc.). The NuroGym curriculum **does not depend** on live search for core safety content — that lives in **these files** and **config**.

---

## 12.3 Curriculum Expansion Process (March 2026)

To add **latest treatment and rehabilitation** themes for neurodivergent health and wellness, curriculum modules **07–11** were drafted using:

- **WHO (2020)** global physical activity and sedentary behaviour guidelines for **people living with disability**  
- **Peer-reviewed systematic reviews** (e.g. autism and anxiety/exercise; Down syndrome therapeutic exercise; CP adult activity reviews)  
- **Clinical education sources** (APTA, NHS-style patient information)  
- **Attempted queries** via `https://xng.quest.ac` — **JSON API** sometimes returned **no results** or **engine errors**; **HTML** search occasionally returned **no hits**. Therefore, **authoritative static sources** were used to ensure **reliable** RAG text.

When you self-host SearXNG or use a stable instance, you can still use **`SEARXNG_URL`** for live augmentation; re-seed the curriculum after editing markdown.

---

## 12.4 How to Verify or Go Deeper

- **PubMed** — [https://pubmed.ncbi.nlm.nih.gov/](https://pubmed.ncbi.nlm.nih.gov/) — search “autism exercise systematic review,” “Down syndrome resistance training,” “cerebral palsy adults physical activity.”  
- **WHO** — physical activity guidelines and disability supplement.  
- **National CP / Down syndrome / autism organisations** — country-specific toolkits and helplines.

---

## 12.5 Disclaimer

NuroCoach provides **wellness and fitness education**, not **medical diagnosis**, **therapy**, or **individual rehabilitation prescriptions**. Always involve **qualified clinicians** for assessment, especially for **new symptoms**, **pain**, **cardiac history**, **neck concerns (AAI)**, **seizures**, and **swallowing difficulties**.

---

## 12.6 Related curriculum files

- **07** — WHO disability activity guidelines  
- **08** — Autism exercise and mental health evidence  
- **09** — Down syndrome rehabilitation and safety  
- **10** — Cerebral palsy adult activity  
- **11** — IDD adaptive fitness  
