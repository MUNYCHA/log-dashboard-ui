# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint (flat config, ESLint 9)
npm run preview   # Preview production build locally
```

## Stack

React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12. JavaScript/JSX only (no TypeScript). Styling is 100% Tailwind utility classes — no CSS modules or styled-components.

## Architecture

**Component structure:** Components are organized into folders under `src/components/`:
- `common/` — shared UI primitives (ThemeToggle, HeartbeatLine)
- `filters/` — filter dropdowns and keyword filter (FilterDropdown, ServerDropdown, PathDropdown, KeywordFilter)
- `log/` — log panel and its sub-components (LogPanel orchestrator, DesktopHeader, MobileHeader, FilterBar, ActiveFilters, StatusBar, EmptyState, ScrollButtons, LogEntry, constants)
- `sidebar/` — topic sidebar (Sidebar)

Each folder has an `index.js` for clean imports (e.g. `import LogPanel from './components/log'`).

**Data flow:** `useWebSocket` hook → `App.jsx` (global state) → `Sidebar` + `LogPanel` (via props)

**`useWebSocket(url)`** is the single data source. It manages the WebSocket connection, auto-reconnect (exponential backoff, max 30s), log batching (150ms flush interval), per-topic rate tracking (5s window), and pause/buffer logic. Returns `{ logsByTopic, topics, isConnected, isReconnecting, clearLogs, logRates }`.

**WS protocol:** Server sends `string[]` (topic list) on connect, then individual `{ topic, serverName, path, message, timestamp }` objects. Max 100 logs per topic in memory (`config.ws.maxLogsPerTopic`).

**`App.jsx`** owns all cross-component state: selected topics/servers for each panel, dark mode, sidebar open/collapsed, split view, per-panel pause states. Theme is resolved here (`darkMode ? styles.dark : styles.light`) and passed down.

**Split view:** Two independent `LogPanel` instances, each with their own topic, server, pause, and filter state. Panel 2 state (`selectedTopic2`, `selectedServer2`, `isPaused2`) lives in App; panel-local filters (path, search, keywords, time range) live inside LogPanel.

**Theme system** (`src/constants/theme.js`): Two complete token objects (`styles.dark`, `styles.light`) containing Tailwind class strings. Components receive a `theme` prop and use `theme.X` for all styling. `popupBorder` is used for floating elements (dropdowns, scroll buttons); `border` is `border-transparent` (no visible dividers between sections).

## Key Patterns

- `selectedPath` state is local to `LogPanel`, auto-clears on topic change via `pathForTopic` pattern
- `selectedServer` is global (App.jsx) because Sidebar badges depend on it
- All filters reset when topic changes (render-phase check: `prevTopic !== selectedTopic`)
- Auto-scroll is button-toggled only — manual scrolling does not disable it
- Mobile menu has a 300ms `pointer-events-none` guard to prevent double-tap issues
- `LogPanel` uses `useLayoutEffect` for auto-scroll to avoid visible flicker
- ESLint `no-unused-vars` ignores uppercase/underscore-prefixed names (`^[A-Z_]`)

## Environment

`.env` is gitignored. Copy `.env.example` and set `VITE_WS_URL` (default fallback: `ws://localhost:8080/ws/logs`).
