# Architecture — log-dashboard-ui

Deep implementation reference. CLAUDE.md links here for details.

---

## File Map

```
src/
├── main.jsx                          # Entry point — renders Root inside StrictMode + ErrorBoundary
├── Root.jsx                          # BrowserRouter + AuthProvider + routes + SplashScreen gate
├── App.jsx                           # Global state, nav routing, split view, theme resolution
├── config.js                         # All env vars: WS, storage API, SSO, log caps
│
├── auth/
│   ├── AuthContext.jsx               # AuthProvider + useAuth hook — token in sessionStorage
│   ├── AuthGuard.jsx                 # Blocks render until token present, redirects to SSO
│   └── CallbackPage.jsx              # Handles /callback from SSO — TODO: token exchange
│
├── api/
│   ├── client.js                     # Base fetch wrapper — auth header, 401 logout, errors
│   ├── storageApi.js                 # Storage endpoints (getLatest)
│   ├── logsApi.js                    # Log endpoints (download)
│   └── useApiClient.js               # Hook — builds memoized clients from token
│
├── hooks/
│   ├── useWebSocket.js               # WS connection, reconnect, batching, rate tracking, filter dispatch
│   └── useServerStorage.js           # Storage data polling (30s interval) via storageApi
│
├── constants/
│   └── theme.js                      # styles.dark / styles.light token objects
│
├── utils/
│   ├── storageUtils.js               # formatBytes
│   └── timeUtils.js                  # getRelativeTime
│
└── components/
    ├── common/
    │   ├── ErrorBoundary.jsx         # App-level error boundary (used by main.jsx)
    │   └── SplashScreen.jsx          # Animated splash screen shown on first load (Root.jsx)
    │
    ├── layout/
    │   ├── AppShell.jsx              # Outer layout: NavRail + SecondaryPanel + content slot
    │   ├── NavRail.jsx               # Desktop vertical rail (72px) + mobile bottom tab bar
    │   └── SecondaryPanel.jsx        # Topics list (Logs) or Systems list (Storage) — collapsible
    │
    ├── home/
    │   └── HomePage.jsx              # Overview: WS status, topic summary, storage health, alerts
    │
    ├── settings/
    │   ├── SettingsPage.jsx          # Settings: theme, config display
    │   └── ThemeToggle.jsx           # Dark/light toggle button
    │
    ├── storage/
    │   ├── StorageDashboard.jsx      # Server storage panel — ServerCard per server
    │   └── index.js                  # Re-exports StorageDashboard
    │
    └── log/
        ├── LogPanel.jsx              # Main log viewer orchestrator
        ├── DesktopHeader.jsx         # Desktop toolbar (topic, rate, pause, download, split)
        ├── MobileHeader.jsx          # Mobile header + inline dropdowns
        ├── FilterBar.jsx             # Desktop filter row
        ├── ActiveFilters.jsx         # Active filter tags with clear buttons
        ├── StatusBar.jsx             # Bottom bar: connection, rate, stream mode
        ├── EmptyState.jsx            # Placeholder when no topic selected
        ├── ScrollButtons.jsx         # Floating scroll-to-top/bottom buttons
        ├── LogEntry.jsx              # Individual log row (memo'd, key=log._id)
        ├── HeartbeatLine.jsx         # Animated SVG log rate visualizer
        ├── constants.js              # TIME_RANGES, getButtonStyles, getShortPath
        ├── index.js                  # Re-exports LogPanel
        └── filters/
            ├── FilterDropdown.jsx    # Generic dropdown with search
            ├── ServerDropdown.jsx    # Server filter (wraps FilterDropdown)
            ├── PathDropdown.jsx      # Path filter (wraps FilterDropdown)
            ├── TimeRangeSelector.jsx # Time range presets + custom input
            ├── KeywordFilter.jsx     # Tag-based keyword filter with color picker
            └── index.js             # Re-exports all filters
```

---

## State Ownership Map

