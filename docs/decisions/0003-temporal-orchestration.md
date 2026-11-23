# 0003 — Temporal for orchestration, with two design rules

- **Status:** Accepted · 2026-11-23

## Context
Required capabilities: workflows that span days (a 48h horizon with deadlines at T−36h, T−12h and T−6h), waiting hours for a human approval with a timer fallback, a Q&A with a minutes-long deadline budget, per-step retries and timeouts, crash-safe progress, and visibility.

## Decision
**Temporal** (TypeScript SDK). Locally, the Temporal CLI dev server. In the cloud, Temporal Cloud pay-as-you-go ($50 per million actions, no minimum, checked 2026-11-23; estimated $10–20/month), to be re-checked against the M2 budget.

**Rule 1 — Postgres is the source of truth for domain state.** An episode's status lives in `production`. Activities update it idempotently. The product and dashboard read Postgres, never Temporal. This avoids two diverging sources of truth.

**Rule 2 — A workflow per unit of business work, not per event.** An episode, an airing's Q&A, an approval: these are workflows. High-volume input whose volume we don't control (listener questions) is written to a table and consumed by the workflow **in bounded batches**. That keeps workflow cost and history size proportional to time, not to input volume. A signal-per-question design would let a flood exceed history limits and kill the show's Q&A.

## Alternatives
- **Postgres job queue (pg-boss / graphile-worker) + a state machine:** transactional enqueue and few moving parts, but timers, long waits and visibility would all be built by hand.
- **BullMQ on Redis:** popular in Node, but a dual write with Postgres (needs an outbox), and durability is still hand-built.
- **AWS Step Functions:** native to AWS, but awkward locally, logic in JSON, lock-in.
- **LangGraph as orchestrator:** built for one agent's loop, not for multi-day business processes with durable timers. See 0017.

## Consequences
- Workflow code must be deterministic: no `Date.now()`, `Math.random()` or I/O inside workflows. Enforced by a path-scoped rule and the Temporal SDK sandbox.
- Changing a running workflow's code requires workflow versioning (patching), a skill to learn.
- One more infrastructure component, with action-based pricing in the cloud.
