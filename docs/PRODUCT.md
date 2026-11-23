# Product

## Identity

**A.I. Radio — Always Interesting Radio.** "A.I." is a deliberate double meaning. Working tagline: *Never a dull moment.*

An autonomous, AI-powered, interactive internet radio station. It researches, writes, voices and
schedules its own shows, broadcasts them as one shared stream, and lets listeners take part by
submitting questions that the hosts discuss on air.

What it is **not**: a chatbot with a radio skin, a "prompt in, MP3 out" generator, or a private
per-listener AI conversation.

## Core product decisions

| Topic | Decision | ADR |
|---|---|---|
| Stations | **One** station with many shows. Multi-station is a possible future expansion, not built now. | — |
| Schedule | A weekly schedule inside a daily broadcast window (e.g. 09:00–21:00), with fixed show slots. Not 24/7. Target: about 6 shows a day. | [0006](decisions/0006-continuous-stream-with-filler.md) |
| Between shows | One continuous stream across the window. Gaps are filled with reruns, station IDs and royalty-free music. Show start times are hard. | [0006](decisions/0006-continuous-stream-with-filler.md) |
| Show format | 30 minutes: 25 minutes of host conversation plus 5 minutes of listener Q&A. | [0010](decisions/0010-qa-timeline.md) |
| Presenters | Station-wide AI presenters (persona + voice), two hosts per show by default. Always disclosed as AI. | [0019](decisions/0019-presenters-and-structured-script.md) |
| How a show is "live" | An **approved spine** (script written and voiced in advance) plus a **live performance layer** (ad-libs and reactions generated seconds before air). The live layer only adds; if it fails, the approved show plays unchanged. | [0007](decisions/0007-approved-spine-and-live-layer.md) |
| Listener questions | Public, answered on air for everyone. Anyone signed in can submit one per show. 5 are picked at random from the questions that pass moderation, and the hosts discuss them in the Q&A segment. | [0010](decisions/0010-qa-timeline.md) |
| Identity | Listening is anonymous. Submitting requires sign-in (Google/GitHub). Invite-only at first. | [0011](decisions/0011-identity-and-auth.md) |
| Editorial planning | The system proposes a weekly plan per show; the producer approves it once a week. The producer's own assignments take priority. | [0017](decisions/0017-editorial-planning-and-agents.md) |
| Human approval | Risk-based, per show. Scripts are approved before voicing until a show earns automatic mode through measured quality (the trust ramp). The Q&A is always automatic behind strict gates, with a live kill switch. | [0008](decisions/0008-risk-based-approval.md) |
| Production lead time | A rolling 48-hour horizon with a deadline per stage. A missed deadline means a rerun airs, never silence. | [0009](decisions/0009-production-horizon-and-state-machine.md) |
| On demand | Past episodes are available to stream. Episode reruns play without their original Q&A. | — |

## Users and journeys

### Listener
1. Opens the app and hears the station immediately (no sign-in needed).
2. Sees what's playing now — in sync with what they actually hear — plus the schedule and shows.
3. Signs in to submit a question during a show (until minute 18).
4. Follows the question's status: received → approved → picked → aired, or not picked / rejected.
5. Hears picked questions discussed in the Q&A segment at minute 25.
6. Browses and plays past episodes.

### Producer / administrator (`/studio`)
1. Configures shows, presenters and the schedule.
2. Approves the weekly editorial plan, or adds assignments directly.
3. Reviews scripts **with their sources**, then approves or rejects them. Every decision has a reason code.
4. Watches production workflows, the broadcast timeline, the questions queue, costs and quality metrics.
5. Uses kill switches: drop the Q&A segment or turn off the live layer while on air.
6. Investigates failures: which step failed, what it cost, what the model saw.

### The autonomous system
- Plans topics, researches, writes, checks facts, voices and packages episodes.
- Keeps the broadcast running: fills gaps, substitutes reruns for late episodes, recovers from crashes.
- Moderates and selects listener questions, and prepares grounded Q&A.
- Improves only through explicit, measured mechanisms: the trust ramp, eval-gated prompt changes, and listener questions that become topic candidates. No unmeasured "self-learning".

## Content and safety constraints

- **No commercial music.** Original spoken content, AI narration, royalty-free/CC-licensed or public-domain audio, with attribution where a license requires it.
- **No voice cloning or impersonation.** Only the TTS model's built-in voices.
- **AI disclosure** in the product and in a recurring on-air station segment.
- **No invented citations.** Every factual claim in a script must trace to a stored source. Ad-libs may not introduce new facts.
- **Research only from accessible, permitted sources** (initially Wikipedia; later arXiv and Semantic Scholar), respecting each source's terms and licenses.
- **Listener input is untrusted.** It is moderated, can never control the system, and is checked for prompt injection.
- **Privacy:** minimal personal data (identity for submissions), deletable on request, and redacted before it reaches third-party tooling.

## Non-goals (for now)

- Multiple stations or multi-tenancy.
- 24/7 broadcasting.
- Fully live, turn-by-turn AI conversation and live voice participants (a later phase; the design keeps the path open).
- A native mobile app (a later phase; the API is designed for multiple clients from day one).
