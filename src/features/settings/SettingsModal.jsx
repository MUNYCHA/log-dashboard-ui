import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import SortChip from './SortChip';
import ToggleSwitch from './ToggleSwitch';
import SettingRow from './SettingRow';

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
            className={`fixed top-0 left-0 bottom-0 z-[60] flex flex-col overflow-hidden border-r shadow-2xl
                        w-[90vw] max-w-[480px]
                        ${darkMode ? 'border-[#2A2B2E] bg-[#1C1C1E] text-[#E8EAED]' : 'border-[#E8EAED] bg-[#FAFAFA] text-[#202124]'}`}
          >
            {/* Header */}
            <div className={`flex flex-shrink-0 items-center justify-between px-6 py-5 border-b ${darkMode ? 'border-[#2A2B2E]' : 'border-[#EBEBEB]'}`}>
              <div>
                <h2 className="text-[20px] font-bold tracking-tight">Settings</h2>
                <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#9AA0A6]' : 'text-[#80868B]'}`}>Log Dashboard</p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 ease-in-out active:scale-95 ${
                  darkMode
                    ? 'text-[#9AA0A6] hover:bg-[#303134] hover:text-[#E8EAED]'
                    : 'text-[#5F6368] hover:bg-[#EBEBEB] hover:text-[#202124]'
                }`}
              >
                <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">

              {/* Appearance section */}
              <div className="px-6 pt-7 pb-2">
                <div className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-1 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`}>
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
                  icon={
                    themeMode === 'dark'
                      ? <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                      : themeMode === 'system'
                        ? <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" /></svg>
                        : <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.5m0 13V21m9-9h-2.5M5.5 12H3m15.364 6.364-1.768-1.768M7.404 7.404 5.636 5.636m12.728 0-1.768 1.768M7.404 16.596l-1.768 1.768" /><circle cx="12" cy="12" r="3.25" strokeWidth="2" /></svg>
                  }
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
              <div className={`mx-6 border-t ${darkMode ? 'border-[#2A2B2E]' : 'border-[#EBEBEB]'}`} />

              {/* Layout section */}
              <div className="px-6 pt-7 pb-8">
                <div className={`text-[11px] font-bold uppercase tracking-[0.1em] mb-1 ${darkMode ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`}>
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
