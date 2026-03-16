import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from '../common/ThemeToggle';
import HeartbeatLine from '../common/HeartbeatLine';
import { ServerDropdown, PathDropdown, TimeRangeSelector } from '../filters';
import { getShortPath } from './constants';

const MobileHeader = ({
  selectedTopic, displayedLogs, logRate, darkMode, theme,
  onOpenSidebar, onThemeToggle,
  isMobileMenuOpen, onToggleMobileMenu, mobileMenuReady,
  isPaused, onTogglePause,
  autoScroll, onToggleAutoScroll,
  onExport, onClearLogs,
  logSearchTerm, onSearchChange,
  showMobileServerDropdown, onToggleMobileServerDropdown,
  showMobilePathDropdown, onToggleMobilePathDropdown,
  filteredServers, selectedServer, onServerSelect, onClearServer,
  serverSearchTerm, onServerSearchChange,
  filteredPaths, selectedPath, onPathSelect, onClearPath,
  pathSearchTerm, onPathSearchChange,
  timeRange, customRangeMs, onTimeRangeChange,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [showExportMenu]);

  const btnIdle = darkMode
    ? 'rounded-xl border border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
    : 'rounded-xl border border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]';
  const btnActive = darkMode
    ? 'rounded-xl border border-[#A8C7FA]/40 bg-[#0842A0]/30 text-[#A8C7FA] hover:bg-[#0842A0]/45 hover:border-[#A8C7FA]/55'
    : 'rounded-xl border border-[#A8C7FA] bg-[#D3E3FD] text-[#0B57D0] hover:bg-[#BDD7FB] hover:border-[#7BAEF8]';
  const btnDanger = darkMode
    ? 'rounded-xl border border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#4A2A2A] hover:text-[#F28B82] hover:border-[#8B3C36]'
    : 'rounded-xl border border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#FCE8E6] hover:text-[#C5221F] hover:border-[#F5C6C2]';
  const btnBase = 'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95';
  const btnGhost = darkMode
    ? 'text-[#CAC4BC] hover:text-[#E8E2DC] hover:bg-[#2E2B28]'
    : 'text-[#4A4540] hover:text-[#1C1B1A] hover:bg-[#EEE8E2]';

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-1 items-center gap-1.5">
            <button onClick={onOpenSidebar} className={`${btnBase} ${btnGhost}`} aria-label="Open sidebar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="min-w-0 truncate text-sm font-semibold">
              {selectedTopic}
            </h2>
            <span className={`text-[11px] font-mono tabular-nums ${theme.textMuted}`}>
              {displayedLogs?.length || 0}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums ${
              logRate > 0 ? (darkMode ? 'text-emerald-300' : 'text-emerald-600') : theme.textMuted
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${logRate > 0 ? 'bg-emerald-500' : (darkMode ? 'bg-[#49443E]' : 'bg-[#C5BEB7]')}`} />
              {logRate}/s
            </span>
            {logRate > 0 && <HeartbeatLine rate={logRate} darkMode={darkMode} />}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
            <button onClick={onToggleMobileMenu} className={`${btnBase} ${isMobileMenuOpen ? btnActive : btnGhost}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className={`mt-2 space-y-2 rounded-xl border p-2.5 ${
              darkMode ? 'border-[#3A3530] bg-[#1E1C1A]' : 'border-[#E4DDD6] bg-[#F7F4F1]'
            } ${mobileMenuReady ? '' : 'pointer-events-none'}`}
          >
            {/* Server / Path dropdowns */}
            <div className="relative w-full">
              <button
                onClick={() => onToggleMobileServerDropdown()}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95 ${
                  darkMode
                    ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
                    : 'border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
                }`}
                type="button"
              >
                <span className="truncate">{selectedServer || "All Servers"}</span>
                <svg className={`w-3 h-3 transition-transform ${showMobileServerDropdown ? "rotate-180" : ""}`}
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ServerDropdown
                isOpen={showMobileServerDropdown} onClose={() => onToggleMobileServerDropdown(false)}
                servers={filteredServers} selectedServer={selectedServer}
                onServerSelect={onServerSelect} onClearServer={onClearServer}
                searchTerm={serverSearchTerm} onSearchChange={onServerSearchChange}
                theme={theme} darkMode={darkMode}
              />
            </div>

            <div className="relative w-full">
              <button
                onClick={() => selectedServer && onToggleMobilePathDropdown()}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95
                          ${!selectedServer ? "opacity-40 cursor-not-allowed" : ""} ${
                  darkMode
                    ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
                    : 'border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
                }`}
                type="button" disabled={!selectedServer}
              >
                <span className="truncate">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
                <svg className={`w-3 h-3 transition-transform ${showMobilePathDropdown ? "rotate-180" : ""}`}
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {selectedServer && (
                <PathDropdown
                  isOpen={showMobilePathDropdown} onClose={() => onToggleMobilePathDropdown(false)}
                  paths={filteredPaths} selectedPath={selectedPath}
                  onPathSelect={onPathSelect} onClearPath={onClearPath}
                  searchTerm={pathSearchTerm} onSearchChange={onPathSearchChange}
                  theme={theme} darkMode={darkMode}
                />
              )}
            </div>

            {/* Time range */}
            <TimeRangeSelector timeRange={timeRange} customRangeMs={customRangeMs} onTimeRangeChange={onTimeRangeChange} darkMode={darkMode} />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onTogglePause}
                className={`py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${isPaused ? btnActive : btnIdle}`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onToggleAutoScroll}
                className={`py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${autoScroll ? btnActive : btnIdle}`}
              >
                Auto-scroll
              </button>

              {/* Export — single button with dropdown */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setShowExportMenu((v) => !v)}
                  className={`w-full py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${showExportMenu ? btnActive : btnIdle}`}
                >
                  Export
                </button>
                {showExportMenu && (
                  <div className={`absolute left-0 bottom-12 z-50 w-36 rounded-xl shadow-xl border overflow-hidden ${
                    darkMode ? 'border-[#3F3A34] bg-[#252320]' : 'border-[#E4DDD6] bg-[#FFFDF9]'
                  }`}>
                    <button
                      onClick={() => { onExport('json'); setShowExportMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-all duration-150 ease-in-out ${
                        darkMode ? 'text-[#D0CAC3] hover:bg-[#2E2B28] hover:text-[#ECE6DF]' : 'text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A]'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-all duration-150 ease-in-out ${
                        darkMode ? 'text-[#D0CAC3] hover:bg-[#2E2B28] hover:text-[#ECE6DF]' : 'text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A]'
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => onClearLogs(selectedTopic)}
                className={`py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${btnDanger}`}
              >
                Clear logs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile search */}
      <div className="mt-2 md:hidden">
        <div className="relative">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search logs"
            className={`w-full rounded-full border pl-9 pr-3 py-1.5 text-[13px] focus:outline-none
                     focus:ring-2 transition-all duration-150 ease-in-out
                     ${darkMode
                       ? 'bg-[#252219] border-[#4A4540] text-[#ECE6DF] placeholder:text-[#8E8882] focus:ring-[#A8C7FA]/20 focus:border-[#A8C7FA]'
                       : 'bg-white border-[#C5BEB7] text-[#1C1B1A] placeholder:text-[#79736D] focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]'
                     }`}
            value={logSearchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
