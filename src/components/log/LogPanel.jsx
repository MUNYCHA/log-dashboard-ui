import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { KeywordFilter } from "../filters";
import { downloadFile, getButtonStyles, getAccentStyles } from "./constants";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import FilterBar from "./FilterBar";
import ActiveFilters from "./ActiveFilters";
import StatusBar from "./StatusBar";
import EmptyState from "./EmptyState";
import ScrollButtons from "./ScrollButtons";
import LogEntry from "./LogEntry";

const ESTIMATED_LOG_HEIGHT = 52; // px — rough estimate, virtualizer measures actual

const VirtualLogList = React.memo(({
  displayedLogs, isPaused, accent, theme, darkMode, keywords, timestampGen,
  selectedServer, selectedPath, timeRange,
  scrollRef, atTop, atBottom, scrollToTop, scrollToBottom,
  handleClearPath, handleClearServer,
}) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is designed this way
  const virtualizer = useVirtualizer({
    count: displayedLogs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LOG_HEIGHT,
    overscan: 20,
  });

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 overflow-auto font-mono text-sm" ref={scrollRef}>
        <div className="p-3 sm:p-4 md:p-5">
          {isPaused && (
            <div className={`text-center py-2 px-4 rounded-lg text-xs ${accent.paused} mb-2`}>
              Stream paused — display frozen, new logs still incoming
            </div>
          )}
          {displayedLogs.length > 0 ? (
            <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const log = displayedLogs[virtualRow.index];
                return (
                  <div
                    key={log._id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="py-1">
                      <LogEntry log={log} theme={theme} darkMode={darkMode} keywords={keywords} timestampGen={timestampGen} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-64 ${theme.textMuted}`}>
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No logs to display</p>
              <p className="text-sm px-4 text-center">
                {selectedServer && selectedPath
                  ? `No logs from "${selectedServer}" at "${selectedPath}"`
                  : selectedServer
                    ? `No logs from "${selectedServer}"`
                    : timeRange !== 'all'
                      ? `No logs in the last ${timeRange}`
                      : "Waiting for incoming logs..."}
              </p>
              {(selectedServer || selectedPath) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedPath && (
                    <button onClick={handleClearPath} className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}>Clear path</button>
                  )}
                  {selectedServer && (
                    <button onClick={handleClearServer} className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}>Clear server</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ScrollButtons
        atTop={atTop} atBottom={atBottom}
        scrollToTop={scrollToTop} scrollToBottom={scrollToBottom}
        theme={theme}
      />
    </div>
  );
});

const LogPanel = ({
  selectedTopic,
  topicLogs,
  selectedServer,
  onServerSelect,
  onClearServer,
  onClearLogs,
  isConnected,
  isReconnecting,
  isPaused,
  togglePause,
  logRate,
  theme,
  darkMode,
  onThemeToggle,
  onOpenSidebar,
  splitView,
  onOpenSplit,
  onClosePanel,
  isActivePanel,
  onSetActive,
  sendFilter,
  filterAck,
}) => {
  const [frozenLogs, setFrozenLogs] = useState(null);
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [showMobileServerDropdown, setShowMobileServerDropdown] = useState(false);
  const [showMobilePathDropdown, setShowMobilePathDropdown] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [pathSearchTerm, setPathSearchTerm] = useState("");
  // selectedPath is tied to the current topic — auto-clears when topic changes
  const [pathForTopic, setPathForTopic] = useState({ topic: null, path: null });
  const selectedPath = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;
  const [prevTopic, setPrevTopic] = useState(selectedTopic);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuReady, setMobileMenuReady] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordMode, setKeywordMode] = useState('or');
  const [isRegex, setIsRegex] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  // Debounced versions of text inputs — only these use a delay before sending to server.
  // Discrete actions (server select, path select, time range, regex toggle) trigger
  // the filter useEffect immediately because their state changes aren't debounced.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedKeywordInput, setDebouncedKeywordInput] = useState('');
  // Reset all filters when topic changes
  if (prevTopic !== selectedTopic) {
    setPrevTopic(selectedTopic);
    setAutoScroll(true);
    setLogSearchTerm('');
    setDebouncedSearch('');
    setDebouncedKeywordInput('');
    setPathForTopic({ topic: null, path: null });
    setKeywords([]);
    setKeywordInput('');
    setTimeRange('all');
    setIsRegex(false);
    setServerSearchTerm('');
    setPathSearchTerm('');
    setFrozenLogs(null);
    setShowServerDropdown(false);
    setShowPathDropdown(false);
    setShowMobileServerDropdown(false);
    setShowMobilePathDropdown(false);
    setIsMobileMenuOpen(false);
    if (isPaused) togglePause();
  }
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  // Relative timestamp ticker — uses a generation counter to trigger
  // re-render without passing a changing `now` value to every LogEntry.
  const [timestampGen, setTimestampGen] = useState(0);

  const scrollRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Delay mobile menu interactivity to prevent fast double-tap from hitting buttons
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const id = setTimeout(() => setMobileMenuReady(true), 300);
    return () => { clearTimeout(id); setMobileMenuReady(false); };
  }, [isMobileMenuOpen]);

  // Ticker for relative timestamps (every 30s) — bumps generation counter
  // and updates nowMs for time-range filtering (keeps render pure).
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampGen((g) => g + 1);
      setNowMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh nowMs immediately when timeRange changes so the cutoff isn't stale
  const handleTimeRangeChange = useCallback((value) => {
    setTimeRange(value);
    if (value !== 'all') setNowMs(Date.now());
  }, []);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll tracking — update atTop/atBottom indicators only.
  // Auto-scroll is toggled exclusively via the button, never by scrolling.
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAtTop(scrollTop < 50);
    setAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, selectedTopic]);

  // Re-scroll on container resize (window resize, split view toggle, etc.)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (autoScroll && !isPaused) {
        el.scrollTop = el.scrollHeight;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoScroll, isPaused, selectedTopic]);

  // Regex validation — from server ack or local check
  const regexError = useMemo(() => {
    if (!isRegex || !logSearchTerm) return false;
    if (filterAck?.regexError) return true;
    try { new RegExp(logSearchTerm); return false; } catch { return true; }
  }, [isRegex, logSearchTerm, filterAck]);

  // Debounce text search input (300ms) — discrete actions send immediately
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(logSearchTerm), 300);
    return () => clearTimeout(t);
  }, [logSearchTerm]);

  // Debounce keyword input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeywordInput(keywordInput), 300);
    return () => clearTimeout(t);
  }, [keywordInput]);

  // Send filter to server (debounced for text, immediate for discrete actions).
  // This is a bandwidth optimization — the client-side filter in filteredLogs
  // provides instant visual feedback, while this reduces unnecessary traffic.
  useEffect(() => {
    if (!sendFilter) return;

    const pendingInput = debouncedKeywordInput.trim().toLowerCase();
    const allTerms = [...keywords.map((k) => k.text), ...(pendingInput ? [pendingInput] : [])];

    const filters = {
      server: selectedServer || null,
      path: selectedPath || null,
      search: debouncedSearch || null,
      regex: isRegex,
      keywords: allTerms.length > 0 ? { terms: allTerms, mode: keywordMode } : undefined,
      timeRange: timeRange,
    };

    const hasAny = filters.server || filters.path || filters.search || filters.keywords || filters.timeRange !== 'all';
    sendFilter(hasAny ? filters : null);
  }, [selectedServer, selectedPath, debouncedSearch, isRegex, keywords, debouncedKeywordInput, keywordMode, timeRange, sendFilter]);

  // Unique servers for selected topic (derived from received logs for dropdown population)
  const serversForSelectedTopic = useMemo(
    () =>
      selectedTopic
        ? [...new Set(topicLogs?.map((l) => l.serverName) || [])].sort()
        : [],
    [selectedTopic, topicLogs],
  );

  // Unique paths for selected server
  const pathsForSelectedServer = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;
    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    return [...new Set(logs.map((l) => l.path))].sort();
  }, [selectedTopic, topicLogs, selectedServer]);

  const filteredServers = useMemo(
    () => serversForSelectedTopic.filter((s) => s.toLowerCase().includes(serverSearchTerm.toLowerCase())),
    [serversForSelectedTopic, serverSearchTerm],
  );

  const filteredPaths = useMemo(
    () => pathsForSelectedServer.filter((p) => p.toLowerCase().includes(pathSearchTerm.toLowerCase())),
    [pathsForSelectedServer, pathSearchTerm],
  );

  // Client-side filter for instant visual feedback on every keystroke.
  // All filters are applied locally so the UI reacts in real time.
  // The server-side filter (debounced) reduces bandwidth but is not
  // relied on for display — this memo is the single source of truth.
  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;

    // Server / path exact match
    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    if (selectedPath) logs = logs.filter((l) => l.path === selectedPath);

    // Text search (instant — uses logSearchTerm, not debounced)
    if (logSearchTerm) {
      if (isRegex) {
        try {
          const re = new RegExp(logSearchTerm, 'i');
          logs = logs.filter((l) =>
            re.test(l.message) || re.test(l.serverName) || re.test(l.path)
          );
        } catch {
          // Invalid regex in progress — show nothing until it's valid
          logs = [];
        }
      } else {
        const lower = logSearchTerm.toLowerCase();
        logs = logs.filter((l) =>
          l.message.toLowerCase().includes(lower) ||
          l.serverName.toLowerCase().includes(lower) ||
          l.path.toLowerCase().includes(lower)
        );
      }
    }

    // Keywords (instant — uses live keywordInput, not debounced)
    const pendingKw = keywordInput.trim().toLowerCase();
    const allTerms = [
      ...keywords.map((k) => k.text.toLowerCase()),
      ...(pendingKw ? [pendingKw] : []),
    ];
    if (allTerms.length > 0) {
      logs = logs.filter((l) => {
        const haystack = (l.message + '\0' + l.serverName + '\0' + l.path).toLowerCase();
        return keywordMode === 'and'
          ? allTerms.every((t) => haystack.includes(t))
          : allTerms.some((t) => haystack.includes(t));
      });
    }

    // Time range — uses nowMs (updated every 30s via effect) to stay pure
    if (timeRange !== 'all') {
      const ranges = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };
      const cutoff = nowMs - (ranges[timeRange] || 0);
      logs = logs.filter((l) => {
        try { return new Date(l.timestamp).getTime() >= cutoff; }
        catch { return true; }
      });
    }

    return [...logs].reverse();
  }, [selectedTopic, topicLogs, selectedServer, selectedPath, logSearchTerm, isRegex, keywords, keywordInput, keywordMode, timeRange, nowMs]);

  const displayedLogs = frozenLogs ?? filteredLogs;

  // Wrap togglePause to snapshot/release displayed logs
  const handleTogglePause = () => {
    if (!isPaused) {
      setFrozenLogs(filteredLogs);
    } else {
      setFrozenLogs(null);
    }
    togglePause();
  };

  // Auto-scroll to bottom — uses rAF to avoid blocking the main thread.
  useEffect(() => {
    if (!isPaused && autoScroll && scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [filteredLogs, autoScroll, isPaused]);

  // Handlers
  const handleServerSelect = (server) => {
    onServerSelect(server);
    setPathForTopic({ topic: selectedTopic, path: null });
    setShowServerDropdown(false);
    setShowMobileServerDropdown(false);
    setServerSearchTerm("");
  };

  const handlePathSelect = (path) => {
    setPathForTopic({ topic: selectedTopic, path });
    setShowPathDropdown(false);
    setShowMobilePathDropdown(false);
    setPathSearchTerm("");
  };

  const handleClearServer = () => {
    onClearServer();
    setPathForTopic({ topic: selectedTopic, path: null });
  };

  const handleClearPath = () => setPathForTopic({ topic: selectedTopic, path: null });

  const exportLogs = (format) => {
    const safeTopic = selectedTopic.replace(/[^a-z0-9]/gi, '_');
    const exportNow = new Date();
    const ts = `${exportNow.getFullYear()}-${String(exportNow.getMonth()+1).padStart(2,'0')}-${String(exportNow.getDate()).padStart(2,'0')}_${String(exportNow.getHours()).padStart(2,'0')}-${String(exportNow.getMinutes()).padStart(2,'0')}-${String(exportNow.getSeconds()).padStart(2,'0')}`;
    const base = `${safeTopic}_${ts}`;
    if (format === 'json') {
      downloadFile(JSON.stringify(displayedLogs, null, 2), `${base}.json`, 'application/json');
    } else {
      const cols = ['timestamp', 'serverName', 'path', 'message'];
      const rows = displayedLogs.map((log) =>
        cols.map((c) => `"${String(log[c] || '').replace(/"/g, '""')}"`).join(',')
      );
      downloadFile([cols.join(','), ...rows].join('\n'), `${base}.csv`, 'text/csv');
    }
    setShowExportMenu(false);
  };

  const scrollToTop = () => { if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setAutoScroll(true);
  };

  const btn = getButtonStyles(darkMode);
  const accent = getAccentStyles(darkMode);

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!selectedTopic) {
    return (
      <EmptyState
        theme={theme} darkMode={darkMode}
        splitView={splitView} isActivePanel={isActivePanel}
        onSetActive={onSetActive} onClosePanel={onClosePanel} onOpenSidebar={onOpenSidebar}
      />
    );
  }

  // ─── Main panel ────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-70' : ''} ${splitView && isActivePanel ? `ring-1 ${darkMode ? 'ring-green-500/60' : 'ring-indigo-400/60'}` : ''}`}
      onClick={splitView && !isActivePanel ? onSetActive : undefined}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={`px-3 sm:px-4 md:px-5 py-3 ${theme.header} flex-shrink-0 relative z-10`}>
        <DesktopHeader
          selectedTopic={selectedTopic} displayedLogs={displayedLogs}
          logRate={logRate} darkMode={darkMode} theme={theme}
          splitView={splitView} isActivePanel={isActivePanel}
          onSetActive={onSetActive} onClosePanel={onClosePanel} onOpenSplit={onOpenSplit}
          isPaused={isPaused} onTogglePause={handleTogglePause} btn={btn}
          showExportMenu={showExportMenu} onToggleExportMenu={() => setShowExportMenu((v) => !v)}
          exportMenuRef={exportMenuRef} onExport={exportLogs}
          onThemeToggle={onThemeToggle}
          autoScroll={autoScroll} onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm} onSearchChange={setLogSearchTerm}
          isRegex={isRegex} onToggleRegex={() => setIsRegex((v) => !v)} regexError={regexError}
        />

        <MobileHeader
          selectedTopic={selectedTopic} displayedLogs={displayedLogs}
          logRate={logRate} darkMode={darkMode} theme={theme}
          onOpenSidebar={onOpenSidebar} onThemeToggle={onThemeToggle}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          mobileMenuReady={mobileMenuReady}
          isPaused={isPaused} onTogglePause={handleTogglePause}
          autoScroll={autoScroll} onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onExport={exportLogs} onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm} onSearchChange={setLogSearchTerm}
          isRegex={isRegex} onToggleRegex={() => setIsRegex((v) => !v)} regexError={regexError}
          showMobileServerDropdown={showMobileServerDropdown}
          onToggleMobileServerDropdown={(v) => setShowMobileServerDropdown(v ?? !showMobileServerDropdown)}
          showMobilePathDropdown={showMobilePathDropdown}
          onToggleMobilePathDropdown={(v) => setShowMobilePathDropdown(v ?? !showMobilePathDropdown)}
          filteredServers={filteredServers} selectedServer={selectedServer}
          onServerSelect={handleServerSelect} onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm} onServerSearchChange={setServerSearchTerm}
          filteredPaths={filteredPaths} selectedPath={selectedPath}
          onPathSelect={handlePathSelect} onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm} onPathSearchChange={setPathSearchTerm}
          timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange}
          accentActive={accent.active} accentPaused={accent.paused}
        />

        <FilterBar
          theme={theme} darkMode={darkMode}
          serverButtonRef={serverButtonRef} pathButtonRef={pathButtonRef}
          showServerDropdown={showServerDropdown}
          onToggleServerDropdown={(v) => setShowServerDropdown(v ?? !showServerDropdown)}
          showPathDropdown={showPathDropdown}
          onTogglePathDropdown={(v) => setShowPathDropdown(v ?? !showPathDropdown)}
          filteredServers={filteredServers} selectedServer={selectedServer}
          onServerSelect={handleServerSelect} onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm} onServerSearchChange={setServerSearchTerm}
          filteredPaths={filteredPaths} selectedPath={selectedPath}
          onPathSelect={handlePathSelect} onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm} onPathSearchChange={setPathSearchTerm}
          timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange}
          accentActive={accent.active}
        />

        {/* Keyword filter */}
        <div className="mt-2">
          <KeywordFilter
            keywords={keywords}
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAdd={(kw) => setKeywords((prev) => [...prev, kw])}
            onRemove={(text) => setKeywords((prev) => prev.filter((k) => k.text !== text))}
            onClearAll={() => { setKeywords([]); setKeywordInput(''); }}
            mode={keywordMode}
            onModeChange={setKeywordMode}
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        <ActiveFilters
          selectedServer={selectedServer} selectedPath={selectedPath}
          logSearchTerm={logSearchTerm} keywords={keywords} isRegex={isRegex}
          darkMode={darkMode} theme={theme}
          onClearServer={handleClearServer} onClearPath={handleClearPath}
          onClearSearch={() => setLogSearchTerm("")}
        />
      </div>

      {/* ── Logs Area ──────────────────────────────────────────────────────── */}
      <VirtualLogList
        displayedLogs={displayedLogs}
        isPaused={isPaused}
        accent={accent}
        theme={theme}
        darkMode={darkMode}
        keywords={keywords}
        timestampGen={timestampGen}
        selectedServer={selectedServer}
        selectedPath={selectedPath}
        timeRange={timeRange}
        scrollRef={scrollRef}
        atTop={atTop}
        atBottom={atBottom}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
        handleClearPath={handleClearPath}
        handleClearServer={handleClearServer}
      />

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <StatusBar
        isConnected={isConnected} isReconnecting={isReconnecting} isPaused={isPaused}
        selectedServer={selectedServer} selectedPath={selectedPath}
        logRate={logRate} darkMode={darkMode} theme={theme}
        onClearServer={handleClearServer} onClearPath={handleClearPath}
      />
    </div>
  );
};

export default React.memo(LogPanel);
