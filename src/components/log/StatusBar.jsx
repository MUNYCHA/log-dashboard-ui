import React from 'react';
import { getShortPath } from './constants';

const StatusBar = ({
  isConnected, isReconnecting,
  selectedServer, selectedPath,
  logRate, darkMode, theme,
  streamMode, visibleCount, bufferedCount, hasActiveFilters,
  onClearServer, onClearPath,
}) => {
  const dotColor = isConnected
    ? 'bg-emerald-500'
    : isReconnecting
      ? 'bg-amber-500 animate-pulse'
      : 'bg-rose-500';

  const connectionLabel = isConnected ? 'Connected' : isReconnecting ? 'Reconnecting…' : 'Disconnected';

  const dot = <span className={`w-px h-3.5 ${darkMode ? 'bg-[#3F3A34]' : 'bg-[#DDD7D0]'}`} />;

  return (
    <div className={`px-4 sm:px-5 py-2 ${theme.statusBar} text-[12px] font-mono flex items-center gap-2.5 flex-shrink-0 overflow-x-auto`}>

      {/* Connection */}
      <span className="inline-flex items-center gap-1.5 flex-shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className={theme.textMuted}>{connectionLabel}</span>
      </span>

      {dot}

      {/* Rate */}
      <span className={`tabular-nums flex-shrink-0 ${theme.textMuted}`}>{logRate}/s</span>

      {dot}

      {/* Stream mode */}
      <span className={`flex-shrink-0 font-medium ${
        streamMode === 'Live tail'
          ? (darkMode ? 'text-[#A8C7FA]' : 'text-[#0B57D0]')
          : streamMode === 'Paused'
            ? (darkMode ? 'text-amber-300' : 'text-amber-700')
            : theme.textMuted
      }`}>
        {streamMode}
      </span>

      {dot}

      {/* Counts */}
      <span className={`tabular-nums flex-shrink-0 ${theme.textMuted}`}>
        {visibleCount} <span className="opacity-50">/</span> {bufferedCount}
      </span>

      {hasActiveFilters && (
        <>
          {dot}
          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            darkMode ? 'bg-[#0842A0]/30 text-[#A8C7FA]' : 'bg-[#D3E3FD] text-[#0B57D0]'
          }`}>Filtered</span>
        </>
      )}

      {selectedServer && (
        <>
          {dot}
          <button
            onClick={onClearServer}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium max-w-[140px] transition-colors flex-shrink-0 ${
              darkMode ? 'bg-[#252320] text-[#A8C7FA] hover:bg-[#2E2B28]' : 'bg-[#EEE8E2] text-[#0B57D0] hover:bg-[#DDD7D0]'
            }`}
          >
            <span className="truncate">{selectedServer}</span>
            <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}

      {selectedPath && (
        <>
          {dot}
          <button
            onClick={onClearPath}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium max-w-[140px] transition-colors flex-shrink-0 ${
              darkMode ? 'bg-[#252320] text-[#A8C7FA] hover:bg-[#2E2B28]' : 'bg-[#EEE8E2] text-[#0B57D0] hover:bg-[#DDD7D0]'
            }`}
          >
            <span className="truncate">{getShortPath(selectedPath)}</span>
            <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default StatusBar;
