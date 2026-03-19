import React from 'react';

const ScrollButtons = ({ atTop, atBottom, scrollToTop, scrollToBottom, darkMode }) => (
  <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 z-10 opacity-0 group-hover/logpanel:opacity-100 pointer-events-none group-hover/logpanel:pointer-events-auto transition-opacity duration-100">
    {!atTop && (
      <button
        onClick={scrollToTop}
        className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#5F6368] bg-[#1E1E1E] text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED] hover:border-[#80868B]'
      : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]'
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
      ? 'border-[#5F6368] bg-[#1E1E1E] text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED] hover:border-[#80868B]'
      : 'border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]'
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
