import React from 'react';

const SunIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M8 21h8M12 17v4" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const MODES = [
  { value: 'light', title: 'Light mode', Icon: SunIcon },
  { value: 'system', title: 'System preference', Icon: MonitorIcon },
  { value: 'dark', title: 'Dark mode', Icon: MoonIcon },
];

const ThemeToggle = ({ themeMode, darkMode, onThemeModeChange }) => {
  const containerClass = darkMode
    ? 'bg-[#303134] border-[#5F6368]'
    : 'bg-[#F1F3F4] border-[#DADCE0]';

  const activeClass = darkMode
    ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]'
    : 'bg-white text-[#1A73E8] shadow-sm';

  const inactiveClass = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#3C4043]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-white';

  return (
    <div className={`flex items-center rounded-xl border p-0.5 gap-0.5 ${containerClass}`}>
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onThemeModeChange(mode.value)}
          title={mode.title}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 ease-in-out active:scale-95 ${themeMode === mode.value ? activeClass : inactiveClass}`}
        >
          <mode.Icon />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
