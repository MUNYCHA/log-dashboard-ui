import React from 'react';
import { ServerDropdown, PathDropdown, TimeRangeSelector } from '../filters';
import { getShortPath } from './constants';

const chip = (active, darkMode) =>
  `h-8 inline-flex items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium
  transition-all duration-150 ease-in-out active:scale-95 cursor-pointer select-none
  ${active
    ? darkMode
      ? 'border-[#8AB4F8]/60 bg-[#1A3A6B]/50 text-[#8AB4F8]'
      : 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]'
    : darkMode
      ? 'border-[#5F6368] bg-transparent text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED]'
      : 'border-[#DADCE0] bg-transparent text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124]'
  }`;

const FilterBar = ({
  theme, darkMode,
  serverButtonRef, pathButtonRef,
  showServerDropdown, onToggleServerDropdown,
  showPathDropdown, onTogglePathDropdown,
  filteredServers, selectedServer, onServerSelect, onClearServer,
  serverSearchTerm, onServerSearchChange,
  filteredPaths, selectedPath, onPathSelect, onClearPath,
  pathSearchTerm, onPathSearchChange,
  timeRange, customRangeMs, onTimeRangeChange,
  logSearchTerm, onSearchChange,
}) => (
  <div className="hidden md:flex items-center gap-2 mt-3 flex-wrap">

    {/* Filter chips: Server + Path */}
    <div className="relative">
      <button
        ref={serverButtonRef}
        onClick={onToggleServerDropdown}
        className={chip(!!selectedServer, darkMode)}
        type="button"
      >
        {selectedServer ? (
          <>
            <span className="truncate max-w-[100px]">{selectedServer}</span>
            <span
              className="ml-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onClearServer(); }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span>All servers</span>
            <svg className={`w-3.5 h-3.5 opacity-50 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
      <ServerDropdown
        isOpen={showServerDropdown} onClose={() => onToggleServerDropdown(false)}
        servers={filteredServers} selectedServer={selectedServer}
        onServerSelect={onServerSelect} onClearServer={onClearServer}
        searchTerm={serverSearchTerm} onSearchChange={onServerSearchChange}
        theme={theme} darkMode={darkMode}
      />
    </div>

    <div className="relative">
      <button
        ref={pathButtonRef}
        onClick={() => selectedServer && onTogglePathDropdown()}
        className={`${chip(!!selectedPath, darkMode)} ${!selectedServer ? 'opacity-35 cursor-not-allowed' : ''}`}
        type="button"
        disabled={!selectedServer}
        title={!selectedServer ? "Select a server first" : undefined}
      >
        {selectedPath ? (
          <>
            <span className="truncate max-w-[100px]">{getShortPath(selectedPath)}</span>
            <span
              className="ml-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onClearPath(); }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span>All paths</span>
            <svg className={`w-3.5 h-3.5 opacity-50 transition-transform ${showPathDropdown ? 'rotate-180' : ''}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
      {selectedServer && (
        <PathDropdown
          isOpen={showPathDropdown} onClose={() => onTogglePathDropdown(false)}
          paths={filteredPaths} selectedPath={selectedPath}
          onPathSelect={onPathSelect} onClearPath={onClearPath}
          searchTerm={pathSearchTerm} onSearchChange={onPathSearchChange}
          theme={theme} darkMode={darkMode}
        />
      )}
    </div>

    {/* Thin divider */}
    <div className={`w-px h-5 ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`} />

    {/* Time range */}
    <TimeRangeSelector timeRange={timeRange} customRangeMs={customRangeMs} onTimeRangeChange={onTimeRangeChange} darkMode={darkMode} />

    {/* Thin divider */}
    <div className={`w-px h-5 ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`} />

    {/* Search */}
    <div className="relative min-w-[240px] flex-1">
      <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`}
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search logs"
        className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none
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
);

export default FilterBar;
