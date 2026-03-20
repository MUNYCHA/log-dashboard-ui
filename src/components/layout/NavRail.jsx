import React from 'react';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  {
    id: 'servers',
    label: 'Servers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
      </svg>
    ),
  },
];

const SETTINGS_ITEM = {
  id: 'settings',
  label: 'Settings',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const NavItem = ({ label, icon, isActive, onClick, badge, darkMode }) => (
  <button
    onClick={onClick}
    title={label}
    className={`relative flex flex-col items-center gap-1 w-full py-2.5 px-1 rounded-xl transition-all duration-150 ease-in-out active:scale-95 ${
      isActive
        ? darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
        : darkMode ? 'text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#303134]' : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
    }`}
  >
    {badge && (
      <span className={`absolute top-1.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ${darkMode ? 'ring-[#1E1E1E]' : 'ring-white'}`} />
    )}
    {icon}
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);

const NavRail = ({ activeNav, onNavChange, darkMode, isConnected }) => {
  const dividerClass = darkMode ? 'border-[#303134]' : 'border-[#E8EAED]';
  const bgClass = darkMode
    ? 'bg-[#1E1E1E] shadow-[0_1px_3px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)]'
    : 'bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08),0_2px_6px_rgba(60,64,67,0.06)]';
  const allItems = [...NAV_ITEMS, SETTINGS_ITEM];

  return (
    <>
      {/* Desktop nav rail */}
      <div className={`hidden md:flex flex-col flex-shrink-0 w-[72px] rounded-2xl overflow-hidden ${bgClass}`}>
        {/* Logo */}
        <div className={`flex items-center justify-center py-3.5 border-b ${dividerClass}`}>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#1A3A6B]/50' : 'bg-[#E8F0FE]'}`}>
            <svg className={`w-5 h-5 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Main nav items */}
        <div className="flex flex-col gap-1 p-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeNav === item.id}
              onClick={() => onNavChange(item.id)}
              badge={item.id === 'logs' && isConnected}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Settings at bottom */}
        <div className={`p-2 border-t ${dividerClass}`}>
          <NavItem
            label={SETTINGS_ITEM.label}
            icon={SETTINGS_ITEM.icon}
            isActive={activeNav === 'settings'}
            onClick={() => onNavChange('settings')}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t ${
        darkMode ? 'bg-[#1E1E1E] border-[#303134]' : 'bg-white border-[#E8EAED]'
      }`}>
        {allItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-150 ${
              activeNav === item.id
                ? darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'
                : darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default NavRail;
