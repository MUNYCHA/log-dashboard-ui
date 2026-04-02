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

const SettingRow = ({ icon, title, description, control, darkMode, last }) => (
  <div className={`flex items-center justify-between gap-4 px-1 py-4 ${
    !last ? `border-b ${darkMode ? 'border-[#303134]' : 'border-[#F1F3F4]'}` : ''
  }`}>
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex-shrink-0 ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium">{title}</div>
        {description && (
          <div className={`mt-0.5 text-[12px] ${darkMode ? 'text-[#9AA0A6]' : 'text-[#80868B]'}`}>{description}</div>
        )}
      </div>
    </div>
    <div className="flex-shrink-0">{control}</div>
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
        <>
          {/* Backdrop */}
          <Motion.div
            className="fixed inset-0 z-[59] bg-[#202124]/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }}
          />

          {/* Drawer */}
          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            ref={dialogRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className={`fixed top-0 left-0 bottom-0 z-[60] flex flex-col overflow-hidden border-r shadow-xl
                        w-[90vw] max-w-[520px]
                        ${darkMode ? 'border-[#303134] bg-[#1E1E1E] text-[#E8EAED]' : 'border-[#E8EAED] bg-white text-[#202124]'}`}
          >
            {/* Header */}
            <div className={`flex flex-shrink-0 items-center justify-between px-6 py-5 border-b ${darkMode ? 'border-[#303134]' : 'border-[#E8EAED]'}`}>
              <h2 className="text-[16px] font-semibold tracking-tight">Settings</h2>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ease-in-out active:scale-95 ${
                  darkMode
                    ? 'text-[#9AA0A6] hover:bg-[#303134] hover:text-[#E8EAED]'
                    : 'text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124]'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">

              {/* Appearance section */}
              <div className="px-6 pt-6 pb-2">
                <div className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  Appearance
                </div>
                <SettingRow
                  darkMode={darkMode}
                  title="Theme"
                  description={themeMode === 'system' ? `System default (${darkMode ? 'Dark' : 'Light'})` : themeMode === 'dark' ? 'Dark' : 'Light'}
                  control={
                    <div className="flex gap-1.5">
                      <SortChip active={themeMode === 'light'} onClick={() => onThemeModeChange('light')} darkMode={darkMode}>Light</SortChip>
                      <SortChip active={themeMode === 'dark'} onClick={() => onThemeModeChange('dark')} darkMode={darkMode}>Dark</SortChip>
                      <SortChip active={themeMode === 'system'} onClick={() => onThemeModeChange('system')} darkMode={darkMode}>System</SortChip>
                    </div>
                  }
                  icon={<svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.5m0 13V21m9-9h-2.5M5.5 12H3m15.364 6.364-1.768-1.768M7.404 7.404 5.636 5.636m12.728 0-1.768 1.768M7.404 16.596l-1.768 1.768" /><circle cx="12" cy="12" r="3.25" strokeWidth="2" /></svg>}
                />
                <SettingRow
                  darkMode={darkMode}
                  last
                  title="Terminal log mode"
                  description="Compact monospace view without cards"
                  control={<ToggleSwitch checked={terminalMode} onChange={onTerminalModeChange} darkMode={darkMode} ariaLabel="Toggle terminal log mode" />}
                  icon={<svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
              </div>

              {/* Divider */}
              <div className={`mx-6 border-t ${darkMode ? 'border-[#303134]' : 'border-[#E8EAED]'}`} />

              {/* Layout section */}
              <div className="px-6 pt-5 pb-6">
                <div className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                  Layout
                </div>
                <SettingRow
                  darkMode={darkMode}
                  title="Collapsed sidebar"
                  description="Icons only, hide topic labels"
                  control={<ToggleSwitch checked={sidebarCollapsed} onChange={onSidebarCollapsedChange} darkMode={darkMode} ariaLabel="Toggle collapsed sidebar" />}
                  icon={<svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16v14H4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5v14" /></svg>}
                />
                <SettingRow
                  darkMode={darkMode}
                  last
                  title="Topic order"
                  description="How topics are sorted in the sidebar"
                  control={
                    <div className="flex gap-1.5">
                      <SortChip active={topicSortMode === 'activity'} onClick={() => onTopicSortModeChange('activity')} darkMode={darkMode}>Active</SortChip>
                      <SortChip active={topicSortMode === 'asc'} onClick={() => onTopicSortModeChange('asc')} darkMode={darkMode}>A–Z</SortChip>
                      <SortChip active={topicSortMode === 'desc'} onClick={() => onTopicSortModeChange('desc')} darkMode={darkMode}>Z–A</SortChip>
                    </div>
                  }
                  icon={<svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M7 12h10M9 17h6" /></svg>}
                />
              </div>

            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