```
App.jsx (global)
├── selectedTopic / selectedTopic2      ← which topic each panel shows
├── selectedServer / selectedServer2    ← server filter (global — SecondaryPanel badges need it)
├── darkMode                            ← theme toggle
├── sidebarOpen / sidebarCollapsed      ← sidebar visibility
├── splitView / activePanel             ← split view mode + which panel is focused
├── isPaused1 / isPaused2              ← per-panel pause (frozen snapshot)
├── topicSortMode                       ← 'activity' | 'asc' | 'desc'
├── topicSearchTerm                     ← sidebar topic search
├── activeNav                           ← 'home' | 'logs' | 'servers' | 'settings'
├── selectedSystemId                    ← selected system in Storage view (null = nothing selected)
├── viewedTopics                        ← useMemo([selectedTopic, selectedTopic2]) for tiered log caps
│
├── useAuth() → { token, user, login, logout }
├── useApiClient() → { storageClient, logsClient }  ← memoized, rebuilds on token change
├── useWebSocket(url, viewedTopics, token) → shared across all components
│   ├── logsByTopic    — Record<topic, LogEntry[]> (newest-first after flush, 500 viewed / 100 non-viewed)
│   ├── topics         — string[]
│   ├── isConnected / isReconnecting
│   ├── logRates       — Record<topic, number> (logs/sec, 5s window)
│   └── clearLogs(topic), subscribe(topics), sendFilter(filters), trimTopicBuffer(topic)
└── useServerStorage(storageClient) → { data, loading, error, lastUpdated, refresh }

LogPanel.jsx (per-panel local)
├── frozenLogs / frozenTopic ← snapshot when paused
├── logSearchTerm / debouncedSearch     ← text search (300ms debounce for server-side)
├── pathForTopic        ← { topic, path } — auto-clears on topic change
├── keywords / keywordInput / keywordMode / debouncedKeywordInput (300ms)
├── timeRange / customRangeMs
├── autoScroll          ← disabled only by user-initiated upward scroll (800ms intent window)
├── showServerDropdown / showPathDropdown / showMobileServerDropdown / showMobilePathDropdown
├── serverSearchTerm / pathSearchTerm
├── isMobileMenuOpen / mobileMenuReady
├── atTop / atBottom    ← scroll position indicators
├── timestampGen        ← counter bumped every 5s for relative time refresh
└── nowMs               ← Date.now() updated every 5s + on timeRange change

SecondaryPanel.jsx (local, display only)
├── systemSortMode      ← 'asc' | 'desc'
└── systemSearchTerm    ← search input for systems list

AuthContext.jsx
├── token               ← JWT from SSO, stored in sessionStorage
├── user                ← parsed user info
└── loading             ← true while restoring from sessionStorage on mount
```

---

## API Layer

```
useApiClient()
  → createClient({ baseUrl: storageApiUrl, token, onUnauthorized: logout })  → storageClient
  → createClient({ baseUrl: httpBaseUrl,    token, onUnauthorized: logout })  → logsClient

storageClient → storageApi.getLatest(client)   → GET /api/server-storage-usage/latest
logsClient    → logsApi.download(client, topic) → GET /api/logs/download?topic=...

client.js handles:
  - Authorization: Bearer <token> header on every request
  - 401 response → calls onUnauthorized() → logout()
  - Non-OK responses → throws ApiError(status, message)
```

Adding a new endpoint = one line in `storageApi.js` or `logsApi.js`. Nothing else changes.

---

## Auth Flow

```
App opens
  → AuthGuard checks sessionStorage for token
  → No token + VITE_SSO_LOGIN_URL set → redirect to SSO login
  → No token + VITE_SSO_LOGIN_URL empty → skip auth (dev mode)
  → Token found → render App normally

SSO login:
  User → SSO login page
  → SSO redirects to /callback?code=xxx
  → CallbackPage exchanges code for token  ← TODO: fill in when SSO details available
  → handleCallback(token, user) → stored in sessionStorage
  → navigate('/') → App renders

Token expiry:
  Any API call returns 401
  → client.js catches it → calls onUnauthorized()
  → logout() → clears sessionStorage → redirect to /
  → AuthGuard → redirect to SSO login
```

---

## Render Optimization Strategy

### What's memoized
| Component | `React.memo` | Internal `useMemo` | Notes |
|---|---|---|---|
| `LogPanel` | Yes | `filteredLogs`, `serversForSelectedTopic`, `pathsForSelectedServer`, `filteredServers`, `filteredPaths`, `displayKeywords`, `emptyState` | Main orchestrator |
| `VirtualLogList` | Yes | — | Extracted to avoid re-rendering when LogPanel state changes that don't affect the list |
| `LogEntry` | Yes | `relativeTime` (via timestampGen) | Only re-renders when its specific log object or keywords change |
| `TopicItem` (SecondaryPanel) | Yes | — | Only re-renders when its topic's data changes |
| `SystemItem` (SecondaryPanel) | Yes | — | Only re-renders when its system's data changes |
| `SecondaryPanel` | Yes | `sortedTopics`, `sortedSystems` | Re-renders on topic/system data change |
| All other sub-components | **No** | — | DesktopHeader, MobileHeader, FilterBar, ActiveFilters, StatusBar, ScrollButtons, EmptyState, KeywordFilter, FilterDropdown — cheap renders |

