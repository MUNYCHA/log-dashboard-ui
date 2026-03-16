import React, { useState, useRef, useEffect } from 'react';
import { formatDurationMs } from '../log/constants';

const PRESETS = [
  { label: 'All time', value: 'all' },
  { label: '1m',       value: '1m'  },
  { label: '5m',       value: '5m'  },
  { label: '15m',      value: '15m' },
  { label: '1h',       value: '1h'  },
];

const parseCustomDuration = (input) => {
  const t = input.trim().toLowerCase();
  if (!t) return null;
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(s|sec|m|min|h|hr)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2] || 'm';
  const mul = { s: 1000, sec: 1000, m: 60000, min: 60000, h: 3600000, hr: 3600000 };
  const ms = Math.round(n * mul[unit]);
  return ms > 0 ? ms : null;
};

const TimeRangeSelector = ({ timeRange, customRangeMs, onTimeRangeChange, darkMode }) => {
  const [isOpen, setIsOpen]         = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen]);

  const isActive = timeRange !== 'all';
  const label = timeRange === 'custom'
    ? `Last ${formatDurationMs(customRangeMs)}`
    : timeRange === 'all' ? 'All time' : `Last ${timeRange}`;

  const handleApply = () => {
    const ms = parseCustomDuration(customInput);
    if (!ms) { setCustomError(true); return; }
    setCustomError(false);
    setCustomInput('');
    onTimeRangeChange('custom', ms);
    setIsOpen(false);
  };

  const chipCls = `h-8 inline-flex items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium
    transition-all duration-150 ease-in-out active:scale-95 cursor-pointer select-none
    ${isActive
      ? 'border-[#0B57D0] bg-[#D3E3FD] text-[#0B57D0]'
      : darkMode
        ? 'border-[#3F3A34] bg-transparent text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC]'
        : 'border-[#C5BEB7] bg-transparent text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A]'
    }`;

  const presetCls = (active) =>
    `px-3 py-1 rounded-full text-[12.5px] font-medium border transition-all duration-150 ease-in-out active:scale-95
    ${active
      ? 'border-[#0B57D0] bg-[#D3E3FD] text-[#0B57D0]'
      : darkMode
        ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
        : 'border-[#C5BEB7] bg-white text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
    }`;

  const sectionLabel = `text-[10.5px] font-semibold uppercase tracking-wider mb-2 px-0.5 ${
    darkMode ? 'text-[#6E6862]' : 'text-[#A39E97]'
  }`;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setIsOpen((v) => !v)} className={chipCls}>
        {/* Clock icon */}
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{label}</span>
        {isActive ? (
          <span
            className="opacity-60 hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onTimeRangeChange('all', 0); setIsOpen(false); }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ) : (
          <svg className={`w-3 h-3 opacity-40 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className={`absolute left-0 top-10 z-50 w-72 rounded-2xl shadow-xl border ${
          darkMode ? 'border-[#3F3A34] bg-[#1E1C1A]' : 'border-[#E4DDD6] bg-[#FFFDF9]'
        }`}>
          {/* Quick presets */}
          <div className="p-3.5 pb-3">
            <p className={sectionLabel}>Quick select</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { onTimeRangeChange(p.value, 0); setIsOpen(false); }}
                  className={presetCls(timeRange === p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`mx-3.5 border-t ${darkMode ? 'border-[#2E2B28]' : 'border-[#EEE8E2]'}`} />

          {/* Custom duration */}
          <div className="p-3.5 pt-3">
            <p className={sectionLabel}>Custom duration</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 30m · 2h · 90s"
                value={customInput}
                onChange={(e) => { setCustomInput(e.target.value); setCustomError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className={`flex-1 rounded-xl border px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ${
                  customError
                    ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
                    : darkMode
                      ? 'bg-[#252219] border-[#4A4540] text-[#ECE6DF] placeholder:text-[#6E6862] focus:ring-[#A8C7FA]/20 focus:border-[#A8C7FA]'
                      : 'bg-white border-[#C5BEB7] text-[#1C1B1A] placeholder:text-[#A39E97] focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]'
                }`}
              />
              <button
                type="button"
                onClick={handleApply}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B57D0] text-white text-[12.5px] font-semibold hover:bg-[#0842A0] transition-all duration-150 active:scale-95 flex-shrink-0"
              >
                Apply
              </button>
            </div>
            {customError && (
              <p className="text-[11.5px] text-red-500 mt-1.5 px-0.5">
                Use format: 30s, 5m, 2h
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
