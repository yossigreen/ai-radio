# 0012 — Cost stack and budget

- **Status:** Accepted · 2026-11-23 (prices checked on this date; re-verify before relying on them)

## Decision
| Area | Choice | Approximate cost |
|---|---|---|
| LLM | **Claude Haiku 5.5** by default ($0.10 / $0.50 per million tokens in/out for prompts ≤100K tokens). **Sonnet 5.5** only where an eval shows Haiku fails. | ~$0.05–0.10 per episode |
| TTS | **Hosted Kokoro** (OpenRouter / DeepInfra, ~$0.62–0.99 per million characters) as primary. **Local Kokoro** as fallback, **with identical voices**, behind `TTSProvider`. | ~$3–5/month at 6 shows/day |
| Research | Free APIs (Wikipedia; later arXiv and Semantic Scholar) plus our own RAG. No paid web search. | $0 |
| Embeddings | Decided in M3 (local or hosted) | $0–3/month |
| Local LLM | A later experiment, not the main path | — |

**Budget:** a **$40/month hard cap** in the local phase (including ~$10/month for evals, at most $2 per run), and **up to $150/month** in the cloud phase. Hard spending limits are set at each provider.

**A cost ledger from M1:** every paid call records usage and cost against its episode or airing.

## Alternatives
- **Premium TTS (ElevenLabs, $0.04–0.08 per 1K characters):** ~$195–390/month at target volume.
- **A free local LLM:** saves ~$15/month at the price of unreliable agentic, tool-use and grounding behavior. That would make the most interesting part of the system the least reliable.
- **Free API tiers:** rate-limited, terms change, and some train on submitted data (a privacy issue for listener questions).

## Consequences
- **Using the same open model on two backends makes TTS fallback invisible to listeners.** A different vendor would change presenters' voices mid-show.
- Voice quality is below premium; accepted as a trade-off.
