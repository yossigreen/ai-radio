# A.I. Radio — Always Interesting Radio

*Never a dull moment.*

An AI-native internet radio station. One station, many shows. Each show is researched, written,
reviewed, voiced and scheduled by an AI production pipeline, then broadcast as a single shared
stream. Listeners submit questions during a show, and the AI hosts discuss the selected ones on air.

**All presenters are AI-generated.** No real person's voice is cloned or imitated.

## Status

Design phase complete. No application code yet. Current milestone: **M0 — Foundations**.
See [docs/ROADMAP.md](docs/ROADMAP.md).

## Documentation

| Document | What it covers |
|---|---|
| [PRODUCT.md](docs/PRODUCT.md) | Vision, product decisions, user journeys |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Components, boundaries, data flows, failure model |
| [decisions/](docs/decisions/) | Architecture Decision Records — the why behind each choice |
| [ROADMAP.md](docs/ROADMAP.md) | Milestones and status |
| [WORKING_AGREEMENTS.md](docs/WORKING_AGREEMENTS.md) | Process, Git, testing, evals, CI, Definition of Done |

## Planned stack

TypeScript · NestJS · Temporal · PostgreSQL + pgvector · Drizzle · Next.js · HLS · OpenTelemetry ·
Langfuse · AWS. Rationale for each choice lives in the ADRs.
