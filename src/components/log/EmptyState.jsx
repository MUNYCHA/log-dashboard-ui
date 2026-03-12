import React from 'react';

const EmptyState = ({
  theme, darkMode, splitView, isActivePanel,
  onSetActive, onClosePanel, onOpenSidebar,
}) => (
  <div
    className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-60' : ''} ${splitView && isActivePanel ? 'ring-1 ring-blue-500/40' : ''}`}
    onClick={splitView && !isActivePanel ? onSetActive : undefined}
  >
    {onClosePanel && (
      <div className={`hidden md:flex items-center justify-between px-3 py-3 ${theme.header}`}>
        <span className={`text-sm ${theme.textMuted}`}>Select a topic</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
          className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
          title="Close this panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
    <div className={`md:hidden flex items-center px-3 py-3 ${theme.header}`}>
      <button onClick={onOpenSidebar} className={`p-1.5 rounded-md ${theme.textMuted}`} aria-label="Open sidebar">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className={`ml-3 text-sm ${theme.textMuted}`}>Select a topic</span>
    </div>
    <div className={`flex-1 flex items-center justify-center ${theme.textMuted}`}>
      <div className="max-w-md text-center px-4">
        <svg className="w-10 h-10 mb-3 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">Select a topic to start monitoring</p>
        <p className="text-xs mt-1">Topics stay live in the sidebar. Open one to inspect its recent buffered stream.</p>
        <button onClick={onOpenSidebar} className={`md:hidden mt-3 px-3 py-1.5 rounded-md ${theme.input} text-sm`}>
          Open Topics
        </button>
      </div>
    </div>
  </div>
);

export default EmptyState;
