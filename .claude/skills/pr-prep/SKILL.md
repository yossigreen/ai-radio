---
name: pr-prep
description: Prepare the current branch for a pull request in this repo - run the checks, run simplify, verify behavior, fill in the PR template with actual results, then ask the engineer for approval to push. Use before asking to push or open any PR.
---

# PR prep

Gets a branch to the point where the engineer's push approval is an informed decision. The rules
it applies live in `CLAUDE.md` and `docs/WORKING_AGREEMENTS.md` (§3 Git, §8 Definition of Done).

1. **Scope.** `git diff main...HEAD --stat` against the PR size target (§3). If it's over, propose
   a split into stacked PRs, each green on its own, opened one at a time from `main` (no
   force-push).
2. **Checks.** `pnpm check` and `pnpm build`. Record the **actual** output: test counts, failures,
   timings.
3. **Failure tests prove themselves.** For each test of a failure path, break the fix on purpose,
   confirm the test fails, then restore it (a mutation check). Say so in the PR.
4. **Run it for real** when behavior changed: start the processes (`pnpm dev:infra`, `start:*`) and
   exercise the change, including its failure scenarios. Tests alone have missed real crashes here.
5. **`simplify`** on the diff, plus `security-review` when its trigger applies. Apply the fixes or
   note why one was skipped.
6. **Docs.** Update what changed: `docs/ROADMAP.md` task status, ADRs, `CLAUDE.md`, `.claude/rules/`.
7. **Commit** in the §3 format.
8. **PR body.** Fill in every section of `.github/pull_request_template.md`. The review guide names
   where to look and the "what happens if..." questions worth asking. "Limitations / not done" is
   never empty by omission. Report deviations from the approved brief.
9. **Ask for approval to push and open the PR,** as the only question in the message. The learning
   checkpoint comes later, in its own message (`learning-checkpoint`).
