import React, { useMemo } from 'react';

/**
 * Individual topic row — memoized so it only re-renders when its specific
 * topic's log array changes (stable reference from the flush shallow copy).
 */
const TopicItem = React.memo(({ topic, logs, isSelected, onTopicSelect, logRate, theme, darkMode }) => {
  const logCount = logs?.length || 0;
  const lastLog = logs?.[0];

  const servers = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return [...new Set(logs.map((l) => l.serverName))].sort();
  }, [logs]);

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`w-full text-left px-3 py-2.5 rounded-xl
               transition-colors duration-200 group active:scale-[0.98]
               ${isSelected
                 ? darkMode
                   ? 'bg-gradient-to-r from-green-500/15 to-green-500/5 shadow-lg shadow-green-900/20 border border-green-500/20'
                   : 'bg-white shadow-lg shadow-indigo-200/60 border border-indigo-200/80'
                 : darkMode
                   ? 'hover:bg-gray-700/40 border border-transparent hover:border-gray-700/50'
                   : 'hover:bg-white/60 border border-transparent hover:border-indigo-100 hover:shadow-sm'
               }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
            isSelected
              ? darkMode ? 'bg-green-400 shadow-sm shadow-green-400/50' : 'bg-indigo-500 shadow-sm shadow-indigo-500/50'
              : darkMode ? 'bg-gray-600' : 'bg-gray-400'
          }`} />
          <span className={`font-medium truncate text-sm ${
            isSelected
              ? darkMode ? 'text-green-400' : 'text-indigo-600'
              : theme.textSecondary
          }`}>
            {topic}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {logRate > 0 && (
            <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-indigo-500'} font-mono`}>
              {logRate}/s
            </span>
          )}
          {logCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono transition-colors ${
              isSelected
                ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/15 text-indigo-600'
                : darkMode ? 'bg-gray-800/80 text-gray-500' : 'bg-slate-200/80 text-slate-500'
            }`}>
              {logCount}
            </span>
          )}
        </div>
      </div>

      {servers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 ml-[18px]">
          {servers.slice(0, 3).map((server) => (
            <span key={server}
                  className={`text-xs px-1.5 py-0.5 rounded-md ${theme.serverBadge}`}>
              {server}
            </span>
          ))}
          {servers.length > 3 && (
            <span className={`text-xs ${theme.textMuted}`}>+{servers.length - 3}</span>
          )}
        </div>
      )}

      {lastLog && (
        <p className={`text-xs ${theme.textMuted} mt-1.5 truncate ml-[18px]`}>
          {lastLog.message}
        </p>
      )}
    </button>
  );
});

const Sidebar = ({
  topics,
  logsByTopic,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  collapsed,
  onCollapse,
}) => {
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
        <div className={`px-3 pt-4 pb-2 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${darkMode ? 'bg-green-400' : 'bg-indigo-500'} rounded-full animate-pulse`} />
              <h1 className={`text-lg font-semibold ${darkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'} bg-clip-text text-transparent`}>
                Log Topics
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${theme.textMuted}`}>{topics.length} active</span>
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

      <div className={`px-3 pb-3 flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search topics..."
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
          {/* Desktop collapse button — aligned with search box */}
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

      <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-2 py-1`}>
        <div className="flex flex-col gap-1">
          {topics
            .filter(topic => topic.toLowerCase().includes(topicSearchTerm.toLowerCase()))
            .map(topic => (
              <TopicItem
                key={topic}
                topic={topic}
                logs={logsByTopic[topic]}
                isSelected={selectedTopic === topic}
                onTopicSelect={onTopicSelect}
                logRate={logRates?.[topic] || 0}
                theme={theme}
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
