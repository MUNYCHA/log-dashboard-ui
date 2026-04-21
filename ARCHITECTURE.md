# Architecture — log-dashboard-ui

Deep implementation reference. CLAUDE.md links here for details.

---

## State Ownership Map

```
App.jsx (global)
├── selectedTopic / selectedTopic2      ← which topic each panel shows
├── selectedServer / selectedServer2    ← server filter (per-panel independent state — each panel has its own server filter)
├── themeMode                           ← 'light' | 'dark' | 'system' (persisted to localStorage)
│   └── darkMode                        ← derived: themeMode === 'dark' || (system && systemPrefersDark)
├── systemPrefersDark                   ← mirrors window.matchMedia prefers-color-scheme
├── terminalMode                        ← compact monospace log display (persisted to localStorage)
├── topicSortMode                       ← 'asc' | 'desc' | 'activity' (persisted to localStorage)
├── sidebarOpen / sidebarCollapsed      ← sidebar visibility (collapsed persisted)
├── splitView / activePanel             ← split view mode + which panel is focused
├── isPaused1 / isPaused2              ← per-panel pause (frozen snapshot)
├── topicSearchTerm                     ← sidebar topic search
├── isSettingsOpen                      ← settings modal visibility
├── viewedTopics                       ← useMemo([selectedTopic, selectedTopic2]) for tiered log caps
│
├── useWebSocket(url, viewedTopics) → shared across all components
│   ├── logsByTopic    — Record<topic, LogEntry[]> (newest-first after flush, rawBufferPerTopic cap viewed (2000 at default) / 100 non-viewed)
│   ├── topics         — string[]
│   ├── isConnected / isReconnecting
│   ├── logRates       — Record<topic, number> (logs/sec, from server stats message)
│   ├── clearLogs(topic), subscribe(topics), trimTopicBuffer(topic, cap?), sendFilter(filters, panelId)
│
LogPanel.jsx (per-panel local) — all resettable state via useReducer (panelReducer)
├── frozenLogs / frozenTopic ← snapshot of logs + topic when paused
├── logSearchTerm / debouncedSearch     ← text search (300ms debounce for server-side)
├── pathForTopic        ← { topic, path } — resets on topic change via RESET_TOPIC action
├── keywords / keywordInput / keywordMode / debouncedKeywordInput
│   └── filteredLogs uses debouncedKeywordInput (300ms) — keeps filter and keyword chip in sync
├── timeRange / customRangeMs
├── autoScroll          ← disabled only by user-initiated upward scroll (800ms intent window)
├── showServerDropdown / showPathDropdown / showMobileServerDropdown / showMobilePathDropdown
├── serverSearchTerm / pathSearchTerm
├── isMobileMenuOpen / mobileMenuReady
├── atTop / atBottom    ← scroll position indicators
├── downloadError       ← transient download error message (auto-clears after 5s)
├── topicMeta           ← backend-provided metadata for current topic (servers/paths)
│
├── timestampGen        ← separate useState, counter bumped every 5s for relative time refresh
└── nowMs               ← separate useState, Date.now() updated every 5s + on timeRange change
```

## Render Optimization Strategy

### What's memoized
| Component | `React.memo` | Internal `useMemo` | Notes |
|---|---|---|---|
| `LogPanel` | Yes | `filteredLogs`, `serversForSelectedTopic`, `pathsForSelectedServer`, `mergedServers`, `mergedPaths`, `filteredServers`, `filteredPaths`, `displayKeywords`, `emptyState` | Main orchestrator |
| `VirtualLogList` | Yes | — | Extracted to avoid re-rendering when LogPanel state changes that don't affect the list |
| `LogEntry` | Yes | `relativeTime` (via timestampGen) | Only re-renders when its specific log object or keywords change |
| `TopicItem` (Sidebar) | Yes | — | Only re-renders when `topic`, `isSelected`, `logRate`, or `darkMode` props change |
| `Sidebar` | Yes | — | Re-renders on its own props changes; `TopicItem` children are protected by their own memo |
| Most other sub-components | **No** | — | DesktopHeader, MobileHeader, FilterBar, ActiveFilters, StatusBar, ScrollButtons, EmptyState — purely presentational, re-render with parent |
| `KeywordFilter` | **No** | — | Has local state (`selectedColor`) and a ref (`inputRef`) — not purely presentational |
| `FilterDropdown` | **No** | — | Has a ref and a click-outside effect — not purely presentational |

### What triggers re-renders and why it's OK
| Trigger | Frequency | What re-renders | Why it's OK |
|---|---|---|---|
| Log flush (150ms) | ~6.6x/sec | `useWebSocket` → `App` → `LogPanel` → `VirtualLogList` | Only ~20-30 visible `LogEntry` via virtualization |
| `timestampGen` bump | Every 5s | `VirtualLogList` → visible `LogEntry`s | Only visible rows, `useMemo` recalculates relative time |
| Filter change | On user action | `LogPanel` + children | One-shot, not continuous |
| Theme toggle | On user action | Everything | One-shot |

