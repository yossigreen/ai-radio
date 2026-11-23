# 0017 — Editorial planning; agent vs. workflow; frameworks

- **Status:** Accepted · 2026-11-23

## Decision
**Editorial planning:** the system proposes a weekly plan per show. The producer approves, edits or rejects it once a week. The producer's own assignments take priority. Inputs to the planner:
1. **Memory of past episodes:** candidate topics are compared against the show's history by embedding similarity, to avoid repeats.
2. **Listener-driven topics:** questions that passed moderation but weren't picked become candidates.

**Agent vs. deterministic workflow**
- **The planner is an agent.** The task is open-ended and creative, and its errors are cheap because a human approves the plan.
- **Production is a deterministic workflow with LLM steps.** The order is fixed, every output is validated, and failures are handled explicitly. Its errors are expensive.

**Frameworks**
- **No LangChain in the core.** Our provider abstraction is thin, and LangChain's layers would add indirection without solving a problem we have.
- **Temporal is the backbone** (0003). An agent's loop runs inside a single Temporal activity.
- **The planner is built twice (M6):** first raw with the Anthropic SDK (about 100 lines, nothing hidden), then with LangGraph. **The version that wins on the eval set stays.**
- **Experiment (after M5):** compare our RAG against LlamaIndex on the same eval set.

## Consequences
- Practical experience with LangGraph and LlamaIndex, with a measured answer to "framework or custom?"
- If LangGraph.js lags the Python version in features, the LangGraph planner can be a Python activity.
