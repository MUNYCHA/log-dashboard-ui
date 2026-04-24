import React, { useState, useReducer, useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { KeywordFilter } from "../filters";
import { getButtonStyles } from "./constants";
import { fetchTopicMeta, downloadLogs as apiDownloadLogs } from '../../api/logApi';
import { initialPanelState, panelReducer } from './panelReducer';
import { useFilteredLogs } from '../../hooks/useFilteredLogs';
import VirtualLogList from './components/VirtualLogList';
import DesktopHeader from "./components/headers/DesktopHeader";
import MobileHeader from "./components/headers/MobileHeader";
import FilterBar from "./components/FilterBar";
import ActiveFilters from "./components/ActiveFilters";
import StatusBar from "./components/StatusBar";
import EmptyState from "./components/EmptyState";

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
  terminalMode,
  onToggleTheme,
  onToggleTerminalMode,
  onOpenSidebar,
  isSidebarOpen,
  splitView,
  onOpenSplit,
  onClosePanel,
  isActivePanel,
  onSetActive,
  sendFilter,
  panelId,
}) => {
  const [state, dispatch] = useReducer(panelReducer, undefined, () => initialPanelState(selectedTopic));
  const {
    frozenLogs, frozenTopic, logSearchTerm, debouncedSearch, autoScroll,
    showServerDropdown, showPathDropdown, showMobileServerDropdown, showMobilePathDropdown,
    serverSearchTerm, pathSearchTerm, pathForTopic,
    isMobileMenuOpen, mobileMenuReady,
    keywords, keywordInput, debouncedKeywordInput, keywordMode,
    timeRange, customRangeMs,
    atTop, atBottom, downloadError, topicMeta,
  } = state;
  const selectedPathForTopic = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;
  const [timestampGen, setTimestampGen] = useState(0);

  const scrollRef = useRef(null);
  const virtualizerScrollToBottomRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);
  const previousScrollTopRef = useRef(0);
  const userScrollIntentUntilRef = useRef(0);
  const previousTopicRef = useRef(selectedTopic);

  const markUserScrollIntent = useCallback(() => {
    userScrollIntentUntilRef.current = Date.now() + 800;
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const id = setTimeout(() => dispatch({ type: 'PATCH', payload: { mobileMenuReady: true } }), 300);
    return () => {
      clearTimeout(id);
      dispatch({ type: 'PATCH', payload: { mobileMenuReady: false } });
    };
  }, [isMobileMenuOpen]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampGen((g) => g + 1);
      setNowMs(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeRangeChange = useCallback((value, ms = 0) => {
    dispatch({ type: 'PATCH', payload: { timeRange: value, customRangeMs: ms } });
    if (value !== 'all') setNowMs(Date.now());
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
    dispatch({ type: 'PATCH', payload: { atTop: isNearTop, atBottom: isNearBottom } });
    if (userInitiated && didScrollUp && !isNearBottom) {
      dispatch({ type: 'PATCH', payload: { autoScroll: false } });
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
    const previousTopic = previousTopicRef.current;
    previousTopicRef.current = selectedTopic;

    if (!selectedTopic || previousTopic === selectedTopic) return;

    dispatch({ type: 'RESET_TOPIC', topic: selectedTopic });
    userScrollIntentUntilRef.current = 0;
    previousScrollTopRef.current = 0;

    requestAnimationFrame(() => {
      if (virtualizerScrollToBottomRef.current) {
        virtualizerScrollToBottomRef.current();
        return;
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [selectedTopic]);

  useEffect(() => {
    if (!selectedTopic) return;
    const controller = new AbortController();
    fetchTopicMeta(selectedTopic, controller.signal)
      .then((data) => { if (data) dispatch({ type: 'PATCH', payload: { topicMeta: data } }); })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedTopic]);

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'PATCH', payload: { debouncedSearch: logSearchTerm } }), 300);
    return () => clearTimeout(t);
  }, [logSearchTerm]);

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'PATCH', payload: { debouncedKeywordInput: keywordInput } }), 300);
    return () => clearTimeout(t);
  }, [keywordInput]);

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

  // Merge backend meta (all-time) with buffer (recently seen) — meta order preserved,
  // buffer-only servers appended at the end for brand-new servers not yet in meta.
  const mergedServers = useMemo(() => {
    const metaNames = topicMeta?.servers?.map((s) => s.name) ?? [];
    const metaSet = new Set(metaNames);
    const bufferOnly = serversForSelectedTopic.filter((s) => !metaSet.has(s));
    return [...metaNames, ...bufferOnly];
  }, [topicMeta, serversForSelectedTopic]);

  const mergedPaths = useMemo(() => {
    const serverMeta = selectedServer
      ? topicMeta?.servers?.find((s) => s.name === selectedServer)
      : null;
    const metaPaths = serverMeta?.paths?.map((p) => p.path) ?? [];
    const metaSet = new Set(metaPaths);
    const bufferOnly = pathsForSelectedServer.filter((p) => !metaSet.has(p));
    return [...metaPaths, ...bufferOnly];
  }, [topicMeta, selectedServer, pathsForSelectedServer]);

  const selectedPath = selectedPathForTopic && (
    mergedPaths.includes(selectedPathForTopic) || pathsForSelectedServer.includes(selectedPathForTopic)
  ) ? selectedPathForTopic : null;

  // Auto-clear selected server if it's gone from both meta and buffer.
  // Guard on mergedServers.length so we don't clear before meta has loaded.
  useEffect(() => {
    if (selectedServer && mergedServers.length > 0 && !mergedServers.includes(selectedServer)) {
      onServerSelect(null);
    }
  }, [selectedServer, mergedServers, onServerSelect]);

  useEffect(() => {
    if (selectedPathForTopic && mergedPaths.length > 0 && !mergedPaths.includes(selectedPathForTopic)) {
      dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null } } });
    }
  }, [selectedPathForTopic, mergedPaths, selectedTopic]);

  useEffect(() => {
    if (!sendFilter) return;

    const pendingInput = debouncedKeywordInput.trim().toLowerCase();
    const allTerms = [...keywords.map((k) => k.text), ...(pendingInput ? [pendingInput] : [])];

    const filters = {
      server: selectedServer || null,
      path: selectedPath || null,
      search: debouncedSearch || null,
      keywords: allTerms.length > 0 ? { terms: allTerms, mode: keywordMode } : undefined,
      timeRange: timeRange,
      ...(timeRange === 'custom' && customRangeMs > 0 ? { timeRangeMs: customRangeMs } : {}),
    };

    const hasAny = filters.server || filters.path || filters.search || filters.keywords ||
      (filters.timeRange && filters.timeRange !== 'all' && (filters.timeRange !== 'custom' || customRangeMs > 0));
    sendFilter(hasAny ? filters : null, panelId);
  }, [selectedServer, selectedPath, debouncedSearch, keywords, debouncedKeywordInput, keywordMode, timeRange, customRangeMs, sendFilter, panelId]);

  const filteredServers = useMemo(
    () => mergedServers.filter((s) => s.toLowerCase().includes(serverSearchTerm.toLowerCase())),
    [mergedServers, serverSearchTerm],
  );

  const filteredPaths = useMemo(
    () => mergedPaths.filter((p) => p.toLowerCase().includes(pathSearchTerm.toLowerCase())),
    [mergedPaths, pathSearchTerm],
  );

  const renderServerItem = useCallback((serverName) => {
    return { primary: serverName, secondary: null };
  }, []);

  const filteredLogs = useFilteredLogs({
    selectedTopic, topicLogs, selectedServer, selectedPath,
    logSearchTerm, keywords, debouncedKeywordInput, keywordMode,
    timeRange, customRangeMs, nowMs,
  });

  const displayedLogs = frozenLogs != null && frozenTopic === selectedTopic
    ? frozenLogs
    : filteredLogs;
  const bufferedCount = topicLogs?.length || 0;
  const displayKeywords = useMemo(() => {
    const pending = debouncedKeywordInput.trim();
    if (!pending) return keywords;

    const exists = keywords.some((k) => k.text.toLowerCase() === pending.toLowerCase());
    if (exists) return keywords;

    return [...keywords, { text: pending, color: '#888888' }];
  }, [keywords, debouncedKeywordInput]);

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
      dispatch({ type: 'PATCH', payload: { frozenTopic: selectedTopic, frozenLogs: filteredLogs } });
    } else {
      dispatch({ type: 'PATCH', payload: { frozenTopic: null, frozenLogs: null } });
    }
    togglePause();
  };


  const handleServerSelect = (server) => {
    onServerSelect(server);
    dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null }, showServerDropdown: false, showMobileServerDropdown: false, serverSearchTerm: "" } });
  };

  const handlePathSelect = (path) => {
    dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path }, showPathDropdown: false, showMobilePathDropdown: false, pathSearchTerm: "" } });
  };

  const handleClearServer = () => {
    onClearServer();
    dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null } } });
  };

  const handleClearPath = () => dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null } } });

  const clearAllFilters = () => {
    handleClearServer();
    dispatch({ type: 'PATCH', payload: { logSearchTerm: "", keywords: [], keywordInput: "", timeRange: "all" } });
  };

  const downloadLogs = async () => {
    try {
      const { blob, filename } = await apiDownloadLogs(selectedTopic);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      dispatch({ type: 'PATCH', payload: { downloadError: err.message || 'Download failed — server unreachable' } });
      setTimeout(() => dispatch({ type: 'PATCH', payload: { downloadError: null } }), 5000);
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      previousScrollTopRef.current = 0;
    }
    dispatch({ type: 'PATCH', payload: { atTop: true, atBottom: false, autoScroll: false } });
  };

  const scrollToBottom = () => {
    // Prefer virtualizer-based scroll so we land exactly on the last item,
    // not mid-item when padding spacers are active.
    if (virtualizerScrollToBottomRef.current) {
      virtualizerScrollToBottomRef.current();
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (scrollRef.current) {
      previousScrollTopRef.current = scrollRef.current.scrollTop;
    }
    dispatch({ type: 'PATCH', payload: { atTop: false, atBottom: true, autoScroll: true } });
  };

  const btn = getButtonStyles(darkMode);
  const toggleAutoScroll = () => {
    if (autoScroll) {
      dispatch({ type: 'PATCH', payload: { autoScroll: false } });
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
      className={`flex-1 flex flex-col min-w-0 gap-2 ${splitView && !isActivePanel ? 'cursor-pointer' : ''}`}
      onClick={splitView && !isActivePanel ? onSetActive : undefined}
    >
      <div className={`px-3 sm:px-4 md:px-4 py-2 ${theme.card} rounded-2xl flex-shrink-0 relative z-10`}>
        <DesktopHeader
          panelId={panelId}
          selectedTopic={selectedTopic}
          displayedLogs={displayedLogs}
          logRate={logRate}
          darkMode={darkMode}
          theme={theme}
          onToggleTheme={onToggleTheme}
          terminalMode={terminalMode}
          onToggleTerminalMode={onToggleTerminalMode}
          splitView={splitView}
          isActivePanel={isActivePanel}
          onSetActive={onSetActive}
          onClosePanel={onClosePanel}
          onOpenSplit={onOpenSplit}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          btn={btn}
          onDownload={downloadLogs}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onClearLogs={onClearLogs}
        />

        <MobileHeader
          panelId={panelId}
          selectedTopic={selectedTopic}
          displayedLogs={displayedLogs}
          logRate={logRate}
          darkMode={darkMode}
          theme={theme}
          onToggleTheme={onToggleTheme}
          terminalMode={terminalMode}
          onToggleTerminalMode={onToggleTerminalMode}
          onOpenSidebar={onOpenSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => dispatch({ type: 'PATCH', payload: { isMobileMenuOpen: !isMobileMenuOpen } })}
          mobileMenuReady={mobileMenuReady}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onDownload={downloadLogs}
          onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm}
          onSearchChange={(v) => dispatch({ type: 'PATCH', payload: { logSearchTerm: v } })}
          showMobileServerDropdown={showMobileServerDropdown}
          onToggleMobileServerDropdown={(v) => dispatch({ type: 'PATCH', payload: { showMobileServerDropdown: v ?? !showMobileServerDropdown } })}
          showMobilePathDropdown={showMobilePathDropdown}
          onToggleMobilePathDropdown={(v) => dispatch({ type: 'PATCH', payload: { showMobilePathDropdown: v ?? !showMobilePathDropdown } })}
          filteredServers={filteredServers}
          renderServerItem={renderServerItem}
          selectedServer={selectedServer}
          onServerSelect={handleServerSelect}
          onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm}
          onServerSearchChange={(v) => dispatch({ type: 'PATCH', payload: { serverSearchTerm: v } })}
          filteredPaths={filteredPaths}
          selectedPath={selectedPath}
          onPathSelect={handlePathSelect}
          onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm}
          onPathSearchChange={(v) => dispatch({ type: 'PATCH', payload: { pathSearchTerm: v } })}
          timeRange={timeRange}
          customRangeMs={customRangeMs}
          onTimeRangeChange={handleTimeRangeChange}
        />

        <FilterBar
          theme={theme}
          darkMode={darkMode}
          serverButtonRef={serverButtonRef}
          pathButtonRef={pathButtonRef}
          showServerDropdown={showServerDropdown}
          onToggleServerDropdown={(v) => dispatch({ type: 'PATCH', payload: { showServerDropdown: v ?? !showServerDropdown } })}
          showPathDropdown={showPathDropdown}
          onTogglePathDropdown={(v) => dispatch({ type: 'PATCH', payload: { showPathDropdown: v ?? !showPathDropdown } })}
          filteredServers={filteredServers}
          renderServerItem={renderServerItem}
          selectedServer={selectedServer}
          onServerSelect={handleServerSelect}
          onClearServer={handleClearServer}
          serverSearchTerm={serverSearchTerm}
          onServerSearchChange={(v) => dispatch({ type: 'PATCH', payload: { serverSearchTerm: v } })}
          filteredPaths={filteredPaths}
          selectedPath={selectedPath}
          onPathSelect={handlePathSelect}
          onClearPath={handleClearPath}
          pathSearchTerm={pathSearchTerm}
          onPathSearchChange={(v) => dispatch({ type: 'PATCH', payload: { pathSearchTerm: v } })}
          timeRange={timeRange}
          customRangeMs={customRangeMs}
          onTimeRangeChange={handleTimeRangeChange}
          logSearchTerm={logSearchTerm}
          onSearchChange={(v) => dispatch({ type: 'PATCH', payload: { logSearchTerm: v } })}
        />

        <div className="mt-2.5">
          <KeywordFilter
            keywords={keywords}
            inputValue={keywordInput}
            onInputChange={(v) => dispatch({ type: 'PATCH', payload: { keywordInput: v } })}
            onAdd={(kw) => dispatch({ type: 'PATCH', payload: { keywords: [...keywords, kw] } })}
            onRemove={(text) => dispatch({ type: 'PATCH', payload: { keywords: keywords.filter((k) => k.text !== text) } })}
            onClearAll={() => dispatch({ type: 'PATCH', payload: { keywords: [], keywordInput: '' } })}
            mode={keywordMode}
            onModeChange={(v) => dispatch({ type: 'PATCH', payload: { keywordMode: v } })}
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        <ActiveFilters
          selectedServer={selectedServer}
          selectedPath={selectedPath}
          logSearchTerm={logSearchTerm}
          keywords={keywords}
          darkMode={darkMode}
          theme={theme}
          onClearServer={handleClearServer}
          onClearPath={handleClearPath}
          onClearSearch={() => dispatch({ type: 'PATCH', payload: { logSearchTerm: '' } })}
          onRemoveKeyword={(text) => dispatch({ type: 'PATCH', payload: { keywords: keywords.filter((k) => k.text !== text) } })}
        />
      </div>

      <AnimatePresence>
        {downloadError && (
          <Motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-[13px] font-medium flex-shrink-0 ${
              darkMode ? 'bg-[#2D1B1B] text-[#F28B82] border border-[#5C2D2D]' : 'bg-[#FCE8E6] text-[#C5221F] border border-[#F5C6C2]'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="flex-1 min-w-0 truncate">Download failed: {downloadError}</span>
            <button onClick={() => dispatch({ type: 'PATCH', payload: { downloadError: null } })} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      <VirtualLogList
        displayedLogs={displayedLogs}
        isPaused={isPaused}
        autoScroll={autoScroll}
        theme={theme}
        darkMode={darkMode}
        keywords={displayKeywords}
        timestampGen={timestampGen}
        logSearchTerm={logSearchTerm}
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
        virtualizerScrollToBottomRef={virtualizerScrollToBottomRef}
        terminalMode={terminalMode}
      />

      <StatusBar
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        isPaused={isPaused}
        logRate={logRate}
        darkMode={darkMode}
        theme={theme}
        streamMode={streamMode}
        visibleCount={displayedLogs.length}
        bufferedCount={bufferedCount}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};

export default React.memo(LogPanel);

