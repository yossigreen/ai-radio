# 0013 — Next.js as render-only frontend; SSE with a durable log

- **Status:** Accepted · 2026-11-23

## Decision
**Frontend:** one Next.js (App Router) app with listener routes and `/studio` routes.
- **Next.js renders only.** No database access, no business logic, no Server Actions that write. All data comes from the NestJS API, the same API a React Native client will use.
- Server-side rendering for public pages (schedule, shows, episodes) gives SEO and link previews. The player and the studio are client components.
- **The player lives in the root layout,** so navigating doesn't stop playback.
- TanStack Query for server state. hls.js for playback.
- Deployed as a standalone container on ECS (no Vercel).

**Real-time updates:** Server-Sent Events.
- Needed for question status and studio updates. "Now playing" needs no push; the client derives it from HLS timestamps.
- Events are written to an **events table** (the durable log). Postgres `LISTEN/NOTIFY` wakes every api instance (an ephemeral notification). On reconnect, clients send `Last-Event-ID`, and missed events are replayed from the table.

## Alternatives
- **Vite SPA:** simpler and cheaper to host, but less interview-relevant and weaker for SEO.
- **Next.js plus Vite:** two frameworks for one developer.
- **WebSocket:** bidirectional, which isn't needed.
- **Polling:** wasteful and slow.

## Consequences
- The rule "Next.js renders only" must be enforced: a path-scoped rule plus code review.
- SSE across instances works without Redis. NOTIFY alone isn't durable, which is why the log exists.
