import React, { useRef, useEffect } from 'react';

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
  darkMode
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPaths = paths.filter(path =>
    path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get just the filename from full path
  const getFileName = (path) => {
    return path.split('/').pop() || path;
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`absolute left-0 mt-2 w-80 rounded-lg shadow-lg ${theme.card} border ${theme.border} z-50`}
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Search paths..."
          className={`w-full ${theme.input} rounded-md px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 
                     ${darkMode ? 'focus:ring-purple-500/50' : 'focus:ring-purple-500/50'}`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        
        <div className="max-h-60 overflow-y-auto">
          {/* All Paths option */}
          <button
            onClick={() => {
              onClearPath();
              onClose();
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer
                     ${!selectedPath 
                       ? (darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600') 
                       : `hover:bg-opacity-80 ${theme.hover}`
                     }`}
            type="button"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span>All Paths</span>
            </div>
          </button>

          {filteredPaths.length > 0 ? (
            filteredPaths.map(path => (
              <button
                key={path}
                onClick={() => {
                  onPathSelect(path);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer
                         ${selectedPath === path 
                           ? (darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600')
                           : `hover:bg-opacity-80 ${theme.hover}`
                         }`}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2-10H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-6l-2-2z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px]" title={path}>
                      {getFileName(path)}
                    </span>
                    <span className={`text-xs ${theme.textMuted} truncate`}>
                      {path}
                    </span>
                  </div>
                  {selectedPath === path && (
                    <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className={`px-3 py-4 text-center ${theme.textMuted} text-sm`}>
              No paths found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathDropdown;