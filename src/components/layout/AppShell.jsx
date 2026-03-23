import React from 'react';
import NavRail from './NavRail';
import SecondaryPanel from './SecondaryPanel';

const AppShell = ({
  activeNav,
  onNavChange,
  darkMode,
  theme,
  isConnected,
  // secondary panel
  sidebarOpen,
  onCloseSidebar,
  sidebarCollapsed,
  onToggleSidebarCollapsed,
  topics,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  topicSortMode,
  onTopicSortModeChange,
  logRates,
  systems,
  selectedSystemId,
  onSystemSelect,
  children,
}) => {
  const hasSecondaryPanel = activeNav === 'logs' || activeNav === 'servers';

  return (
    <div className={`flex h-screen overflow-hidden ${theme.background} ${theme.text} transition-colors duration-200 p-2 gap-2`}>
      {/* Mobile overlay for secondary panel */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <NavRail
        activeNav={activeNav}
        onNavChange={onNavChange}
        darkMode={darkMode}
        isConnected={isConnected}
      />

      {hasSecondaryPanel && (
        <SecondaryPanel
          activeNav={activeNav}
          topics={topics}
          selectedTopic={selectedTopic}
          onTopicSelect={onTopicSelect}
          topicSearchTerm={topicSearchTerm}
          onTopicSearchChange={onTopicSearchChange}
          topicSortMode={topicSortMode}
          onTopicSortModeChange={onTopicSortModeChange}
          logRates={logRates}
          systems={systems}
          selectedSystemId={selectedSystemId}
          onSystemSelect={onSystemSelect}
          theme={theme}
          darkMode={darkMode}
          isOpen={sidebarOpen}
          onClose={onCloseSidebar}
          collapsed={sidebarCollapsed}
          onCollapse={onToggleSidebarCollapsed}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 min-w-0 overflow-hidden gap-2">
        {children}
      </div>
    </div>
  );
};

export default AppShell;
