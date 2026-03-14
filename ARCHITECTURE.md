# Architecture — log-dashboard-ui

Deep implementation reference. CLAUDE.md links here for details.

---

## State Ownership Map

```
App.jsx (global)
├── selectedTopic / selectedTopic2      ← which topic each panel shows
├── selectedServer / selectedServer2    ← server filter (global because Sidebar badges need it)
├── darkMode                            ← theme toggle
├── sidebarOpen / sidebarCollapsed      ← sidebar visibility
├── splitView / activePanel             ← split view mode + which panel is focused
├── isPaused1 / isPaused2              ← per-panel pause (frozen snapshot)
├── topicSearchTerm                     ← sidebar topic search
├── viewedTopics                       ← useMemo([selectedTopic, selectedTopic2]) for tiered log caps
│
├── useWebSocket(url, viewedTopics) → shared across all components
│   ├── logsByTopic    — Record<topic, LogEntry[]> (newest-first after flush, 500 cap viewed / 50 non-viewed)
│   ├── topics         — string[]
│   ├── isConnected / isReconnecting
│   ├── logRates       — Record<topic, number> (logs/sec, 5s window)
│   ├── clearLogs(topic), subscribe(topics), sendFilter(filters)
│
LogPanel.jsx (per-panel local)
├── frozenLogs          ← snapshot of logs when paused
├── logSearchTerm / debouncedSearch     ← text search (300ms debounce)
├── pathForTopic        ← { topic, path } — auto-clears on topic change
├── keywords / keywordInput / keywordMode / debouncedKeywordInput
├── isRegex / timeRange
├── autoScroll          ← button-toggled only
├── showServerDropdown / showPathDropdown / showMobileServerDropdown / showMobilePathDropdown
├── serverSearchTerm / pathSearchTerm
├── showExportMenu / isMobileMenuOpen / mobileMenuReady
├── atTop / atBottom    ← scroll position indicators
├── timestampGen        ← counter bumped every 5s for relative time refresh
└── nowMs               ← Date.now() updated every 5s + on timeRange change (pure render)
```

## Render Optimization Strategy

### What's memoized
| Component | `React.memo` | Internal `useMemo` | Notes |
|---|---|---|---|
| `LogPanel` | Yes | `filteredLogs`, `serversForSelectedTopic`, `pathsForSelectedServer`, `filteredServers`, `filteredPaths`, `regexError` | Main orchestrator |
| `VirtualLogList` | Yes | — | Extracted to avoid re-rendering when LogPanel state changes that don't affect the list |
| `LogEntry` | Yes | `relativeTime` (via timestampGen) | Only re-renders when its specific log object or keywords change |
| `TopicItem` (Sidebar) | Yes | — | Only re-renders when its topic's log array ref changes |
| `Sidebar` | Yes | — | Re-renders when `logsByTopic` ref changes (every flush) but children are protected |
| All other sub-components | **No** | — | DesktopHeader, MobileHeader, FilterBar, ActiveFilters, StatusBar, ScrollButtons, EmptyState, KeywordFilter, FilterDropdown — all pure presentational, re-render with parent |

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
  → Push to pendingRef (per-topic capped at 500 viewed / 50 non-viewed)
  ...150ms later (setInterval flush)...
  → Group pending by topic
  → setLogsByTopic(prev => { ...prev, [topic]: newLogs.reverse().concat(existing).slice(0, cap) })
  → App re-renders → topicLogs1/2 derived → LogPanel re-renders
  → filteredLogs = useMemo(reverse + all filters: server/path/search/keywords/regex/timeRange)
  → VirtualLogList renders only visible rows (~20-30)
  → useEffect + rAF scrolls to bottom (non-blocking)
