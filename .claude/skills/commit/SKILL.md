---
name: commit
description: Stage and commit changes with a conventional commit message. Use when ready to commit work.
---

Commit the current changes to git.

Steps:
1. Run `git status` and `git diff` (staged + unstaged) to understand what changed.
2. Stage the relevant modified files by name — do NOT use `git add -A` or `git add .`.
3. Write a conventional commit message:
   - Format: `<type>(<optional scope>): <subject>`
   - Types: feat, fix, docs, refactor, style, perf, chore, test
   - Subject: imperative, ≤72 chars, lowercase
   - Add a body only if the why isn't obvious from the subject
4. Commit using a HEREDOC — do NOT add any Co-Authored-By line.
5. Run `git status` after to confirm.

If the user provided a hint via arguments, use it to guide the message: $ARGUMENTS
