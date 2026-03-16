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
    placeholder="Search servers"
    emptyLabel="No servers found"
    selectedClass={darkMode ? 'bg-[#0842A0]/30 text-[#A8C7FA]' : 'bg-[#D3E3FD] text-[#0B57D0]'}
    theme={theme}
  />
);

export default ServerDropdown;
