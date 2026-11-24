import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Stops `next dev` from writing and re-creating AGENTS.md when it detects a coding agent.
  // Its only content, a pointer to the bundled docs, lives in .claude/rules/web.md instead.
  agentRules: false,
};

export default nextConfig;
