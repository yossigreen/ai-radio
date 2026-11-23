# 0010 — Q&A timeline: window, 5+2 selection, freeze point

- **Status:** Accepted · 2026-11-23

## Decision
For a 30-minute show (25 minutes of conversation, then 5 minutes of Q&A):
```
00:00  window opens; questions are moderated and grouped as they arrive (batches, see 0003)
18:00  window closes; pick 5 + 2 spares at random, one per duplicate group
       → grounded facts → host dialogue → gates → TTS → segments (in parallel)
24:00  freeze: assemble from what's ready; spares replace failures
25:00  Q&A airs
```
- Questions are accepted **only during the show**, from people who are listening.
- **Random selection among good questions** is fair and hard to game. Duplicates are grouped first, so the same question can't take several slots.
- **Spares** (+2) turn "a failure shortens the Q&A" into "a failure is invisible", at negligible cost.
- **Graceful degradation:** 1–4 ready answers means a shorter Q&A plus filler; 0 ready means a standard outro. The broadcast never waits.
- Questions that pass moderation but aren't picked become **topic candidates** (0017). Rejections show a generic reason, never details that teach someone how to evade the filter.
- **Reruns play without a Q&A.**

## Consequences
- A deadline-driven pipeline: each step has a time budget, and degradation is preferred to lateness. It applies the "over-provision and take the first ready" pattern (hedging).
- The cutoff, spare count and freeze point are configuration, tuned by measurement.
