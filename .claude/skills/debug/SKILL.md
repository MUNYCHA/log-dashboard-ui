---
name: debug
description: Use Codex CLI to investigate a bug — trace root cause across files, identify the fix location. Claude then applies the actual code fix. Use when you have a bug or unexpected behavior to diagnose.
---

Debug the reported issue using Codex for investigation and Claude for the fix.

Bug description: $ARGUMENTS

Steps:

1. Run Codex to investigate — it scans relevant files and diagnoses the root cause:

```bash
cd D:/log-dashboard-ui && codex exec --color never -s read-only -o .codex-debug-tmp.md "You are debugging a React/Vite frontend project. The reported bug is: $ARGUMENTS

Scan the src/ directory. Focus on files most likely related to this bug. Trace the data flow — props, state, effects, callbacks.

Output a compact markdown report with these sections ONLY — no file dumps, just findings:

## Root Cause
Exact file path and line number where the bug originates. Explain why this code causes the problem.

## Data Flow
Short trace of how the bug propagates (e.g. state update → wrong prop → bad render).

## Fix
The exact code change needed. Include:
- File path
- The current code (quote it)
- The replacement code
- Why this fixes it

## Side Effects
Any other files or behaviors that may be affected by the fix.

Be precise. Quote actual code lines. Do not summarize file contents."
```

2. Read `.codex-debug-tmp.md`

3. Review the Root Cause and Fix sections carefully. If the diagnosis looks correct:
   - Read the target file(s) Codex identified
   - Apply the fix using the Edit tool
   - Do not change anything beyond what the fix requires

4. Delete the temp file:
```bash
rm D:/log-dashboard-ui/.codex-debug-tmp.md
```

5. Report: what was the root cause, what was changed, and any side effects to watch for.

Notes:
- If Codex cannot find the root cause, ask the user for more details (error message, steps to reproduce, which component)
- If the fix touches state or effects, re-read CLAUDE.md Key Rules and Performance Rules before applying
- Never apply a fix that violates the performance rules in CLAUDE.md (keys, virtualization, auto-scroll)
- If Codex times out or fails, fall back to reading related files manually with Read + Grep
