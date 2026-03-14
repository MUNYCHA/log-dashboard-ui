import React from 'react';

const ScrollButtons = ({ atTop, atBottom, scrollToTop, scrollToBottom, darkMode }) => (
  <div className="absolute right-3 bottom-3 flex flex-col gap-1 z-10">
    {!atTop && (
      <button
        onClick={scrollToTop}
        className={`p-2 rounded-md border transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
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
        className={`p-2 rounded-md border transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
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
