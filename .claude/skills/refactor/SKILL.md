---
name: refactor
description: Use Codex CLI to plan a large refactor across multiple files, then Claude applies each change in order. Use for renames, restructuring, API changes, or any refactor touching 3+ files.
---

Execute a large refactor using Codex for planning and Claude for applying changes.

Refactor goal: $ARGUMENTS

Steps:

1. Run Codex to analyze all affected files and produce a step-by-step refactor plan:

```bash
cd D:/log-dashboard-ui && codex exec --color never -s read-only -o .codex-refactor-tmp.md "You are planning a large refactor for a React/Vite frontend project. The refactor goal is: $ARGUMENTS

Scan the entire src/ directory. Identify every file that needs to change.

Output a structured markdown refactor plan with these sections ONLY — no file dumps, no summaries, just the plan:

## Scope
List every file that needs to change and one sentence explaining why.

## Dependency Order
List the changes in the order they must be applied (e.g. rename a hook before updating consumers).

## Changes
For each file, in dependency order, provide:

### Step N — path/to/file.jsx
**What:** one sentence describing the change
**Find:**
\`\`\`
exact current code to replace (enough context to be unique in the file)
\`\`\`
**Replace with:**
\`\`\`
exact new code
\`\`\`

## Risks
Any breaking changes, performance rule violations, or side effects to watch for.

Be precise. Quote actual code. Do not suggest changes beyond what the refactor goal requires."
```

2. Read `.codex-refactor-tmp.md`

3. Show the user the **Scope** and **Risks** sections and ask for confirmation before proceeding.

4. After confirmation, apply each step from the **Changes** section in order:
   - Read the target file before each edit
   - Use the Edit tool to apply the exact find/replace
   - Do not change anything outside the specified block
   - If a change cannot be applied (code not found), stop and report to the user

5. After all changes are applied, run lint:
```bash
cd D:/log-dashboard-ui && npm run lint
```

6. Delete the temp file:
```bash
rm D:/log-dashboard-ui/.codex-refactor-tmp.md
```

7. Report: files changed, any lint errors, any steps that were skipped.

Notes:
- Always confirm scope with the user before applying any changes
- Never apply changes that violate CLAUDE.md Performance Rules (keys, virtualization, auto-scroll, effects)
- If Codex plan touches more than what was asked, flag the extra scope to the user before applying
- If lint fails after changes, report the errors — do not attempt to auto-fix without user approval
- If Codex times out or fails, ask the user to break the refactor into smaller pieces
