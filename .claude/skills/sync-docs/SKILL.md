---
name: sync-docs
description: Check README.md, CLAUDE.md, and ARCHITECTURE.md against recent code changes and update if needed. Use after editing source files.
---

Check whether README.md, CLAUDE.md, and ARCHITECTURE.md are still accurate after the recent code changes, and update them if needed.

Steps:
1. Run `git diff HEAD~1` (or `git diff` if there are staged/unstaged changes) to see what was modified.
2. Read README.md, CLAUDE.md, and ARCHITECTURE.md.
3. For each doc, identify any sections that are now inaccurate, outdated, or missing based on the code changes.
4. Make targeted edits — only change what's actually wrong or missing. Do not rewrite sections that are still correct.
5. Report a brief summary: what was updated in each file, or confirm nothing needed changing.

Focus areas to check:
- CLAUDE.md: Key Rules, Architecture Summary, File Map, state ownership
- ARCHITECTURE.md: State Ownership Map, Theme System token list, Sub-component Props, File Map
- README.md: Features list, Project Structure, Configuration table
