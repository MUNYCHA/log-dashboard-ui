import React from 'react';
import ThemeToggle from './ThemeToggle';

const SettingsPage = ({ darkMode, onThemeToggle, theme }) => (
  <div className="flex flex-col flex-1 min-w-0 min-h-0">
    <div className={`flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden border ${theme.card} ${
      darkMode ? 'border-[#3C4043]' : 'border-[#DADCE0]'
    }`}>

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
                  <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>Toggle between dark and light mode</p>
                </div>
                <div className="flex-shrink-0">
                  <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
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
