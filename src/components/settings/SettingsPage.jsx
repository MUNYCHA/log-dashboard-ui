import React from 'react';
import ThemeToggle from './ThemeToggle';
import config from '../../config';
import { STORAGE_REFRESH_INTERVAL_MS } from '../../hooks/useServerStorage';

const Section = ({ title, children, darkMode }) => (
  <div>
    <h2 className={`text-[11px] font-semibold tracking-wider uppercase mb-3 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
      {title}
    </h2>
    <div className={`rounded-xl overflow-hidden border ${
      darkMode ? 'bg-[#252525] border-[#3C4043]' : 'bg-[#F8F9FA] border-[#E8EAED]'
    }`}>
      {children}
    </div>
  </div>
);

const SettingRow = ({ label, description, children, darkMode, isLast }) => (
  <div className={`px-5 py-4 flex items-center justify-between gap-6 ${
    !isLast ? `border-b ${darkMode ? 'border-[#3C4043]' : 'border-[#E8EAED]'}` : ''
  }`}>
    <div className="min-w-0 flex-1">
      <p className={`text-[13.5px] font-medium ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>{label}</p>
      {description && (
        <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
);

const CodeChip = ({ value, darkMode }) => (
  <span className={`inline-block rounded-lg px-2.5 py-1 text-[12px] font-mono max-w-[200px] truncate ${
    darkMode ? 'bg-[#303134] text-[#BDC1C6]' : 'bg-[#F1F3F4] text-[#3C4043]'
  }`} title={String(value)}>
    {value}
  </span>
);

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
        <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>App configuration</p>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-4 ${theme.scrollbar}`}>
        <div className="flex flex-col gap-6 max-w-2xl pb-2">

          <Section title="Appearance" darkMode={darkMode}>
            <SettingRow
              label="Theme"
              description="Toggle between dark and light mode"
              darkMode={darkMode}
              isLast
            >
              <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
            </SettingRow>
          </Section>

          <Section title="Connection" darkMode={darkMode}>
            <SettingRow
              label="WebSocket URL"
              description="Real-time log stream endpoint"
              darkMode={darkMode}
            >
              <CodeChip value={config.ws.url} darkMode={darkMode} />
            </SettingRow>
            <SettingRow
              label="Storage API URL"
              description="Server storage REST API endpoint"
              darkMode={darkMode}
              isLast
            >
              <CodeChip value={config.storageApiUrl} darkMode={darkMode} />
            </SettingRow>
          </Section>

          <Section title="Data" darkMode={darkMode}>
            <SettingRow
              label="Max logs per topic"
              description="Cap for actively viewed topics"
              darkMode={darkMode}
            >
              <CodeChip value={config.ws.maxLogsPerTopic} darkMode={darkMode} />
            </SettingRow>
            <SettingRow
              label="Storage refresh interval"
              description="How often server storage data is polled"
              darkMode={darkMode}
              isLast
            >
              <CodeChip value={`${STORAGE_REFRESH_INTERVAL_MS / 1000}s`} darkMode={darkMode} />
            </SettingRow>
          </Section>

        </div>
      </div>

    </div>
  </div>
);

export default SettingsPage;
