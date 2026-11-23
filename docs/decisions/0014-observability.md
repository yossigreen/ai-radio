# 0014 — OpenTelemetry → Grafana stack; Langfuse for LLM

- **Status:** Accepted · 2026-11-23

## Decision
Three distinct layers:
1. **Product dashboard** (`/studio`): domain-level actions, decisions, sources and costs, read from Postgres.
2. **Workflow internals:** the Temporal UI.
3. **Engineering telemetry:** OpenTelemetry in every process. Locally, the `grafana/otel-lgtm` container. In the cloud, Grafana Cloud's free tier (limits to be verified in M2).

**LLM observability: Langfuse Cloud.** It records prompts, responses, prompt versions, tokens, cost, latency and eval scores.
- **Prompts are versioned in git, not in Langfuse.** Langfuse only records which version ran.
- **Listener identifiers are redacted** before anything is sent to Langfuse.

**Conventions**
- W3C `traceparent` over HTTP. Temporal interceptors propagate the trace into workflows and activities. **Span links** model batch fan-in (a moderation batch links to every question it processed).
- `nestjs-pino` structured logs with `trace_id`.
- **Business metrics before resource metrics:** on-time premiere rate, Q&A answers ready at freeze, ad-libs skipped for lateness, cost per episode, LLM and TTS p50/p95 latency.

## Alternatives
- AWS-native (CloudWatch + X-Ray): clumsy, poor local story.
- Datadog / New Relic: common in industry but expensive. Instrumentation is OpenTelemetry, so switching later is configuration.
- LangSmith: pairs with LangGraph, SaaS-only.
