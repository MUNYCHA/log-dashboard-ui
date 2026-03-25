import React from 'react';

const EmptyState = ({
  theme, darkMode, splitView, isActivePanel,
  onSetActive, onClosePanel, onOpenTopicSidebar,
}) => (
  <div
    className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-60' : ''} ${splitView && isActivePanel ? 'ring-1 ring-[#1A73E8]/40' : ''}`}
    onClick={splitView && !isActivePanel ? onSetActive : undefined}
  >
    {onClosePanel && (
      <div className={`hidden md:flex items-center justify-between px-3 py-2.5 ${theme.header}`}>
        <span className={`text-xs ${theme.textMuted}`}>Select a topic</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
          className={`p-1 rounded-lg transition-colors ${darkMode ? 'text-[#80868B] hover:text-[#F28B82]' : 'text-[#5F6368] hover:text-[#C5221F]'}`}
          title="Close this panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
    <div className={`md:hidden flex items-center px-3 py-2.5 ${theme.header}`}>
      <span className={`text-xs ${theme.textMuted}`}>Select a topic</span>
    </div>
    <div className={`flex-1 flex items-center justify-center ${theme.textMuted}`}>
      <div className="max-w-sm text-center px-4">
        <svg className="w-8 h-8 mb-3 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">Select a topic to start monitoring</p>
        <p className="text-xs mt-1 opacity-60">Topics update live in the sidebar.</p>
        <button onClick={onOpenTopicSidebar} className={`md:hidden mt-4 px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-150 ease-in-out active:scale-95 ${
          darkMode ? 'bg-[#303134] text-[#BDC1C6] border-[#5F6368]' : 'bg-[#F1F3F4] text-[#3C4043] border-[#DADCE0]'
        }`}>
          Open Topics
        </button>
      </div>
    </div>
  </div>
);

export default EmptyState;
