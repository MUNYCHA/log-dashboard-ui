import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

const SortChip = ({ active, children, onClick, darkMode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all duration-150 ease-in-out active:scale-95 ${
      active
        ? darkMode
          ? 'bg-[#1A3A6B]/60 text-[#8AB4F8] shadow-[inset_0_0_0_1px_rgba(138,180,248,0.24)]'
          : 'bg-[#E8F0FE] text-[#1A73E8] shadow-[inset_0_0_0_1px_rgba(26,115,232,0.12)]'
        : darkMode
          ? 'bg-[#2A2B2E] text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED]'
          : 'bg-[#F1F3F4] text-[#3C4043] hover:bg-[#E8EAED] hover:text-[#202124]'
    }`}
  >
    {children}
  </button>
);

const ToggleSwitch = ({ checked, onChange, darkMode, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-all duration-200 ease-out active:scale-95 ${
      checked
        ? darkMode
          ? 'border-[#8AB4F8]/50 bg-[#1A3A6B]'
          : 'border-[#A8C7FA] bg-[#D2E3FC]'
        : darkMode
          ? 'border-[#5F6368] bg-[#303134]'
          : 'border-[#DADCE0] bg-[#F1F3F4]'
    }`}
  >
    <span
      className={`absolute left-1 inline-flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-200 ease-out ${
        checked ? 'translate-x-6' : 'translate-x-0'
      } ${
        checked
          ? darkMode
            ? 'bg-[#8AB4F8] text-[#071435]'
            : 'bg-[#1A73E8] text-white'
          : darkMode
            ? 'bg-[#BDC1C6] text-[#202124]'
            : 'bg-white text-[#5F6368]'
      }`}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {checked ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12l4 4L19 6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h12" />
        )}
      </svg>
    </span>
  </button>
);

const SettingRow = ({ icon, title, value, control, darkMode }) => (
  <div className={`flex items-center justify-between gap-4 rounded-[24px] border px-4 py-3.5 ${
    darkMode ? 'border-[#303134] bg-[#202124]' : 'border-[#E8EAED] bg-[#F8F9FA]'
  }`}>
    <div className="flex min-w-0 items-center gap-3">
      <div className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
        darkMode ? 'bg-[#303134] text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold">{title}</div>
        <div className={`mt-0.5 text-[12px] ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>{value}</div>
      </div>
    </div>
    <div className="flex-shrink-0">
      {control}
    </div>
  </div>
);

const SettingsModal = ({
  isOpen,
  onClose,
  darkMode,
  themeMode,
  onThemeModeChange,
  topicSortMode,
  onTopicSortModeChange,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  terminalMode,
  onTerminalModeChange,
}) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const focusableItems = Array.from(focusable);
      if (focusableItems.length === 0) return;

      const first = focusableItems[0];
      const last = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <Motion.button
            type="button"
            aria-label="Close settings"
            className="absolute inset-0 bg-[#202124]/50 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06, ease: 'linear' }}
          />

          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            ref={dialogRef}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className={`relative z-10 w-full max-w-[680px] overflow-hidden rounded-[32px] border shadow-[0_18px_48px_rgba(32,33,36,0.28)] ${
              darkMode ? 'border-[#303134] bg-[#1E1E1E] text-[#E8EAED]' : 'border-[#E8EAED] bg-white text-[#202124]'
            }`}
          >
            <div className={`border-b px-6 py-5 ${darkMode ? 'border-[#303134]' : 'border-[#E8EAED]'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[18px] ${
                    darkMode ? 'bg-[#303134] text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
                  }`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.928 1.69 1.724 1.724 0 00.856 2.79 1.724 1.724 0 010 2.984 1.724 1.724 0 00-.856 2.79 1.724 1.724 0 01-2.928 1.69 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.928-1.69 1.724 1.724 0 00-.856-2.79 1.724 1.724 0 010-2.984 1.724 1.724 0 00.856-2.79 1.724 1.724 0 012.928-1.69 1.724 1.724 0 002.573-1.066z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-tight">Settings</h2>
                    <div className={`text-[12px] ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Global dashboard controls</div>
                  </div>
                </div>

                <button
                  type="button"
                  ref={closeButtonRef}
                  onClick={onClose}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-150 ease-in-out active:scale-95 ${
                    darkMode
                      ? 'text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED]'
                      : 'text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124]'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`max-h-[min(78vh,720px)] overflow-y-auto p-6 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
              <div className="space-y-3">
                <SettingRow
                  darkMode={darkMode}
                  title="Theme"
                  value={themeMode === 'system'
                    ? `System (${darkMode ? 'Dark' : 'Light'})`
                    : themeMode === 'dark' ? 'Dark' : 'Light'}
                  control={
                    <div className="flex flex-wrap justify-end gap-2">
                      <SortChip active={themeMode === 'light'} onClick={() => onThemeModeChange('light')} darkMode={darkMode}>
                        Light
                      </SortChip>
                      <SortChip active={themeMode === 'dark'} onClick={() => onThemeModeChange('dark')} darkMode={darkMode}>
                        Dark
                      </SortChip>
                      <SortChip active={themeMode === 'system'} onClick={() => onThemeModeChange('system')} darkMode={darkMode}>
                        System
                      </SortChip>
                    </div>
                  }
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 3v2.5m0 13V21m9-9h-2.5M5.5 12H3m15.364 6.364-1.768-1.768M7.404 7.404 5.636 5.636m12.728 0-1.768 1.768M7.404 16.596l-1.768 1.768" />
                      <circle cx="12" cy="12" r="3.25" strokeWidth="2.2" />
                    </svg>
                  }
                />

                <SettingRow
                  darkMode={darkMode}
                  title="Terminal log mode"
                  value={terminalMode ? 'On' : 'Off'}
                  control={
                    <ToggleSwitch
                      checked={terminalMode}
                      onChange={onTerminalModeChange}
                      darkMode={darkMode}
                      ariaLabel="Toggle terminal log mode"
                    />
                  }
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <SettingRow
                  darkMode={darkMode}
                  title="Collapsed sidebar"
                  value={sidebarCollapsed ? 'On' : 'Off'}
                  control={
                    <ToggleSwitch
                      checked={sidebarCollapsed}
                      onChange={onSidebarCollapsedChange}
                      darkMode={darkMode}
                      ariaLabel="Toggle collapsed sidebar"
                    />
                  }
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4 5h16v14H4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M9 5v14" />
                    </svg>
                  }
                />
              </div>

              <div className={`mt-5 rounded-[24px] border px-4 py-4 ${darkMode ? 'border-[#303134] bg-[#202124]' : 'border-[#E8EAED] bg-[#F8F9FA]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                    darkMode ? 'bg-[#303134] text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
                  }`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4 7h16M7 12h10M9 17h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold">Topic order</div>
                    <div className={`text-[12px] ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Sidebar sorting</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <SortChip active={topicSortMode === 'activity'} onClick={() => onTopicSortModeChange('activity')} darkMode={darkMode}>
                    Active
                  </SortChip>
                  <SortChip active={topicSortMode === 'asc'} onClick={() => onTopicSortModeChange('asc')} darkMode={darkMode}>
                    A-Z
                  </SortChip>
                  <SortChip active={topicSortMode === 'desc'} onClick={() => onTopicSortModeChange('desc')} darkMode={darkMode}>
                    Z-A
                  </SortChip>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
