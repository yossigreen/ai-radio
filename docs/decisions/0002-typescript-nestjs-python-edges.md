# 0002 — TypeScript + NestJS core, Python at the edges

- **Status:** Accepted · 2026-11-23

## Context
The engineer is fluent in TypeScript and is targeting Senior Full Stack roles. Python has the richer ML, eval and document-parsing ecosystem. The local TTS model (Kokoro on MLX) needs Python and must run natively.

## Decision
- **TypeScript** for the core, **including orchestration, agents and RAG.** Concepts (durable execution, idempotency, retrieval) are language-agnostic, and splitting the domain model across two languages costs more than it gives.
- **NestJS** (Express adapter, class-validator DTOs). Chosen for industry relevance. Its modules map naturally onto module boundaries.
- **Python only where it has a real advantage**, as separate Temporal activity workers or tools: the local TTS worker, PDF parsing if needed, eval analysis notebooks.
- Contracts that cross the language boundary are defined once (JSON Schema) and contract-tested on both sides.

## Alternatives
- **Fastify + Zod:** leaner, with the request lifecycle visible. Rejected for lower industry prevalence, at the engineer's call.
- **Python backend (FastAPI):** a new language on top of new backend concepts. Weaker type sharing with the frontend.
- **A Python "AI service"** owning production, knowledge and editorial: legitimate if the target were AI Engineer roles or we depended on Python-only frameworks. Revisit if that changes.

## Consequences
- NestJS hides mechanics. Mitigation: a learning checkpoint traces a request through middleware → guards → interceptors → pipes → handler → filters, and dependency injection gets explained explicitly.
- Two runtimes once `tts-local` exists. That boundary must be explicit and tested.
