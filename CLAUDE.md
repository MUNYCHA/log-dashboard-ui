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

React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12 + @tanstack/react-virtual 3 + React Router 7. JavaScript/JSX only (no TypeScript). Styling is 100% Tailwind utility classes.

## Architecture (Summary)

**Data flow:**
- `useWebSocket(url, viewedTopics, token)` → `App.jsx` (global state) → `LogPanel` (via props)
- `useServerStorage(storageClient)` → `App.jsx` → `HomePage` + `StorageDashboard` (via props)
- `useApiClient()` → builds `storageClient` + `logsClient` from auth token → passed to hooks/components
- `useAuth()` → token, user, login, logout — available anywhere inside `AuthProvider`

**State ownership:**
- `App.jsx` — selectedTopic/Server (per panel), darkMode, sidebarOpen/collapsed, splitView, activePanel, isPaused1/2, viewedTopics, activeNav, selectedSystemId
- `LogPanel.jsx` — path, search, keywords, timeRange, autoScroll, dropdowns, frozenLogs, frozenTopic, timestampGen, nowMs, isMobileMenuOpen
- `useWebSocket` — logsByTopic, topics, isConnected, logRates
- `useServerStorage` — data, loading, error, lastUpdated
- `SecondaryPanel` — systemSortMode, systemSearchTerm (local, display only)
- `AuthContext` — token, user, loading

**Component tree:**
```
BrowserRouter
└── AuthProvider
    ├── /callback → CallbackPage (public)
    └── /* → AuthGuard → App
                ├── AppShell
                │   ├── NavRail (desktop rail + mobile bottom tab bar)
                │   ├── SecondaryPanel (topics list for Logs, systems list for Storage)
                │   └── [main content slot]
                ├── HomePage        (activeNav === 'home')
                ├── LogPanel #1     (activeNav === 'logs')
                │   ├── DesktopHeader / MobileHeader / FilterBar / ActiveFilters
                │   ├── KeywordFilter
                │   ├── VirtualLogList (memo'd — @tanstack/react-virtual)
                │   │   └── LogEntry (memo'd — key=log._id)
                │   ├── ScrollButtons
                │   └── StatusBar
                ├── LogPanel #2     (activeNav === 'logs' + splitView)
                ├── StorageDashboard (activeNav === 'servers')
                │   └── ServerCard (per server)
                └── SettingsPage    (activeNav === 'settings')
```

**WS protocol:** Server sends `string[]` (topics) on connect, then `LogEvent` objects or **batched JSON arrays**, plus `{ type: "filter-ack" }` acks. Hook normalizes both formats. Each log gets `_id` (monotonic counter) for stable React keys. Token attached as `?token=` query param (browsers cannot send WS headers).

**Client-side filtering:** All filtering (server, path, search, keywords, timeRange) runs client-side in `filteredLogs` useMemo for instant real-time feedback. Keyword input uses `debouncedKeywordInput` (300ms) so the filter and the pending keyword chip appear in sync. Server-side filter (debounced 300ms) is a bandwidth optimization only — UI does not depend on it for display.

**Topic subscription:** All topics auto-subscribed on connect. Viewed topics get full 500-log cap; non-viewed topics capped at 100 (sidebar info only).

**API layer:** All HTTP calls go through `src/api/client.js` (auth header, 401 auto-logout, error handling). `storageApi.js` and `logsApi.js` define endpoints. `useApiClient()` builds memoized clients from the current token.

**Auth:** SSO via OIDC. `AuthGuard` blocks the app until a token is present. If `VITE_SSO_LOGIN_URL` is empty, auth is skipped (dev mode). Token exchange in `CallbackPage.jsx` is a TODO pending DEC SSO details.

## Key Rules

