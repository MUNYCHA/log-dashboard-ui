import React from 'react';
import HeartbeatLine from '../common/HeartbeatLine';
import ThemeToggle from '../common/ThemeToggle';

const DesktopHeader = ({
  selectedTopic, displayedLogs, logRate, darkMode, theme,
  splitView, isActivePanel, onSetActive, onClosePanel, onOpenSplit,
  isPaused, onTogglePause, btn,
  showExportMenu, onToggleExportMenu, exportMenuRef, onExport,
  onThemeToggle,
  autoScroll, onToggleAutoScroll,
  onClearLogs,
  logSearchTerm, onSearchChange, isRegex, onToggleRegex, regexError,
}) => (
  <div className="hidden md:block">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex flex-1 items-center gap-2">
        {splitView && (
          <button
            onClick={onSetActive}
            className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${
              isActivePanel
                ? 'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                : `${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`
            }`}
            title={isActivePanel ? 'Active panel' : 'Click to make active'}
          />
        )}
        <div className="min-w-0 flex flex-1 items-center gap-1.5 overflow-hidden">
          <h2 className="truncate text-base font-semibold tracking-[0.01em]">
            {selectedTopic}
          </h2>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-mono tabular-nums ${
            darkMode ? 'border-gray-800 bg-black/20 text-gray-300' : 'border-gray-200 bg-white text-gray-600'
          }`}>
            {displayedLogs?.length || 0} logs
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono tabular-nums ${
            logRate > 0
              ? (darkMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
              : (darkMode ? 'border-gray-800 bg-black/20 text-gray-500' : 'border-gray-200 bg-white text-gray-400')
          }`}>
            <span className={`h-2 w-2 rounded-full ${logRate > 0 ? 'bg-current animate-pulse' : 'bg-current/70'}`} />
            {logRate}/s
          </span>
          {logRate > 0 && (
            <span className="hidden lg:inline-flex items-center flex-shrink-0">
              <HeartbeatLine rate={logRate} darkMode={darkMode} />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onTogglePause}
          className={isPaused ? btn.paused : btn.pause}
          title={isPaused ? "Resume stream" : "Pause stream"}
        >
          {isPaused ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          )}
        </button>

        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={onToggleExportMenu}
            className={btn.export}
            title="Export logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          {showExportMenu && (
            <div className={`absolute right-0 top-9 z-50 w-32 rounded-md shadow-lg border ${theme.popupBorder} ${theme.card} overflow-hidden`}>
              <button onClick={() => onExport('json')} className={`w-full text-left px-3 py-2 text-sm ${theme.hover} ${theme.textSecondary}`}>
                JSON
              </button>
              <button onClick={() => onExport('csv')} className={`w-full text-left px-3 py-2 text-sm ${theme.hover} ${theme.textSecondary}`}>
                CSV
              </button>
            </div>
          )}
        </div>

        <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />

        <button
          onClick={onToggleAutoScroll}
          className={autoScroll ? btn.scrollOn : btn.scroll}
          title="Auto-scroll"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {!onClosePanel && (
          <button
            onClick={onOpenSplit}
            className={`hidden md:flex ${splitView ? btn.splitOn : btn.split}`}
            title="Open split view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </button>
        )}
        {onClosePanel && (
          <button
            onClick={onClosePanel}
            className={`hidden md:flex ${btn.close}`}
            title="Close this panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          onClick={() => onClearLogs(selectedTopic)}
          className={btn.clear}
          title="Clear logs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div className="mt-3">
      <div className="relative min-w-0">
        <input
          type="text"
          placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
          className={`w-full ${theme.input} rounded-xl px-3 py-2 pr-16 text-sm focus:outline-none
                   focus:ring-1 ${regexError ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'} transition-colors`}
          value={logSearchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {regexError && <span className="text-red-400 text-xs font-semibold">!</span>}
          <button
            onClick={onToggleRegex}
            className={`rounded-full border px-2 py-0.5 text-[11px] font-mono transition-colors ${
              isRegex
                ? darkMode ? 'border-blue-500/20 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'
                : darkMode ? 'border-gray-800 bg-black/20 text-gray-500 hover:text-gray-300' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
            }`}
            title="Toggle regex search"
          >.*</button>
          <svg className={`w-3.5 h-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

export default DesktopHeader;
