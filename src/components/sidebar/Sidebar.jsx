import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const MotionSpan = motion.span;

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode
      ? 'bg-[#0842A0]/30 text-[#A8C7FA]'
      : 'bg-[#D3E3FD] text-[#0B57D0]')
    : (darkMode
      ? 'text-[#CAC4BC] hover:text-[#E8E2DC] hover:bg-[#2E2B28]'
      : 'text-[#4A4540] hover:text-[#1C1B1A] hover:bg-[#EEE8E2]');

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-left transition-all duration-150 ease-in-out active:scale-[0.98] ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="topic-selection-indicator"
          className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#A8C7FA]' : 'bg-[#0B57D0]'}`}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isActive
            ? 'bg-emerald-500'
            : darkMode ? 'bg-[#49443E]' : 'bg-[#C5BEB7]'
        }`} />
        <span className="truncate text-[13.5px] font-medium">
          {topic}
        </span>
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

const Sidebar = ({
  topics,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  topicSortMode,
  onTopicSortModeChange,
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  collapsed,
  onCollapse,
}) => {
  const sortedTopics = useMemo(() => {
    const filtered = topics.filter((t) => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));

    if (topicSortMode === 'asc') {
      return filtered.sort((a, b) => a.localeCompare(b));
    }

    if (topicSortMode === 'desc') {
      return filtered.sort((a, b) => b.localeCompare(a));
    }

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
    ? 'text-[#CAC4BC] hover:text-[#E8E2DC] hover:bg-[#2E2B28]'
    : 'text-[#4A4540] hover:text-[#1C1B1A] hover:bg-[#EEE8E2]';

  return (
    <div
      className={`
        flex flex-col flex-shrink-0 ${theme.sidebar}
        fixed inset-y-0 left-0 z-50 w-72
        transform transition-transform duration-200
        md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-60 lg:w-68'}
      `}
    >
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-3 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
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
              <h1 className={`text-[13px] font-semibold ${theme.text}`}>Topics</h1>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums ${
                darkMode ? 'bg-[#252320] text-[#938D87]' : 'bg-[#EEE8E2] text-[#79736D]'
              }`}>
                {activeCount}/{topics.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className={`md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={onCollapse}
                title="Hide sidebar"
                aria-label="Collapse sidebar"
                className={`hidden md:inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${ghostBtn}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search — rounded-full */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <svg
              className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search topics"
              className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 transition-all duration-150 ease-in-out ${
                darkMode
                  ? 'bg-[#252219] border-[#4A4540] text-[#ECE6DF] placeholder:text-[#8E8882] focus:ring-[#A8C7FA]/20 focus:border-[#A8C7FA]'
                  : 'bg-white border-[#C5BEB7] text-[#1C1B1A] placeholder:text-[#79736D] focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]'
              }`}
              value={topicSearchTerm}
              onChange={(e) => onTopicSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Sort tabs */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className={`grid grid-cols-3 gap-0.5 rounded-2xl border p-1 ${
            darkMode ? 'border-[#3F3A34] bg-[#252320]' : 'border-[#DDD7D0] bg-[#EEE8E2]'
          }`}>
            {TOPIC_SORT_OPTIONS.map((option) => {
              const isSelected = option.value === topicSortMode;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTopicSortModeChange(option.value)}
                  className={`w-full rounded-xl py-1.5 text-center text-[12px] font-medium transition-all duration-150 ease-in-out active:scale-95
                    ${isSelected
                      ? darkMode
                        ? 'bg-[#0842A0]/30 text-[#A8C7FA]'
                        : 'bg-white text-[#0B57D0] shadow-sm'
                      : darkMode
                        ? 'text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC]'
                        : 'text-[#4A4540] hover:bg-[#F7F4F1] hover:text-[#1C1B1A]'
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic list */}
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
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
