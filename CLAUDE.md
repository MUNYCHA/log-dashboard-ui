# CLAUDE.md

Guidance for Claude Code. For deep implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Commands

```bash
npm run dev       # Vite dev server at localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint (flat config, ESLint 9)
npm run preview   # Preview production build locally
```

## Stack

React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12 + @tanstack/react-virtual 3. JavaScript/JSX only (no TypeScript). Styling is 100% Tailwind utility classes.

## Architecture (Summary)

**Data flow:** `useWebSocket(url, viewedTopics)` hook → `App.jsx` (global state) → `Sidebar` + `LogPanel` (via props)

**State ownership:**
- `App.jsx` — selectedTopic/Server (per panel), darkMode, sidebarOpen/collapsed, splitView, activePanel, isPaused1/2, viewedTopics
- `LogPanel.jsx` — path, search, keywords, timeRange, autoScroll, dropdowns, frozenLogs, frozenTopic, timestampGen, nowMs
- `useWebSocket` — logsByTopic, topics, isConnected, logRates

**Component tree:**
```
App
├── Sidebar (topics list, TopicItem per topic — memo'd)
├── LogPanel #1 (memo'd)
│   ├── DesktopHeader / MobileHeader / FilterBar / ActiveFilters (presentational, no memo)
│   ├── KeywordFilter (has local state: selectedColor, hexInput)
│   ├── VirtualLogList (memo'd — @tanstack/react-virtual, ~20-30 visible rows)
│   │   └── LogEntry (memo'd — key=log._id, useMemo for relativeTime)
│   ├── ScrollButtons
│   └── StatusBar
└── LogPanel #2 (split view only, same structure)
```

**WS protocol:** Server sends `string[]` (topics) on connect, then `LogEvent` objects or **batched JSON arrays**, plus `{ type: "filter-ack" }` acks. Hook normalizes both formats. Each log gets `_id` (monotonic counter) for stable React keys.

**Client-side filtering:** All filtering (server, path, search, keywords, regex, timeRange) runs client-side in `filteredLogs` useMemo for instant real-time feedback. Server-side filter (debounced 300ms) is a bandwidth optimization only — UI does not depend on it for display.

**Topic subscription:** All topics auto-subscribed on connect. Viewed topics get full 500-log cap; non-viewed topics capped at 50 (sidebar info only).

## Key Rules

- `selectedPath` is local to LogPanel, auto-clears on topic change via `pathForTopic` pattern
- `selectedServer` is global (App.jsx) — Sidebar badges depend on it
- All filters reset on topic change via key-based component remount (`key=panel-X-${selectedTopic}` in App.jsx forces full LogPanel remount)
- Active filters resent on WS reconnect (stored in `activeFilterRef`)
- Auto-scroll is button-toggled only — manual scrolling does NOT disable it
- Mobile menu: 300ms `pointer-events-none` guard against double-tap

## Performance Rules (DO NOT REGRESS)

- **Keys**: `LogEntry` MUST use `log._id` — NEVER array index (shifted keys = full re-render of 500 items)
- **Virtualization**: Log list MUST use `@tanstack/react-virtual` — only visible rows rendered
- **Auto-scroll**: MUST use `useEffect` + `requestAnimationFrame` — NEVER `useLayoutEffect` (blocks main thread)
- **Timestamps**: `LogEntry` receives `timestampGen` counter, computes `Date.now()` internally via `useMemo` — NEVER pass a changing `now` prop (breaks memo for all entries)
- **Flush interval**: 150ms in useWebSocket — balances responsiveness vs re-render frequency
- Sub-components (DesktopHeader, MobileHeader, etc.) are intentionally NOT memo'd — they're cheap renders, memo overhead isn't worth it

## Environment

`.env` is gitignored. Copy `.env.example` and configure. All values baked at build time.

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080/ws/logs` | WebSocket server URL |
| `VITE_MAX_LOGS_PER_TOPIC` | `500` | Max logs in memory per viewed topic (non-viewed: 50) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncate messages longer than this (chars) |

## ESLint

- `no-unused-vars` ignores uppercase/underscore-prefixed names (`^[A-Z_]`)
