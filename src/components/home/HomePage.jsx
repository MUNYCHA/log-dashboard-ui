import React, { useMemo } from 'react';

const formatBytes = (bytes) => {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9)  return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6)  return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3)  return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
};

const StatCard = ({ title, children, darkMode }) => (
  <div className={`rounded-2xl overflow-hidden border ${
    darkMode
      ? 'bg-[#1E1E1E] border-[#3C4043] shadow-[0_8px_24px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]'
      : 'bg-white border-[#DADCE0] shadow-[0_4px_12px_rgba(60,64,67,0.18),0_1px_4px_rgba(60,64,67,0.12)]'
  }`}>
    <div className={`px-5 py-2.5 border-b text-[11px] font-semibold tracking-wider uppercase ${
      darkMode ? 'bg-[#252525] border-[#3C4043] text-[#5F6368]' : 'bg-[#F8F9FA] border-[#E8EAED] text-[#9AA0A6]'
    }`}>
      {title}
    </div>
    <div className="px-5 py-4">
      {children}
    </div>
  </div>
);

const WsStatusCard = ({ isConnected, isReconnecting, darkMode }) => {
  const dotClass = isConnected
    ? 'bg-emerald-500'
    : isReconnecting ? 'bg-amber-500 animate-pulse' : 'bg-rose-500';
  const label = isConnected ? 'Connected' : isReconnecting ? 'Reconnecting…' : 'Disconnected';
  const labelColor = isConnected
    ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
    : isReconnecting
      ? darkMode ? 'text-amber-400' : 'text-amber-600'
      : darkMode ? 'text-rose-400' : 'text-rose-600';

  return (
    <StatCard title="WebSocket" darkMode={darkMode}>
      <div className="flex items-center gap-3 mb-1">
        <span className={`h-3 w-3 rounded-full flex-shrink-0 ${dotClass}`} />
        <span className={`text-[15px] font-semibold ${labelColor}`}>{label}</span>
      </div>
      <p className={`text-[12px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
        Real-time log stream
      </p>
    </StatCard>
  );
};

const TopicSummaryCard = ({ topics, logRates, darkMode, onNavChange }) => {
  const activeCount = useMemo(
    () => topics.filter((t) => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  );
  const totalRate = useMemo(
    () => Object.values(logRates || {}).reduce((s, r) => s + r, 0),
    [logRates],
  );
  const top5 = useMemo(
    () => [...topics]
      .filter((t) => (logRates?.[t] || 0) > 0)
      .sort((a, b) => (logRates?.[b] || 0) - (logRates?.[a] || 0))
      .slice(0, 5),
    [topics, logRates],
  );

  return (
    <StatCard title="Log Topics" darkMode={darkMode}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-[28px] font-bold tabular-nums leading-none ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
          {activeCount}
        </span>
        <span className={`text-[13px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
          / {topics.length} active
        </span>
        {totalRate > 0 && (
          <span className={`ml-auto text-[12px] font-mono tabular-nums font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {totalRate}/s
          </span>
        )}
      </div>
      {top5.length > 0 ? (
        <div className="flex flex-col gap-1.5 mb-3">
          {top5.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className={`truncate text-[12.5px] flex-1 min-w-0 ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>{t}</span>
              <span className={`text-[11px] font-mono tabular-nums flex-shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {logRates?.[t] || 0}/s
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-[12px] mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
          No active topics
        </p>
      )}
      <button
        onClick={() => onNavChange('logs')}
        className={`text-[12px] font-medium transition-colors ${darkMode ? 'text-[#8AB4F8] hover:text-[#669DF6]' : 'text-[#1A73E8] hover:text-[#1557B0]'}`}
      >
        Open Logs →
      </button>
    </StatCard>
  );
};

const StorageHealthCard = ({ groupedSystems, storageLoading, storageError, storageLastUpdated, darkMode, onNavChange }) => {
  const stats = useMemo(() => {
    let serverCount = 0;
    let criticalCount = 0;
    let warningCount = 0;
    for (const system of groupedSystems) {
      serverCount += system.servers.length;
      for (const server of system.servers) {
        for (const mount of server.mountPathStorageUsages ?? []) {
          const pct = mount.usedPercent ?? 0;
          if (pct >= 90) criticalCount++;
          else if (pct >= 70) warningCount++;
        }
      }
    }
    return { serverCount, criticalCount, warningCount };
  }, [groupedSystems]);

  return (
    <StatCard title="Server Storage" darkMode={darkMode}>
      {storageLoading ? (
        <p className={`text-[13px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Loading…</p>
      ) : storageError ? (
        <p className={`text-[13px] ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>Error: {storageError}</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-[28px] font-bold tabular-nums leading-none ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
              {stats.serverCount}
            </span>
            <span className={`text-[13px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              servers · {groupedSystems.length} {groupedSystems.length === 1 ? 'system' : 'systems'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {stats.criticalCount > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                darkMode ? 'bg-red-900/20 text-red-400 border border-red-800/40' : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {stats.criticalCount} critical
              </span>
            )}
            {stats.warningCount > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                darkMode ? 'bg-amber-900/20 text-amber-400 border border-amber-700/40' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {stats.warningCount} warning
              </span>
            )}
            {stats.criticalCount === 0 && stats.warningCount === 0 && stats.serverCount > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                darkMode ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All healthy
              </span>
            )}
          </div>
          {storageLastUpdated && (
            <p className={`text-[11px] font-mono mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              Updated {storageLastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={() => onNavChange('servers')}
            className={`text-[12px] font-medium transition-colors ${darkMode ? 'text-[#8AB4F8] hover:text-[#669DF6]' : 'text-[#1A73E8] hover:text-[#1557B0]'}`}
          >
            View Servers →
          </button>
        </>
      )}
    </StatCard>
  );
};

const AlertsSection = ({ groupedSystems, darkMode, onNavChange }) => {
  const criticalMounts = useMemo(() => {
    const result = [];
    for (const system of groupedSystems) {
      for (const server of system.servers) {
        for (const mount of server.mountPathStorageUsages ?? []) {
          if ((mount.usedPercent ?? 0) >= 90) {
            result.push({
              ...mount,
              serverName: server.serverName,
              serverIp: server.serverIp,
              systemName: system.systemName,
            });
          }
        }
      }
    }
    return result;
  }, [groupedSystems]);

  if (criticalMounts.length === 0) return null;

  return (
    <div>
      <h3 className={`text-[11px] font-semibold tracking-wider uppercase mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
        Critical Alerts — {criticalMounts.length} {criticalMounts.length === 1 ? 'disk' : 'disks'} at ≥90%
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {criticalMounts.map((m, i) => (
          <button
            key={i}
            onClick={() => onNavChange('servers')}
            className={`text-left rounded-2xl border p-4 transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.99] ${
              darkMode
                ? 'bg-red-900/10 border-red-800/40 hover:bg-red-900/15 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                : 'bg-red-50 border-red-200 hover:bg-red-100/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
                  {m.serverName}
                </p>
                <p className={`text-[11px] font-mono truncate ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  {m.systemName} · {m.serverIp}
                </p>
              </div>
              <span className={`flex-shrink-0 text-[13px] font-bold font-mono tabular-nums ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {(m.usedPercent ?? 0).toFixed(1)}%
              </span>
            </div>
            <p className={`text-[12px] font-mono truncate mb-2 ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>
              {m.path}
            </p>
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`}>
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min(m.usedPercent ?? 0, 100)}%` }}
              />
            </div>
            <p className={`mt-1.5 text-[11px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              {formatBytes(m.usedBytes)} / {formatBytes(m.totalBytes)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

const HomePage = ({
  isConnected,
  isReconnecting,
  topics,
  logRates,
  groupedSystems,
  storageLoading,
  storageError,
  storageLastUpdated,
  darkMode,
  theme,
  onNavChange,
}) => (
  <div className={`flex flex-col flex-1 min-w-0 min-h-0 rounded-2xl overflow-hidden ${
    darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F1F3F4]'
  }`}>
    {/* Header */}
    <div className={`px-5 py-3.5 flex-shrink-0 border-b ${darkMode ? 'bg-[#1E1E1E] border-[#303134]' : 'bg-white border-[#E8EAED]'}`}>
      <h1 className={`text-[14px] font-semibold ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Overview</h1>
      <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>System health at a glance</p>
    </div>

    {/* Content */}
    <div className={`flex-1 overflow-y-auto p-4 ${theme.scrollbar} ${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#F1F3F4]'}`}>
      <div className="flex flex-col gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WsStatusCard isConnected={isConnected} isReconnecting={isReconnecting} darkMode={darkMode} />
          <TopicSummaryCard topics={topics} logRates={logRates} darkMode={darkMode} onNavChange={onNavChange} />
          <StorageHealthCard
            groupedSystems={groupedSystems}
            storageLoading={storageLoading}
            storageError={storageError}
            storageLastUpdated={storageLastUpdated}
            darkMode={darkMode}
            onNavChange={onNavChange}
          />
        </div>

        {/* Critical alerts */}
        {!storageLoading && !storageError && (
          <AlertsSection groupedSystems={groupedSystems} darkMode={darkMode} onNavChange={onNavChange} />
        )}
      </div>
    </div>
  </div>
);

export default HomePage;
