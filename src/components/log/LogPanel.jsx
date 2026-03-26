import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useVirtualizer } from '@tanstack/react-virtual';
import { KeywordFilter } from "../filters";
import { getButtonStyles } from "./constants";
import config from "../../config";
import useAppStore, { selectLogPrefs } from "../../store/useAppStore";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import FilterBar from "./FilterBar";
import ActiveFilters from "./ActiveFilters";
import StatusBar from "./StatusBar";
import EmptyState from "./EmptyState";
import ScrollButtons from "./ScrollButtons";
import LogEntry from "./LogEntry";

const ESTIMATED_LOG_HEIGHT = 114;

const VirtualLogList = React.memo(({
  displayedLogs, isPaused, autoScroll, theme, darkMode, keywords, timestampGen,
  density, timestampFormat, messageWrap,
  logSearchTerm,
  selectedServer, selectedPath,
  emptyState, onClearFilters, onResumeLive,
  scrollRef, atTop, atBottom, scrollToTop, scrollToBottom,
  handleClearPath, handleClearServer, markUserScrollIntent,
  virtualizerScrollToBottomRef,
}) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is designed this way
  const virtualizer = useVirtualizer({
    count: displayedLogs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LOG_HEIGHT,
    overscan: 20,
    getItemKey: (index) => displayedLogs[index]._id,
  });

  // Stable refs so ResizeObserver closure never goes stale
  const measureRef = useRef(() => {});
  measureRef.current = () => virtualizer.measure();
  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;
  const atBottomRef = useRef(atBottom);
  atBottomRef.current = atBottom;

  // Captures current virtualizer + count so ResizeObserver can scroll without
  // stale closures. Updated every render.
  const scrollToLastRef = useRef(() => {});
  scrollToLastRef.current = () => {
    if (displayedLogs.length > 0) {
      virtualizer.scrollToIndex(displayedLogs.length - 1, { align: 'end' });
    }
  };

  // Scroll to a specific item index — used to restore paused position after
  // remeasurement. Always points to the latest virtualizer instance.
  const scrollToIndexRef = useRef(() => {});
  scrollToIndexRef.current = (index) => {
    if (index >= 0 && index < displayedLogs.length) {
      virtualizer.scrollToIndex(index, { align: 'start' });
    }
  };

  // Captures the first item whose bottom edge is at or past the current scrollTop —
  // i.e. the topmost visible item. Called before measure() so we know what to
  // restore once item sizes update. Updated every render for fresh virtualizer ref.
  const anchorIndexRef = useRef(null);
  const captureAnchorRef = useRef(() => {});
  captureAnchorRef.current = () => {
    if (!scrollRef.current || displayedLogs.length === 0) return;
    const scrollTop = scrollRef.current.scrollTop;
    const items = virtualizer.getVirtualItems();
    if (items.length === 0) return;
    const first = items.find((item) => item.end >= scrollTop) ?? items[items.length - 1];
    anchorIndexRef.current = first.index;
  };

  // Expose virtualizer-based scroll to LogPanel so scrollToBottom() uses the
  // same coordinate system as auto-scroll (avoids mid-item landing on spacers).
  // Wraps scrollToLastRef.current so LogPanel always calls the latest version.
  if (virtualizerScrollToBottomRef) {
    virtualizerScrollToBottomRef.current = () => scrollToLastRef.current();
  }

  const totalSize = virtualizer.getTotalSize();

  // Effect 1 — new logs: scroll to bottom when live logs arrive.
  // Blocked by pause intentionally (frozen view should not move on incoming logs).
  useEffect(() => {
    if (!autoScroll || isPaused || displayedLogs.length === 0) return;
    requestAnimationFrame(() => scrollToLastRef.current());
  }, [displayedLogs, autoScroll, isPaused]);

  // Effect 2 — remeasurement re-anchor: fires when item sizes update after
  // text reflow (resize, theme toggle, font load). Not blocked by pause.
  // • At bottom → scroll to last item (keep tail pinned).
  // • Scrolled up with a captured anchor → restore that item at the top of
  //   the viewport so the same card stays visible after reflow.
  useEffect(() => {
    if (displayedLogs.length === 0) return;
    if (atBottomRef.current) {
      anchorIndexRef.current = null;
      requestAnimationFrame(() => scrollToLastRef.current());
    } else if (anchorIndexRef.current !== null) {
      const idx = anchorIndexRef.current;
      anchorIndexRef.current = null;
      requestAnimationFrame(() => scrollToIndexRef.current(idx));
    }
  }, [totalSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Width change (resize / split-view) causes text reflow — invalidate cache.
  // Debounce measure() so it fires once after resize settles, not on every pixel.
  // Immediately rAF-scroll on each resize frame if at the bottom.
  // For mid-scroll positions, capture the topmost visible item once per resize
  // gesture (anchorCaptured prevents overwriting on subsequent drag events);
  // Effect 2 restores it after totalSize updates from remeasurement.
  // Height shrink (pause banner, mobile menu) is handled by atBottomRef check.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let prevWidth = el.clientWidth;
    let prevHeight = el.clientHeight;
    let measureTimer;
    let anchorCaptured = false;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w !== prevWidth) {
        prevWidth = w;
        if (atBottomRef.current) {
          anchorCaptured = false;
          anchorIndexRef.current = null;
          requestAnimationFrame(() => scrollToLastRef.current());
        } else if (!anchorCaptured) {
          captureAnchorRef.current();
          anchorCaptured = true;
        }
        clearTimeout(measureTimer);
        measureTimer = setTimeout(() => {
          measureRef.current();
          anchorCaptured = false; // reset for next resize gesture
        }, 150);
      }
      if (h < prevHeight && atBottomRef.current) {
        requestAnimationFrame(() => scrollToLastRef.current());
      }
      prevHeight = h;
    });
    ro.observe(el);
    return () => { ro.disconnect(); clearTimeout(measureTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const virtualItems = virtualizer.getVirtualItems();
  // Padding spacers stand in for off-screen items above and below the
  // rendered window. Visible items are in normal document flow so the
  // browser — not JS estimates — controls the gaps between them.
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div className={`flex-1 flex flex-col overflow-hidden rounded-2xl group/logpanel ${theme.card}`}>
      {isPaused && (
        <div className={`animate-paused-banner flex items-center justify-between gap-3 px-4 py-2 text-xs border-b flex-shrink-0 ${
          darkMode ? 'border-[#303134] bg-[#1E1E1E] text-[#80868B]' : 'border-[#E8EAED] bg-white text-[#5F6368]'
        }`}>
          <span className="min-w-0 font-mono">
            Paused — logs continue buffering.
          </span>
          <button
            onClick={onResumeLive}
            className={`rounded-lg border px-3 py-1 text-xs font-medium
    transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]'
      : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124]'
    }`}
          >
            Resume
          </button>
        </div>
      )}
      <div className="flex-1 relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_20px,black_100%)]">
        <div
          className="absolute inset-0 overflow-auto font-mono text-sm"
        ref={scrollRef}
        onWheel={markUserScrollIntent}
        onTouchMove={markUserScrollIntent}
        onPointerDown={markUserScrollIntent}
      >
        <div className="pt-1.5 pb-1.5">
          {displayedLogs.length > 0 ? (
            <div style={{ paddingTop, paddingBottom }}>
              {virtualItems.map((virtualRow) => {
                const log = displayedLogs[virtualRow.index];
                return (
                  <div
                    key={log._id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                  >
                    <LogEntry
                      log={log}
                      darkMode={darkMode}
                      keywords={keywords}
                      timestampGen={timestampGen}
                      density={density}
                      timestampFormat={timestampFormat}
                      messageWrap={messageWrap}
                      logSearchTerm={logSearchTerm}
                    />
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
                    <button
                      onClick={handleClearPath}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ease-in-out active:scale-95 ${
                        darkMode
                          ? 'border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]'
                          : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124]'
                      }`}
                    >
                      Clear path
                    </button>
                  )}
                  {selectedServer && (
                    <button
                      onClick={handleClearServer}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ease-in-out active:scale-95 ${
                        darkMode
                          ? 'border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]'
                          : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124]'
                      }`}
                    >
                      Clear server
                    </button>
                  )}
                </div>
              )}
              {emptyState.showClearFilters && (
                <button
                  onClick={onClearFilters}
                  className={`mt-3 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all duration-150 ease-in-out active:scale-95 ${
                    darkMode
                      ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
                      : 'border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
                  }`}
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
  onOpenSidebar,
  onOpenTopicSidebar,
  splitView,
  onOpenSplit,
  onClosePanel,
  isActivePanel,
  onSetActive,
  sendFilter,
  panelId,
}) => {
  const [initialPrefs] = useState(() => selectLogPrefs(useAppStore.getState()));
  const prefsRef = useRef(initialPrefs);
  const [frozenLogs, setFrozenLogs] = useState(null);
  const [frozenTopic, setFrozenTopic] = useState(null);
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(initialPrefs.autoScroll);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [showMobileServerDropdown, setShowMobileServerDropdown] = useState(false);
  const [showMobilePathDropdown, setShowMobilePathDropdown] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [pathSearchTerm, setPathSearchTerm] = useState("");
  const [pathForTopic, setPathForTopic] = useState({ topic: null, path: null });
  const selectedPathForTopic = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuReady, setMobileMenuReady] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordMode, setKeywordMode] = useState('or');
  const [timeRange, setTimeRange] = useState(initialPrefs.defaultTimeRange);
  const [customRangeMs, setCustomRangeMs] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedKeywordInput, setDebouncedKeywordInput] = useState('');
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const [timestampGen, setTimestampGen] = useState(0);
  const [downloadError, setDownloadError] = useState(null);

  const scrollRef = useRef(null);
  const virtualizerScrollToBottomRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);
  const previousScrollTopRef = useRef(0);
  const userScrollIntentUntilRef = useRef(0);
  const downloadErrorTimerRef = useRef(null);

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

  useEffect(() => () => clearTimeout(downloadErrorTimerRef.current), []);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampGen((g) => g + 1);
      setNowMs(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeRangeChange = useCallback((value, ms = 0) => {
    setTimeRange(value);
    setCustomRangeMs(ms);
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
    const t = setTimeout(() => setDebouncedSearch(logSearchTerm), 300);
    return () => clearTimeout(t);
  }, [logSearchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeywordInput(keywordInput), 300);
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

  const selectedPath = selectedPathForTopic && pathsForSelectedServer.includes(selectedPathForTopic)
    ? selectedPathForTopic
    : null;

  useEffect(() => {
    if (selectedServer && !serversForSelectedTopic.includes(selectedServer)) {
      onServerSelect(null);
    }
  }, [selectedServer, serversForSelectedTopic, onServerSelect]);

  useEffect(() => {
    if (selectedPathForTopic && !pathsForSelectedServer.includes(selectedPathForTopic)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPathForTopic({ topic: selectedTopic, path: null });
    }
  }, [selectedPathForTopic, pathsForSelectedServer, selectedTopic]);

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
      const lower = logSearchTerm.toLowerCase();
      logs = logs.filter((l) =>
        String(l.message ?? '').toLowerCase().includes(lower)
      );
    }

    const pendingKw = debouncedKeywordInput.trim().toLowerCase();
    const allTerms = [
      ...keywords.map((k) => k.text.toLowerCase()),
      ...(pendingKw ? [pendingKw] : []),
    ];
    if (allTerms.length > 0) {
      logs = logs.filter((l) => {
        const haystack = String(l.message ?? '').toLowerCase();
        return keywordMode === 'and'
          ? allTerms.every((t) => haystack.includes(t))
          : allTerms.some((t) => haystack.includes(t));
      });
    }

    if (timeRange !== 'all') {
      const PRESET_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };
      const rangeMs = timeRange === 'custom' ? customRangeMs : (PRESET_MS[timeRange] || 0);
      if (rangeMs > 0) {
        const cutoff = nowMs - rangeMs;
        logs = logs.filter((l) => {
          const ts = new Date(l.timestamp).getTime();
          return Number.isFinite(ts) && ts >= cutoff;
        });
      }
    }

    return [...logs].slice(0, config.ws.maxLogsPerTopic).reverse();
  }, [selectedTopic, topicLogs, selectedServer, selectedPath, logSearchTerm, keywords, debouncedKeywordInput, keywordMode, timeRange, customRangeMs, nowMs]);

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
      setFrozenTopic(selectedTopic);
      setFrozenLogs(filteredLogs);
    } else {
      setFrozenTopic(null);
      setFrozenLogs(null);
    }
    togglePause();
  };


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
    setTimeRange(prefsRef.current.defaultTimeRange);
  };

  const scheduleDownloadErrorClear = useCallback(() => {
    clearTimeout(downloadErrorTimerRef.current);
    downloadErrorTimerRef.current = setTimeout(() => setDownloadError(null), 5000);
  }, []);

  const downloadLogs = async () => {
    const url = `${config.httpBaseUrl}/api/logs/download?topic=${encodeURIComponent(selectedTopic)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text.trim() || `Server returned ${res.status}`;
        setDownloadError(msg);
        scheduleDownloadErrorClear();
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
      setDownloadError('Download failed — server unreachable');
      scheduleDownloadErrorClear();
    }
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
    setAtTop(false);
    setAtBottom(true);
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
        onOpenTopicSidebar={onOpenTopicSidebar}
      />
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col min-w-0 gap-2 ${splitView && !isActivePanel ? 'cursor-pointer opacity-60' : ''}`}
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
          onOpenTopicSidebar={onOpenTopicSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          mobileMenuReady={mobileMenuReady}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          autoScroll={autoScroll}
          onToggleAutoScroll={toggleAutoScroll}
          onDownload={downloadLogs}
          onClearLogs={onClearLogs}
          logSearchTerm={logSearchTerm}
          onSearchChange={setLogSearchTerm}
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
          customRangeMs={customRangeMs}
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
          customRangeMs={customRangeMs}
          onTimeRangeChange={handleTimeRangeChange}
          logSearchTerm={logSearchTerm}
          onSearchChange={setLogSearchTerm}
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
          darkMode={darkMode}
          theme={theme}
          onClearServer={handleClearServer}
          onClearPath={handleClearPath}
          onClearSearch={() => setLogSearchTerm('')}
          onRemoveKeyword={(text) => setKeywords((prev) => prev.filter((k) => k.text !== text))}
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
            <button onClick={() => setDownloadError(null)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity" title="Dismiss download error" aria-label="Dismiss download error">
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
        density={initialPrefs.density}
        timestampFormat={initialPrefs.timestampFormat}
        messageWrap={initialPrefs.messageWrap}
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

