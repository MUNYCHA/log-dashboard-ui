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
    {/* Row 1: topic + right controls */}
    <div className="flex items-center gap-2">

      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        {splitView && (
          <button
            onClick={onSetActive}
            className={`w-3 h-3 rounded-full flex-shrink-0 border-2 transition-colors ${
              isActivePanel
                ? 'border-blue-500 bg-blue-500'
                : `border-gray-500 bg-transparent`
            }`}
            title={isActivePanel ? 'Active panel' : 'Click to make active'}
          />
        )}
        <h2 className="text-sm font-semibold truncate max-w-[100px] lg:max-w-[200px]">
          {selectedTopic}
        </h2>
        <span className={`text-xs font-mono tabular-nums ${theme.textMuted}`}>
          {displayedLogs?.length || 0}
        </span>
        {logRate > 0 && (
          <span className="hidden md:inline-flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs font-mono tabular-nums ${theme.textMuted}`}>
              {logRate}/s
            </span>
            <HeartbeatLine rate={logRate} darkMode={darkMode} />
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
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

        <div className={`w-px h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

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

    {/* Row 2: search */}
    <div className="flex mt-2">
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
          className={`w-full ${theme.input} rounded-md px-3 py-1.5 pr-14 text-sm focus:outline-none
                   focus:ring-1 ${regexError ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'} transition-colors`}
          value={logSearchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {regexError && <span className="text-red-400 text-xs">!</span>}
          <button
            onClick={onToggleRegex}
            className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
              isRegex
                ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                : `${theme.textMuted} hover:${theme.textSecondary}`
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
