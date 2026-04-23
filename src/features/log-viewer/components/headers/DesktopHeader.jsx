import React from 'react';
import HeartbeatLine from '../../../../ui/HeartbeatLine';

const DesktopHeader = ({
  selectedTopic, displayedLogs, logRate, darkMode, theme, onToggleTheme,
  splitView, isActivePanel, onSetActive, onClosePanel, onOpenSplit,
  isPaused, onTogglePause, btn,
  onDownload,
  autoScroll, onToggleAutoScroll,
  onClearLogs,
}) => {
  const toolbarIconClass = 'w-5 h-5';
  const toolbarStrokeWidth = 2.5;
  const pauseIconClass = 'w-6 h-6';
  const themeToggleBtn = `inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-150 ease-in-out active:scale-95 ${
    darkMode ? 'text-[#E8EAED] hover:bg-[#303134]' : 'text-[#202124] hover:bg-[#F1F3F4]'
  }`;
  const themeIconClass = 'w-6 h-6';

  return (
    <div className="hidden md:block">
      <div className="flex items-center justify-between gap-3 py-0.5">
        <div className="min-w-0 flex flex-1 items-center gap-2.5 overflow-hidden">
          {splitView && (
            <button
              onClick={onSetActive}
              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 transition-colors ${
                isActivePanel
                  ? 'bg-[#1A73E8]'
                  : `${darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]'}`
              }`}
              title={isActivePanel ? 'Active panel' : 'Click to make active'}
            />
          )}
          <h2 className={`truncate text-[17px] font-semibold tracking-tight ${theme.text}`}>
            {selectedTopic}
          </h2>
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-mono tabular-nums font-medium flex-shrink-0 ${
            darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
          }`}>
            {displayedLogs?.length || 0}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-mono tabular-nums flex-shrink-0 ${
            logRate > 0 ? (darkMode ? 'text-emerald-300' : 'text-emerald-600') : theme.textMuted
          }`}>
            <span className={`h-2 w-2 rounded-full ${logRate > 0 ? 'bg-emerald-500' : (darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]')}`} />
            {logRate}/s
          </span>
          {logRate > 0 && (
            <span className="hidden lg:inline-flex items-center flex-shrink-0">
              <HeartbeatLine rate={logRate} darkMode={darkMode} />
            </span>
          )}
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={themeToggleBtn}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {darkMode ? (
                <svg className={themeIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="4.25" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(45 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(90 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(135 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(180 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(225 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(270 12 12)" />
                  <rect x="11" y="1.6" width="2" height="4.1" rx="1" transform="rotate(315 12 12)" />
                </svg>
              ) : (
                <svg className={themeIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21 12a9 9 0 1 0 -18 0a9 9 0 1 0 18 0Z M26 11a10 10 0 1 0 -20 0a10 10 0 1 0 20 0Z"
                  />
                </svg>
              )}
            </button>
          )}

          <button onClick={onTogglePause} className={isPaused ? btn.paused : btn.pause} title={isPaused ? "Resume" : "Pause"}>
            {isPaused ? (
              <svg className={pauseIconClass} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className={pauseIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M10 9v6m4-6v6" /></svg>
            )}
          </button>

          <button onClick={onToggleAutoScroll} className={autoScroll ? btn.scrollOn : btn.scroll} title="Auto-scroll">
            <svg className={toolbarIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </button>

          <button onClick={onDownload} className={btn.export} title="Download log file">
            <svg className={toolbarIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>

          {!onClosePanel && (
            <button onClick={onOpenSplit} className={`hidden md:flex ${splitView ? btn.splitOn : btn.split}`} title="Split view">
              <svg className={toolbarIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
            </button>
          )}
          {onClosePanel && (
            <button onClick={onClosePanel} className={`hidden md:flex ${btn.close}`} title="Close panel">
              <svg className={pauseIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}

          <button onClick={() => onClearLogs(selectedTopic)} className={btn.clear} title="Clear logs">
            <svg className={toolbarIconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toolbarStrokeWidth} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
