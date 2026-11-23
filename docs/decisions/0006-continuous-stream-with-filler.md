# 0006 — Continuous stream with filler across the broadcast window

- **Status:** Accepted · 2026-11-23

## Context
The station runs a weekly schedule inside a daily window (e.g. 09:00–21:00) with gaps between show slots. Options: off-air in the gaps, a continuous stream, or a hybrid.

## Decision
**One continuous stream for the whole window.** Gaps are filled with reruns (the 25-minute body only, without the original Q&A), station IDs, AI-disclosure segments and royalty-free music. Show start times are hard: filler is cut, with a fade, so the next show starts exactly on its slot. Off-air outside the window.

## Alternatives
- **Off-air between shows:** much simpler, but it removes the core broadcast engineering (an always-ready timeline, fallback, hard starts, crash recovery).
- **Hybrid:** combines the downsides of both.

## Consequences
- Fallback logic is exercised every day, not just in failure tests. The same filler system covers a late episode.
- The audio layer is deliberately kept thin (ffmpeg, normalization at production time). Radio-specific audio craft has low transfer value.
