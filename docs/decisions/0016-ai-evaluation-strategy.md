# 0016 — AI evaluation strategy

- **Status:** Accepted · 2026-11-23

## Decision
**Per-capability evals**

| Capability | Critical metric | Gate |
|---|---|---|
| Question moderation (including prompt injection) | **Recall on harmful content** | **Hard:** must not regress |
| Duplicate grouping | Pairwise precision / recall | Soft |
| Retrieval | Recall@k, MRR, nDCG | Soft |
| Script | **Faithfulness to sources**; schema validity | **Hard:** schema validity 100% |
| Fact-check gate | Detection rate of planted unsupported claims | Soft |
| Q&A | Faithfulness, relevance, safety | Soft (safety hard) |
| Ad-libs | Rate of invented facts | Hard once M4 ships |
| Planner | Novelty against past episodes; producer approval rate | Soft |

**Four kinds of check**, cheapest first:
1. **Deterministic** (schema, length, citations resolve to stored sources). Runs in CI on recorded outputs, at $0.
2. **Labeled datasets.**
3. **An LLM judge** with an explicit rubric. A stronger, different model judges (Sonnet judges Haiku outputs). It's **not trusted until calibrated** against about 50 human labels, and recalibrated every milestone.
4. **Human:** script approvals and edits with reason codes are labels produced as a by-product of normal work.

**Datasets:** `evals/datasets/`, versioned JSONL, 30–50 cases per capability to start.
- A **dev/test split**: prompts are tuned against dev, and results are reported only on test (prevents leakage).
- Deliberate adversarial cases: prompt injection, misleading or outdated sources, unanswerable questions.
- **Every production failure becomes an eval case.**

**Execution and budget**
- CI runs the deterministic checks only.
- Real-model runs are triggered manually by a `run-evals` PR label, **$2 cap per run, ~$10/month.**
- In production, a judge runs on ~10% of aired content.

**Regression gate**
- Baselines live in `evals/baselines/` (prompt version + model + dataset version).
- Generative evals run **3 times per case** to estimate noise. A difference smaller than the noise isn't an improvement.
- Reports state what improved, what regressed, cost and latency deltas, and the remaining uncertainty.

**Tooling:** a thin TypeScript runner in `evals/` that sends results to Langfuse experiments. Python notebooks for analysis.
