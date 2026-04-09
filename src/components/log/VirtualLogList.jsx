import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import LogEntry from './LogEntry';
import ScrollButtons from './ScrollButtons';

const ESTIMATED_LOG_HEIGHT = 114;

const VirtualLogList = React.memo(({
  displayedLogs, isPaused, autoScroll, theme, darkMode, keywords, timestampGen,
  logSearchTerm,
  selectedServer, selectedPath,
  emptyState, onClearFilters, onResumeLive,
  scrollRef, atTop, atBottom, scrollToTop, scrollToBottom,
  handleClearPath, handleClearServer, markUserScrollIntent,
  virtualizerScrollToBottomRef,
  terminalMode,
}) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is designed this way
  const virtualizer = useVirtualizer({
    count: displayedLogs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => terminalMode ? 20 : ESTIMATED_LOG_HEIGHT,
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
    <div className={`flex-1 flex flex-col overflow-hidden rounded-2xl group/logpanel ${terminalMode ? (darkMode ? 'bg-black' : 'bg-white border border-[#E8EAED]') : theme.card}`}>
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
      <div className={`flex-1 relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_20px,black_100%)] ${terminalMode && !darkMode ? 'bg-white' : theme.logArea}`}>
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
                        logSearchTerm={logSearchTerm}
                        terminalMode={terminalMode}
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

export default VirtualLogList;
