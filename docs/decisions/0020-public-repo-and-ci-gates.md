# 0020 — Public repository and CI quality gates

- **Status:** Accepted · 2026-11-23

## Decision
**Public repository.** Reasons: portfolio value for interviews, free CI minutes and free security tooling (to be verified when the repo is created). Security must not rely on hidden code or prompts. **Secrets never enter Git.**

**Required checks on every PR (GitHub Actions)**
- Reproducible install (`pnpm install --frozen-lockfile`).
- Prettier formatting.
- ESLint `strict-type-checked`, plus a **module-boundary rule**.
- `tsc --noEmit` with `strict` and `noUncheckedIndexedAccess`.
- Jest unit and integration tests (Testcontainers).
- A build of all apps and Docker images.
- Migrations: `drizzle-kit check`, apply to a clean database, **no edits to merged migrations**.
- API contract: OpenAPI diff against `main` with `oasdiff`. **A breaking change fails the build** unless it carries an approved label.
- Deterministic evals.
- The Playwright golden path.
- **gitleaks** (in CI and as a pre-commit hook).
- Dependabot and `pnpm audit` (high or critical in production dependencies fails the build).
- Hardening: Actions pinned to commit SHAs, minimal `GITHUB_TOKEN` permissions.

**Locally:** husky + lint-staged mirror the fast checks.

**Rule:** a check is never disabled, an assertion never weakened, and a test never edited just to get green. A bypass requires a recorded decision with its reason.

## Consequences
- Prompts (including moderation prompts) are public. The defense lies in layered gates, rate limits and evals, not in secrecy.
- Learning-tracking documents with personal assessments (`docs/LEARNING.md`, `docs/INTERVIEW_PREP.md`) are **local-only (gitignored)**, so they stay out of the public history.
- No license file: all rights reserved.
