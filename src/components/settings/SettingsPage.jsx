import React from 'react';

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const SettingsPage = ({ darkMode, themeMode, onSetThemeMode, theme }) => (
  <div className="flex flex-col flex-1 min-w-0 min-h-0">
    <div className={`flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden ${theme.card}`}>

      {/* Header */}
      <div className={`flex-shrink-0 px-5 py-4 border-b ${
        darkMode ? 'border-[#3C4043] bg-[#252525]' : 'border-[#E8EAED] bg-[#FAFAFA]'
      }`}>
        <h1 className={`text-[14px] font-semibold ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Settings</h1>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-4 ${theme.scrollbar}`}>
        <div className="flex flex-col gap-6 max-w-2xl pb-2">

          <div>
            <h2 className={`text-[11px] font-semibold tracking-wider uppercase mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
              Appearance
            </h2>
            <div className={`rounded-xl overflow-hidden border ${
              darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F8F9FA] border-[#E8EAED]'
            }`}>
              <div className="px-5 py-4 flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className={`text-[13.5px] font-medium ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Theme</p>
                  <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                    Choose dark, light, or follow your system setting
                  </p>
                </div>
                <div className={`flex-shrink-0 flex items-center gap-1 rounded-xl p-1 ${
                  darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'
                }`}>
                  {THEME_OPTIONS.map((opt) => {
                    const active = themeMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onSetThemeMode(opt.value)}
                        title={opt.label}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                          active
                            ? darkMode
                              ? 'bg-[#1E1E1E] text-[#8AB4F8] shadow-sm'
                              : 'bg-white text-[#1A73E8] shadow-sm'
                            : darkMode
                              ? 'text-[#80868B] hover:text-[#BDC1C6]'
                              : 'text-[#5F6368] hover:text-[#202124]'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);

export default SettingsPage;
