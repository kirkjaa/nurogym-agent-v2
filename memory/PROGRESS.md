# Project progress and revision log

_Last updated: 2026-03-31_

This file records recent structural and configuration work on the NuroGym Coach codebase (RAG, folders, deployment alignment, curriculum content, web search). Edit it as you ship new changes.

---

## 2026-03-31 — GitHub: new canonical remote `kirkjaa/nurogym-agent-v2`

### Summary

The previous **`.git`** history (remote `tottoh/nurogym-coach`) was **removed** from this working tree. A **fresh repository** was initialized, all tracked sources committed, and **`origin`** set to **[https://github.com/kirkjaa/nurogym-agent-v2](https://github.com/kirkjaa/nurogym-agent-v2)** with **`main`** pushed. **`README.md`** clone instructions and project tree folder name were updated to **`nurogym-agent-v2`**. Prior commit history from the old remote is **not** present in the new repo (single new root commit plus follow-up doc commit).

---

## 2026-03-31 — `deploy.sh`, README, PROGRESS (help, quick build, backup, restore)

### Summary

**`deploy.sh`** was aligned with **NuroCoach** usage: clearer **help** (`help`, `-h`, `--help`, default with no args), **`quick`** as an alias for **incremental Docker build** (`build`), **Nurogym-oriented** status strings and **`check_config`** (prefers `config/nurogym.json`), and **non-interactive restore** via **`DEPLOY_RESTORE_YES=1`**. **`README.md`** now documents the full command table, backup/restore, **`npm run searxng`**, **`AGENTS.md`**, curriculum **07–12** pointer, and project tree updates. **`memory/PROGRESS.md`** (this file) is updated in the same batch.

### `deploy.sh` behaviour

| Area | Details |
|------|---------|
| **Help** | `cmd_help` lists deploy, seed, build, quick, rebuild, backup, restore, prerequisites, examples. |
| **Quick build** | `quick` → same as `build` (cached `docker compose build`, no container start). |
| **Backup** | Unchanged logic: `chromadb/`, `curriculum/`, `memory/`, `config/`, `.env` → `backups/nurogym-coach_backup_*.tar.gz`. |
| **Restore** | Optional `DEPLOY_RESTORE_YES=1` skips the overwrite confirmation; still runs `docker compose down`, `tar -xzf`, `up -d chromadb` + `frontend`. |
| **Project name** | `PROJECT_NAME=nurogym-coach` for backup filenames and help text. |

### Cursor / research (cross-reference)

- **`AGENTS.md`**, **`.cursor/skills/nurogym-searxng-research/SKILL.md`**, **`scripts/searxng-search.mjs`**, **`memory/embedding-research-snapshot.md`** — SearXNG workflow and embedding prep (see `README.md`).

---

## 2026-03-31 — RAG structure, `curriculum/`, `memory/`, multi-folder embedding

### Summary

The project already used **ChromaDB + RAG** (chat flow queries `/api/chroma`, embeddings via Gemini in `initialiseDb.ts`). Work focused on making the **knowledge base location explicit**, adding a **workspace memory** area, and letting the seed script embed **more than one folder**.

### What changed

| Area | Details |
|------|---------|
| **`curriculum/`** | New canonical folder for RAG markdown. Copied the six NuroGym topic files from `docs/knowledge/` (`01-welcome` through `06-nutrition`) plus a `README.md` describing usage and seeding. |
| **`memory/`** | Workspace notes: `WORKSPACE.md` template for long-lived project notes; optional inclusion in the same vector index as curriculum. |
| **`src/scripts/embedDocuments.ts`** | `DOCUMENTS_FOLDER` is now **comma-separated** (e.g. `curriculum,memory`). Only **`.md`** files are embedded. Chunk IDs include folder and filename (e.g. `curriculum/01-welcome-to-nurogym.md#0`). Missing folders log a warning and are skipped; if no chunks load, the script fails clearly. |
| **`.env.example`** | Default `DOCUMENTS_FOLDER=curriculum,memory` with a short comment. |
| **`docker-compose.yml`** | Seed and frontend services mount `./curriculum` and `./memory`; `DOCUMENTS_FOLDER=/app/curriculum,/app/memory`. |
| **`deploy.sh`** | `DOCS_FOLDER="curriculum,memory"`; `check_docs`, post-seed counts, and `backup` iterate over comma-separated folders; restore warning text mentions `curriculum/` and `memory/`. |
| **`README.md`** | Knowledge-base section points to **`curriculum/`**; documents **`memory/`**; env table and project tree updated. |
| **`docs/knowledge/README.md`** | Marked as **legacy**; points to `curriculum/` as canonical for RAG; duplicate “How it works” heading cleaned up. |

### RAG pipeline (unchanged behaviour, same endpoints)

- **Embed / seed:** `npm run seed` or `./deploy.sh seed` → `embedDocuments.ts` → Chroma collection (`CHROMA_COLLECTION_NAME`, default `nurogym_knowledge`).
- **Runtime:** User message → `/api/chat` fetches context from **`/api/chroma`** → system prompt in `systemPrompt.ts` → LLM (`llm.ts`).

### Follow-up for local environments

- If `.env` still has `DOCUMENTS_FOLDER=docs/knowledge`, update to `curriculum,memory` (or `curriculum` only if workspace notes should not be embedded).
- After changing folders or markdown, re-run **`npm run seed`** or **`./deploy.sh seed`** with Chroma running.

---

## 2026-03-31 — Curriculum expansion (sub-modules, research-informed content)

### Summary

All **six** main curriculum files were **heavily expanded** (~750 → ~1,600 lines total) with numbered **sub-modules** (e.g. 2.1, 3.4) for clearer chunking in Chroma and more accurate RAG. Topics drew on recent literature and clinical guidance (systematic reviews, condition-specific safety such as AAI, GMFCS, PBS, sensory systems, gut–brain and sleep).

### Files touched

| File | Notes |
|------|--------|
| `curriculum/01-welcome-to-nurogym.md` | Condition overviews (ASD, Down syndrome, CP), benefits, promises |
| `curriculum/02-exercise-for-neurodivergent-users.md` | Evidence-style prescriptions, progressive tiers, GMFCS table, functional movement patterns |
| `curriculum/03-mental-wellness-and-motivation.md` | Emotional regulation, zones, interoception, executive function, breathing variants |
| `curriculum/04-caregiver-support-guide.md` | PBS framework, documentation, meltdown/shutdown notes |
| `curriculum/05-sensory-friendly-movement.md` | Eight sensory systems, sample sensory workouts, sensory profile template |
| `curriculum/06-nutrition-and-recovery.md` | Hydration, gut–brain, micronutrients, condition-specific nutrition, sleep hygiene |
| `curriculum/README.md` | Full **module / sub-module index** for maintainers |

### What to do when you continue

1. **Re-seed Chroma** if the vector DB was built before this expansion (so retrieval matches new text):
   ```bash
   # Chroma must be running; GOOGLE_API_KEY set for embeddings
   npm run seed
   # or: ./deploy.sh seed
   ```
2. **Git:** local `main` may be **ahead of `origin/main`** by commits including curriculum work. Push failed in this environment with **403** — GitHub authenticated as `kirkjaa` but remote is `tottoh/nurogym-coach`. Fix auth (correct account, PAT, or SSH for `tottoh`) then: `git push origin main`.
3. Optional: add a short note in **`memory/WORKSPACE.md`** if you have session-specific reminders (cohort names, pilot constraints).

---

## 2026-03-31 — Additional curriculum modules (07–12): guidelines, evidence, SearXNG note

### Summary

Six **new** markdown files were added under `curriculum/` to deepen **rehabilitation, evidence, and public-health alignment** for neurodivergent clients: WHO disability activity guidelines, autism exercise/anxiety evidence, Down syndrome safety and rehab themes, CP adult activity, IDD adaptive fitness, and a **meta** file on research sources and **`SEARXNG_URL`** (`https://xng.quest.ac` in README examples).

### SearXNG (`xng.quest.ac`)

- The **runtime** chat flow can call SearXNG when queries look time-sensitive (see `src/pages/api/chat/index.ts` and `SEARXNG_URL`).
- **Manual** attempts to use `https://xng.quest.ac` for automated curriculum research returned **empty or unusable results** (engine CAPTCHAs / no hits). New KB text was therefore built from **WHO**, **PubMed-indexed reviews**, and **clinical education** sources, and Module **12** documents this limitation so expectations stay clear.

### New files

| File | Purpose |
|------|---------|
| `07-who-disability-physical-activity-guidelines.md` | WHO 2020 global PA/sedentary guidance for people living with disability |
| `08-autism-exercise-evidence-and-mental-health.md` | Systematic-review themes, prescription ranges, gaps |
| `09-down-syndrome-rehabilitation-exercise-safety.md` | AAI, heart/thyroid/heat, therapeutic exercise evidence, GLOBAL pointer |
| `10-cerebral-palsy-adult-rehabilitation-activity.md` | Activity targets, spasticity/pain/fatigue, rehab modalities |
| `11-intellectual-developmental-disability-adaptive-fitness.md` | IDD adaptive fitness, barriers, inclusion |
| `12-research-sources-and-web-search.md` | Three-layer knowledge model, SearXNG, verification links |

`curriculum/README.md` index updated for modules 7–12. **Re-seed** Chroma after pulling these files.

---

## 2026-03-31 — SearXNG integration (verified in codebase)

### Summary

Live web snippets use **SearXNG** with base URL from **`SEARXNG_URL`**, default **`https://xng.quest.ac`** (see `.env.example`).

### Implementation paths

| Path | Behaviour |
|------|-----------|
| **`src/pages/api/search/index.ts`** | Node handler: `GET ${SEARXNG_URL}/search?...&format=json&categories=general`, 8s timeout; returns top N results for the LLM prompt. |
| **`src/pages/api/chat/index.ts`** (Edge) | On **time-sensitive** user messages (regex: e.g. `latest`, `news`, `2026`), calls **`POST ${NEXT_PUBLIC_FRONTEND_URL}/api/search`** (same-origin), not SearXNG directly. Requires **`NEXT_PUBLIC_FRONTEND_URL`** to be set (e.g. `http://localhost:3003`). |
| **`src/pages/api/v1/chat/*.ts`** | Calls SearXNG **directly** when `webSearch.enabled` in `config/nurogym.json` and message matches **`timeSensitivePatterns`**. |

### Operational note

If SearXNG returns no results or errors, `/api/search` responds with an empty `results` array and chat continues without web context.

---

## 2026-03-31 — Git: commit curriculum 07–12 and push

### Summary

Tracked files for this batch: **`curriculum/07`–`12-*.md`**, updated **`curriculum/README.md`**, and this **`memory/PROGRESS.md`**. Local **`main`** was **ahead of `origin/main`** by prior commits; this commit adds the missing module files and progress notes.

### Push

After committing, run **`git push origin main`**. If GitHub returns **403**, authenticate as an account with **write** access to `tottoh/nurogym-coach` (or switch remote to SSH with the correct key). Earlier failures involved credentials for **`kirkjaa`** vs owner **`tottoh`**.

**Status (2026-03-31):** Curriculum 07–12 and PROGRESS updates are **local only** until push succeeds. Automated push failed with: `Permission to tottoh/nurogym-coach.git denied to kirkjaa` — fix GitHub auth on your machine and run `git push origin main`. Check ahead count with: `git log origin/main..main --oneline`.

---

## How to use this file

- Append new dated sections under “Project progress and revision log” when you make notable changes.
- Keep **`WORKSPACE.md`** for informal session notes; use **`PROGRESS.md`** for a concise audit trail of revisions.
