import React, { useRef, useEffect } from 'react';

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

  const filteredServers = servers.filter(server =>
    server.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      ref={dropdownRef} 
      className={`absolute left-0 mt-2 w-64 rounded-lg shadow-lg ${theme.card} border ${theme.border} z-50`}
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Search servers..."
          className={`w-full ${theme.input} rounded-md px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 
                     ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-blue-500/50'}`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        
        <div className="max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onClearServer();
              onClose();
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer
                     ${!selectedServer 
                       ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-600') 
                       : `hover:bg-opacity-80 ${theme.hover}`
                     }`}
            type="button"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span>All Servers</span>
            </div>
          </button>

          {filteredServers.length > 0 ? (
            filteredServers.map(server => (
              <button
                key={server}
                onClick={() => {
                  onServerSelect(server);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer
                         ${selectedServer === server 
                           ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-600')
                           : `hover:bg-opacity-80 ${theme.hover}`
                         }`}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="flex-1 truncate">{server}</span>
                  {selectedServer === server && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className={`px-3 py-4 text-center ${theme.textMuted} text-sm`}>
              No servers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerDropdown;