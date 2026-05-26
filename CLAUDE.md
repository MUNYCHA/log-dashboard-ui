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

React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12 + @tanstack/react-virtual 3. JavaScript/JSX only (no TypeScript). Styling is primarily Tailwind utility classes; `src/index.css` adds custom CSS for self-hosted fonts, global base styles, and keyframe animations.

## Architecture (Summary)

**Data flow:** `useWebSocket(url, viewedTopics)` hook → `App.jsx` (global state) → `Sidebar` + `LogPanel` (via props)

**State ownership:**
- `App.jsx` — selectedTopic/Server (per panel), themeMode (→ darkMode derived), terminalMode, topicSortMode, sidebarOpen/collapsed, splitView, activePanel, isPaused1/2, viewedTopics, isSettingsOpen, systemPrefersDark, topicSearchTerm
- `LogPanel.jsx` — all panel-local state via `useReducer` (`panelReducer`): path, search, keywords, timeRange, autoScroll, dropdowns, frozenLogs, frozenTopic, isMobileMenuOpen + separate useState for timestampGen, nowMs
- `useWebSocket` — logsByTopic, topics, isConnected, isReconnecting, logRates, clearLogs, trimTopicBuffer, subscribe, sendFilter

**Component tree:**
```
App
├── Sidebar (topics list, TopicItem per topic — memo'd)
├── LogPanel #1 (memo'd)
│   ├── DesktopHeader / MobileHeader / FilterBar / ActiveFilters (presentational, no memo)
│   ├── KeywordFilter (has local state: selectedColor)
│   ├── VirtualLogList (memo'd — @tanstack/react-virtual, ~20-30 visible rows)
│   │   └── LogEntry (memo'd — key=log._id, useMemo for relativeTime)
│   ├── ScrollButtons
│   └── StatusBar
└── LogPanel #2 (split view only, same structure)
```

**WS protocol:** Server sends `{ type: "topics", topics: string[] }` on connect (legacy bare `string[]` also accepted), then `LogEvent` objects or **batched JSON arrays**, plus `{ type: "stats" }` rate updates. Each log gets `_id` (monotonic counter) for stable React keys.

**Client-side filtering:** All filtering (server, path, search, keywords, timeRange) runs client-side in `filteredLogs` useMemo for instant real-time feedback. Keyword input uses `debouncedKeywordInput` (300ms) so the filter and the pending keyword chip appear in sync. Server-side filter (debounced 300ms) is a bandwidth optimization only — UI does not depend on it for display.

**Topic subscription:** All topics auto-subscribed on connect. Viewed topics get a raw buffer of `displayCap × 4` (2000 at default) so filtered views can fill the display cap (500). Non-viewed topics capped at 100 (sidebar info only). The 500 display cap is applied in `filteredLogs.slice(0, config.ws.maxLogsPerTopic)`.

## Key Rules

- `selectedPath` is local to LogPanel, auto-clears on topic change via `pathForTopic` pattern
- `selectedServer` / `selectedServer2` are per-panel independent state in App.jsx — each panel has its own server filter, not shared
- All filters reset on topic change via `dispatch({ type: 'RESET_TOPIC', topic })` in a `useEffect` inside `LogPanel.jsx`. State is owned by a `useReducer` (`panelReducer`) — `initialPanelState(topic)` is the single source of truth for what resets. LogPanel is NOT remounted; it stays alive to avoid flicker.
- Active filters resent on WS reconnect. `sendFilter(filters, panelId)` tracks per-panel filters in `panelFiltersRef` — in split view, if both panels have filters, server-side filter is cleared so both panels receive all logs and filter independently client-side
- Auto-scroll is disabled only by user-initiated upward scrolling (guarded by an 800ms `userScrollIntentUntilRef` window — prevents programmatic `scrollToIndex` from being misidentified as user intent). Re-enabling requires an explicit action: clicking `scrollToBottom()` (scroll-to-bottom button) or toggling the auto-scroll button.
- Mobile menu: 300ms `pointer-events-none` guard against double-tap

## Performance Rules (DO NOT REGRESS)

- **Keys**: `LogEntry` MUST use `log._id` — NEVER array index (shifted keys = full re-render of 500 items)
- **Virtualization**: Log list MUST use `@tanstack/react-virtual` flow mode — items in normal document flow between CSS `paddingTop`/`paddingBottom` spacers. NEVER switch to absolutely-positioned mode (breaks flow layout).
- **Auto-scroll — two effects, do not merge:**
  - Effect 1 `[displayedLogs, autoScroll, isPaused]`: scrolls on new logs — blocked by `isPaused` intentionally.
  - Effect 2 `[totalSize]`: re-anchors after remeasurement (text reflow on resize) — NOT blocked by `isPaused`. Guards via `atBottomRef` (scroll to last) or `anchorIndexRef` (restore captured item).
- **Auto-scroll**: MUST use `useEffect` + `requestAnimationFrame` — NEVER `useLayoutEffect` (blocks main thread)
- **Scroll position on resize**: ResizeObserver captures the topmost visible item index (`anchorIndexRef`) before `measure()` fires, restores it in Effect 2 after `totalSize` updates. `atBottomRef` used as the single gate for all resize compensation — works whether paused or live.
- **`scrollToBottom()`**: prefer `virtualizerScrollToBottomRef` (virtualizer-based `scrollToIndex`) to avoid landing mid-item on spacer boundaries. Falls back to raw `scrollTop = scrollHeight` only when the ref is unavailable (e.g. topic-change scroll before virtualizer mounts).
- **Paused banner**: rendered OUTSIDE the scroll container as a `flex-shrink-0` element in the flex column. NEVER inside the `overflow-auto` div (would scroll out of view).
- **Timestamps**: `LogPanel` refreshes `nowMs` every 5s and passes it to visible `LogEntry` rows so relative timestamps update without impure render-time clock reads.
- **Flush interval**: 150ms in useWebSocket — balances responsiveness vs re-render frequency
- Sub-components (DesktopHeader, MobileHeader, etc.) are intentionally NOT memo'd — they're cheap renders, memo overhead isn't worth it

## Environment

`.env` is gitignored. Copy `.env.example` for standalone UI development. Office deployment values are owned by `../log-infra/.env`.

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | blank | Optional WebSocket/API origin override; blank derives same-origin `/ws/logs`. |
| `VITE_SSO_LOGIN_URL` | blank | Optional Keycloak authority override; blank derives same-origin `/auth/realms/logstream`. |
| `VITE_SSO_CLIENT_ID` | `logstream-ui` | Keycloak OIDC client ID for authenticated deployment. |
| `VITE_MAX_LOGS_PER_TOPIC` | `500` | Display cap per viewed topic; internal raw buffer stores 4× this for filter headroom (non-viewed: 100) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncate messages longer than this (chars) |

## ESLint

- `no-unused-vars` ignores uppercase/underscore-prefixed names (`^[A-Z_]`)
