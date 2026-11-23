# Roadmap

Milestones, not task lists. Detailed acceptance criteria are written at each milestone's design gate.
**No time estimates until M1 has given us a measured pace.** Pace is reviewed weekly (~30 h/week).

Status vocabulary: Planned → Designed → Implemented → Tested → Evaluated → Reviewed → Approved → Integrated → Deployed.

## Core path

| | Milestone | Demo | Engineering core | Interview topics | Status |
|---|---|---|---|---|---|
| **M0** | Foundations | A repo with CI; one command brings up the dev environment | pnpm monorepo, CI gates, Docker Compose, context layers, skill vetting, **HLS discontinuity spike** | CI/CD, supply chain, AI-assisted development | **In progress** |
| **M1** | First Broadcast | A script you approved airs exactly on time, after filler, in the browser | Episode state machine, Temporal (signals, timers, idempotency), playlist as a pure function, OIDC + sessions, cost ledger, first eval | Durable execution, idempotency, sessions vs JWT, HLS, crash recovery | Planned |
| **M2** | On Air | A real station at a public URL, playable on a phone | Terraform, ECS (playout as a single instance), RDS, S3 + CloudFront, Temporal Cloud, CD via OIDC, secrets | Zero-downtime deploys, IaC, least privilege, CDN caching, cost traps | Planned |
| **M3** | Listener Q&A | Listeners submit questions; the hosts discuss them on air | Listener auth + allowlist, batch moderation, duplicate grouping (first embeddings), 5+2 selection, freeze point, kill switch, SSE | Backpressure, rate limiting, prompt injection, deadline pipelines, durable log + notify, moderation evals | Planned |
| **M4** | Live Hosts | The hosts improvise, reacting to each other and to incoming questions | Performer workflow, lookahead, latency budgets, a "no new facts" gate | Real-time orchestration, latency budgets, graceful degradation, live-content evals | Planned |
| **M5** | Knowledge | Deeper research from more sources | Real RAG: ingestion, chunking, embeddings, HNSW, hybrid + RRF, reranking, source versioning and deletion | Chunking, hybrid retrieval, retrieval evals, reindexing, freshness | Planned |
| **M6** | Editorial Autonomy | The station plans its own week; trusted shows run without per-episode approval | Planner agent (raw vs LangGraph, judged on evals), topic memory, listener-driven topics, trust ramp, judge calibration | Agent vs workflow, agent evals, memory, controlled adaptation | Planned |
| **M7** | Reliability & Scale | Survives injected failures on air; measured capacity numbers | Failure injection, local TTS fallback, circuit breakers, adaptive bitrate, k6, SLOs + error budgets, runbooks, backup-restore drill | SLOs, capacity planning with data, disaster recovery, incident investigation | Planned |

**Ordering principles**
- Reliability is not deferred. Every milestone ships its own failure scenarios; M7 consolidates and measures at scale.
- M4 (live) comes before M5 (RAG): ad-libs can't add facts, so they don't depend on RAG.
- M3's Q&A retrieval (full-text search over the episode's sources) becomes the **baseline** that M5 must beat.

## Experiments (optional, off the core path)

| Experiment | What it teaches | Earliest |
|---|---|---|
| Our RAG vs LlamaIndex on the same evals | Framework vs custom, measured | after M5 |
| A local LLM for moderation | Eval-driven model routing, self-hosted inference | after M3 |
| Kubernetes (kind locally, a brief EKS run) | Orchestration compared with ECS | after M2 |
| Redis | Only on a measured need | when needed |
| React Native client | API backward compatibility in practice | after M3 |
| Live voice participants (WebRTC / LiveKit) | Fully live conversation (Part 6) | after M4 |

## M0 — Foundations (detail)

1. **Documentation** (this set): product, architecture, ADRs, roadmap, working agreements, learning tracking, root `CLAUDE.md`. *Implemented, awaiting review.*
2. **Open decision:** whether `LEARNING.md` and `INTERVIEW_PREP.md` (personal assessments) belong in the public repo.
3. Create the public GitHub repo, protect `main` and add the PR template. *Needs explicit approval.*
4. Toolchain: pnpm workspace, TypeScript strict, ESLint (including the boundary rule), Prettier, Jest, husky + lint-staged, gitleaks.
5. Docker Compose: Postgres 17 + pgvector, MinIO, Temporal dev server, otel-lgtm.
6. CI workflow with the required checks (those that apply before application code exists).
7. Context layers: `.claude/rules/` (path-scoped) and project skills (`pr-prep`, `learning-checkpoint`). Vet and vendor the third-party skills (Vercel React, security-guidance). *Tier 3 per skill.*
8. **Spike — HLS discontinuities:** about 10 Kokoro-voiced clips joined with `EXT-X-DISCONTINUITY`, played on hls.js, iOS and Android. Decides between ADR 0005's design and the B1 fallback. *Needs a TTS provider key (external cost: cents).*

**Needed from the engineer:** an Anthropic API key with a $40 spending cap, an OpenRouter or DeepInfra key, a Google OAuth client, a Langfuse Cloud account, approval to create the public repo.

## M1 — First Broadcast (scope)

**In scope**
- A seeded show with 2 presenters.
- A producer signs in (Google OIDC, sessions, roles) and creates an assignment.
- Research from Wikipedia only (sources stored with attribution) produces a structured script with citations, then `awaiting_approval`.
- The studio review page: script plus sources, approve or reject with a reason code.
- After approval: TTS line by line with hosted Kokoro, loudness normalization, HLS segments in MinIO, then `ready`.
- Playout with a filler library (station IDs, a disclosure segment, royalty-free music) and a hard start.
- The web player with "now playing" in sync with the audio.
- The cost ledger, a trace from assignment to published segment, Langfuse traces, and a faithfulness eval (~20 cases) plus deterministic checks.

**Acceptance scenarios**

| Scenario | Expected |
|---|---|
| Approve, then wait for the slot | The show starts on its slot after filler |
| Reject | No TTS spend |
| Approval deadline missed (short deadlines configured for the demo) | Filler or a rerun airs; the episode is marked `missed` |
| Worker killed during TTS | Resumes with no duplicate TTS spend |
| Playout killed | Another instance resumes. A glitch, not silence, within the buffer budget. |
| Studio endpoints | Pass the permissions matrix |

**Deferred:** the planner, RAG and embeddings, Q&A and listener auth, SSE, ad-libs, adaptive bitrate, the cloud, local TTS, load and fault-injection tooling, the LangGraph comparison, React Native.
