---
name: project-overview
description: Load a compact mental model of the entire project using only the docs. Use at the start of a session or before a large task to orient quickly without burning tokens on source files.
---

Build a concise mental model of this project by reading only the documentation — do NOT read source files unless a specific gap requires it.

Steps:
1. Read these three files in order (they are the source of truth):
   - CLAUDE.md — stack, commands, architecture summary, key rules, performance rules
   - ARCHITECTURE.md — full component tree, state ownership, data flow, file map
   - README.md — features, project structure, configuration
2. From those docs alone, produce a compact project summary covering:
   - **What it does** (1-2 sentences)
   - **Stack** (tech + versions)
   - **Data flow** (WebSocket → state → UI in one line)
   - **Key files** (the 4-5 most important ones and their role)
   - **State ownership** (who owns what)
   - **Rules to never break** (performance + architectural constraints)
3. If $ARGUMENTS specifies a focus area (e.g., "filters", "split view", "theme"), highlight the relevant parts of the docs for that area.
4. Do NOT read any src/ files unless the docs are missing critical information for the requested focus.
5. End with: "Ready — ask me anything about the project or give me a task."

Focus area (if any): $ARGUMENTS
