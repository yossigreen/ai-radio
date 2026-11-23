# 0009 — 48h production horizon and episode state machine

- **Status:** Accepted · 2026-11-23

## Decision
- A rolling 48-hour production horizon, measured from the slot time T:

| Stage | Deadline | On miss |
|---|---|---|
| Research + script | starts T−48h, done by T−36h | retry, then alert |
| Approval | T−12h | the slot gets a rerun; episode → `missed` |
| Audio production | ready by T−6h | retry, then rerun |
| Playout lookahead | minutes | filler |

- The episode lifecycle is an **explicit state machine** (see ARCHITECTURE.md), enforced in the domain layer and constrained in the database. Illegal transitions are rejected.
- When a show runs in `auto_with_gates`, the approval stage is skipped and the horizon can shrink.
- **First product SLO: the on-time premiere rate.** The share of scheduled slots that air their planned episode rather than a substitute. Target to be set after M1 measurements (initially proposed at 95%).

## Alternatives
- **Just in time** (about 1h before air): no room for approval or retries.
- **A full week ahead:** stale content, wasted work when plans change, late detection of problems.

## Consequences
- Delays surface at T−36h, not at airtime.
- The SLO measures what listeners actually experience, and it gets an error budget.
