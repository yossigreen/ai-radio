# Working Agreements

How we build A.I. Radio. **The engineer** is the decision-maker, reviewer and owner. **Claude**
is the implementation partner and mentor. Agreed 2026-11-23. Changes to this document are tier 2.

## 1. Change tiers

| Tier | Examples | Process |
|---|---|---|
| **0 — Trivial** | Typo, docs wording, formatting, patch-level dependency bump with no API change | Done within the current task. Visible in the PR. |
| **1 — Routine within an approved scope** | Internal naming and structure, extra tests, implementation details of an approved feature | Covered by the feature's approval. Reviewed in the PR. |
| **2 — Feature / slice** | A new capability, endpoint or workflow | **Design brief** (problem, solution, alternatives, affected files, risks, what to learn) → **approval** → implement → test → self-review → PR with a review guide → **learning checkpoint** → engineer merges |
| **3 — Architectural, security, data or cost** | New dependency, framework or infrastructure; breaking change to a contract or schema; auth changes; external integrations; any spending | Tier 2 **plus an ADR** in `docs/decisions/` and explicit approval. **Claude always stops** if tier 3 comes up mid-task. |

At the end of every **milestone**: the full learning loop (§7) and the engineer's approval before the next milestone starts.

## 2. Authority

| Action | Who |
|---|---|
| Create branches; make focused local commits on feature branches | Claude, without asking |
| Push a feature branch; open a PR | Claude, **after explicit approval per PR** |
| **Merge to `main`** | **The engineer only**, in the GitHub UI, after review |
| Push to `main`, force-push, rewrite shared history | Never |
| Deploy, change cloud resources, spend money, touch secrets or production data, add external integrations | Explicit approval, every time |
| Run paid evals | Only within the approved eval budget |

## 3. Repository and Git

