import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
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

const LogPanel = ({
  selectedTopic,
  logsByTopic,
  selectedServer,
  onServerSelect,
  onClearServer,
  onClearLogs,
  isConnected,
  isReconnecting,
  isPaused,
  togglePause,
  logRates,
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
  // Reset all filters when topic changes
  if (prevTopic !== selectedTopic) {
    setPrevTopic(selectedTopic);
    setAutoScroll(true);
    setLogSearchTerm('');
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
  const [now, setNow] = useState(() => Date.now());

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

  // Ticker for relative timestamps (every 30s)
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
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

  // Send filter updates to server (debounced 300ms)
  const filterTimerRef = useRef(null);
  useEffect(() => {
    if (!sendFilter) return;
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);

    filterTimerRef.current = setTimeout(() => {
      const pendingInput = keywordInput.trim().toLowerCase();
      const allTerms = [...keywords.map((k) => k.text), ...(pendingInput ? [pendingInput] : [])];

      const filters = {
        server: selectedServer || null,
        path: selectedPath || null,
        search: logSearchTerm || null,
        regex: isRegex,
        keywords: allTerms.length > 0 ? { terms: allTerms, mode: keywordMode } : undefined,
        timeRange: timeRange,
      };

      // Check if all filters are empty
      const hasAny = filters.server || filters.path || filters.search || filters.keywords || filters.timeRange !== 'all';
      sendFilter(hasAny ? filters : null);
    }, 300);

    return () => { if (filterTimerRef.current) clearTimeout(filterTimerRef.current); };
  }, [selectedServer, selectedPath, logSearchTerm, isRegex, keywords, keywordInput, keywordMode, timeRange, sendFilter]);

  // Pin to the selected topic's array — already filtered by server
  const topicLogs = logsByTopic[selectedTopic];

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

  // Logs are already filtered by server — just reverse for newest-first display
  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    return [...topicLogs].reverse();
  }, [selectedTopic, topicLogs]);

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

  // Auto-scroll to bottom — useLayoutEffect runs before paint.
  useLayoutEffect(() => {
    if (!isPaused && autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll, isPaused, darkMode]);

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
      <div className={`px-3 sm:px-4 md:px-5 py-3 ${theme.header} backdrop-blur-xl flex-shrink-0 relative z-10`}>
        <DesktopHeader
          selectedTopic={selectedTopic} displayedLogs={displayedLogs}
          logRates={logRates} darkMode={darkMode} theme={theme}
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
          logRates={logRates} darkMode={darkMode} theme={theme}
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
          timeRange={timeRange} onTimeRangeChange={setTimeRange}
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
          timeRange={timeRange} onTimeRangeChange={setTimeRange}
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
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-auto font-mono text-sm" ref={scrollRef}>
          <div className="p-3 sm:p-4 md:p-5 space-y-2">
            {isPaused && (
              <div className={`text-center py-2 px-4 rounded-lg text-xs ${accent.paused} mb-2`}>
                Stream paused — display frozen, new logs still incoming
              </div>
            )}
            {displayedLogs.length > 0 ? (
              displayedLogs.map((log, i) => (
                <LogEntry key={i} log={log} theme={theme} darkMode={darkMode} keywords={keywords} now={now} />
              ))
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

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <StatusBar
        isConnected={isConnected} isReconnecting={isReconnecting} isPaused={isPaused}
        selectedServer={selectedServer} selectedPath={selectedPath} selectedTopic={selectedTopic}
        logRates={logRates} darkMode={darkMode} theme={theme}
        onClearServer={handleClearServer} onClearPath={handleClearPath}
      />
    </div>
  );
};

export default LogPanel;