### Performance-critical path (log ingestion)
```
WebSocket frame arrives (single or batch JSON)
  → JSON.parse
  → Normalize to array (single event or batch)
  → Assign _id (monotonic counter) to each log
  → Truncate oversized messages (>50KB)
  → Push to pendingRef (per-topic capped at rawBufferPerTopic viewed / 100 non-viewed)
  ...150ms later (setInterval flush)...
  → Group pending by topic
  → setLogsByTopic(prev => { ...prev, [topic]: newLogs.reverse().concat(existing).slice(0, cap) })  // cap = rawBufferPerTopic (displayCap×4 = 2000) or SIDEBAR_LOG_CAP (100)
  → App re-renders → topicLogs1/2 derived → LogPanel re-renders
  → filteredLogs = useFilteredLogs()(reverse + all filters: server/path/search/keywords/timeRange)
  → VirtualLogList renders only visible rows (~20-30, overscan 20)
  → Effect 1 useEffect [displayedLogs] + rAF → scrollToIndex(last) — non-blocking, blocked by isPaused
  → Effect 2 useEffect [totalSize] + rAF → re-anchors after remeasurement — not blocked by isPaused
```

### Keys
- `LogEntry` uses `log._id` (monotonic counter assigned in useWebSocket) — NOT array index
- `TopicItem` uses `topic` string

## Virtualization Details

`VirtualLogList` (`features/log-viewer/components/VirtualLogList.jsx`) uses `@tanstack/react-virtual` in **flow mode** (not positioned mode):
- `estimateSize`: 114px per row
- `overscan`: 20 rows (renders 20 extra above/below viewport for smooth scrolling)
- `getScrollElement`: the `absolute inset-0 overflow-auto` div (scrollRef)
- Each row uses `measureElement` for live height measurement via the virtualizer's internal ResizeObserver
- Items are in **normal document flow** — NOT absolutely positioned. Spacing managed by CSS `paddingTop` / `paddingBottom` on the items wrapper div (virtualizer spacers). Cards cannot collide or overlap.
- A separate `ResizeObserver` on the scroll container handles two concerns:
  - **Width change**: captures topmost visible item index (`anchorIndexRef`) before `measure()`, restores it in Effect 2 after `totalSize` updates; or scrolls to last if at bottom
  - **Height shrink** (pause banner, mobile menu open): scrolls to last if at bottom (`atBottomRef`)
