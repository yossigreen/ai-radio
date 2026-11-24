# 0021 — Third-party skills and plugins for AI-assisted development

- **Status:** Accepted · 2026-11-24

## Context
Skills and plugins for the coding agent are supply-chain inputs. A skill is instructions the agent
follows; a plugin can also run code on every edit, prompt or commit. WORKING_AGREEMENTS §10 planned
three: Vercel's React best practices and composition patterns, and Anthropic's `security-guidance`
plugin. Each was read at a pinned commit before this decision.

## Decision
**Adopt `vercel-react-best-practices`** (vercel-labs/agent-skills `5a37a63`, MIT).
- About 70 performance rules for React and Next.js, markdown only, with no scripts or install steps.
  Only its description stays in context until it is used.
- **Vendored unmodified** into `.claude/skills/`, with source, commit, license and a content hash
  in `.claude/VENDORED.md`. Formatters skip it so it stays byte-identical to upstream.
- Some rules conflict with our ADRs (at adoption: SWR, Server Actions and API routes, a new
  dependency, a cross-request cache in Next.js). The overrides are listed in `.claude/rules/web.md`,
  which loads whenever the agent touches `apps/web`, so the vendored copy never needs editing.

**Don't adopt `vercel-composition-patterns`.** It targets component-library design. Our UI is
small, and there is no recorded problem it would fix (§9: a new rule needs a repeated mistake).
Revisit if `/studio` grows.

**Don't install `security-guidance` now; port its TypeScript-relevant patterns to ESLint.**
- The plugin (v2.0.21) is about 750 KB of Python on four hooks: pattern warnings on every edit, an
  Opus review of the diff at the end of every turn, an agentic reviewer on every commit and push,
  and a session-start step that runs `pip install claude-agent-sdk` **with no version or hash pin**.
- The plugin itself can be pinned (marketplace `ref` set to a commit SHA, `autoUpdate: false`), but
  its PyPI install cannot. The review layers also overlap our `security-review` gate.
- Its local pattern layer is the part §10 planned for. About 10 of its 25 patterns apply to
  TypeScript, and ESLint enforces them with no new dependencies, in CI as well as locally:
  `eval` and `new Function`, `child_process` `exec`/`execSync`, `innerHTML`/`outerHTML`/
  `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`, `shell: true`, and disabled
  TLS verification.

## Consequences
- An upstream change to the vendored skill reaches us only through a PR (tier 3), following the
  update steps in `.claude/VENDORED.md`.
- `NODE_TLS_REJECT_UNAUTHORIZED` set outside code (compose, `.env`, a Dockerfile) is invisible to
  ESLint.
- Not ported: deprecated `crypto.createCipher` (removed from Node), external scripts without SRI
  (we load none), and GitHub Actions expression injection (needs a workflow linter such as
  `actionlint` or `zizmor`: a new tool, so a separate decision).
- **Revisit `security-guidance` at the start of M1**, when authentication and the first endpoints
  with user input land and its cross-file reviewer (IDOR, auth bypass) has real targets. If
  adopted then: pinned by commit, with the cost of a review on every turn measured first.
