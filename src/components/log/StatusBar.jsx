import React from 'react';

const StatusBar = ({
  isConnected, isReconnecting,
  logRate, darkMode, theme,
  streamMode, visibleCount, bufferedCount, hasActiveFilters,
}) => {
  const dotColor = isConnected
    ? 'bg-emerald-500'
    : isReconnecting
      ? 'bg-amber-500 animate-pulse'
      : 'bg-rose-500';

  const connectionLabel = isConnected ? 'Connected' : isReconnecting ? 'Reconnecting…' : 'Disconnected';

  const dot = <span className={`w-px h-3.5 ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`} />;

  return (
    <div className={`px-4 sm:px-5 py-2 ${theme.statusBar} rounded-2xl text-[12px] font-mono flex items-center gap-2.5 flex-shrink-0 overflow-x-auto`}>

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
          ? (darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]')
          : streamMode === 'Paused'
            ? (darkMode ? 'text-amber-300' : 'text-amber-700')
            : theme.textMuted
      }`}>
        {streamMode}
      </span>

      {dot}

      {/* Counts */}
      <span className={`tabular-nums flex-shrink-0 ${theme.textMuted}`}>
        {visibleCount} shown
        {bufferedCount > visibleCount && (
          <span className="opacity-60"> · {bufferedCount} buffered</span>
        )}
      </span>

      {hasActiveFilters && (
        <>
          {dot}
          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
          }`}>Filtered</span>
        </>
      )}

    </div>
  );
};

export default StatusBar;
