# NuroGym Knowledge Base (legacy)

**Canonical RAG content now lives in `curriculum/`** at the repository root (and optional `memory/`). Configure `DOCUMENTS_FOLDER=curriculum,memory` in `.env`, then run `npm run seed` or `./deploy.sh seed`. This directory is kept for reference and older copies of the same topics.

---

This directory previously held the knowledge documents that power **NuroCoach** — the AI fitness companion for NuroGym. Documents are embedded into ChromaDB and used for RAG (Retrieval-Augmented Generation) to provide accurate, neuro-inclusive responses.

## NuroGym Documents

| File | Topic |
|------|-------|
| `01-welcome-to-nurogym.md` | Introduction, why fitness matters, who NuroGym is for |
| `02-exercise-for-neurodivergent-users.md` | Adaptive exercise for autism, Down syndrome, cerebral palsy |
| `03-mental-wellness-and-motivation.md` | Mood support, breathing exercises, motivation strategies |
| `04-caregiver-support-guide.md` | Guidance for caregivers and support workers |
| `05-sensory-friendly-movement.md` | Sensory processing differences and sensory-friendly exercise design |
| `06-nutrition-and-recovery.md` | Hydration, nutrition, sleep, and recovery |

## How It Works

1. **Document Embedding**: When you run `./deploy.sh seed`, all markdown files in the configured folders (`curriculum/`, optionally `memory/`) are processed and embedded into ChromaDB
2. **Semantic Search**: When a user asks a question, the system searches for relevant content from these documents
3. **Augmented Responses**: The AI coach uses the retrieved content along with its training to provide helpful answers

## Adding Your Content

### Step 1: Plan Your Knowledge Structure

Organize your domain knowledge into logical categories. For example:

```
docs/knowledge/
├── 01-getting-started.md
├── 02-core-concepts.md
├── 03-techniques.md
├── 04-training-programs.md
├── 05-nutrition.md
├── 06-equipment.md
├── 07-common-mistakes.md
├── 08-advanced-topics.md
└── README.md
```

### Step 2: Create Markdown Files

Each file should focus on a specific topic. Use clear headings and structured content:

```markdown
# Topic Title

Brief introduction to the topic.

## Section 1

Detailed content...

### Subsection 1.1

More specific content...

## Section 2

More content...
```

### Step 3: Best Practices

- **Be comprehensive**: Include all information you want the coach to know
- **Be accurate**: Verify facts and figures
- **Be organized**: Use consistent formatting and clear structure
- **Use plain language**: Write as if explaining to a beginner
- **Include examples**: Concrete examples help the AI provide better answers
- **Update regularly**: Keep content current and relevant

### Step 4: Seed the Database

After adding or modifying documents, run:

```bash
./deploy.sh seed
```

This processes all documents and updates the vector database.

## File Naming Convention

- Use numeric prefixes for ordering: `01-`, `02-`, etc.
- Use lowercase with hyphens: `getting-started.md`
- Keep names descriptive but concise

## Content Guidelines

### What to Include

- Factual information about your domain
- Step-by-step instructions for techniques
- Common questions and answers
- Terminology definitions
- Safety guidelines
- Best practices
- Troubleshooting tips

### What to Avoid

- Opinions presented as facts
- Outdated or incorrect information
- Copyrighted content without permission
- Sensitive personal information
- Content that could cause harm

## Checking Your Content

After seeding, test your knowledge base by asking the coach questions about the content you added. The coach should be able to answer questions based on your documents.

## Need Help?

If the coach isn't finding relevant content:

1. Check that documents are properly formatted
2. Ensure content is clear and specific
3. Try adding more detail or examples
4. Re-run `./deploy.sh seed` after changes
