---
paths:
  - "apps/web/**"
---

# Web app conventions (`apps/web`)

Next.js renders only (root `CLAUDE.md`, ADR 0013).

## Read the bundled Next.js docs first

Next.js 16 is newer than most training data, and its APIs, caching and file conventions differ
from older versions. Before writing or changing Next.js code, read the relevant guide in
`apps/web/node_modules/next/dist/docs/` (start at `index.md`) and heed deprecation notices.
These docs match the installed version exactly.

## Data access

- **Components never call `fetch` directly.** They call a data-access function: today
  `src/health/api-health.ts`, and from M1 one typed client generated from the API's OpenAPI
  contract. Why: one place owns the base URL, the timeout, the cache policy and the mapping of
  failures to UI states, and the NestJS API stays the only data source.
- **Every network call has a timeout:** `signal: AbortSignal.timeout(ms)`. Why: `fetch` has no
  default timeout, so an API that accepts the connection and never answers hangs the render
  forever (found in PR #4).
- **Every call states its cache policy:** `cache: 'no-store'` or `next: { revalidate: seconds }`,
  chosen per data type. Live state (now playing, question status, health) is never cached;
  slow-changing data (schedule, shows) may revalidate. The call owns the policy, not the page:
  don't use route-level `dynamic`/`fetchCache` overrides. Why: the default ("auto no cache")
  depends on what else the route does, and an implicit cache is a stale-data bug that only shows
  up in production.
