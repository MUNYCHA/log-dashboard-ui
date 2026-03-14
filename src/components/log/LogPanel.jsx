import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { KeywordFilter } from "../filters";
import { downloadFile, getButtonStyles } from "./constants";
import config from "../../config";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import FilterBar from "./FilterBar";
import ActiveFilters from "./ActiveFilters";
import StatusBar from "./StatusBar";
import EmptyState from "./EmptyState";
import ScrollButtons from "./ScrollButtons";
import LogEntry from "./LogEntry";

const ESTIMATED_LOG_HEIGHT = 96;

const VirtualLogList = React.memo(({
  displayedLogs, isPaused, theme, darkMode, keywords, timestampGen,
  selectedServer, selectedPath,
  emptyState, onClearFilters, onResumeLive,
  scrollRef, atTop, atBottom, scrollToTop, scrollToBottom,
  handleClearPath, handleClearServer, markUserScrollIntent,
}) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is designed this way
  const virtualizer = useVirtualizer({
    count: displayedLogs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LOG_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Top fade overlay */}
      <div className={`absolute top-0 left-0 right-0 h-8 z-[1] pointer-events-none ${
        darkMode
          ? 'bg-gradient-to-b from-[#111111] to-transparent'
          : 'bg-gradient-to-b from-white to-transparent'
      }`} />
      <div
        className="absolute inset-0 overflow-auto font-mono text-sm"
        ref={scrollRef}
        onWheel={markUserScrollIntent}
        onTouchMove={markUserScrollIntent}
        onPointerDown={markUserScrollIntent}
      >
        <div>
          {isPaused && (
            <div className={`flex items-center justify-between gap-3 px-3 py-2 text-xs border-b ${
              darkMode ? 'border-[#222] bg-[#141414] text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}>
              <span className="min-w-0 font-mono">
                Paused - logs continue buffering.
              </span>
              <button
                onClick={onResumeLive}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  darkMode
                    ? 'bg-[#1a1a1a] text-gray-300 hover:text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                Resume
              </button>
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
                    <LogEntry log={log} theme={theme} darkMode={darkMode} keywords={keywords} timestampGen={timestampGen} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`flex h-48 flex-col items-center justify-center ${theme.textMuted}`}>
              <p className="text-sm font-medium">{emptyState.title}</p>
              <p className="mt-1 max-w-md text-center text-xs">{emptyState.description}</p>
              {(selectedServer || selectedPath) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPath && (
                    <button onClick={handleClearPath} className={`px-2.5 py-1.5 rounded-md ${theme.input} text-xs`}>Clear path</button>
                  )}
                  {selectedServer && (
                    <button onClick={handleClearServer} className={`px-2.5 py-1.5 rounded-md ${theme.input} text-xs`}>Clear server</button>
                  )}
                </div>
              )}
              {emptyState.showClearFilters && (
                <button
                  onClick={onClearFilters}
                  className={`mt-3 rounded-md px-2.5 py-1.5 text-xs ${theme.input}`}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ScrollButtons
        atTop={atTop}
        atBottom={atBottom}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
        darkMode={darkMode}
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
  panelId,
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
  const [pathForTopic, setPathForTopic] = useState({ topic: null, path: null });
  const selectedPath = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuReady, setMobileMenuReady] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordMode, setKeywordMode] = useState('or');
  const [isRegex, setIsRegex] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedKeywordInput, setDebouncedKeywordInput] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const [timestampGen, setTimestampGen] = useState(0);

  const scrollRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);
  const exportMenuRef = useRef(null);
  const previousScrollTopRef = useRef(0);
  const userScrollIntentUntilRef = useRef(0);

  const markUserScrollIntent = useCallback(() => {
    userScrollIntentUntilRef.current = Date.now() + 800;
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const id = setTimeout(() => setMobileMenuReady(true), 300);
    return () => {
      clearTimeout(id);
      setMobileMenuReady(false);
    };
  }, [isMobileMenuOpen]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampGen((g) => g + 1);
      setNowMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeRangeChange = useCallback((value) => {
    setTimeRange(value);
    if (value !== 'all') setNowMs(Date.now());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const previousScrollTop = previousScrollTopRef.current;
    const didScrollUp = scrollTop < previousScrollTop - 1;
    const isNearTop = scrollTop < 50;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    const userInitiated = userScrollIntentUntilRef.current > Date.now();
    previousScrollTopRef.current = scrollTop;
    setAtTop(isNearTop);
    setAtBottom(isNearBottom);
    if (userInitiated && didScrollUp && !isNearBottom) {
      setAutoScroll(false);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    previousScrollTopRef.current = el.scrollTop;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, selectedTopic]);

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

  const regexError = useMemo(() => {
    if (!isRegex || !logSearchTerm) return false;
    if (logSearchTerm.length > 512) return true;
    try {
      new RegExp(logSearchTerm);
      return false;
    } catch {
      return true;
    }
  }, [isRegex, logSearchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(logSearchTerm), 300);
    return () => clearTimeout(t);
  }, [logSearchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeywordInput(keywordInput), 300);
    return () => clearTimeout(t);
  }, [keywordInput]);

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
      timeRange,
    };

    const hasAny = filters.server || filters.path || filters.search || filters.keywords || filters.timeRange !== 'all';
    sendFilter(hasAny ? filters : null, panelId);
  }, [selectedServer, selectedPath, debouncedSearch, isRegex, keywords, debouncedKeywordInput, keywordMode, timeRange, sendFilter, panelId]);

  const serversForSelectedTopic = useMemo(
    () => selectedTopic ? [...new Set(topicLogs?.map((l) => l.serverName) || [])].sort() : [],
    [selectedTopic, topicLogs],
  );

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

  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;

    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    if (selectedPath) logs = logs.filter((l) => l.path === selectedPath);

    if (logSearchTerm) {
      if (isRegex) {
        try {
          const re = new RegExp(logSearchTerm, 'i');
          logs = logs.filter((l) =>
            re.test(String(l.message ?? '')) || re.test(String(l.serverName ?? '')) || re.test(String(l.path ?? ''))
          );
        } catch {
          logs = [];
        }
      } else {
        const lower = logSearchTerm.toLowerCase();
        logs = logs.filter((l) =>
          String(l.message ?? '').toLowerCase().includes(lower) ||
          String(l.serverName ?? '').toLowerCase().includes(lower) ||
          String(l.path ?? '').toLowerCase().includes(lower)
        );
      }
    }

    const pendingKw = keywordInput.trim().toLowerCase();
    const allTerms = [
      ...keywords.map((k) => k.text.toLowerCase()),
      ...(pendingKw ? [pendingKw] : []),
    ];
    if (allTerms.length > 0) {
      logs = logs.filter((l) => {
        const haystack = `${String(l.message ?? '')}\0${String(l.serverName ?? '')}\0${String(l.path ?? '')}`.toLowerCase();
        return keywordMode === 'and'
          ? allTerms.every((t) => haystack.includes(t))
          : allTerms.some((t) => haystack.includes(t));
      });
    }

    if (timeRange !== 'all') {
      const ranges = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };
      const cutoff = nowMs - (ranges[timeRange] || 0);
      logs = logs.filter((l) => {
        const ts = new Date(l.timestamp).getTime();
        return Number.isFinite(ts) && ts >= cutoff;
      });
    }

    return [...logs].slice(0, config.ws.maxLogsPerTopic).reverse();
  }, [selectedTopic, topicLogs, selectedServer, selectedPath, logSearchTerm, isRegex, keywords, keywordInput, keywordMode, timeRange, nowMs]);

  const displayedLogs = frozenLogs ?? filteredLogs;
  const bufferedCount = topicLogs?.length || 0;
  const hasActiveFilters = Boolean(
    selectedServer || selectedPath || logSearchTerm || keywords.length > 0 || keywordInput.trim() || timeRange !== 'all',
  );
  const streamMode = isPaused ? 'Paused' : autoScroll && atBottom ? 'Live tail' : 'Manual review';

  const emptyState = useMemo(() => {
    if (hasActiveFilters) {
      return {
        title: 'No logs match the current filters',
        description: 'Adjust or clear filters to return to the live stream for this topic.',
        showClearFilters: true,
      };
    }

    if (bufferedCount === 0 && logRate > 0) {
      return {
        title: 'Topic is live. Waiting for local buffer',
        description: 'The topic is receiving traffic now. The panel will fill as soon as recent entries arrive in the local stream buffer.',
        showClearFilters: false,
      };
    }

    if (bufferedCount === 0) {
      return {
        title: 'No logs received for this topic yet',
        description: 'This topic is known to the dashboard, but no log entries have reached the client buffer yet.',
        showClearFilters: false,
      };
    }

    return {
      title: 'No recent logs in the current view',
      description: timeRange !== 'all'
        ? `There are buffered logs for this topic, but none fall inside the last ${timeRange}.`
        : 'There are buffered logs for this topic, but none are visible in the current view.',
      showClearFilters: false,
    };
  }, [bufferedCount, hasActiveFilters, logRate, timeRange]);

  const handleTogglePause = () => {
    if (!isPaused) {
      setFrozenLogs(filteredLogs);
    } else {
      setFrozenLogs(null);
    }
    togglePause();
  };

  useEffect(() => {
    if (!isPaused && autoScroll && scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        previousScrollTopRef.current = el.scrollTop;
      });
    }
  }, [filteredLogs, autoScroll, isPaused]);

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

  const clearAllFilters = () => {
    handleClearServer();
    handleClearPath();
    setLogSearchTerm("");
    setKeywords([]);
    setKeywordInput('');
    setIsRegex(false);
    setTimeRange('all');
  };

  const exportLogs = (format) => {
    const safeTopic = selectedTopic.replace(/[^a-z0-9]/gi, '_');
    const exportNow = new Date();
    const ts = `${exportNow.getFullYear()}-${String(exportNow.getMonth() + 1).padStart(2, '0')}-${String(exportNow.getDate()).padStart(2, '0')}_${String(exportNow.getHours()).padStart(2, '0')}-${String(exportNow.getMinutes()).padStart(2, '0')}-${String(exportNow.getSeconds()).padStart(2, '0')}`;
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

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      previousScrollTopRef.current = 0;
      setAtTop(true);
      setAtBottom(false);
    }
    setAutoScroll(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      previousScrollTopRef.current = scrollRef.current.scrollTop;
      setAtTop(false);
      setAtBottom(true);
    }
    setAutoScroll(true);
  };

  const btn = getButtonStyles(darkMode);
  const toggleAutoScroll = () => {
    if (autoScroll) {
      setAutoScroll(false);
      return;
    }
    scrollToBottom();
  };

  if (!selectedTopic) {
    return (
      <EmptyState
        theme={theme}
        darkMode={darkMode}
        splitView={splitView}
        isActivePanel={isActivePanel}
        onSetActive={onSetActive}
        onClosePanel={onClosePanel}
        onOpenSidebar={onOpenSidebar}
      />
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-60' : ''} ${splitView && isActivePanel ? 'ring-1 ring-blue-500/40' : ''}`}
      onClick={splitView && !isActivePanel ? onSetActive : undefined}
    >
      <div className={`px-3 sm:px-4 md:px-4 py-2 ${theme.header} flex-shrink-0 relative z-10`}>
        <DesktopHeader
          selectedTopic={selectedTopic}
          displayedLogs={displayedLogs}
          logRate={logRate}
          darkMode={darkMode}
          theme={theme}
          splitView={splitView}
          isActivePanel={isActivePanel}
          onSetActive={onSetActive}
          onClosePanel={onClosePanel}
          onOpenSplit={onOpenSplit}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          btn={btn}
          showExportMenu={showExportMenu}
          onToggleExportMenu={() => setShowExportMenu((v) => !v)}
          exportMenuRef={exportMenuRef}
          onExport={exportLogs}
          onThemeToggle={onThemeToggle}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm}
          onSearchChange={setLogSearchTerm}
          isRegex={isRegex}
          onToggleRegex={() => setIsRegex((v) => !v)}
          regexError={regexError}
        />

        <MobileHeader
          selectedTopic={selectedTopic}
          displayedLogs={displayedLogs}
          logRate={logRate}
          darkMode={darkMode}
          theme={theme}
          onOpenSidebar={onOpenSidebar}
          onThemeToggle={onThemeToggle}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          mobileMenuReady={mobileMenuReady}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onExport={exportLogs}
          onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm}
          onSearchChange={setLogSearchTerm}
          isRegex={isRegex}
          onToggleRegex={() => setIsRegex((v) => !v)}
          regexError={regexError}
          showMobileServerDropdown={showMobileServerDropdown}
          onToggleMobileServerDropdown={(v) => setShowMobileServerDropdown(v ?? !showMobileServerDropdown)}
          showMobilePathDropdown={showMobilePathDropdown}
          onToggleMobilePathDropdown={(v) => setShowMobilePathDropdown(v ?? !showMobilePathDropdown)}
          filteredServers={filteredServers}
          selectedServer={selectedServer}
          onServerSelect={handleServerSelect}
          onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm}
          onServerSearchChange={setServerSearchTerm}
          filteredPaths={filteredPaths}
          selectedPath={selectedPath}
          onPathSelect={handlePathSelect}
          onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm}
          onPathSearchChange={setPathSearchTerm}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />

        <FilterBar
          theme={theme}
          darkMode={darkMode}
          serverButtonRef={serverButtonRef}
          pathButtonRef={pathButtonRef}
          showServerDropdown={showServerDropdown}
          onToggleServerDropdown={(v) => setShowServerDropdown(v ?? !showServerDropdown)}
          showPathDropdown={showPathDropdown}
          onTogglePathDropdown={(v) => setShowPathDropdown(v ?? !showPathDropdown)}
          filteredServers={filteredServers}
          selectedServer={selectedServer}
          onServerSelect={handleServerSelect}
          onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm}
          onServerSearchChange={setServerSearchTerm}
          filteredPaths={filteredPaths}
          selectedPath={selectedPath}
          onPathSelect={handlePathSelect}
          onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm}
          onPathSearchChange={setPathSearchTerm}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />

        <div className="mt-2.5">
          <KeywordFilter
            keywords={keywords}
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAdd={(kw) => setKeywords((prev) => [...prev, kw])}
            onRemove={(text) => setKeywords((prev) => prev.filter((k) => k.text !== text))}
            onClearAll={() => {
              setKeywords([]);
              setKeywordInput('');
            }}
            mode={keywordMode}
            onModeChange={setKeywordMode}
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        <ActiveFilters
          selectedServer={selectedServer}
          selectedPath={selectedPath}
          logSearchTerm={logSearchTerm}
          keywords={keywords}
          isRegex={isRegex}
          darkMode={darkMode}
          theme={theme}
          onClearServer={handleClearServer}
          onClearPath={handleClearPath}
          onClearSearch={() => setLogSearchTerm("")}
        />
      </div>

      <VirtualLogList
        displayedLogs={displayedLogs}
        isPaused={isPaused}
        theme={theme}
        darkMode={darkMode}
        keywords={keywords}
        timestampGen={timestampGen}
        selectedServer={selectedServer}
        selectedPath={selectedPath}
        emptyState={emptyState}
        onClearFilters={clearAllFilters}
        onResumeLive={() => {
          if (isPaused) handleTogglePause();
          scrollToBottom();
        }}
        scrollRef={scrollRef}
        atTop={atTop}
        atBottom={atBottom}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
        handleClearPath={handleClearPath}
        handleClearServer={handleClearServer}
        markUserScrollIntent={markUserScrollIntent}
      />

      <StatusBar
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        isPaused={isPaused}
        selectedServer={selectedServer}
        selectedPath={selectedPath}
        logRate={logRate}
        darkMode={darkMode}
        theme={theme}
        streamMode={streamMode}
        visibleCount={displayedLogs.length}
        bufferedCount={bufferedCount}
        hasActiveFilters={hasActiveFilters}
        onClearServer={handleClearServer}
        onClearPath={handleClearPath}
      />
    </div>
  );
};

export default React.memo(LogPanel);

