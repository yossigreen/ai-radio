# 0007 — Approved spine + live performance layer

- **Status:** Accepted · 2026-11-23

## Context
The product should feel live and natural, not pre-recorded. But scripts must be approved by a human, and an LLM must never block the broadcast. Reading a pre-approved script with TTS at air time is indistinguishable from a recording: **liveness comes from when decisions are made, not from when TTS runs.**

## Decision
Every show has two layers:
1. **The approved spine:** the script, approved per policy (0008), voiced and segmented in advance.
2. **The live performance layer (M4):** a performer workflow per airing generates ad-libs about 30–60 seconds before air, reacting to what has aired, to incoming questions and to the other host.
   - Ad-libs **may not introduce new factual claims.** Only reactions, humor, transitions, and opinions marked as opinions. A gate enforces this, and it's an eval metric.
   - An ad-lib is inserted **only if ready before its deadline.** Otherwise it's skipped.
   - **The layer only adds.** If all of it fails, the listener hears exactly the approved show.
   - A kill switch disables the layer for the rest of an airing.

The Q&A is conversational. Facts are prepared and grounded in the 18:00–24:00 window, and the hosts **discuss** the questions as dialogue rather than reading answers out. Separating fact preparation from performance is what keeps both accuracy and naturalness.

## Alternatives
- **Fully live, turn-by-turn generation from the start:** incompatible with script approval, and it makes the first slice much heavier. It's the later Part 6 evolution.
- **Pre-recorded only:** feels canned. That's the opposite of the product vision.

## Consequences
- Phasing: conversational Q&A in M3, ad-libs in M4.
- Introduces real-time orchestration with per-line latency budgets and context management, on top of a safe baseline.
- The playout is agnostic to producers. Episode, Q&A and live segments differ only in their deadline (hours, minutes, seconds).
