import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '../common/ThemeToggle';

const MotionDiv = motion.div;

// ── Primitives ────────────────────────────────────────────────────────────────

const SegmentedControl = ({ options, value, onChange, darkMode }) => {
  const containerClass = darkMode ? 'border-[#3C4043] bg-[#303134]' : 'border-[#E8EAED] bg-[#F1F3F4]';
  const activeClass = darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-white text-[#1A73E8] shadow-sm';
  const inactiveClass = darkMode ? 'text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]' : 'text-[#5F6368] hover:bg-white hover:text-[#202124]';

  return (
    <div
      className={`grid border rounded-2xl p-1 gap-0.5 ${containerClass}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl py-1.5 px-2 text-center text-[12px] font-medium transition-all duration-150 ease-in-out active:scale-95 whitespace-nowrap ${
            value === opt.value ? activeClass : inactiveClass
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const Toggle = ({ value, onChange, darkMode }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out active:scale-95 ${
      value
        ? darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'
        : darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]'
    }`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const Section = ({ title, darkMode, children }) => (
  <div>
    <h3 className={`mb-3.5 text-[11px] font-semibold uppercase tracking-widest ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
      {title}
    </h3>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

const SettingRow = ({ label, description, darkMode, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <div className={`text-[13px] font-medium ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>{label}</div>
      {description && <div className={`text-[11.5px] mt-0.5 ${darkMode ? 'text-[#80868B]' : 'text-[#9AA0A6]'}`}>{description}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// ── Option constants ──────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

const TIMESTAMP_OPTIONS = [
  { value: 'relative', label: 'Relative' },
  { value: 'local', label: 'Local' },
  { value: 'utc', label: 'UTC' },
];

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Cozy' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const computePanelGeometry = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(780, vw * 0.95);
  const maxH = vh - 48;
  return { w, maxH };
};

// ── Main component ────────────────────────────────────────────────────────────

const SettingsDrawer = ({
  isOpen,
  onClose,
  darkMode,
  themeMode,
  onThemeModeChange,
  topicSortMode,
  onTopicSortModeChange,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  splitView,
  onSplitViewToggle,
  timestampFormat,
  onTimestampFormatChange,
  logCard,
  onLogCardChange,
}) => {
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-[#FAFAFA]';
  const borderClass = darkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';
  const divideClass = darkMode ? 'divide-[#2C2C2E]' : 'divide-[#E5E5EA]';
  const colDivide = darkMode ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';

  const { w, maxH } = computePanelGeometry();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel — flex-centered wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <MotionDiv
            className={`pointer-events-auto w-full flex flex-col overflow-hidden rounded-[28px] border shadow-2xl ${bg} ${borderClass}`}
            style={{ maxWidth: w, maxHeight: maxH }}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] } }}
            exit={{ opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.15, ease: [0.3, 0, 1, 1] } }}
          >
              {/* Header */}
              <div className={`flex-shrink-0 flex items-center justify-between border-b px-6 py-4 ${borderClass}`}>
                <div className="flex items-center gap-2.5">
                  <svg className={`w-4.5 h-4.5 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className={`text-[15px] font-semibold tracking-tight ${darkMode ? 'text-[#F2F2F7]' : 'text-[#1C1C1E]'}`}>
                    Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close settings"
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
                    darkMode ? 'bg-[#3A3A3C] text-[#AEAEB2] hover:bg-[#48484A] hover:text-[#F2F2F7]' : 'bg-[#E5E5EA] text-[#6C6C70] hover:bg-[#D1D1D6] hover:text-[#1C1C1E]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body — 2-column grid */}
              <div className={`flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-x overflow-y-auto ${divideClass}`}>

                {/* ── Left column: App-level settings ── */}
                <div className="flex flex-col gap-7 p-6">

                  <Section title="Appearance" darkMode={darkMode}>
                    <SettingRow label="Theme" darkMode={darkMode}>
                      <ThemeToggle themeMode={themeMode} darkMode={darkMode} onThemeModeChange={onThemeModeChange} />
                    </SettingRow>
                  </Section>

                  <div className={`border-t ${colDivide}`} />

                  <Section title="Layout" darkMode={darkMode}>
                    <SettingRow label="Topic sort" description="Default order in the sidebar" darkMode={darkMode}>
                      <SegmentedControl options={SORT_OPTIONS} value={topicSortMode} onChange={onTopicSortModeChange} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="Collapsed sidebar" description="Start with sidebar hidden" darkMode={darkMode}>
                      <Toggle value={sidebarCollapsed} onChange={onSidebarCollapsedChange} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="Split view" description="Start with two panels open" darkMode={darkMode}>
                      <Toggle value={splitView} onChange={onSplitViewToggle} darkMode={darkMode} />
                    </SettingRow>
                  </Section>

                </div>

                {/* ── Right column: Log-related settings ── */}
                <div className="flex flex-col gap-7 p-6">

                  <Section title="Log Display" darkMode={darkMode}>
                    <SettingRow label="Timestamp" description="Format shown on each entry" darkMode={darkMode}>
                      <SegmentedControl options={TIMESTAMP_OPTIONS} value={timestampFormat} onChange={onTimestampFormatChange} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="Density" description="Spacing between log entries" darkMode={darkMode}>
                      <SegmentedControl options={DENSITY_OPTIONS} value={logCard.logDensity} onChange={(v) => onLogCardChange('logDensity', v)} darkMode={darkMode} />
                    </SettingRow>
                  </Section>

                  <div className={`border-t ${colDivide}`} />

                  <Section title="Log Card" darkMode={darkMode}>
                    <SettingRow label="Level badge" description="Show log level (ERROR, WARN…) on each card" darkMode={darkMode}>
                      <Toggle value={logCard.showLevelBadge} onChange={(v) => onLogCardChange('showLevelBadge', v)} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="Server badge" description="Show server name on each card" darkMode={darkMode}>
                      <Toggle value={logCard.showServerBadge} onChange={(v) => onLogCardChange('showServerBadge', v)} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="File path" description="Show source path on each card" darkMode={darkMode}>
                      <Toggle value={logCard.showPath} onChange={(v) => onLogCardChange('showPath', v)} darkMode={darkMode} />
                    </SettingRow>
                    <SettingRow label="Copy always visible" description="Show copy button without hover" darkMode={darkMode}>
                      <Toggle value={logCard.copyAlwaysVisible} onChange={(v) => onLogCardChange('copyAlwaysVisible', v)} darkMode={darkMode} />
                    </SettingRow>
                  </Section>

                </div>
              </div>
            </MotionDiv>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsDrawer;
