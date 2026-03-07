import React from 'react';
import FilterDropdown from './FilterDropdown';

/**
 * Dropdown for filtering logs by server name.
 * Thin configuration wrapper over FilterDropdown.
 */
const ServerDropdown = ({
  isOpen,
  onClose,
  servers,
  selectedServer,
  onServerSelect,
  onClearServer,
  searchTerm,
  onSearchChange,
  theme,
  darkMode,
}) => (
  <FilterDropdown
    isOpen={isOpen}
    onClose={onClose}
    items={servers}
    selectedItem={selectedServer}
    onSelectItem={onServerSelect}
    onClearItem={onClearServer}
    searchTerm={searchTerm}
    onSearchChange={onSearchChange}
    allLabel="All Servers"
    placeholder="Search servers..."
    emptyLabel="No servers found"
    selectedClass={darkMode ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-600'}
    focusRingClass={darkMode ? 'focus:ring-green-500/50' : 'focus:ring-indigo-500/50'}
    theme={theme}
  />
);

export default ServerDropdown;
