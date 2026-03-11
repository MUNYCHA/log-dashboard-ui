import React from 'react';
import FilterDropdown from './FilterDropdown';

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
    selectedClass={darkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'}
    focusRingClass="focus:ring-blue-500"
    theme={theme}
  />
);

export default ServerDropdown;
