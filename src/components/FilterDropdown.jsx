import React, { useRef, useEffect } from 'react';

/**
 * Generic searchable dropdown for filtering a list of string items.
 *
 * Props:
 *   isOpen          - whether the dropdown is visible
 *   onClose         - called when the dropdown should close
 *   items           - string[] — the full list of items to show
 *   selectedItem    - the currently selected item string (or null)
 *   onSelectItem    - (item: string) => void
 *   onClearItem     - () => void — clears the selection (selects "All")
 *   searchTerm      - controlled search input value
 *   onSearchChange  - (value: string) => void
 *   allLabel        - label for the "show all" option  (e.g. "All Servers")
 *   placeholder     - search input placeholder text
 *   emptyLabel      - text shown when no items match the search
 *   selectedClass   - Tailwind classes applied to the active/selected row
 *   focusRingClass  - Tailwind focus-ring classes for the search input
 *   renderItem      - optional (item) => { primary, secondary? } for two-line rows
 *   theme           - theme object from constants/theme.js
 *   width           - Tailwind width class for the dropdown panel (default 'w-64')
 */
const FilterDropdown = ({
  isOpen,
  onClose,
  items,
  selectedItem,
  onSelectItem,
  onClearItem,
  searchTerm,
  onSearchChange,
  allLabel = 'All',
  placeholder = 'Search...',
  emptyLabel = 'No items found',
  selectedClass,
  focusRingClass,
  renderItem,
  theme,
  width = 'w-64',
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 mt-2 ${width} rounded-lg shadow-lg ${theme.card} border ${theme.border} z-50`}
    >
      <div className="p-2">
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full ${theme.input} rounded-md px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 ${focusRingClass}`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />

        <div className="max-h-60 overflow-y-auto">
          {/* "Show all" option */}
          <button
            type="button"
            onClick={() => { onClearItem(); onClose(); }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 cursor-pointer active:scale-[0.98]
              ${!selectedItem ? selectedClass : theme.hover}`}
          >
            <div className="flex items-center space-x-2">
              <ArrowRightIcon />
              <span>{allLabel}</span>
            </div>
          </button>

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const { primary, secondary } = renderItem
                ? renderItem(item)
                : { primary: item };
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => { onSelectItem(item); onClose(); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 cursor-pointer active:scale-[0.98]
                    ${selectedItem === item ? selectedClass : theme.hover}`}
                >
                  <div className="flex items-center space-x-2">
                    <ArrowRightIcon />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate" title={item}>{primary}</span>
                      {secondary && (
                        <span className={`text-xs ${theme.textMuted} truncate`}>
                          {secondary}
                        </span>
                      )}
                    </div>
                    {selectedItem === item && <CheckIcon />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className={`px-3 py-4 text-center ${theme.textMuted} text-sm`}>
              {emptyLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default FilterDropdown;
