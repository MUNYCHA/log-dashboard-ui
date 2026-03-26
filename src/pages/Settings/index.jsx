import { useMemo, useState } from 'react'
import useAppStore, { selectTheme, selectDarkMode } from '../../store/useAppStore'

const SECTION_ITEMS = [
  {
    key: 'general',
    label: 'General',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
    ),
  },
  {
    key: 'appearance',
    label: 'Appearance',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    ),
  },
  {
    key: 'log-viewer',
    label: 'Log Viewer',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
]

function ToggleSwitch({ value, onChange, darkMode, label }) {
  const trackClass = value
    ? (darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]')
    : (darkMode ? 'bg-[#5F6368]' : 'bg-[#DADCE0]')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${trackClass}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SegmentedControl({ options, value, onChange, darkMode, ariaLabel }) {
  return (
    <div className={`inline-flex items-center rounded-full p-1 border ${darkMode ? 'border-[#5F6368] bg-[#1E1E1E]' : 'border-[#DADCE0] bg-white'}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              active
                ? (darkMode ? 'bg-[#8AB4F8] text-[#071435]' : 'bg-[#1A73E8] text-white')
                : (darkMode ? 'text-[#BDC1C6] hover:bg-[#303134]' : 'text-[#5F6368] hover:bg-[#F1F3F4]')
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function SettingRow({ title, description, control, border = true, theme }) {
  return (
    <div className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${border ? `border-b ${theme.border}` : ''}`}>
      <div className="min-w-0 pr-2">
        <p className={`text-sm font-semibold ${theme.text}`}>{title}</p>
        <p className={`mt-1 text-xs ${theme.textMuted}`}>{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export default function SettingsPage() {
  const theme = useAppStore(selectTheme)
  const darkMode = useAppStore(selectDarkMode)

  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)

  const sidebarCollapsedByDefault = useAppStore((s) => s.sidebarCollapsedByDefault)
  const setSidebarCollapsedByDefault = useAppStore((s) => s.setSidebarCollapsedByDefault)

  const logAutoScroll = useAppStore((s) => s.logAutoScroll)
  const setLogAutoScroll = useAppStore((s) => s.setLogAutoScroll)

  const logTimestampFormat = useAppStore((s) => s.logTimestampFormat)
  const setLogTimestampFormat = useAppStore((s) => s.setLogTimestampFormat)

  const logDensity = useAppStore((s) => s.logDensity)
  const setLogDensity = useAppStore((s) => s.setLogDensity)

  const logPauseOnTopicSwitch = useAppStore((s) => s.logPauseOnTopicSwitch)
  const setLogPauseOnTopicSwitch = useAppStore((s) => s.setLogPauseOnTopicSwitch)

  const logDefaultTimeRange = useAppStore((s) => s.logDefaultTimeRange)
  const setLogDefaultTimeRange = useAppStore((s) => s.setLogDefaultTimeRange)

  const logMessageWrap = useAppStore((s) => s.logMessageWrap)
  const setLogMessageWrap = useAppStore((s) => s.setLogMessageWrap)

  const [activeSection, setActiveSection] = useState('appearance')

  const navGhostClass = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'

  const navItems = useMemo(() => SECTION_ITEMS, [])

  const appearanceOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  return (
    <div className={`flex-1 overflow-auto p-4 sm:p-6 ${theme.scrollbar}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:gap-6">
        <div className={`hidden md:flex md:w-[180px] md:flex-col md:gap-1.5 md:rounded-2xl md:p-2 ${theme.card}`}>
          {navItems.map((item) => {
            const active = activeSection === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-all duration-150 ${active ? theme.selected : navGhostClass}`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`mb-4 grid grid-cols-3 gap-2 rounded-2xl p-2 md:hidden ${theme.card}`}>
            {navItems.map((item) => {
              const active = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-150 ${active ? theme.selected : navGhostClass}`}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {activeSection === 'general' && (
            <div className={`${theme.card} rounded-2xl p-5`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>General</h2>
              <div className={`mt-3 border-t ${theme.border}`}>
                <SettingRow
                  title="Sidebar default"
                  description="Start with sidebar collapsed"
                  control={(
                    <ToggleSwitch
                      value={sidebarCollapsedByDefault}
                      onChange={setSidebarCollapsedByDefault}
                      darkMode={darkMode}
                      label="Sidebar default"
                    />
                  )}
                  border={false}
                  theme={theme}
                />
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className={`${theme.card} rounded-2xl p-5`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>Appearance</h2>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>Choose how the dashboard looks</p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {appearanceOptions.map((opt) => {
                  const active = themeMode === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setThemeMode(opt.value)}
                      className={`rounded-2xl border p-3 text-left transition-all duration-150 active:scale-[0.98] ${
                        active
                          ? (darkMode ? 'border-2 border-[#8AB4F8] bg-[#1A3A6B]/25' : 'border-2 border-[#1A73E8] bg-[#E8F0FE]')
                          : (darkMode ? 'border-[#303134] bg-[#1E1E1E] hover:border-[#5F6368]' : 'border-[#E8EAED] bg-white hover:border-[#BDC1C6]')
                      }`}
                    >
                      <div className="relative h-14 w-full overflow-hidden rounded-xl border border-black/10">
                        {opt.value === 'light' && (
                          <div className="h-full w-full bg-[#F8F9FA]">
                            <div className="px-3 pt-3">
                              <div className="h-1.5 w-2/3 rounded bg-[#3C4043]" />
                              <div className="mt-2 h-1.5 w-1/2 rounded bg-[#3C4043]" />
                            </div>
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#1A73E8]" />
                          </div>
                        )}

                        {opt.value === 'dark' && (
                          <div className="h-full w-full bg-[#1E1E1E]">
                            <div className="px-3 pt-3">
                              <div className="h-1.5 w-2/3 rounded bg-[#BDC1C6]" />
                              <div className="mt-2 h-1.5 w-1/2 rounded bg-[#BDC1C6]" />
                            </div>
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#8AB4F8]" />
                          </div>
                        )}

                        {opt.value === 'system' && (
                          <div className="flex h-full w-full">
                            <div className="relative h-full w-1/2 bg-[#F8F9FA]">
                              <div className="px-2 pt-3">
                                <div className="h-1.5 w-4/5 rounded bg-[#3C4043]" />
                                <div className="mt-2 h-1.5 w-3/5 rounded bg-[#3C4043]" />
                              </div>
                              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#1A73E8]" />
                            </div>
                            <div className="relative h-full w-1/2 bg-[#1E1E1E]">
                              <div className="px-2 pt-3">
                                <div className="h-1.5 w-4/5 rounded bg-[#BDC1C6]" />
                                <div className="mt-2 h-1.5 w-3/5 rounded bg-[#BDC1C6]" />
                              </div>
                              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#8AB4F8]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <p className={`mt-3 text-sm font-semibold ${theme.text}`}>{opt.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === 'log-viewer' && (
            <div className={`${theme.card} rounded-2xl p-5`}>
              <h2 className={`text-base font-semibold ${theme.text}`}>Log Viewer</h2>
              <div className={`mt-3 border-t ${theme.border}`}>
                <SettingRow
                  title="Auto-scroll"
                  description="Automatically scroll to new logs"
                  control={(
                    <ToggleSwitch
                      value={logAutoScroll}
                      onChange={setLogAutoScroll}
                      darkMode={darkMode}
                      label="Auto-scroll"
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Timestamp format"
                  description="How timestamps are displayed"
                  control={(
                    <SegmentedControl
                      value={logTimestampFormat}
                      onChange={setLogTimestampFormat}
                      darkMode={darkMode}
                      ariaLabel="Timestamp format"
                      options={[
                        { value: 'relative', label: 'Relative' },
                        { value: 'absolute', label: 'Absolute' },
                      ]}
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Log density"
                  description="Space between log entries"
                  control={(
                    <SegmentedControl
                      value={logDensity}
                      onChange={setLogDensity}
                      darkMode={darkMode}
                      ariaLabel="Log density"
                      options={[
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'compact', label: 'Compact' },
                      ]}
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Pause on topic switch"
                  description="Pause stream when switching topics"
                  control={(
                    <ToggleSwitch
                      value={logPauseOnTopicSwitch}
                      onChange={setLogPauseOnTopicSwitch}
                      darkMode={darkMode}
                      label="Pause on topic switch"
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Default time range"
                  description="Initial time filter when opening a topic"
                  control={(
                    <SegmentedControl
                      value={logDefaultTimeRange}
                      onChange={setLogDefaultTimeRange}
                      darkMode={darkMode}
                      ariaLabel="Default time range"
                      options={[
                        { value: 'all', label: 'All' },
                        { value: '1m', label: '1m' },
                        { value: '5m', label: '5m' },
                        { value: '15m', label: '15m' },
                        { value: '1h', label: '1h' },
                      ]}
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Message wrap"
                  description="Wrap long log messages"
                  control={(
                    <ToggleSwitch
                      value={logMessageWrap}
                      onChange={setLogMessageWrap}
                      darkMode={darkMode}
                      label="Message wrap"
                    />
                  )}
                  border={false}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
