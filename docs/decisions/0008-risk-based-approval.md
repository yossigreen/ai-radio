# 0008 — Risk-based approval per show, with a trust ramp

- **Status:** Accepted · 2026-11-23

## Context
"Runs without an operator" conflicts with "sensitive actions need human approval." At about 6 shows a day, approving all audio (3h/day) or all scripts (~90 min/day) is not sustainable. The Q&A deadline (minutes) can't wait for a human.

## Decision
- The approval policy is **configuration per show**: `approval: required | auto_with_gates`.
- Episodes start at `required`. The producer approves the **script text before TTS**, so a rejection costs nothing in audio.
- **Trust ramp:** a show moves to `auto_with_gates` only on measured criteria: N consecutive episodes approved without edits, and eval pass rates above thresholds. It can be moved back at any time.
- Automated gates: schema validity, a safety classifier, grounding (every claim cites a stored source), length. Anything flagged goes to a human queue.
- **Q&A is always automatic**, behind strict gates, with a live **kill switch** and a standard-outro fallback.
- **Approval is bound to a script version** (content hash). Any change invalidates it.
- An append-only **audit log** records who approved which version, and when.

## Alternatives
- **Approve everything manually:** doesn't scale, and the Q&A would fail whenever the producer is offline.
- **Fully automatic:** no safety net while trust hasn't been established.

## Consequences
- Requires durable waits with timer fallbacks. This is the strongest reason for Temporal (0003).
- Approval and edit decisions, with reason codes, become labeled eval data (0016).
