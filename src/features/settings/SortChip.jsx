import React from 'react';

const SortChip = ({ active, children, onClick, darkMode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${
      active
        ? darkMode
          ? 'bg-[#8AB4F8] text-[#071435]'
          : 'bg-[#1A73E8] text-white'
        : darkMode
          ? 'bg-[#2A2B2E] text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED]'
          : 'bg-[#F1F3F4] text-[#3C4043] hover:bg-[#E8EAED] hover:text-[#202124]'
    }`}
  >
    {children}
  </button>
);

export default SortChip;
