import { useMemo, useRef, useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { formatBytes } from '../../utils/storageUtils';

const SAMPLES = 30;

// ── Rolling rate history (1s interval, 30s window) ────────────────────────
const useRateHistory = (logRates, topics) => {
  const ratesRef = useRef(logRates);
  const topicsRef = useRef(topics);
  const buf = useRef({ total: [], byTopic: {} });
  const [snap, setSnap] = useState({ total: [], byTopic: {} });
  useEffect(() => {
    ratesRef.current = logRates;
    topicsRef.current = topics;
  });
  useEffect(() => {
    const tick = () => {
      const rates = ratesRef.current || {};
      const tops = topicsRef.current || [];
      const total = Object.values(rates).reduce((s, r) => s + r, 0);
      buf.current.total = [...buf.current.total, total].slice(-SAMPLES);
      for (const t of tops) {
        const prev = buf.current.byTopic[t] || [];
        buf.current.byTopic[t] = [...prev, rates[t] || 0].slice(-SAMPLES);
      }
      setSnap({ total: [...buf.current.total], byTopic: { ...buf.current.byTopic } });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return snap;
};

// ── Animated counter ──────────────────────────────────────────────────────
const Counter = ({ value }) => {
  const fromRef = useRef(value);
  const rafRef = useRef(null);
  const [disp, setDisp] = useState(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / 500, 1);
      const e = 1 - (1 - p) ** 3;
      const v = Math.round(from + (to - from) * e);
      setDisp(v);
      if (p < 1) { rafRef.current = requestAnimationFrame(step); }
      else { fromRef.current = to; }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);
  return <>{disp}</>;
};

// ── Sparkline ─────────────────────────────────────────────────────────────
const Sparkline = ({ samples, width = 120, height = 32, color = '#10B981' }) => {
  if (!samples || samples.length < 2) return <svg width={width} height={height} />;
  const max = Math.max(...samples, 1);
  const pts = samples.map((v, i) => [
    (i / (samples.length - 1)) * width,
    height - 2 - (v / max) * (height - 4),
  ]);
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `M${pts[0][0]},${height} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${pts[pts.length - 1][0]},${height} Z`;
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg width={width} height={height}>
      <path d={area} fill={color} fillOpacity={0.12} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={2.5} fill={color} />
    </svg>
  );
};

// ── Donut chart ───────────────────────────────────────────────────────────
const Donut = ({ pct, size = 80, sw = 7, darkMode }) => {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(pct ?? 0, 100);
  const offset = circ * (1 - p / 100);
  const color = p >= 90 ? '#EF4444' : p >= 70 ? '#F59E0B' : '#10B981';
  const track = darkMode ? '#303134' : '#E8EAED';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <Motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold tabular-nums leading-none" style={{ color }}>
          {p.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

// ── Pulse ring ────────────────────────────────────────────────────────────
const Pulse = ({ isConnected, isReconnecting }) => {
  const color = isConnected ? '#10B981' : isReconnecting ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40 }}>
      {isConnected && [0, 0.8].map((delay, i) => (
        <Motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 12, height: 12, background: color }}
          animate={{ scale: [1, 3.2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeOut' }}
        />
      ))}
      <div className="relative w-3 h-3 rounded-full" style={{ background: color }} />
    </div>
  );
};

// ── System storage card ───────────────────────────────────────────────────
const SystemStorageCard = ({ system, darkMode, onNavChange }) => {
  const worstPct = useMemo(() => {
    let max = 0;
    for (const s of system.servers) {
      for (const m of s.mountPathStorageUsages ?? []) {
        if ((m.usedPercent ?? 0) > max) max = m.usedPercent ?? 0;
      }
    }
    return max;
  }, [system]);

  return (
    <Motion.button
      onClick={() => onNavChange('servers')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center gap-3 p-4 rounded-xl border w-full transition-colors duration-150 ${
        darkMode
          ? 'bg-[#252525] border-[#3C4043] hover:bg-[#2C2C2C]'
          : 'bg-[#F8F9FA] border-[#E8EAED] hover:bg-white'
      }`}
    >
      <Donut pct={worstPct} darkMode={darkMode} />
      <div className="text-center min-w-0 w-full">
        <p className={`text-[12px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
          {system.systemName}
        </p>
        <p className={`text-[11px] font-mono mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
          {system.servers.length} server{system.servers.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Motion.button>
  );
};

// ── HomePage ──────────────────────────────────────────────────────────────
const HomePage = ({
  isConnected, isReconnecting,
  topics, logRates,
  groupedSystems, storageLoading, storageError, storageLastUpdated,
  darkMode, theme,
  onNavChange,
}) => {
  const history = useRateHistory(logRates, topics);

  const totalRate = useMemo(
    () => Object.values(logRates || {}).reduce((s, r) => s + r, 0),
    [logRates],
  );

  const activeTopics = useMemo(
    () => [...topics]
      .filter(t => (logRates?.[t] || 0) > 0)
      .sort((a, b) => (logRates?.[b] || 0) - (logRates?.[a] || 0))
      .slice(0, 8),
    [topics, logRates],
  );

  const criticalMounts = useMemo(() => {
    const result = [];
    for (const sys of groupedSystems) {
      for (const srv of sys.servers) {
        for (const m of srv.mountPathStorageUsages ?? []) {
          if ((m.usedPercent ?? 0) >= 90) {
            result.push({ ...m, serverName: srv.serverName, serverIp: srv.serverIp, systemName: sys.systemName });
          }
        }
      }
    }
    return result;
  }, [groupedSystems]);

  const connLabel = isConnected ? 'Connected' : isReconnecting ? 'Reconnecting…' : 'Disconnected';
  const connColor = isConnected
    ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
    : isReconnecting
      ? (darkMode ? 'text-amber-400' : 'text-amber-600')
      : (darkMode ? 'text-rose-400' : 'text-rose-600');
  const accentColor = darkMode ? '#8AB4F8' : '#1A73E8';

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 pb-14 md:pb-0">
      <div className={`flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden ${theme.card}`}>

        {/* Header */}
        <div className={`flex-shrink-0 px-5 py-4 border-b ${darkMode ? 'border-[#3C4043] bg-[#252525]' : 'border-[#E8EAED] bg-[#FAFAFA]'}`}>
          <h1 className={`text-[14px] font-semibold ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Overview</h1>
          <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>System health at a glance</p>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 ${theme.scrollbar}`}>
          <div className="flex flex-col gap-4 pb-2">

            {/* ── Hero: connection + live rate + sparkline ── */}
            <div className={`rounded-xl border p-4 flex items-center gap-4 ${darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F8F9FA] border-[#E8EAED]'}`}>
              <Pulse isConnected={isConnected} isReconnecting={isReconnecting} />
              <div className="flex-shrink-0">
                <p className={`text-[13px] font-semibold ${connColor}`}>{connLabel}</p>
                <p className={`text-[11px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>WebSocket stream</p>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <Sparkline samples={history.total} width={160} height={36} color={accentColor} />
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-[28px] font-bold tabular-nums leading-none ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
                  <Counter value={totalRate} />
                </p>
                <p className={`text-[11px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>logs / sec</p>
              </div>
            </div>

            {/* ── Storage systems grid ── */}
            {storageLoading && (
              <div>
                <h2 className={`text-[11px] font-semibold tracking-wider uppercase mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Server Storage</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-[148px] rounded-xl border animate-pulse ${darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F1F3F4] border-[#E8EAED]'}`} />
                  ))}
                </div>
              </div>
            )}

            {!storageLoading && !storageError && groupedSystems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-[11px] font-semibold tracking-wider uppercase ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                    Server Storage
                  </h2>
                  <div className="flex items-center gap-3">
                    {storageLastUpdated && (
                      <span className={`text-[11px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                        Updated {storageLastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                    <button
                      onClick={() => onNavChange('servers')}
                      className={`text-[11px] font-medium transition-colors ${darkMode ? 'text-[#8AB4F8] hover:text-[#669DF6]' : 'text-[#1A73E8] hover:text-[#1557B0]'}`}
                    >
                      View all →
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                  {groupedSystems.map(sys => (
                    <SystemStorageCard key={sys.systemId} system={sys} darkMode={darkMode} onNavChange={onNavChange} />
                  ))}
                </div>
              </div>
            )}

            {!storageLoading && storageError && (
              <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] border ${darkMode ? 'bg-red-900/20 text-red-400 border-red-800/40' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Storage error: {storageError}
              </div>
            )}

            {/* ── Active topics ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-[11px] font-semibold tracking-wider uppercase ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  Active Topics
                  {activeTopics.length > 0 && (
                    <span className={`ml-2 normal-case font-mono font-normal ${darkMode ? 'text-[#80868B]' : 'text-[#9AA0A6]'}`}>
                      {activeTopics.length} of {topics.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => onNavChange('logs')}
                  className={`text-[11px] font-medium transition-colors ${darkMode ? 'text-[#8AB4F8] hover:text-[#669DF6]' : 'text-[#1A73E8] hover:text-[#1557B0]'}`}
                >
                  Open Logs →
                </button>
              </div>

              {activeTopics.length > 0 ? (
                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F8F9FA] border-[#E8EAED]'}`}>
                  {activeTopics.map((topic, i) => {
                    const rate = logRates?.[topic] || 0;
                    const samples = history.byTopic[topic] || [];
                    const isLast = i === activeTopics.length - 1;
                    return (
                      <div
                        key={topic}
                        className={`flex items-center gap-3 px-4 py-2.5 ${!isLast ? `border-b ${darkMode ? 'border-[#3C4043]' : 'border-[#E8EAED]'}` : ''}`}
                      >
                        <span className="h-2 w-2 rounded-full flex-shrink-0 bg-emerald-500" />
                        <span className={`flex-1 min-w-0 truncate text-[12.5px] font-mono ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>
                          {topic}
                        </span>
                        <Sparkline samples={samples} width={80} height={24} color={accentColor} />
                        <span className={`flex-shrink-0 text-[12px] font-mono font-semibold tabular-nums w-14 text-right ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {rate}/s
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`rounded-xl border px-4 py-8 text-center text-[13px] ${darkMode ? 'bg-[#252525] border-[#3C4043] text-[#5F6368]' : 'bg-[#F8F9FA] border-[#E8EAED] text-[#9AA0A6]'}`}>
                  No active topics
                </div>
              )}
            </div>

            {/* ── Critical alerts ── */}
            {!storageLoading && !storageError && criticalMounts.length > 0 && (
              <div>
                <h2 className={`text-[11px] font-semibold tracking-wider uppercase mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  Critical Alerts — {criticalMounts.length} {criticalMounts.length === 1 ? 'disk' : 'disks'} at ≥90%
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {criticalMounts.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => onNavChange('servers')}
                      className={`text-left rounded-xl border p-4 transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.99] ${
                        darkMode
                          ? 'bg-red-900/10 border-red-800/40 hover:bg-red-900/15'
                          : 'bg-red-50 border-red-200 hover:bg-red-100/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className={`text-[13px] font-semibold truncate ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>{m.serverName}</p>
                          <p className={`text-[11px] font-mono truncate ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>{m.systemName} · {m.serverIp}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[13px] font-bold font-mono tabular-nums ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {(m.usedPercent ?? 0).toFixed(1)}%
                        </span>
                      </div>
                      <p className={`text-[12px] font-mono truncate mb-2 ${darkMode ? 'text-[#BDC1C6]' : 'text-[#3C4043]'}`}>{m.path}</p>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`}>
                        <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: `${Math.min(m.usedPercent ?? 0, 100)}%` }} />
                      </div>
                      <p className={`mt-1.5 text-[11px] font-mono ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                        {formatBytes(m.usedBytes)} / {formatBytes(m.totalBytes)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
