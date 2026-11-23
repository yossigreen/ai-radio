## Problem
<!-- What user or engineering problem does this solve? Link the design brief / issue. -->

## Solution
<!-- What changed and how it works. Keep it to the essentials. -->

## Decisions
<!-- Significant choices and alternatives considered. Link ADRs (docs/decisions/). -->

## Review guide
<!-- Where to look first, and the questions worth asking while reviewing.
     e.g. "What happens if this activity runs twice?" "Is the auth check at the right boundary?" -->

## Tests
<!-- Commands run and their ACTUAL results. Never "should pass". -->

## Evals
<!-- Required if AI behavior changed (prompt, model, retrieval): report vs baseline, cost, latency. Otherwise "N/A". -->

## Security & reliability
<!-- Auth, untrusted input, prompt injection, failure modes, idempotency. -->

## Risks & rollback

## Limitations / not done
<!-- Anything skipped, deferred, or known to be incomplete. Never omit silently. -->

## Documentation
<!-- Docs, ADRs, rules, CLAUDE.md updated? -->

## Definition of Done (tier 2)
- [ ] Matches the approved design brief (deviations approved)
- [ ] Required tests exist and pass in CI
- [ ] Static checks green
- [ ] Evals vs baseline (if AI behavior changed)
- [ ] Every failure scenario in the brief is tested or explicitly not handled
- [ ] `security-review` run (if auth / user input / listener-text prompts touched)
- [ ] Observability appropriate to risk
- [ ] `simplify` run; review guide written
- [ ] Docs updated
- [ ] Learning checkpoint passed (or gap recorded)
