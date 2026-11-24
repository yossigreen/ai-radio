---
name: learning-checkpoint
description: Run the learning checkpoint for a tier 2 PR or a milestone in this repo - questions about the code we wrote, asked one at a time with a hint ladder, then record strengths and gaps in the local learning docs. Use when a tier 2 PR is ready for merge, or at the end of a milestone.
---

# Learning checkpoint

The policy (when, how many questions, levels) is `docs/WORKING_AGREEMENTS.md` §7. This is the
procedure. The goal is evidence of understanding, not a quiz score.

## Before asking

- Read `docs/LEARNING.md` (local-only; if it's missing, ask the engineer). Note the open gaps and
  observed patterns, and pick questions that can also revisit an earlier gap.
- Ask about **the code in this PR**, with at least one "what happens if...". Prefer questions whose
  answer names a file, value or failure in our system.

## Asking

- **One question per message, and nothing else to answer in it** (no approval request, no second
  question).
- A clarifying question from the engineer is not an answer: answer it without giving the answer
  away, then restate the question.
- **Hint ladder** when an answer falls short: a hint, then a narrower question, then the explanation.
- Rate honestly on the scale: recognize → explain → apply to our code → reason about failure →
  defend alternatives. Say what was right, what was missing, and what a strong senior answer opens
  with (usually the *why*: the constraint or risk). No flattery.

## Recording

Update both local-only files (never commit them):
- `docs/LEARNING.md`: dated evidence in the domain row, **strengths as well as gaps**, observed
  patterns (including counter-evidence to existing ones), and new concepts introduced. A level
  rises only on a demonstrated answer.
- `docs/INTERVIEW_PREP.md`: each question with its status (answered / partial / explained by Claude).

Then tell the engineer the result in one short summary.