- **Paused banner** sits outside the scroll container as `flex-shrink-0` in the flex column — always visible regardless of scroll position
- **`scrollToBottom()`** in LogPanel uses `virtualizerScrollToBottomRef` (virtualizer's `scrollToIndex`) — not raw `scrollTop` assignment — to avoid mid-item landing on spacer boundaries

## WebSocket Hook Internals (`useWebSocket.js`)

### Queues and buffers
| Ref | Purpose | Cap |
|---|---|---|
| `pendingRef` | Logs waiting for next 150ms flush | Enqueue cap: `rawBufferPerTopic` (displayCap×4) for all topics via `pendingCountRef`; at flush, non-viewed topics are further capped to 100 (`SIDEBAR_LOG_CAP`) when written to `logsByTopic` |

### Message discrimination
```
JSON.parse(event.data)
  → { type: "topics", topics: string[] }?  → Topic list (primary format, on connect)
  → { type: "stats", topics: {...}, intervalMs }?  → Per-topic rate stats (~every 2s)
  → { type: "filter-ack" }?  → No explicit branch; non-log objects are discarded by normalization
  → Array of strings? (legacy)  → Topic list (backwards-compat fallback)
  → Array of objects?  → Batched log events (iterate, assign _id each)
  → Single object?  → Single log event (wrap in array, same path)
```

### Reconnect
- Exponential backoff: `min(1000 * 2^attempts, 30000)ms`
- On reconnect: re-sends subscriptions + active filter

## Filter Pipeline

All filtering runs **client-side** in `filteredLogs` useMemo for instant feedback.
Server-side filter (debounced) is a bandwidth optimization only.

```
User types in search box / changes any filter
  → logSearchTerm / keywords / timeRange / etc. update immediately
  → filteredLogs recomputes instantly via useFilteredLogs() hook (client-side, all filters applied)
  → UI shows matching logs in real time

Server-side bandwidth optimization (parallel, does not block display):
  → 300ms debounce → setDebouncedSearch
  → useEffect fires → sendFilter(filters, panelId)
  → useWebSocket merges per-panel filters (panelFiltersRef):
      - 0 panels with filters → clear-filters action
      - 1 panel with filters  → send that panel's filter directly
      - 2 panels with filters → clear-filters (client handles each panel independently)
  → Server applies filter, sends only matching logs going forward (reduces WS traffic)
  → Server may send { type: "filter-ack", filters } (discarded by hook; client does not rely on it)
```

### Client-side `filteredLogs` (single source of truth)
`filteredLogs` is computed by the `useFilteredLogs()` hook (`src/hooks/useFilteredLogs.js`) called from `LogPanel`. It applies ALL filters locally: server/path exact match, plain text search (message field only), keywords with `debouncedKeywordInput` (AND/OR mode), and time range (using `nowMs` state for render purity). The server-side filter reduces bandwidth but the UI never waits for it. Keyword filtering uses the debounced value so the filter result and the pending keyword chip in the UI appear in sync.

`mergedServers` and `mergedPaths` are derived by merging backend metadata (`/api/topics/{topic}/meta`) with the local buffer — meta order is preserved, buffer-only entries appended. `filteredServers`/`filteredPaths` then apply the search term on top of the merged lists.

## Theme System

`src/constants/theme.js` exports `styles.dark` and `styles.light` — objects with 24 keys, each a Tailwind class string. Components receive `theme` prop and use `theme.background`, `theme.text`, `theme.logEntry`, etc.

Key tokens: `background`, `sidebar`, `header`, `logArea`, `text`, `textSecondary`, `textMuted`, `border`, `input`, `card`, `hover`, `selected`, `topicItem`, `logEntry`, `scrollbar`, `serverBadge`, `serverBadgeHover`, `popupBorder`, `dropdownItemSelected`, `inputFocus`, `button`, `buttonPrimary`, `accent`, `accentBg`

## Sub-component Props Quick Reference

| Component | Key props | State? |
|---|---|---|
| `DesktopHeader` | selectedTopic, displayedLogs, logRate, onDownload, all toolbar callbacks | None |
| `MobileHeader` | Same as Desktop + mobile-specific dropdowns, server/path filters, onDownload | None |
| `FilterBar` | server/path dropdowns, timeRange, refs for positioning | None |
| `ActiveFilters` | selectedServer/Path, logSearchTerm, keywords, clear callbacks | None (returns null if no filters) |
| `StatusBar` | isConnected, isReconnecting, isPaused, logRate | None |
| `ScrollButtons` | atTop, atBottom, scroll callbacks | None |
| `EmptyState` | theme, splitView, panel callbacks | None |
| `KeywordFilter` | keywords, inputValue, callbacks, mode | selectedColor, inputRef |
| `FilterDropdown` | isOpen, items, selectedItem, searchTerm, callbacks | dropdownRef (click-outside) |
| `SettingsModal` | isOpen, onClose, themeMode, terminalMode, topicSortMode, sidebarCollapsed + change callbacks | None (left-side drawer, not a centered modal) |

## File Map

```
src/
├── main.jsx                    # Entry point — wraps <App /> in ErrorBoundary (fallback: recovery screen + reload button)
├── App.jsx                     # Global state, split view, theme resolution, settings modal; updates document.title to track selected topic(s)
├── config.js                   # VITE_WS_URL, VITE_MAX_LOGS_PER_TOPIC, VITE_MAX_MESSAGE_LENGTH + derives httpBaseUrl for REST API
├── constants/
│   ├── theme.js                # styles.dark / styles.light token objects
│   └── keywordColors.js        # KEYWORD_COLORS array, DEFAULT_KEYWORD_COLOR, getColorDef()
├── hooks/
│   ├── useWebSocket.js         # WebSocket + reconnect + batching + rate tracking + filter dispatch
│   └── useFilteredLogs.js      # Client-side filter pipeline (server/path/search/keywords/timeRange)
├── api/
│   ├── endpoints.js            # REST endpoint path constants
│   └── logApi.js               # REST client — download logs, fetch topic metadata
├── utils/
│   └── logUtils.js             # getLogLevelColor, getRelativeTime
├── ui/
│   ├── HeartbeatLine.jsx       # SVG heartbeat animation reflecting log rate
│   └── ErrorBoundary.jsx       # React error boundary wrapper
└── features/
    ├── filters/FilterDropdown.jsx, ServerDropdown.jsx, PathDropdown.jsx, KeywordFilter.jsx, TimeRangeSelector.jsx, index.js
    ├── log-viewer/LogPanel.jsx, panelReducer.js, constants.js, index.js
    │   └── components/VirtualLogList.jsx, LogEntry.jsx, FilterBar.jsx, ActiveFilters.jsx,
    │       StatusBar.jsx, EmptyState.jsx, ScrollButtons.jsx
    │       └── headers/DesktopHeader.jsx, MobileHeader.jsx
    ├── settings/SettingsModal.jsx, SettingRow.jsx, SortChip.jsx, ToggleSwitch.jsx, index.js
    └── sidebar/Sidebar.jsx, TopicItem.jsx, index.js
```
