---
name: delegate
description: "Boss mode — Claude plans and architects, Codex CLI does ALL coding. Claude never writes code directly. Use for any coding task: features, fixes, refactors, or investigations. Claude acts as senior dev, Codex is the developer."
---

# Boss Mode

Task: $ARGUMENTS

**Rules for this entire session:**
- Claude = senior dev / boss. Plans, architects, writes Codex prompts, reviews output. NEVER uses Edit/Write tools for code.
- Codex CLI = developer. Does all file reading, analysis, and code changes.
- User = stakeholder. Describes goals, approves scope, sees results.

---

## Phase 1 — Boss Planning

Read CLAUDE.md and ARCHITECTURE.md mentally (you already have them in context). As the senior dev, think through:
- What is the user actually asking for? Restate it clearly.
- Which part of the codebase is likely involved? (component tree, state ownership, hooks)
- What approach makes sense given the stack (React 19 + Vite 7 + Tailwind 4)?
- Are there any CLAUDE.md Key Rules or Performance Rules that apply?

Write a brief **Boss Plan** (3–6 bullet points) that you will hand to the developer (Codex). Share this with the user before proceeding so they can correct course.

---

## Phase 2 — Send Developer to Explore

Run Codex in read-only mode to explore the codebase and validate assumptions:

```bash
cd D:/log-dashboard-ui && codex exec --color never -s read-only -o .codex-delegate-explore.md "You are a developer on a React/Vite frontend project. Your senior dev has given you this task:

TASK: $ARGUMENTS

Your job is to explore the codebase and report back to the senior dev before writing any code.

Scan src/ and identify:

## Files Involved
List every file relevant to this task with one sentence explaining why.

## Current Behavior
How does the relevant code work right now? Quote key lines.

## What Needs to Change
Describe the changes needed in plain English — no code yet, just what needs to happen.

## Risks or Gotchas
Any tricky parts, performance concerns, or edge cases the senior dev should know about.

Be precise. Quote actual code. Do not implement anything yet."
```

Read `.codex-delegate-explore.md` and review the developer's findings.

---

## Phase 3 — Boss Review & Implementation Brief

As the boss, review what Codex found. Check:
- Did the developer understand the task correctly?
- Are there any risks that would violate CLAUDE.md Performance Rules (keys, virtualization, auto-scroll, effects)?
- Is the scope right — not too wide, not too narrow?

If something looks wrong, run Codex explore again with a more targeted prompt before proceeding.

When satisfied, write a clear **Implementation Brief** — a precise Codex prompt that tells the developer exactly what to implement. Be specific: file paths, what to add/change/remove, what to NOT touch.

---

## Phase 4 — Send Developer to Implement

Run Codex in write mode with the implementation brief you wrote:

```bash
cd D:/log-dashboard-ui && codex exec --color never -o .codex-delegate-impl.md "[YOUR IMPLEMENTATION BRIEF HERE — replace this placeholder with the actual brief from Phase 3]

After making all changes, output a report:

## Changes Made
For each file changed, list the file path and one sentence describing what changed.

## What Was NOT Changed
Any files or behaviors you intentionally left alone.

## Anything Unusual
Any deviation from the brief, or anything the senior dev should review."
```

Read `.codex-delegate-impl.md` and review the developer's work.

---

## Phase 5 — Boss Code Review

As the senior dev, validate the implementation:
- Do the described changes match what was asked?
- Do any changes risk violating CLAUDE.md Performance Rules?
- Did Codex stay in scope (no unrequested changes)?
- Run lint to check for errors:

```bash
cd D:/log-dashboard-ui && npm run lint 2>&1 | head -40
```

If lint fails or the implementation looks wrong:
- Write a correction brief and loop back to Phase 4 with a targeted fix prompt
- Maximum 2 correction loops before flagging to the user

---

## Phase 6 — Cleanup & Report

Delete temp files:
```bash
rm D:/log-dashboard-ui/.codex-delegate-explore.md D:/log-dashboard-ui/.codex-delegate-impl.md 2>/dev/null; true
```

Report to the user:
- What was done (from developer's Changes Made section)
- Any deviations from the original ask
- Any lint errors or unresolved issues
- What to test manually

---

## Notes for Boss Mode

- If the task is purely investigative (no code change needed), stop after Phase 3 and report findings
- If the user says "just do it" or "no need to confirm", skip the scope check in Phase 3 and go straight to Phase 4
- If Codex fails or times out, report the failure and ask the user to break the task into smaller pieces
- Never write a single line of code yourself — if you are tempted to "just fix it quickly", resist and delegate to Codex instead
- If the user gives feedback mid-task, incorporate it into the next Codex prompt as a correction from the senior dev