### What triggers re-renders and why it's OK
| Trigger | Frequency | What re-renders | Why it's OK |
|---|---|---|---|
| Log flush (150ms) | ~6.6x/sec | `useWebSocket` → `App` → `LogPanel` → `VirtualLogList` | Only ~20-30 visible `LogEntry` via virtualization |
| `timestampGen` bump | Every 5s | `VirtualLogList` → visible `LogEntry`s | Only visible rows, `useMemo` recalculates relative time |
| Storage poll (30s) | Every 30s | `useServerStorage` → `App` → `HomePage` + `StorageDashboard` | Infrequent, small payload |
| Filter change | On user action | `LogPanel` + children | One-shot, not continuous |
| Theme toggle | On user action | Everything | One-shot |

---

## Performance-Critical Path (log ingestion)

```
WebSocket frame arrives (single or batch JSON)
  → JSON.parse
  → Normalize to array (single event or batch)
  → Assign _id (monotonic counter) to each log
  → Truncate oversized messages (>50KB)
  → Push to pendingRef (per-topic capped at 500 viewed / 100 non-viewed)
  ...150ms later (setInterval flush)...
  → Group pending by topic
  → setLogsByTopic(prev => { ...prev, [topic]: newLogs.reverse().concat(existing).slice(0, cap) })
  → App re-renders → topicLogs1/2 derived → LogPanel re-renders
  → filteredLogs = useMemo(reverse + all filters: server/path/search/keywords/timeRange)
  → VirtualLogList renders only visible rows (~20-30, overscan 20)
  → Effect 1 useEffect [displayedLogs] + rAF → scrollToIndex(last) — non-blocking, blocked by isPaused
  → Effect 2 useEffect [totalSize] + rAF → re-anchors after remeasurement — not blocked by isPaused
```

---

## Virtualization Details

`VirtualLogList` (inside `LogPanel.jsx`) uses `@tanstack/react-virtual` in **flow mode** (not positioned mode):
- `estimateSize`: 114px per row
- `overscan`: 20 rows
- `getScrollElement`: the `overflow-auto` div (scrollRef)
- Items in **normal document flow** — NOT absolutely positioned. Spacing via CSS `paddingTop`/`paddingBottom` spacers.
- ResizeObserver handles width change (captures `anchorIndexRef`, restores after `totalSize` update) and height shrink (scrolls to last if at bottom via `atBottomRef`)
- **`scrollToBottom()`** uses `virtualizerScrollToBottomRef` (`scrollToIndex`) — never raw `scrollTop`

---

## WebSocket Hook Internals (`useWebSocket.js`)

### Signature
```js
useWebSocket(url, viewedTopics, token = null)
// token appended as ?token=xxx query param (browsers cannot set WS headers)
```

### Message discrimination
```
JSON.parse(event.data)
  → { type: "topics", topics: string[] }?         → Topic list (on connect)
  → { type: "stats", topics: {...}, intervalMs }?  → Per-topic rate stats (~every 2s)
  → { type: "filter-ack" }?                        → Filter ack (ignored, client filters locally)
  → Array of strings? (legacy)                     → Topic list (backwards-compat)
  → Array of objects?                              → Batched log events
  → Single object?                                 → Single log event
```

### Reconnect
- Exponential backoff: `min(1000 * 2^attempts, 30000)ms`
- On reconnect: re-sends subscriptions + active filter

---

## Filter Pipeline

All filtering runs **client-side** in `filteredLogs` useMemo for instant feedback. Server-side filter (debounced 300ms) reduces WS bandwidth only — UI never waits for it.

```
User changes any filter
  → filteredLogs useMemo recomputes instantly (client-side)
  → UI updates in real time

Server-side (parallel, does not block display):
  → 300ms debounce → sendFilter({ server, path, search, keywords, timeRange })
  → Server applies filter, sends only matching logs going forward
```

---

## Theme System

`src/constants/theme.js` exports `styles.dark` and `styles.light` — objects with ~20 Tailwind class string tokens. Components receive `theme` and `darkMode` props.

Key tokens: `background`, `sidebar`, `card`, `panel`, `text`, `textSecondary`, `textMuted`, `border`, `input`, `hover`, `selected`, `logEntry`, `statusBar`, `scrollbar`, `serverBadge`, `popupBorder`

`card` has a box-shadow (used for floating panels). `panel` is flat — same background, no shadow (currently unused but available).

---

## Multilingual Sort (SecondaryPanel)

Systems and topics are sorted using `Intl.Collator` with script detection:
- Scans all names for Unicode script ranges (Khmer, Thai, Japanese, Chinese, Korean, Arabic, Cyrillic, Devanagari)
- Single script detected → uses that script's BCP-47 locale (e.g. `'km'` for Khmer) → linguistically correct order
- Multiple scripts or Latin-only → uses `undefined` (Unicode DUCET) → consistent cross-script grouping
- Options: `{ sensitivity: 'base', numeric: true }` — case-insensitive, `System2` before `System10`
- System name search uses `.normalize('NFC')` on both sides for correct Khmer Unicode matching
