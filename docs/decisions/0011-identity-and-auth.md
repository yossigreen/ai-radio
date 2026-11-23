# 0011 — Identity model and in-house OIDC with server-side sessions

- **Status:** Accepted · 2026-11-23

## Context
The cost of moderating a spam question is negligible (~$0.00005 each with Haiku). The real threats are flooding the moderation queue, gaming the random pick, and abusive content aimed at the air. A React Native client will follow.

## Decision
**Identity model**
- Listening is **anonymous**. No auth on media, so the CDN can cache everything.
- **Submitting a question requires sign-in** (OIDC with Google/GitHub). At most one question per user per airing (a unique constraint).
- **Invite-only** at first: an allowlist table checked at sign-in, behind a feature flag, until moderation is evaluated.
- Roles: `listener`, `producer`, `admin`. The admin role is assigned only by seed or a direct database change, never self-service.

**Implementation: built in-house on standards**
- OIDC through a certified library (`openid-client`). **Social sign-in only, no passwords**, so the riskiest parts (credential storage, recovery, MFA) stay with the identity providers.
- **Server-side sessions in Postgres:** immediately revocable. JWT was rejected because it can't be revoked before it expires, and we have no multi-service verification need.
- One session model with two transports: an `httpOnly`, `SameSite=Lax` cookie for web, and an opaque bearer token for React Native (after PKCE).
- Only a **SHA-256 hash** of the session token is stored.
- CSRF protection: SameSite plus a required custom header on state-changing requests.
- A new session on every login (prevents session fixation).
- NestJS guards, **deny by default**. Every endpoint declares its role.
- An append-only audit log for approvals and role changes.

## Alternatives
Cognito (clumsy, hides the learning), Auth0/Clerk (hides nearly all the learning, an external dependency in the most sensitive path), Better Auth (its abstractions make the decisions we want to learn).

## Consequences
- The security responsibility is ours. Mitigations: security tests from M1 (no session, wrong role, expired session, IDOR, CSRF) and a required `security-review` gate on auth changes.
