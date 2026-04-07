---
name: design
description: Plan a UI/UX or feature design for this project before writing code. Use when adding new components, layouts, or visual features.
---

Plan the design for the requested feature or component in this log dashboard project.

Context:
- Stack: React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12
- Styling: 100% Tailwind utility classes — no custom CSS files
- Theme: dark/light mode via `darkMode` boolean prop passed down from App.jsx; use `dark:` variants
- Layout: sidebar + one or two LogPanel columns (split view)
- Component philosophy: keep state as high as needed, pass props down; memo only heavy components

Steps:
1. Read ARCHITECTURE.md to understand current component tree, state ownership, and theme tokens.
2. Clarify the goal: what problem does this design solve? What does the user see and interact with?
3. Describe the visual layout — where it lives in the component tree, rough HTML/flex structure.
4. List Tailwind classes or patterns to use (colors, spacing, responsive breakpoints, dark mode variants).
5. Identify any Framer Motion animations needed (entry, exit, hover, layout transitions).
6. List state changes required: new local state, reducer actions, or App.jsx global state additions.
7. Call out any performance concerns (memo, virtualization, debounce needs).
8. Present the plan clearly before writing any code. Wait for approval unless the user says to proceed.

If the user provided a target feature or component via arguments, focus the plan on: $ARGUMENTS
