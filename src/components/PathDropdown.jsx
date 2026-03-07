import React from 'react';
import FilterDropdown from './FilterDropdown';

const getFileName = (path) => path?.split('/').pop() || path;

/**
 * Dropdown for filtering logs by file path.
 * Thin configuration wrapper over FilterDropdown.
 * Displays the filename as the primary label and the full path as a sublabel.
 */
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
    selectedClass={darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600'}
    focusRingClass="focus:ring-purple-500/50"
    theme={theme}
    width="w-80"
  />
);

export default PathDropdown;
