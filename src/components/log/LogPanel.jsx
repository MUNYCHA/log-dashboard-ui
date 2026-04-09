import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { KeywordFilter } from "../filters";
import { getButtonStyles } from "./constants";
import { downloadLogs as fetchDownloadLogs } from "../../api/logs";
import useTopicMeta from "../../hooks/useTopicMeta";
import usePanelState from "../../hooks/usePanelState";
import useFilteredLogs from "../../hooks/useFilteredLogs";
import useScrollBehavior from "../../hooks/useScrollBehavior";
import DesktopHeader from "./header/DesktopHeader";
import MobileHeader from "./header/MobileHeader";
import FilterBar from "./FilterBar";
import ActiveFilters from "./ActiveFilters";
import StatusBar from "./StatusBar";
import EmptyState from "./EmptyState";
import VirtualLogList from "./VirtualLogList";

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
  const { state, dispatch, timestampGen, nowMs, handleTimeRangeChange } = usePanelState(selectedTopic);
  const {
    frozenLogs, frozenTopic, logSearchTerm, debouncedSearch, autoScroll,
    showServerDropdown, showPathDropdown, showMobileServerDropdown, showMobilePathDropdown,
    serverSearchTerm, pathSearchTerm, pathForTopic,
    isMobileMenuOpen, mobileMenuReady,
    keywords, keywordInput, debouncedKeywordInput, keywordMode,
    timeRange, customRangeMs,
    atTop, atBottom, downloadError,
  } = state;

  const topicMeta = useTopicMeta(selectedTopic);

  const { filteredLogs, filteredServers, filteredPaths, selectedPath } = useFilteredLogs({
    selectedTopic,
    topicLogs,
    selectedServer,
    onServerSelect,
    topicMeta,
    serverSearchTerm,
    pathSearchTerm,
    pathForTopic,
    logSearchTerm,
    keywords,
    debouncedKeywordInput,
    keywordMode,
    timeRange,
    customRangeMs,
    nowMs,
    dispatch,
  });

  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);

  const { scrollRef, virtualizerScrollToBottomRef, markUserScrollIntent, scrollToTop, scrollToBottom } =
    useScrollBehavior({ selectedTopic, dispatch });

  // Server-side filter dispatch (bandwidth optimization)
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

  const displayedLogs = frozenLogs != null && frozenTopic === selectedTopic ? frozenLogs : filteredLogs;
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
      const res = await fetchDownloadLogs(selectedTopic);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text.trim() || `Server returned ${res.status}`;
        dispatch({ type: 'PATCH', payload: { downloadError: msg } });
        setTimeout(() => dispatch({ type: 'PATCH', payload: { downloadError: null } }), 5000);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const baseName = match ? match[1].replace(/\.log$/i, '') : selectedTopic;
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
      const filename = `${baseName}_${ts}.log`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      dispatch({ type: 'PATCH', payload: { downloadError: 'Download failed — server unreachable' } });
      setTimeout(() => dispatch({ type: 'PATCH', payload: { downloadError: null } }), 5000);
    }
  };

  const btn = getButtonStyles(darkMode);
  const renderServerItem = useCallback((serverName) => ({ primary: serverName, secondary: null }), []);

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
          onDownload={downloadLogs}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onClearLogs={onClearLogs}
        />

        <MobileHeader
          selectedTopic={selectedTopic}
          displayedLogs={displayedLogs}
          logRate={logRate}
          darkMode={darkMode}
          theme={theme}
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
