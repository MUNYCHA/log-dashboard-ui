import React from 'react';

const ScrollButtons = ({ atTop, atBottom, scrollToTop, scrollToBottom, theme }) => (
  <div className="absolute right-3 bottom-4 flex flex-col gap-2 z-10">
    {!atTop && (
      <button
        onClick={scrollToTop}
        className={`p-2 rounded-full shadow-lg ${theme.card} border ${theme.popupBorder} ${theme.textMuted} hover:${theme.textSecondary} transition-all`}
        title="Scroll to top"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    )}
    {!atBottom && (
      <button
        onClick={scrollToBottom}
        className={`p-2 rounded-full shadow-lg ${theme.card} border ${theme.popupBorder} ${theme.textMuted} hover:${theme.textSecondary} transition-all`}
        title="Scroll to bottom"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    )}
  </div>
);

export default ScrollButtons;