```

### Keys
- `LogEntry` uses `log._id` (monotonic counter assigned in useWebSocket) — NOT array index
- `TopicItem` uses `topic` string

## Virtualization Details

`VirtualLogList` (inside `LogPanel.jsx`) uses `@tanstack/react-virtual`:
- `estimateSize`: 96px per row
- `overscan`: 10 rows (renders 10 extra above/below viewport)
- `getScrollElement`: the `.overflow-auto` container (scrollRef)
- Each row uses `measureElement` for dynamic height measurement
- Rows are absolutely positioned with `transform: translateY()`
- Total height set on container to maintain scrollbar accuracy

## WebSocket Hook Internals (`useWebSocket.js`)

### Queues and buffers
| Ref | Purpose | Cap |
|---|---|---|
| `pendingRef` | Logs waiting for next 150ms flush | maxLogsPerTopic per topic (pendingCountRef) |
| `logCountRef` | Raw count per topic for rate calc | Reset every 5s |

### Message discrimination
```
JSON.parse(event.data)
  → Array of strings?  → Topic list (first connect)
  → { type: "filter-ack" }?  → Filter acknowledgment
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
  → filteredLogs useMemo recomputes instantly (client-side, all filters applied)
  → UI shows matching logs in real time

Server-side bandwidth optimization (parallel, does not block display):
  → 300ms debounce → setDebouncedSearch
  → useEffect fires → sendFilter({ server, path, search, regex, keywords, timeRange })
  → Server applies filter, sends only matching logs going forward (reduces WS traffic)
  → Server sends { type: "filter-ack", filters, regexError? }
```

### Client-side `filteredLogs` (single source of truth)
`filteredLogs` in LogPanel applies ALL filters locally: server/path exact match, text search (plain or regex), keywords (AND/OR), and time range (using `nowMs` state for render purity). The server-side filter reduces bandwidth but the UI never waits for it.

## Theme System

`src/constants/theme.js` exports `styles.dark` and `styles.light` — objects with ~20 keys, each a Tailwind class string. Components receive `theme` prop and use `theme.background`, `theme.text`, `theme.logEntry`, etc.

Key tokens: `background`, `sidebar`, `header`, `text`, `textSecondary`, `textMuted`, `border`, `input`, `card`, `hover`, `selected`, `topicItem`, `logEntry`, `statusBar`, `scrollbar`, `serverBadge`, `popupBorder`

## Sub-component Props Quick Reference

| Component | Key props | State? |
|---|---|---|
| `DesktopHeader` | selectedTopic, displayedLogs, logRate, all toolbar callbacks | None |
| `MobileHeader` | Same as Desktop + mobile-specific dropdowns, server/path filters | None |
| `FilterBar` | server/path dropdowns, timeRange, refs for positioning | None |
| `ActiveFilters` | selectedServer/Path, logSearchTerm, keywords, clear callbacks | None (returns null if no filters) |
| `StatusBar` | isConnected, isReconnecting, isPaused, logRate | None |
| `ScrollButtons` | atTop, atBottom, scroll callbacks | None |
| `EmptyState` | theme, splitView, panel callbacks | None |
| `KeywordFilter` | keywords, inputValue, callbacks, mode | selectedColor, hexInput, inputRef |
| `FilterDropdown` | isOpen, items, selectedItem, searchTerm, callbacks | dropdownRef (click-outside) |

## File Map

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Global state, split view, theme resolution
├── config.js                   # VITE_WS_URL, VITE_MAX_LOGS_PER_TOPIC, VITE_MAX_MESSAGE_LENGTH
├── constants/
│   ├── theme.js                # styles.dark / styles.light token objects
│   └── keywordColors.js        # KEYWORD_COLORS array, DEFAULT_KEYWORD_COLOR, getColorDef()
├── hooks/
│   └── useWebSocket.js         # WebSocket + reconnect + batching + rate tracking + filter dispatch
├── utils/
│   └── logUtils.js             # getLogLevelColor, getRelativeTime
└── components/
    ├── common/HeartbeatLine.jsx, ThemeToggle.jsx
    ├── filters/FilterDropdown.jsx, ServerDropdown.jsx, PathDropdown.jsx, KeywordFilter.jsx, index.js
    ├── log/LogPanel.jsx, VirtualLogList (inside LogPanel), LogEntry.jsx, DesktopHeader.jsx,
    │   MobileHeader.jsx, FilterBar.jsx, ActiveFilters.jsx, StatusBar.jsx, EmptyState.jsx,
    │   ScrollButtons.jsx, constants.js, index.js
    └── sidebar/Sidebar.jsx (contains TopicItem), index.js
```