- `selectedPath` is local to LogPanel, auto-clears on topic change via `pathForTopic` pattern
- `selectedServer` is global (App.jsx) — SecondaryPanel badges depend on it
- All filters reset on topic change via key-based component remount (`key=panel-X-${selectedTopic}` in App.jsx forces full LogPanel remount)
- Active filters resent on WS reconnect (stored in `activeFilterRef`)
- Auto-scroll is disabled only by user-initiated upward scrolling (guarded by an 800ms `userScrollIntentUntilRef` window — prevents programmatic `scrollToIndex` from being misidentified as user intent). Scrolling back to the bottom re-enables it.
- Mobile menu: 300ms `pointer-events-none` guard against double-tap
- Nav id `'servers'` is the internal key for the Storage page — do not rename it (all `activeNav === 'servers'` checks depend on it)

## Performance Rules (DO NOT REGRESS)

- **Keys**: `LogEntry` MUST use `log._id` — NEVER array index (shifted keys = full re-render of 500 items)
- **Virtualization**: Log list MUST use `@tanstack/react-virtual` flow mode — items in normal document flow between CSS `paddingTop`/`paddingBottom` spacers. NEVER switch to absolutely-positioned mode (breaks flow layout).
- **Auto-scroll — two effects, do not merge:**
  - Effect 1 `[displayedLogs, autoScroll, isPaused]`: scrolls on new logs — blocked by `isPaused` intentionally.
  - Effect 2 `[totalSize]`: re-anchors after remeasurement (text reflow on resize) — NOT blocked by `isPaused`. Guards via `atBottomRef` (scroll to last) or `anchorIndexRef` (restore captured item).
- **Auto-scroll**: MUST use `useEffect` + `requestAnimationFrame` — NEVER `useLayoutEffect` (blocks main thread)
- **Scroll position on resize**: ResizeObserver captures the topmost visible item index (`anchorIndexRef`) before `measure()` fires, restores it in Effect 2 after `totalSize` updates. `atBottomRef` used as the single gate for all resize compensation — works whether paused or live.
- **`scrollToBottom()`**: MUST use `virtualizerScrollToBottomRef` (virtualizer-based `scrollToIndex`) — NEVER raw `scrollTop = scrollHeight` (lands mid-item on spacer boundaries).
- **Paused banner**: rendered OUTSIDE the scroll container as a `flex-shrink-0` element in the flex column. NEVER inside the `overflow-auto` div (would scroll out of view).
- **Timestamps**: `LogEntry` receives `timestampGen` counter, computes `Date.now()` internally via `useMemo` — NEVER pass a changing `now` prop (breaks memo for all entries)
- **Flush interval**: 150ms in useWebSocket — balances responsiveness vs re-render frequency
- Sub-components (DesktopHeader, MobileHeader, etc.) are intentionally NOT memo'd — they're cheap renders, memo overhead isn't worth it

## Environment

`.env` is gitignored. Copy `.env.example` and configure. All values baked at build time.

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080/ws/logs` | WebSocket server URL. Also used to derive `httpBaseUrl` for REST API calls (`ws://` → `http://`, `wss://` → `https://`) |
| `VITE_MAX_LOGS_PER_TOPIC` | `500` | Max logs in memory per viewed topic (non-viewed: 100) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncate messages longer than this (chars) |
| `VITE_STORAGE_API_URL` | `http://localhost:8081` | Storage monitoring REST API base URL |
| `VITE_SSO_LOGIN_URL` | _(empty)_ | DEC SSO authorization endpoint. **If empty, auth is skipped (dev mode)** |
| `VITE_SSO_LOGOUT_URL` | _(empty)_ | DEC SSO logout endpoint |
| `VITE_SSO_TOKEN_URL` | _(empty)_ | DEC SSO token exchange endpoint |
| `VITE_SSO_CLIENT_ID` | _(empty)_ | App client ID registered with DEC SSO |
| `VITE_SSO_REDIRECT_URI` | `{origin}/callback` | SSO callback URL — defaults to current origin + /callback |

## ESLint

- `no-unused-vars` ignores uppercase/underscore-prefixed names (`^[A-Z_]`)
