import React from 'react';

const ScrollButtons = ({ atTop, atBottom, scrollToTop, scrollToBottom, darkMode }) => (
  <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 z-10">
    {!atTop && (
      <button
        onClick={scrollToTop}
        className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
      : 'border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
    }`}
        title="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    )}
    {!atBottom && (
      <button
        onClick={scrollToBottom}
        className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#3F3A34] bg-[#252320] text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC] hover:border-[#4F4A44]'
      : 'border-[#C5BEB7] bg-[#FFFDF9] text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A] hover:border-[#A39E97]'
    }`}
        title="Scroll to bottom"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    )}
  </div>
);

export default ScrollButtons;
