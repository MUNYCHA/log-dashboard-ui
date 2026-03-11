import React, { useMemo } from 'react';

/**
 * Topic row — compact, information-dense, production-grade.
 * Left activity bar reflects log rate intensity.
 */
const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, serverCount, darkMode }) => {
  // Activity intensity: idle / low / medium / high
  const intensity = logRate === 0 ? 'idle' : logRate < 10 ? 'low' : logRate < 50 ? 'med' : 'high';

  const activityColor = {
    idle: darkMode ? 'bg-gray-600' : 'bg-gray-300',
    low:  darkMode ? 'bg-green-500' : 'bg-indigo-300',
    med:  darkMode ? 'bg-green-400' : 'bg-indigo-400',
    high: darkMode ? 'bg-green-300' : 'bg-indigo-500',
  }[intensity];

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`w-full text-left flex items-center rounded-xl transition-all duration-200 group gap-2.5 px-3 py-2.5
        ${isSelected
          ? darkMode
            ? 'bg-gradient-to-br from-green-500/15 via-green-500/10 to-emerald-500/5 shadow-lg shadow-green-900/30 border border-green-500/25 scale-[1.02]'
            : 'bg-gradient-to-br from-white via-indigo-50 to-violet-50 shadow-lg shadow-indigo-200/50 border border-indigo-200/80 scale-[1.02]'
          : darkMode
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-800/40 shadow-md shadow-black/20 border border-gray-700/50 hover:border-gray-600/60 hover:shadow-lg hover:shadow-black/30 hover:from-gray-750/90 hover:to-gray-800/60 active:scale-[0.98]'
            : 'bg-gradient-to-br from-white to-slate-50 shadow-md shadow-slate-200/50 border border-slate-200/80 hover:border-indigo-200/60 hover:shadow-lg hover:shadow-indigo-100/40 active:scale-[0.98]'
        }`}
    >
      {/* Activity dot — purely reflects log rate, independent of selection */}
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300
        ${activityColor}
        ${intensity !== 'idle'
          ? 'animate-pulse shadow-sm ' + (darkMode ? 'shadow-green-400/40' : 'shadow-indigo-400/40')
          : ''
        }`}
      />

      <div className="flex-1 min-w-0">
        {/* Row 1: topic name + rate */}
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate text-sm ${
            isSelected
              ? darkMode ? 'text-green-300' : 'text-indigo-700'
              : darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {topic}
          </span>

          <div className="flex items-center gap-2 flex-shrink-0">
            {logRate > 0 ? (
              <span className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                isSelected
                  ? darkMode ? 'bg-green-500/25 text-green-300 shadow-sm shadow-green-900/20' : 'bg-indigo-500/15 text-indigo-600 shadow-sm shadow-indigo-200/30'
                  : darkMode ? 'bg-gray-900/60 text-green-400 shadow-inner' : 'bg-slate-100 text-indigo-500 shadow-inner shadow-slate-200/50'
              }`}>
                {logRate}/s
              </span>
            ) : (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                darkMode ? 'bg-gray-900/40 text-gray-500' : 'bg-slate-100/80 text-gray-400'
              }`}>
                idle
              </span>
            )}
          </div>
        </div>

        {/* Row 2: server count — only when there's activity */}
        {serverCount > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <svg className={`w-3 h-3 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {serverCount} {serverCount === 1 ? 'server' : 'servers'}
            </span>
          </div>
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
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  topicServers,
  collapsed,
  onCollapse,
}) => {
  // Sort: active topics first (by rate descending), then idle alphabetically
  const sortedTopics = useMemo(() => {
    const filtered = topics.filter(t => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));
    return filtered.sort((a, b) => {
      const rateA = logRates?.[a] || 0;
      const rateB = logRates?.[b] || 0;
      if (rateA > 0 && rateB === 0) return -1;
      if (rateA === 0 && rateB > 0) return 1;
      if (rateA !== rateB) return rateB - rateA;
      return a.localeCompare(b);
    });
  }, [topics, topicSearchTerm, logRates]);

  const activeCount = useMemo(
    () => topics.filter(t => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  );

  return (
    <div
      className={`
        flex flex-col flex-shrink-0 ${theme.sidebar}
        fixed inset-y-0 left-0 z-50 w-72
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-300 md:ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-64 lg:w-72'}
      `}
    >
      {/* Collapsed strip — desktop only */}
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-3 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
            className={`p-1.5 rounded-lg transition-colors duration-150
              ${darkMode
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-green-400'
                : 'bg-white text-gray-500 shadow-md hover:bg-indigo-50 hover:text-indigo-500'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Full sidebar content */}
      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        {/* Header */}
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${darkMode ? 'bg-green-400' : 'bg-indigo-500'} rounded-full animate-pulse`} />
              <h1 className={`text-lg font-semibold ${darkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'} bg-clip-text text-transparent`}>
                Topics
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-mono ${
                activeCount > 0
                  ? darkMode ? 'text-green-400' : 'text-indigo-500'
                  : theme.textMuted
              }`}>
                {activeCount}/{topics.length} live
              </span>
              {/* Mobile close button */}
              <button
                onClick={onClose}
                className={`md:hidden p-1.5 rounded-lg ${theme.input}`}
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
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Filter topics..."
                className={`w-full ${theme.input} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2
                         ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-indigo-500/50'} focus:border-transparent transition-colors`}
                value={topicSearchTerm}
                onChange={(e) => onTopicSearchChange(e.target.value)}
              />
              <svg className={`absolute right-3 top-2.5 w-4 h-4 ${theme.textMuted}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Desktop collapse button */}
            <button
              onClick={onCollapse}
              title="Hide sidebar"
              aria-label="Collapse sidebar"
              className={`hidden md:flex flex-shrink-0 p-2 rounded-lg transition-colors duration-150
                ${darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-green-400'
                  : 'bg-white text-gray-500 shadow-md hover:bg-indigo-50 hover:text-indigo-500'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Topic list */}
        <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-2 py-1`}>
          <div className="flex flex-col gap-1.5">
            {sortedTopics.map(topic => (
              <TopicItem
                key={topic}
                topic={topic}
                isSelected={selectedTopic === topic}
                onTopicSelect={onTopicSelect}
                logRate={logRates?.[topic] || 0}
                serverCount={(topicServers?.[topic] || []).length}
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
