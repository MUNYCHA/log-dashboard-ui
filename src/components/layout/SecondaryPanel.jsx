import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const MotionSpan = motion.span;

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

const SYSTEM_SORT_OPTIONS = [
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

// Script detection: Unicode range → BCP-47 locale
const SCRIPT_LOCALES = [
  [/[\u1780-\u17FF]/, 'km'],    // Khmer
  [/[\u0E00-\u0E7F]/, 'th'],    // Thai
  [/[\u3040-\u30FF]/, 'ja'],    // Japanese (Hiragana/Katakana)
  [/[\u4E00-\u9FFF]/, 'zh'],    // CJK / Chinese
  [/[\uAC00-\uD7AF]/, 'ko'],    // Korean (Hangul)
  [/[\u0600-\u06FF]/, 'ar'],    // Arabic
  [/[\u0400-\u04FF]/, 'ru'],    // Cyrillic
  [/[\u0900-\u097F]/, 'hi'],    // Devanagari / Hindi
];

const makeCollator = (samples = []) => {
  const joined = samples.join('');
  const matched = SCRIPT_LOCALES.filter(([re]) => re.test(joined));
  // Single non-Latin script → use its locale for correct linguistic order.
  // Multiple scripts or Latin-only → use undefined (Unicode DUCET) which
  // groups all scripts consistently and sorts correctly within each group.
  const locale = matched.length === 1 ? matched[0][1] : undefined;
  return new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
};

const safeName = (s) => s?.systemName ?? '';

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]')
    : (darkMode ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]' : 'text-[#3C4043] hover:text-[#202124] hover:bg-[#F1F3F4]');

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      title={topic}
      className={`relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-left transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="topic-selection-indicator"
          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isActive ? 'bg-emerald-500' : darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]'
        }`} />
        <span className="truncate text-[13.5px] font-medium">{topic}</span>
        {isActive && (
          <span className={`ml-auto text-[11px] font-mono tabular-nums flex-shrink-0 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {logRate}/s
          </span>
        )}
      </div>
    </button>
  );
});

const SystemItem = React.memo(({ system, isSelected, onSelect, darkMode }) => {
  const itemTone = isSelected
    ? (darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]')
    : (darkMode ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]' : 'text-[#3C4043] hover:text-[#202124] hover:bg-[#F1F3F4]');

  return (
    <button
      onClick={() => onSelect(system.systemId)}
      title={system.systemName}
      className={`relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-left transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="system-selection-indicator"
          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="truncate text-[13.5px] font-medium">{system.systemName}</span>
        <span className={`ml-auto text-[11px] font-mono tabular-nums flex-shrink-0 ${
          darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'
        }`}>
          {system.servers.length}
        </span>
      </div>
    </button>
  );
});

const SecondaryPanel = ({
  activeNav,
  // logs
  topics,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  topicSortMode,
  onTopicSortModeChange,
  logRates,
  // servers
  systems,
  selectedSystemId,
  onSystemSelect,
  // shared
  theme,
  darkMode,
  isOpen,
  onClose,
  collapsed,
  onCollapse,
}) => {
  const isLogs = activeNav === 'logs';
  const isServers = activeNav === 'servers';

  const [systemSortMode, setSystemSortMode] = useState('asc');
  const [systemSearchTerm, setSystemSearchTerm] = useState('');

  const sortedSystems = useMemo(() => {
    const list = systems ?? [];
    // Normalize both sides to NFC so composed/decomposed Khmer (and other scripts) match correctly
    const needle = systemSearchTerm.normalize('NFC').toLowerCase();
    const filtered = needle
      ? list.filter((s) => safeName(s).normalize('NFC').toLowerCase().includes(needle))
      : list;
    const collator = makeCollator(filtered.map((s) => safeName(s)));
    return [...filtered].sort((a, b) =>
      systemSortMode === 'asc'
        ? collator.compare(safeName(a), safeName(b))
        : collator.compare(safeName(b), safeName(a)),
    );
  }, [systems, systemSortMode, systemSearchTerm]);

  const sortedTopics = useMemo(() => {
    const filtered = topics.filter((t) => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));
    const collator = makeCollator(topics);
    if (topicSortMode === 'asc') return filtered.sort((a, b) => collator.compare(a, b));
    if (topicSortMode === 'desc') return filtered.sort((a, b) => collator.compare(b, a));
    return filtered.sort((a, b) => {
      const rateA = logRates?.[a] || 0;
      const rateB = logRates?.[b] || 0;
      if (rateA > 0 && rateB === 0) return -1;
      if (rateA === 0 && rateB > 0) return 1;
      if (rateA !== rateB) return rateB - rateA;
      return a.localeCompare(b);
    });
  }, [topics, topicSearchTerm, topicSortMode, logRates]);

  const activeCount = useMemo(
    () => topics.filter((t) => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  );

  const ghostBtn = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]';

  return (
    <div className={`
      flex flex-col flex-shrink-0 ${theme.sidebar}
      fixed inset-y-0 left-0 z-50 w-72
      transform transition-transform duration-200
      md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-200
      md:rounded-2xl md:overflow-hidden
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-60 lg:w-68'}
    `}>
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-3 flex-1">
          <button
            onClick={onCollapse}
            title="Show panel"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className={`text-[13px] font-semibold ${theme.text}`}>
                {isLogs ? 'Topics' : 'Systems'}
              </h2>
              {isLogs && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
                  darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
                }`}>
                  {activeCount}/{topics.length}
                </span>
              )}
              {isServers && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
                  darkMode ? 'bg-[#303134] text-[#80868B]' : 'bg-[#F1F3F4] text-[#5F6368]'
                }`}>
                  {systems?.length ?? 0}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className={`md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={onCollapse}
                title="Collapse"
                className={`hidden md:inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Logs: search + sort + list */}
        {isLogs && (
          <>
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="relative">
                <svg
                  className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search topics"
                  className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ease-in-out ${
                    darkMode
                      ? 'bg-[#303134] border-[#5F6368] text-[#E8EAED] placeholder:text-[#80868B] focus:ring-[#8AB4F8]/20 focus:border-[#8AB4F8]'
                      : 'bg-[#F1F3F4] border-[#DADCE0] text-[#202124] placeholder:text-[#5F6368] focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]'
                  }`}
                  value={topicSearchTerm}
                  onChange={(e) => onTopicSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="px-4 pb-3 flex-shrink-0">
              <div className={`grid grid-cols-3 gap-0.5 rounded-2xl border p-1 ${
                darkMode ? 'border-[#303134] bg-[#303134]' : 'border-[#E8EAED] bg-[#F1F3F4]'
              }`}>
                {TOPIC_SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTopicSortModeChange(option.value)}
                    className={`w-full rounded-xl py-1.5 text-center text-[12px] font-medium transition-all duration-150 ease-in-out active:scale-95 ${
                      option.value === topicSortMode
                        ? darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-white text-[#1A73E8] shadow-sm'
                        : darkMode ? 'text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]' : 'text-[#5F6368] hover:bg-white hover:text-[#202124]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-3 pb-3`}>
              <div className="flex flex-col gap-0.5">
                {sortedTopics.map((topic) => (
                  <TopicItem
                    key={topic}
                    topic={topic}
                    isSelected={selectedTopic === topic}
                    onTopicSelect={onTopicSelect}
                    logRate={logRates?.[topic] || 0}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Servers: search + sort + system list */}
        {isServers && (
          <>
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="relative">
                <svg
                  className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search systems"
                  className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ease-in-out ${
                    darkMode
                      ? 'bg-[#303134] border-[#5F6368] text-[#E8EAED] placeholder:text-[#80868B] focus:ring-[#8AB4F8]/20 focus:border-[#8AB4F8]'
                      : 'bg-[#F1F3F4] border-[#DADCE0] text-[#202124] placeholder:text-[#5F6368] focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]'
                  }`}
                  value={systemSearchTerm}
                  onChange={(e) => setSystemSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="px-4 pb-3 flex-shrink-0">
              <div className={`grid grid-cols-2 gap-0.5 rounded-2xl border p-1 ${
                darkMode ? 'border-[#303134] bg-[#303134]' : 'border-[#E8EAED] bg-[#F1F3F4]'
              }`}>
                {SYSTEM_SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSystemSortMode(option.value)}
                    className={`w-full rounded-xl py-1.5 text-center text-[12px] font-medium transition-all duration-150 ease-in-out active:scale-95 ${
                      option.value === systemSortMode
                        ? darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-white text-[#1A73E8] shadow-sm'
                        : darkMode ? 'text-[#BDC1C6] hover:bg-[#3C4043] hover:text-[#E8EAED]' : 'text-[#5F6368] hover:bg-white hover:text-[#202124]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-3 pb-3`}>
              <div className="flex flex-col gap-0.5">
                {sortedSystems.map((system) => (
                  <SystemItem
                    key={system.systemId}
                    system={system}
                    isSelected={selectedSystemId === system.systemId}
                    onSelect={onSystemSelect}
                    darkMode={darkMode}
                  />
                ))}
                {sortedSystems.length === 0 && (
                  <p className={`px-4 py-3 text-[12px] ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                    {systemSearchTerm ? 'No systems match' : 'No systems available'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(SecondaryPanel);
