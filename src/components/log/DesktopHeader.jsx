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
}) => {
  const sep = darkMode ? 'bg-[#222]' : 'bg-gray-200';

  return (
    <div className="hidden md:block">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex flex-1 items-center gap-2">
          {splitView && (
            <button
              onClick={onSetActive}
              className={`h-2 w-2 rounded-full flex-shrink-0 transition-colors ${
                isActivePanel
                  ? 'bg-blue-500'
                  : `${darkMode ? 'bg-[#333]' : 'bg-gray-300'}`
              }`}
              title={isActivePanel ? 'Active panel' : 'Click to make active'}
            />
          )}
          <div className="min-w-0 flex flex-1 items-center gap-2.5 overflow-hidden">
            <h2 className="truncate text-sm font-semibold">
              {selectedTopic}
            </h2>
            <span className={`text-[11px] font-mono tabular-nums ${theme.textMuted}`}>
              {displayedLogs?.length || 0}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono tabular-nums ${
              logRate > 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : theme.textMuted
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${logRate > 0 ? 'bg-green-500' : (darkMode ? 'bg-[#333]' : 'bg-gray-300')}`} />
              {logRate}/s
            </span>
            {logRate > 0 && (
              <span className="hidden lg:inline-flex items-center flex-shrink-0">
                <HeartbeatLine rate={logRate} darkMode={darkMode} />
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — uniform h-7 w-7 rounded-md */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={onTogglePause} className={isPaused ? btn.paused : btn.pause} title={isPaused ? "Resume" : "Pause"}>
            {isPaused ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
            )}
          </button>

          <button onClick={onToggleAutoScroll} className={autoScroll ? btn.scrollOn : btn.scroll} title="Auto-scroll">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </button>

          <div className={`w-px h-4 mx-0.5 ${sep}`} />

          <div className="relative" ref={exportMenuRef}>
            <button onClick={onToggleExportMenu} className={btn.export} title="Export">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            {showExportMenu && (
              <div className={`absolute right-0 top-8 z-50 w-24 rounded-md shadow-lg border overflow-hidden ${
                darkMode ? 'border-[#282828] bg-[#141414]' : 'border-gray-200 bg-white'
              }`}>
                <button onClick={() => onExport('json')} className={`w-full text-left px-3 py-1.5 text-[11px] ${theme.hover} ${theme.textSecondary}`}>JSON</button>
                <button onClick={() => onExport('csv')} className={`w-full text-left px-3 py-1.5 text-[11px] ${theme.hover} ${theme.textSecondary}`}>CSV</button>
              </div>
            )}
          </div>

          <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />

          {!onClosePanel && (
            <button onClick={onOpenSplit} className={`hidden md:flex ${splitView ? btn.splitOn : btn.split}`} title="Split view">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
            </button>
          )}
          {onClosePanel && (
            <button onClick={onClosePanel} className={`hidden md:flex ${btn.close}`} title="Close panel">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}

          <div className={`w-px h-4 mx-0.5 ${sep}`} />

          <button onClick={() => onClearLogs(selectedTopic)} className={btn.clear} title="Clear logs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-2.5">
        <div className="relative min-w-0">
          <input
            type="text"
            placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
            className={`w-full rounded-md border px-3 py-1.5 pr-16 text-xs font-mono focus:outline-none
                     focus:ring-1 ${regexError ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'} transition-colors ${
              darkMode
                ? 'border-[#282828] bg-[#1a1a1a] text-gray-200 placeholder:text-gray-600'
                : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
            }`}
            value={logSearchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {regexError && <span className="text-red-400 text-xs font-semibold">!</span>}
            <button
              onClick={onToggleRegex}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                isRegex
                  ? darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-900'
                  : darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
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
};

export default DesktopHeader;
