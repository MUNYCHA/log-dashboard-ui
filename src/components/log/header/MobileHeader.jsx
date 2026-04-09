import React from 'react';
import HeartbeatLine from '../../common/HeartbeatLine';
import { ServerDropdown, PathDropdown, TimeRangeSelector } from '../../filters';
import { getShortPath } from '../constants';

const MobileHeader = ({
  selectedTopic, displayedLogs, logRate, darkMode, theme,
  onOpenSidebar, isSidebarOpen,
  isMobileMenuOpen, onToggleMobileMenu, mobileMenuReady,
  isPaused, onTogglePause,
  autoScroll, onToggleAutoScroll,
  onDownload, onClearLogs,
  logSearchTerm, onSearchChange,
  showMobileServerDropdown, onToggleMobileServerDropdown,
  showMobilePathDropdown, onToggleMobilePathDropdown,
  filteredServers, renderServerItem, selectedServer, onServerSelect, onClearServer,
  serverSearchTerm, onServerSearchChange,
  filteredPaths, selectedPath, onPathSelect, onClearPath,
  pathSearchTerm, onPathSearchChange,
  timeRange, customRangeMs, onTimeRangeChange,
}) => {
  const btnIdle = darkMode
    ? 'rounded-xl border border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED] hover:border-[#80868B]'
    : 'rounded-xl border border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]';
  const btnActive = darkMode
    ? 'rounded-xl border border-[#8AB4F8]/40 bg-[#1A3A6B]/50 text-[#8AB4F8] hover:bg-[#1A3A6B]/65 hover:border-[#8AB4F8]/55'
    : 'rounded-xl border border-[#D2E3FC] bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC] hover:border-[#A8C7FA]';
  const btnDanger = darkMode
    ? 'rounded-xl border border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C1F1F] hover:text-[#F28B82] hover:border-[#8B3C36]'
    : 'rounded-xl border border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#FCE8E6] hover:text-[#C5221F] hover:border-[#F5C6C2]';
  const btnBase = 'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95';
  const btnGhost = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#3C4043] hover:text-[#202124] hover:bg-[#F1F3F4]';

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-1 items-center gap-1.5">
            <button onClick={onOpenSidebar} className={`${btnBase} ${isSidebarOpen ? btnActive : btnGhost}`} aria-label="Open sidebar">
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
              <span className={`h-1.5 w-1.5 rounded-full ${logRate > 0 ? 'bg-emerald-500' : (darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]')}`} />
              {logRate}/s
            </span>
            {logRate > 0 && <HeartbeatLine rate={logRate} darkMode={darkMode} />}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
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
              darkMode ? 'border-[#303134] bg-[#1E1E1E]' : 'border-[#E8EAED] bg-[#F1F3F4]'
            } ${mobileMenuReady ? '' : 'pointer-events-none'}`}
          >
            {/* Server / Path dropdowns */}
            <div className="relative w-full">
              <button
                onClick={() => onToggleMobileServerDropdown()}
                className={`w-full px-3 py-1.5 rounded-full border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95 ${
                  selectedServer
                    ? darkMode
                      ? 'border-[#8AB4F8]/60 bg-[#1A3A6B]/50 text-[#8AB4F8]'
                      : 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]'
                    : darkMode
                      ? 'border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED] hover:border-[#80868B]'
                      : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]'
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
                servers={filteredServers} renderServerItem={renderServerItem}
                selectedServer={selectedServer}
                onServerSelect={onServerSelect} onClearServer={onClearServer}
                searchTerm={serverSearchTerm} onSearchChange={onServerSearchChange}
                theme={theme} darkMode={darkMode}
              />
            </div>

            <div className="relative w-full">
              <button
                onClick={() => selectedServer && onToggleMobilePathDropdown()}
                className={`w-full px-3 py-1.5 rounded-full border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95
                          ${!selectedServer ? "opacity-40 cursor-not-allowed" : ""} ${
                  selectedPath
                    ? darkMode
                      ? 'border-[#8AB4F8]/60 bg-[#1A3A6B]/50 text-[#8AB4F8]'
                      : 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]'
                    : darkMode
                      ? 'border-[#5F6368] bg-[#303134] text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED] hover:border-[#80868B]'
                      : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]'
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

              <button
                onClick={onDownload}
                className={`py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${btnIdle}`}
              >
                Download
              </button>

              <button
                onClick={() => onClearLogs(selectedTopic)}
                className={`col-span-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${btnDanger}`}
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
                       ? 'bg-[#303134] border-[#5F6368] text-[#E8EAED] placeholder:text-[#80868B] focus:ring-[#8AB4F8]/20 focus:border-[#8AB4F8]'
                       : 'bg-[#F1F3F4] border-[#DADCE0] text-[#202124] placeholder:text-[#5F6368] focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]'
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
