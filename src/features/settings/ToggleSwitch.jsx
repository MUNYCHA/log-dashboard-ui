import React from 'react';

const ToggleSwitch = ({ checked, onChange, darkMode, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-[28px] w-[52px] flex-shrink-0 rounded-full transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
      checked
        ? darkMode
          ? 'bg-[#8AB4F8] focus-visible:ring-[#8AB4F8]'
          : 'bg-[#1A73E8] focus-visible:ring-[#1A73E8]'
        : darkMode
          ? 'bg-[#5F6368] focus-visible:ring-[#5F6368]'
          : 'bg-[#DADCE0] focus-visible:ring-[#BDC1C6]'
    }`}
  >
    <span
      className={`absolute top-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200 ease-out ${
        checked ? 'translate-x-[24px]' : 'translate-x-0'
      }`}
    />
  </button>
);

export default ToggleSwitch;
