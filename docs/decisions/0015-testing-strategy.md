# 0015 — Testing strategy

- **Status:** Accepted · 2026-11-23

## Decision
**Tests are not evals.** Tests check that our code is correct and are deterministic. **Real LLM or TTS providers are never called in tests.** In-repo fakes implement `LLMClient` and `TTSProvider`, using recorded outputs that include malformed ones. Model quality is measured by evals (0016).

**Tooling:** **Jest** everywhere (`@swc/jest`, `next/jest`), chosen as the NestJS default and the most common runner. Playwright for E2E.

| Component | Layer | Tool |
|---|---|---|
| Domain rules (state machine, selection, approval versioning) | Unit, TDD | Jest |
| Playlist = f(timeline, now) | Unit + **property-based** | Jest + fast-check |
| Temporal workflows | Integration with **time-skipping** | `@temporalio/testing` |
| API endpoints | API tests on a real Postgres, including a **permissions matrix** and IDOR checks | Supertest + Testcontainers |
| Database behavior | Constraints, transactions, **concurrency** | Testcontainers (pgvector image) |
| Migrations | Apply against existing data | Testcontainers |
| TypeScript ↔ Python | Contract tests on shared fixtures | JSON Schema |
| Frontend components | Component tests | Jest + React Testing Library + MSW |
| Critical journeys (3–5, including a golden path) | E2E on Docker Compose | Playwright |
| Failure injection (M7) | Network faults, killed processes | Toxiproxy |
| Load (M7) | Simulated listeners, question floods | k6 |

**Design for testability:** an injected `Clock`, providers behind interfaces, mocks only at system edges, real Postgres in containers.

**Policies**
- **No coverage percentage target.** Instead, required tests by change type: domain logic → unit; endpoint → API + permissions; migration → migration test; workflow → Temporal test including a failure path; **bug fix → a reproducing test first.**
- **A flaky test is a bug.** It gets quarantined with an issue and fixed within the milestone. No retry-to-green in CI.
- TDD for domain rules and bug fixes. Not for UI or exploratory code.
