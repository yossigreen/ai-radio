# 0004 — Postgres + pgvector, Drizzle, no Redis in v1

- **Status:** Accepted · 2026-11-23

## Decision
- **Postgres with pgvector** for all domain state and, later, embeddings (HNSW index). Hybrid retrieval: full-text + vector search fused with Reciprocal Rank Fusion, in SQL.
- **Drizzle** as the query layer. It's close to SQL, so `EXPLAIN ANALYZE` output maps to what you wrote. It has native pgvector support, and migrations are plain SQL files reviewed in PRs.
- **No Redis in v1.** Current needs are covered by:
  - Playout leader lock: `pg_advisory_lock`.
  - One question per user per airing: a **unique constraint** on `(user_id, airing_id)`. A rate limit with no race condition.
  - Abuse rate limiting: AWS WAF rate-based rules at the edge (M2).
  - Hot read caching ("now playing"): the CDN, plus client-side derivation from HLS timestamps.
  - Queueing: Temporal.

## Alternatives
- **A dedicated vector database (Pinecone, Qdrant):** turns source deletion and metadata into a two-system sync problem. Our corpus (≤ ~1M chunks) is well within pgvector's range. Revisit at tens of millions of vectors or on a measured filtering need.
- **Prisma:** the most popular, but it hides SQL and lacks native pgvector support. **TypeORM:** a reputation for surprising behavior. **Kysely:** viable, smaller ecosystem.

## Consequences
- Database skills (transactions, isolation, `SKIP LOCKED`, advisory locks, query plans) are exercised directly.
- Redis is added only with a measured need and a new ADR.
