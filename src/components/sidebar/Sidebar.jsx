import React, { useEffect, useMemo, useRef, useState } from 'react';

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A to Z' },
  { value: 'desc', label: 'Z to A' },
];

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode
      ? 'border-blue-500/40 bg-blue-500/10 text-blue-100 shadow-[inset_0_1px_0_rgba(96,165,250,0.14)]'
      : 'border-blue-200 bg-blue-50/90 text-blue-900 shadow-sm')
    : (darkMode
      ? 'border-gray-900 bg-[#06090f] text-gray-200 hover:border-gray-800 hover:bg-[#0b1220]'
      : 'border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300 hover:bg-white');
  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`w-full rounded-xl border px-2.5 py-1.5 text-left transition-all md:px-3 md:py-2 ${itemTone}`}
    >
      <div className="flex items-start gap-1.5 md:gap-2">
        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
          isActive
            ? darkMode ? 'bg-emerald-300 animate-pulse shadow-[0_0_12px_rgba(110,231,183,0.7)]' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.45)]'
            : darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
        />

        <div className="flex-1 min-w-0">
          <span className="block truncate text-[13px] font-semibold tracking-[0.01em] md:text-sm">
            {topic}
          </span>
        </div>
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
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  const selectedSortOption = TOPIC_SORT_OPTIONS.find((option) => option.value === topicSortMode) ?? TOPIC_SORT_OPTIONS[0];

  const sortedTopics = useMemo(() => {
    const filtered = topics.filter(t => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));

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
    () => topics.filter(t => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  );

  useEffect(() => {
    if (!sortMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [sortMenuOpen]);

  return (
    <div
      className={`
        flex flex-col flex-shrink-0 ${theme.sidebar}
        fixed inset-y-0 left-0 z-50 w-72
        transform transition-transform duration-200
        md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-56 lg:w-64'}
      `}
    >
      {/* Collapsed strip */}
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-2.5 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
            className={`p-1 rounded-md transition-colors
              ${darkMode
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        {/* Header */}
        <div className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.textMuted}`}>
                Topics
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-mono ${
                activeCount > 0
                  ? (darkMode
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                  : (darkMode
                    ? 'border-gray-800 bg-black/20 text-gray-500'
                    : 'border-gray-200 bg-white text-gray-400')
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${activeCount > 0 ? 'bg-current' : 'bg-gray-400'}`} />
                {activeCount}/{topics.length}
              </span>
              <button
                onClick={onClose}
                className={`md:hidden p-1 rounded-md ${theme.textMuted} hover:${theme.text}`}
                aria-label="Close sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-2.5 flex-shrink-0">
          <div className={`rounded-2xl border px-2 py-2 ${darkMode ? 'border-gray-800 bg-gradient-to-b from-gray-950 to-[#05080d]' : 'border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm'}`}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <svg
                  className={`absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${theme.textMuted}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search topics..."
                  className={`w-full ${theme.input} rounded-xl border px-9 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                    darkMode
                      ? 'border-gray-800 bg-black/30 placeholder:text-gray-600'
                      : 'border-gray-200 bg-white/80 placeholder:text-gray-400'
                  }`}
                  value={topicSearchTerm}
                  onChange={(e) => onTopicSearchChange(e.target.value)}
                />
              </div>
              <button
                onClick={onCollapse}
                title="Hide sidebar"
                aria-label="Collapse sidebar"
                className={`hidden md:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  darkMode
                    ? 'border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                    : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="mt-2">
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  onClick={() => setSortMenuOpen((open) => !open)}
                  className={`w-full rounded-xl border pl-9 pr-9 py-2 text-left text-[12px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    darkMode
                      ? 'border-gray-800 bg-black/20 text-gray-300 hover:bg-gray-950'
                      : 'border-gray-200 bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                  aria-label="Sort topics"
                  aria-haspopup="menu"
                  aria-expanded={sortMenuOpen}
                >
                  <svg
                    className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${theme.textMuted}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v16m0 0l-3-3m3 3l3-3M16 20V4m0 0l-3 3m3-3l3 3" />
                  </svg>
                  <span>{selectedSortOption.label}</span>
                </button>
                <svg
                  className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${theme.textMuted} transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>

                {sortMenuOpen && (
                  <div
                    className={`absolute left-0 right-0 top-[calc(100%+0.4rem)] z-20 overflow-hidden rounded-xl border shadow-lg ${
                      darkMode
                        ? 'border-gray-800 bg-[#0d1218]'
                        : 'border-gray-200 bg-white'
                    }`}
                    role="menu"
                  >
                    {TOPIC_SORT_OPTIONS.map((option) => {
                      const isSelected = option.value === topicSortMode;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onTopicSortModeChange(option.value);
                            setSortMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                            isSelected
                              ? (darkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700')
                              : (darkMode ? 'text-gray-300 hover:bg-gray-900' : 'text-gray-600 hover:bg-slate-50')
                          }`}
                          role="menuitemradio"
                          aria-checked={isSelected}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topic list */}
        <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-2 py-0.5`}>
          <div className="flex flex-col gap-1">
            {sortedTopics.map(topic => (
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
