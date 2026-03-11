import React from 'react';
import FilterDropdown from './FilterDropdown';

const getFileName = (path) => path?.split('/').pop() || path;

const PathDropdown = ({
  isOpen,
  onClose,
  paths,
  selectedPath,
  onPathSelect,
  onClearPath,
  searchTerm,
  onSearchChange,
  theme,
  darkMode,
}) => (
  <FilterDropdown
    isOpen={isOpen}
    onClose={onClose}
    items={paths}
    selectedItem={selectedPath}
    onSelectItem={onPathSelect}
    onClearItem={onClearPath}
    searchTerm={searchTerm}
    onSearchChange={onSearchChange}
    allLabel="All Paths"
    placeholder="Search paths..."
    emptyLabel="No paths found"
    renderItem={(path) => ({ primary: getFileName(path), secondary: path })}
    selectedClass={darkMode ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700'}
    focusRingClass="focus:ring-blue-500"
    theme={theme}
    width="w-80"
  />
);

export default PathDropdown;
