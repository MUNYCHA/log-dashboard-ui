import React from 'react';
import { formatBytes } from '../../utils/storageUtils';

const getUsageColors = (pct) => {
  if (pct >= 90) return {
    bar: 'bg-red-500', text: 'text-red-500',
    badge: 'bg-red-900/20 text-red-400 border border-red-800/40',
    badgeLight: 'bg-red-50 text-red-600 border border-red-200',
    rowHover: 'hover:bg-red-500/5',
  };
  if (pct >= 70) return {
    bar: 'bg-amber-500', text: 'text-amber-500',
    badge: 'bg-amber-900/20 text-amber-400 border border-amber-700/40',
    badgeLight: 'bg-amber-50 text-amber-700 border border-amber-200',
    rowHover: 'hover:bg-amber-500/5',
  };
  return {
    bar: 'bg-emerald-500', text: 'text-emerald-500',
    badge: 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/40',
    badgeLight: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rowHover: 'hover:bg-emerald-500/5',
  };
};

const ServerCard = ({ server, darkMode }) => {
  const mounts = server.mountPathStorageUsages ?? [];
  const worstPct = mounts.length > 0 ? Math.max(...mounts.map((m) => m.usedPercent ?? 0)) : 0;
  const worstColors = getUsageColors(worstPct);
  const collectedAt = (() => { try { return new Date(server.collectedAt).toLocaleString(); } catch { return server.collectedAt; } })();
  const divider = darkMode ? 'border-[#3C4043]' : 'border-[#E8EAED]';

  return (
    <div className={`rounded-xl overflow-hidden border ${
      darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F8F9FA] border-[#E8EAED]'
    }`}>

      {/* Card header */}
      <div className={`px-5 py-3.5 flex items-center justify-between gap-3 border-b ${divider} ${
        darkMode ? 'bg-[#2C2C2C]' : 'bg-[#F1F3F4]'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
            darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'
          }`}>
            <svg className={`w-4 h-4 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className={`text-[14px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
              {server.serverName}
            </p>
            <p className={`text-[11.5px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              {collectedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono ${
            darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#E8EAED] text-[#5F6368]'
          }`}>
            {server.serverIp}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
            darkMode ? worstColors.badge : worstColors.badgeLight
          }`}>
            {worstPct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Paths table */}
      {mounts.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className={`border-b ${divider}`}>
              <th className={`px-5 py-2 text-left text-[11px] font-semibold tracking-wider uppercase ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Path</th>
              <th className={`px-5 py-2 text-right text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Used</th>
              <th className={`px-5 py-2 text-right text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Total</th>
              <th className={`px-5 py-2 text-right text-[11px] font-semibold tracking-wider uppercase ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`} style={{ minWidth: 200 }}>Usage</th>
            </tr>
          </thead>
          <tbody>
            {mounts.map((mount, i) => {
              const pct = mount.usedPercent ?? 0;
              const colors = getUsageColors(pct);
              const isLast = i === mounts.length - 1;
              return (
                <tr
                  key={mount.path}
                  className={`transition-colors duration-100 ${colors.rowHover} ${!isLast ? `border-b ${divider}` : ''}`}
                >
                  <td className={`px-5 py-3 font-mono text-[12.5px] ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>
                    {mount.path}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono tabular-nums text-[12.5px] whitespace-nowrap ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                    {formatBytes(mount.usedBytes)}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono tabular-nums text-[12.5px] whitespace-nowrap ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                    {formatBytes(mount.totalBytes)}
                  </td>
                  <td className="px-5 py-3" style={{ minWidth: 200 }}>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[12px] font-mono tabular-nums font-semibold w-12 text-right flex-shrink-0 ${colors.text}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={`px-5 py-4 text-[12.5px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
          No mount paths reported
        </p>
      )}
    </div>
  );
};

const StorageDashboard = ({ darkMode, theme, selectedSystem, loading, error, lastUpdated, refresh, onOpenSidebar }) => {
  const ghostBtn = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#E8EAED]';

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <div className={`flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden border ${theme.card} ${
        darkMode ? 'border-[#3C4043]' : 'border-[#DADCE0]'
      }`}>

        {/* Header */}
        <div className={`flex-shrink-0 px-5 py-3.5 flex items-center justify-between gap-3 border-b ${
          darkMode ? 'border-[#3C4043] bg-[#252525]' : 'border-[#E8EAED] bg-[#FAFAFA]'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onOpenSidebar}
              className={`md:hidden inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
              aria-label="Open systems list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <svg className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            {selectedSystem ? (
              <>
                <span className={`text-[14px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
                  {selectedSystem.systemName}
                </span>
                <span className={`text-[11.5px] font-mono flex-shrink-0 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  {selectedSystem.systemId !== selectedSystem.systemName ? `· ${selectedSystem.systemId}` : ''}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums flex-shrink-0 ${
                  darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#E8EAED] text-[#5F6368]'
                }`}>
                  {selectedSystem.servers.length} server{selectedSystem.servers.length !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span className={`text-[14px] font-semibold ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
                Server Storage
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
          <div className="flex flex-col gap-4 pb-2">

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
              <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] border ${
                darkMode ? 'bg-red-900/20 text-red-400 border-red-800/40' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to fetch: {error}
              </div>
            )}

            {!loading && !error && !selectedSystem && (
              <div className={`flex items-center justify-center h-48 text-[13px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                Select a system from the sidebar
              </div>
            )}

            {!loading && selectedSystem && (
              <div className="flex flex-col gap-4">
                {selectedSystem.servers.map((server) => (
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

      </div>
    </div>
  );
};

export default StorageDashboard;
