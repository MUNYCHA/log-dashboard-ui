import React, { useRef, useEffect } from 'react';

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
  renderItem,
  theme,
  width = 'w-64',
}) => {
  const dropdownRef = useRef(null);
  const inputFocusClasses = theme.inputFocus
    .split(' ')
    .map((c) => `focus:${c}`)
    .join(' ');

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredItems = items.filter((item) =>
    typeof item === 'string' && item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute left-0 mt-2 ${width} rounded-2xl shadow-xl ${theme.card} border ${theme.popupBorder} z-50 overflow-hidden`}
    >
      <div className="p-3">
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          className={`w-full rounded-xl border px-3 py-2 text-[13px] mb-2 focus:outline-none transition-all duration-150 ${theme.input} ${inputFocusClasses}`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />

        <div className="max-h-60 overflow-y-auto -mx-1 px-1">
          <button
            type="button"
            onClick={() => { onClearItem(); onClose(); }}
            className={`w-full text-left px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-150 ease-in-out cursor-pointer
              ${!selectedItem ? selectedClass : theme.hover} ${!selectedItem ? '' : theme.textSecondary}`}
          >
            {allLabel}
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
                  className={`w-full text-left px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-150 ease-in-out cursor-pointer
                    ${selectedItem === item ? selectedClass : `${theme.hover} ${theme.textSecondary}`}`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate" title={item}>{primary}</span>
                      {secondary && (
                        <span className={`text-[11.5px] ${theme.textMuted} truncate mt-0.5`}>
                          {secondary}
                        </span>
                      )}
                    </div>
                    {selectedItem === item && (
                      <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className={`px-3 py-5 text-center ${theme.textMuted} text-[13px]`}>
              {emptyLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
