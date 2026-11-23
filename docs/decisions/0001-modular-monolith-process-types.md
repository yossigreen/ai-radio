# 0001 — Modular monolith with process types

- **Status:** Accepted · 2026-11-23

## Context
The system has very different runtime profiles. There's a user-facing API, long-running and bursty AI and media jobs, and a playout loop that must never stop. Domain-wise it has 8 areas (catalog, editorial, production, knowledge, broadcast, interaction, identity, ops). One developer builds and runs it.

## Decision
One NestJS codebase (`apps/server`) with 8 modules and **three entry points**: `api`, `workers` and `playout`. A Python `tts-local` worker comes later.
- **Processes are split by runtime characteristics** (failure isolation, scaling profile, statefulness), not by domain.
- Each module owns its Postgres schema. No module reads another module's tables; it uses the owning module's service API or events. A lint rule enforces this.
- `playout` runs as a single active instance (advisory lock). It caches its lookahead timeline locally so it survives short database outages.

## Alternatives
- **Single process:** an API crash or deploy would stop the broadcast. Rejected.
- **Microservices per domain:** for one developer it's a distributed monolith, with network calls, cross-service transactions and operational overhead and no team to justify it. Rejected.
- **Separate apps per process:** shared modules would have to be extracted into packages. Rejected in favor of entry points.

## Consequences
- Extracting a service later is mechanical, because the boundaries are already enforced.
- One deploy artifact (an image) with three commands. Deploys must keep `playout` continuity in mind.
- Module discipline depends on tooling (the lint rule) and on review.
