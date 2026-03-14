import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div;

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
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredItems = items.filter((item) =>
    typeof item === 'string' && item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          ref={dropdownRef}
          className={`absolute left-0 mt-1 ${width} rounded-md shadow-lg ${theme.card} border ${theme.popupBorder} z-50`}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder={placeholder}
              className={`w-full ${theme.input} rounded-md px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 ${focusRingClass}`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => { onClearItem(); onClose(); }}
                className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer
                  ${!selectedItem ? selectedClass : theme.hover}`}
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
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer
                        ${selectedItem === item ? selectedClass : theme.hover}`}
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate" title={item}>{primary}</span>
                          {secondary && (
                            <span className={`text-xs ${theme.textMuted} truncate`}>
                              {secondary}
                            </span>
                          )}
                        </div>
                        {selectedItem === item && (
                          <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
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
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default FilterDropdown;