- **Monorepo** (pnpm workspaces): `apps/server` (one NestJS app, entry points `main.api.ts`, `main.worker.ts`, `main.playout.ts`), `apps/web` (Next.js), `apps/tts-local` (Python, later), `packages/contracts`, `evals/`, `infra/`, `docs/`.
- **Trunk-based:** short-lived branches off `main`, named `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `infra/` or `spike/` plus a description. Spike branches may never merge.
- **Conventional Commits** with the module as scope, e.g. `feat(broadcast): publish playlist as pure function of timeline`. The body explains **why**.
- **Squash merge.** The PR title, in Conventional Commits format, becomes the commit on `main`.
- **`main` is protected:** PR required, all checks green, linear history, no force-push.
- **PR size:** target ≤ ~400 changed lines, excluding lockfiles and generated files. Split larger ones.
- **Versioning:** deploys are identified by git SHA; each milestone is tagged `v0.N`.

### PR template
Problem · Solution · Decisions (links to ADRs) · **Review guide** (where to look, questions to consider) · Tests (commands + **actual results**) · Evals (if AI behavior changed) · Security and reliability · Risks and rollback · **Limitations / not done** · Documentation updated · DoD checklist (§8)

## 4. Testing

Full rationale: [ADR 0015](decisions/0015-testing-strategy.md). In short:
- Jest + Playwright. Real Postgres via Testcontainers. Temporal time-skipping. Property-based tests for pure functions.
- **Never call real LLM or TTS providers in tests.** Use the in-repo fakes behind `LLMClient` and `TTSProvider`.
- **Required tests by change type:**
  - Domain logic → unit test.
  - Endpoint → API test including the permissions matrix.
  - Migration → migration test.
  - Workflow → Temporal test including a failure path.
  - **Bug fix → a reproducing test first.**
- No coverage-percentage target. **A flaky test is a bug.** No retry-to-green.

## 5. AI evaluations

Full rationale: [ADR 0016](decisions/0016-ai-evaluation-strategy.md). In short:
- Tests check our code. Evals measure model behavior.
- Deterministic checks run in CI. Real-model runs are triggered by the `run-evals` PR label.
- Budget: **≤ $2 per run, ~$10/month.**
- Dev/test split; 3 runs per case for generative metrics; comparison against a baseline.
- Hard gates: moderation recall on harmful content, and schema validity.
- **Any change to a prompt, model or retrieval** is a tier 2 change and requires an eval report against the baseline.

## 6. CI/CD

Full rationale: [ADR 0020](decisions/0020-public-repo-and-ci-gates.md).
- Required checks: frozen install, format, lint (with module boundaries), typecheck, tests, build, migration checks, OpenAPI breaking-change diff, deterministic evals, golden-path E2E, gitleaks, dependency audit.
- **Never disable a check, weaken an assertion, or edit a test just to get green.** Understand the failure first. A bypass needs a recorded decision.
- CI and CD are separate. Deploys (from M2) require the engineer's manual approval.

## 7. Learning process

| When | What | Blocking? |
|---|---|---|
| **Tier 2 feature: PR ready, before merge** | 2–3 questions about the code that was written, at least one "what happens if…" (~15 min) | **Yes, before merge** |
| **End of milestone** | Walkthrough of the real code, failure scenarios, 2–4 interview questions, update `LEARNING.md` (~1–1.5 h) | **Yes, before the next milestone.** Proceeding despite a gap is allowed; the gap is recorded with its consequences. |
| **Once per milestone** | Independence challenge: the engineer designs first, debugs, reviews a PR before Claude does, or writes a short piece of code | No |
| **~3 times in the project** | 45-minute system-design mock interview | No |

**How questions are run**
- One question at a time, answered in the engineer's own words.
- **Hint ladder:** a hint, then a narrower question, then the explanation.
- Answers are rated on the scale: recognize → explain → apply to our code → reason about failure → defend alternatives.
- **Levels in `LEARNING.md` rise only on demonstrated answers.** "I understand" is not evidence.
- Each milestone checkpoint revisits one earlier gap (spaced repetition).

**Budget:** about 15–20% of weekly time.

**Privacy:** `docs/LEARNING.md` and `docs/INTERVIEW_PREP.md` are **local-only (gitignored)** because the repository is public.

## 8. Definition of Done

**Status vocabulary:** Planned → Designed → Implemented → Tested → Evaluated → Reviewed → Approved → Integrated → Deployed. Claude never says "done" or "works" without stating which state.

**Tier 0–1:** CI green, included in a PR.

**Tier 2:**
1. Behavior matches the approved design brief. Deviations were approved during the work.
2. Required tests exist and **pass in CI**. Actual results are in the PR.
3. All static checks green.
4. If AI behavior changed: eval report against the baseline, and hard gates pass.
5. **Every failure scenario in the design brief** has a test or an explicit "not handled because…".
6. If auth, user input or prompts with listener text are touched: `security-review` run and findings addressed.
7. Observability matches the risk: spans and logs or metrics; alerts for high-risk paths.
8. `simplify` run; review guide written.
9. Documentation updated where something changed (architecture, roadmap, rules, CLAUDE.md).
10. A "Limitations / not done" section.
11. Learning checkpoint passed, or the gap recorded.
12. The engineer merged.

**Tier 3:** tier 2 + an ADR + explicit approval of the decision.

**Milestone:**
- All features Integrated.
- An end-to-end demo on the real system.
- Golden path green.
- **Cost report** (actual spend vs budget, cost per episode).
- Milestone learning checkpoint, with `LEARNING.md` and `INTERVIEW_PREP.md` updated.
- **Context-layer audit.**
- A `v0.N` tag, and the roadmap updated.
- The engineer's approval to continue.

## 9. Context layers for AI-assisted development

**Principle: enforce mechanically what can be checked. Write prose only for judgment, and give every rule its reason.**

| Layer | Loaded | Contains |
|---|---|---|
| `~/.claude/CLAUDE.md` | Always | The engineer's personal preferences (not part of the repo) |
| Root `CLAUDE.md` | Always | Project map, hard rules, invariants, coding behavior, pointers. **Under 200 lines.** Points, never copies. |
| `.claude/rules/*.md` with `paths:` | When a matching file is touched | Area conventions: Temporal workflow determinism, migrations, web, module boundaries |
| Nested `CLAUDE.md` (`apps/*`) | When working in that directory | Local map and commands |
| `.claude/skills/` | Description only, until invoked | Repeatable procedures (`pr-prep`, `learning-checkpoint`, `new-temporal-workflow`, `write-migration`, `run-evals`) |
| `docs/` | On demand | The source of truth |
| Hooks and CI | Deterministically | Formatting, security warnings, blocking edits to merged migrations |

**Maintenance**
- Context files are reviewed in PRs like code.
- A new rule needs the same mistake or correction to have happened twice.
- Every milestone includes an audit (`/doctor prompt-audit`): delete stale rules.

## 10. Skills

| Skill | Use |
|---|---|
| `simplify` (built-in) | **Required gate before every PR** |
| `security-review` (built-in) | **Required gate** for PRs touching auth, user input, or prompts that contain listener text |
| Anthropic `security-guidance` plugin | **Not installed** ([ADR 0021](decisions/0021-third-party-ai-assistant-context.md)): its TypeScript patterns are ESLint rules instead. Revisit at M1 |
| Karpathy guidelines | Adapted, with attribution, into the root `CLAUDE.md` (not installed as a plugin) |
| Vercel React best practices | Vendored skill for `apps/web` ([ADR 0021](decisions/0021-third-party-ai-assistant-context.md)); our overrides in `.claude/rules/web.md` |
| Vercel composition patterns | Not adopted (ADR 0021) |
| Generic "coding standards" skills | **Not adopted.** Replaced by project-specific rules. |

**Third-party skills are supply-chain inputs.** Each one is read before adoption, pinned to a commit and **vendored** into `.claude/skills/`, so any change goes through a PR. Adopting one is tier 3.
