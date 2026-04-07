---
name: audit-docs
description: Use Codex CLI to scan every source file in the project and report what has drifted from CLAUDE.md, ARCHITECTURE.md, and README.md. Codex does the heavy file reading (OpenAI tokens), Claude only reads the final report.
---

Audit the project documentation against the actual source code using Codex CLI.

Steps:
1. Run Codex to scan the full project and write a drift report:

```bash
cd D:/log-dashboard-ui && codex exec --color never -s read-only -o .codex-audit-tmp.md "You are auditing documentation accuracy. Scan every file under src/ in this project. Then read CLAUDE.md, ARCHITECTURE.md, and README.md. Output a structured markdown report with these four sections ONLY — do not include file contents, just the findings:

## Accurate
List doc claims that match the code exactly.

## Drifted
List doc claims that are wrong or outdated. For each: quote the doc claim, then describe what the code actually does. Include file:line references.

## Missing
List things in the code that are NOT documented in any of the three docs. Include file:line references.

## Stale
List things mentioned in the docs that no longer exist in the code.

Be specific. Quote exact lines from the docs when flagging drift. Do not summarize file contents."
```

2. Read the output file:
   - Read `.codex-audit-tmp.md`

3. For each item in Drifted, Missing, and Stale sections — make the targeted edit to the correct doc file (CLAUDE.md, ARCHITECTURE.md, or README.md). Do not rewrite sections that are already accurate.

4. Delete the temp file after updates are done:
```bash
rm D:/log-dashboard-ui/.codex-audit-tmp.md
```

5. Report a summary: how many drift/missing/stale issues were found and fixed.

Notes:
- Codex runs with -s read-only so it cannot modify any files
- The temp file is always cleaned up — never commit it
- If Codex fails or times out, fall back to reading src/ files manually with Read + Grep
