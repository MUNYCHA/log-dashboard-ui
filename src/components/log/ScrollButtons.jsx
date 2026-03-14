import React from 'react';

const ScrollButtons = ({ atTop, atBottom, scrollToTop, scrollToBottom, darkMode }) => (
  <div className="absolute right-3 bottom-3 flex flex-col gap-1 z-10">
    {!atTop && (
      <button
        onClick={scrollToTop}
        className={`p-1.5 rounded-md shadow-sm transition-colors
          ${darkMode
            ? 'bg-[#1a1a1a] border border-[#282828] text-gray-500 hover:text-gray-300'
            : 'bg-white border border-gray-200 text-gray-400 hover:text-gray-600'
          }`}
        title="Scroll to top"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    )}
    {!atBottom && (
      <button
        onClick={scrollToBottom}
        className={`p-1.5 rounded-md shadow-sm transition-colors
          ${darkMode
            ? 'bg-[#1a1a1a] border border-[#282828] text-gray-500 hover:text-gray-300'
            : 'bg-white border border-gray-200 text-gray-400 hover:text-gray-600'
          }`}
        title="Scroll to bottom"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    )}
  </div>
);

export default ScrollButtons;
