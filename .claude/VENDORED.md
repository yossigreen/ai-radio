# Vendored third-party context

Pinned third-party skills, copied **unmodified** (policy: WORKING_AGREEMENTS §10, ADR 0021).
Overrides go in our own rules (e.g. `.claude/rules/web.md`), never in the vendored copy.

| Skill | Source | Commit | License | Vendored |
|---|---|---|---|---|
| `skills/vercel-react-best-practices/` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/react-best-practices` | `5a37a6329fbad3666c3207392a6a7c0110e92efb` | MIT, © Vercel | 2026-11-24 |

## Check that a vendored copy is unmodified

```sh
cd .claude/skills/vercel-react-best-practices
find . -type f -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256
# expected prefix: 99c51ec5786b76eb
```

## Update

1. Review the upstream diff from the pinned commit as in ADR 0021, including new conflicts with our ADRs.
2. Replace the directory with the new commit's copy, update the commit and hash above, and add
   any new conflicts to the overrides in our own rules.
3. Open a PR. An update is a tier 3 change.
