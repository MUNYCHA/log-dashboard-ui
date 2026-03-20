import React from 'react';
import { useServerStorage } from '../../hooks/useServerStorage';

const formatBytes = (bytes) => {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9)  return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6)  return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${bytes} B`;
};

const getUsageColors = (pct) => {
  if (pct >= 90) return { bar: 'bg-red-500',     text: 'text-red-500',     badge: 'bg-red-900/20 text-red-400 border-red-800/40',   badgeLight: 'bg-red-50 text-red-600 border-red-200' };
  if (pct >= 70) return { bar: 'bg-amber-500',   text: 'text-amber-500',   badge: 'bg-amber-900/20 text-amber-400 border-amber-700/40', badgeLight: 'bg-amber-50 text-amber-700 border-amber-200' };
  return          { bar: 'bg-emerald-500', text: 'text-emerald-500', badge: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/40', badgeLight: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
};

const MountPathRow = ({ mount, darkMode }) => {
  const pct = mount.usedPercent ?? 0;
  const colors = getUsageColors(pct);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[12px] font-mono truncate ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>
          {mount.path}
        </span>
        <span className={`text-[11.5px] font-mono tabular-nums font-semibold flex-shrink-0 ${colors.text}`}>
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Bar */}
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Byte counts */}
      <div className={`flex items-center justify-between text-[11px] font-mono tabular-nums ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
        <span>{formatBytes(mount.usedBytes)} used</span>
        <span>{formatBytes(mount.totalBytes)} total</span>
      </div>
    </div>
  );
};

const ServerCard = ({ server, darkMode }) => {
  const mounts = server.mountPathStorageUsages ?? [];
  const worstPct = mounts.length > 0 ? Math.max(...mounts.map((m) => m.usedPercent ?? 0)) : 0;
  const worstColors = getUsageColors(worstPct);
  const collectedAt = (() => {
    try { return new Date(server.collectedAt).toLocaleString(); } catch { return server.collectedAt; }
  })();

  const borderAccent = worstPct >= 90
    ? 'border-red-500/40'
    : worstPct >= 70
      ? 'border-amber-500/30'
      : darkMode ? 'border-[#303134]' : 'border-[#E8EAED]';

  return (
    <div className={`rounded-2xl border flex flex-col gap-4 overflow-hidden ${borderAccent} ${
      darkMode
        ? 'bg-[#1E1E1E] shadow-[0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'bg-white shadow-sm hover:shadow-md'
    } transition-shadow duration-150`}>

      {/* Card header */}
      <div className={`px-4 pt-4 pb-3 flex items-start justify-between gap-2 border-b ${darkMode ? 'border-[#303134]' : 'border-[#E8EAED]'}`}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-[14px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
            {server.serverName}
          </span>
          <span className={`text-[11.5px] font-mono truncate ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
            {server.systemId}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Worst usage badge */}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold border ${
            darkMode ? worstColors.badge : worstColors.badgeLight
          }`}>
            {worstPct.toFixed(0)}%
          </span>
          {/* IP badge */}
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono ${
            darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
          }`}>
            {server.serverIp}
          </span>
        </div>
      </div>

      {/* Mount paths */}
      <div className="px-4 flex flex-col gap-4">
        {mounts.map((mount) => (
          <MountPathRow key={mount.path} mount={mount} darkMode={darkMode} />
        ))}
        {mounts.length === 0 && (
          <span className={`text-[12px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>No mount paths reported</span>
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 pb-3 text-[11px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
        Collected {collectedAt}
      </div>
    </div>
  );
};

const StorageDashboard = ({ darkMode, theme }) => {
  const { data, loading, error, lastUpdated, refresh } = useServerStorage();

  const ghostBtn = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]';

  return (
    <div className={`flex flex-col flex-1 min-w-0 min-h-0 rounded-2xl overflow-hidden ${
      darkMode
        ? 'bg-[#1E1E1E] shadow-[0_1px_3px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)]'
        : 'bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08),0_2px_6px_rgba(60,64,67,0.06)]'
    }`}>

      {/* Header */}
      <div className={`px-5 py-3.5 flex items-center justify-between gap-3 flex-shrink-0 border-b ${darkMode ? 'border-[#303134]' : 'border-[#E8EAED]'}`}>
        <div className="flex items-center gap-2.5">
          <svg className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <span className={`text-[14px] font-semibold ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
            Server Storage
          </span>
          {data.length > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
              darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {data.length} server{data.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className={`hidden sm:block text-[11.5px] font-mono tabular-nums ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            title="Refresh now"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-4 ${theme.scrollbar}`}>

        {loading && (
          <div className={`flex items-center justify-center h-48 gap-2 ${darkMode ? 'text-[#80868B]' : 'text-[#5F6368]'}`}>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[13px]">Loading storage data…</span>
          </div>
        )}

        {error && !loading && (
          <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] border ${
            darkMode
              ? 'bg-red-900/20 text-red-400 border-red-800/40'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Failed to fetch: {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className={`flex items-center justify-center h-48 text-[13px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
            No storage data available
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.map((server) => (
              <ServerCard
                key={`${server.serverIp}-${server.systemId}`}
                server={server}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageDashboard;
