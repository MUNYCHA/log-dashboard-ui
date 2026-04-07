---
name: explain-code
description: Explain how a specific file, component, hook, or concept works in this codebase. Use when onboarding, debugging, or before modifying unfamiliar code.
---

Explain the requested code in this log dashboard project clearly and in depth.

Context:
- Stack: React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12 + @tanstack/react-virtual 3
- JavaScript/JSX only — no TypeScript
- Data flow: useWebSocket hook → App.jsx (global state) → Sidebar + LogPanel (via props)
- See ARCHITECTURE.md for the full component tree, state ownership map, and WS protocol

Steps:
1. Identify the target from $ARGUMENTS — a file path, component name, hook, or concept.
   If no argument is given, ask the user what they want explained.
2. Read the relevant file(s) in full before explaining anything.
3. Also read any closely related files (e.g., if explaining LogPanel, also skim useWebSocket and App.jsx for context).
4. Explain in this order:
   a. **Purpose** — what problem does this code solve?
   b. **How it works** — walk through the logic step by step, referencing actual line numbers
   c. **Key decisions** — why is it structured this way? (performance, data flow, UX constraints)
   d. **Interactions** — what does it receive (props/context) and what does it produce (output/side effects)?
   e. **Gotchas** — anything non-obvious, tricky, or easy to break
5. Use concrete examples from the actual code — quote snippets, reference line numbers.
6. Keep the explanation layered: start with the big picture, then drill into details.

Target to explain: $ARGUMENTS
