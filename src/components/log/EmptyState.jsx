import React from 'react';

const EmptyState = ({
  theme, darkMode, splitView, isActivePanel,
  onSetActive, onClosePanel, onOpenSidebar,
}) => (
  <div
    className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-70' : ''} ${splitView && isActivePanel ? `ring-1 ${darkMode ? 'ring-green-500/60' : 'ring-indigo-400/60'}` : ''}`}
    onClick={splitView && !isActivePanel ? onSetActive : undefined}
  >
    {/* Desktop header — only shown for split panel 2 so close button is always reachable */}
    {onClosePanel && (
      <div className={`hidden md:flex items-center justify-between px-3 py-3 ${theme.header}`}>
        <span className={`text-sm ${theme.textMuted}`}>Select a topic</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
          className={`p-1.5 rounded-lg ${theme.input} hover:text-red-400 hover:bg-red-500/10 transition-colors`}
          title="Close this panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
    <div className={`md:hidden flex items-center px-3 py-3 ${theme.header}`}>
      <button onClick={onOpenSidebar} className={`p-2 rounded-lg ${theme.input}`} aria-label="Open sidebar">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className={`ml-3 text-sm ${theme.textMuted}`}>Select a topic</span>
    </div>
    <div className={`flex-1 flex items-center justify-center ${theme.textMuted}`}>
      <div className="text-center px-4">
        <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">Select a topic to view logs</p>
        <p className="text-sm">Choose from the sidebar to start monitoring</p>
        <button onClick={onOpenSidebar} className={`md:hidden mt-4 px-4 py-2 rounded-lg ${theme.input} text-sm`}>
          Open Topics
        </button>
      </div>
    </div>
  </div>
);

export default EmptyState;
