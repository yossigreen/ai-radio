# Architecture Decision Records

Each file records one significant decision: its context, the alternatives considered and their
consequences. ADRs are immutable once accepted. To change a decision, write a new ADR that
supersedes the old one, and mark the old one `Superseded by NNNN`.

Format: `NNNN-short-title.md`, with sections Status · Context · Decision · Alternatives · Consequences.

| # | Decision | Status |
|---|---|---|
| [0001](0001-modular-monolith-process-types.md) | Modular monolith with process types | Accepted |
| [0002](0002-typescript-nestjs-python-edges.md) | TypeScript + NestJS core, Python at the edges | Accepted |
| [0003](0003-temporal-orchestration.md) | Temporal for orchestration, with two design rules | Accepted |
| [0004](0004-postgres-pgvector-drizzle-no-redis.md) | Postgres + pgvector, Drizzle, no Redis in v1 | Accepted |
| [0005](0005-hls-pre-encoded-segments.md) | HLS with pre-encoded segments; playlist as a pure function | Accepted (pending M0 spike) |
| [0006](0006-continuous-stream-with-filler.md) | Continuous stream with filler across the broadcast window | Accepted |
| [0007](0007-approved-spine-and-live-layer.md) | Approved spine + live performance layer | Accepted |
| [0008](0008-risk-based-approval.md) | Risk-based approval per show, with a trust ramp | Accepted |
| [0009](0009-production-horizon-and-state-machine.md) | 48h production horizon and episode state machine | Accepted |
| [0010](0010-qa-timeline.md) | Q&A timeline: window, 5+2 selection, freeze point | Accepted |
| [0011](0011-identity-and-auth.md) | Identity model and in-house OIDC with server-side sessions | Accepted |
| [0012](0012-cost-stack-and-budget.md) | Cost stack and budget | Accepted |
| [0013](0013-frontend-nextjs-and-sse.md) | Next.js as render-only frontend; SSE with a durable log | Accepted |
| [0014](0014-observability.md) | OpenTelemetry → Grafana stack; Langfuse for LLM | Accepted |
| [0015](0015-testing-strategy.md) | Testing strategy (Jest, real dependencies, no providers in tests) | Accepted |
| [0016](0016-ai-evaluation-strategy.md) | AI evaluation strategy | Accepted |
| [0017](0017-editorial-planning-and-agents.md) | Editorial planning; agent vs. workflow; frameworks | Accepted |
| [0018](0018-aws-target-cloud-ready.md) | AWS target, cloud-ready from day 1, deploy in M2 | Accepted |
| [0019](0019-presenters-and-structured-script.md) | Station-wide presenters and a structured script | Accepted |
| [0020](0020-public-repo-and-ci-gates.md) | Public repository and CI quality gates | Accepted |
