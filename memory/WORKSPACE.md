# Workspace memory

Use this file (and add more `.md` files in `memory/` if you like) for **project-specific notes** you want the coach to retrieve alongside the curriculum: decisions, glossaries, programme details, or reminders.

## How it is used

- If `.env` sets `DOCUMENTS_FOLDER=curriculum,memory`, these files are embedded into **the same ChromaDB collection** as `curriculum/` during `npm run seed` or `./deploy.sh seed`.
- If you omit `memory` from `DOCUMENTS_FOLDER`, this folder stays on disk only and is **not** included in RAG.

## Revision history

See **`PROGRESS.md`** in this folder for dated progress and codebase revision notes.

## Session notes

_Last updated: (edit as needed)_

- **Focus areas:** (e.g. current cohort, pilot constraints)
- **Do not say:** (brand or policy lines)
- **Links / references:** (internal docs, not user-facing)
