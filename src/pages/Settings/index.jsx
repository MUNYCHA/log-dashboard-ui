import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore, { selectTheme, selectDarkMode } from '../../store/useAppStore'

const MotionSpan = motion.span

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
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-150 ${
          value ? 'left-6' : 'left-1'
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

function SettingGroup({ title, description, icon, children, theme, darkMode }) {
  return (
    <div className={`${theme.card} rounded-2xl p-5`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${darkMode ? 'bg-[#303134]' : 'bg-[#F1F3F4]'}`}>
          <svg className={`h-3.5 w-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${theme.text}`}>{title}</h3>
          {description && <p className={`text-xs ${theme.textMuted}`}>{description}</p>}
        </div>
      </div>
      <div className={`mt-4 border-t ${theme.border}`}>
        {children}
      </div>
    </div>
  )
}

function SubLabel({ label, theme }) {
  return (
    <p className={`pt-4 pb-0.5 text-[10.5px] font-semibold uppercase tracking-widest ${theme.textMuted}`}>
      {label}
    </p>
  )
}

export default function SettingsPage() {
  const theme = useAppStore(selectTheme)
  const darkMode = useAppStore(selectDarkMode)

  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)

  const sidebarCollapsedByDefault = useAppStore((s) => s.sidebarCollapsedByDefault)
  const setSidebarCollapsedByDefault = useAppStore((s) => s.setSidebarCollapsedByDefault)

  // Behavior
  const logAutoScroll = useAppStore((s) => s.logAutoScroll)
  const setLogAutoScroll = useAppStore((s) => s.setLogAutoScroll)
  const logPauseOnTopicSwitch = useAppStore((s) => s.logPauseOnTopicSwitch)
  const setLogPauseOnTopicSwitch = useAppStore((s) => s.setLogPauseOnTopicSwitch)

  // Display
  const logDensity = useAppStore((s) => s.logDensity)
  const setLogDensity = useAppStore((s) => s.setLogDensity)
  const logFontSize = useAppStore((s) => s.logFontSize)
  const setLogFontSize = useAppStore((s) => s.setLogFontSize)
  const logMessageWrap = useAppStore((s) => s.logMessageWrap)
  const setLogMessageWrap = useAppStore((s) => s.setLogMessageWrap)
  const logTimestampFormat = useAppStore((s) => s.logTimestampFormat)
  const setLogTimestampFormat = useAppStore((s) => s.setLogTimestampFormat)
  const logShowServer = useAppStore((s) => s.logShowServer)
  const setLogShowServer = useAppStore((s) => s.setLogShowServer)
  const logShowPath = useAppStore((s) => s.logShowPath)
  const setLogShowPath = useAppStore((s) => s.setLogShowPath)

  // Filters
  const logDefaultTimeRange = useAppStore((s) => s.logDefaultTimeRange)
  const setLogDefaultTimeRange = useAppStore((s) => s.setLogDefaultTimeRange)

  // Colors
  const logMessageColor = useAppStore((s) => s.logMessageColor)
  const setLogMessageColor = useAppStore((s) => s.setLogMessageColor)

  // Visibility
  const showHeader = useAppStore((s) => s.showHeader)
  const setShowHeader = useAppStore((s) => s.setShowHeader)
  const showFilterBar = useAppStore((s) => s.showFilterBar)
  const setShowFilterBar = useAppStore((s) => s.setShowFilterBar)
  const showActiveFilters = useAppStore((s) => s.showActiveFilters)
  const setShowActiveFilters = useAppStore((s) => s.setShowActiveFilters)
  const showKeywordFilter = useAppStore((s) => s.showKeywordFilter)
  const setShowKeywordFilter = useAppStore((s) => s.setShowKeywordFilter)
  const showStatusBar = useAppStore((s) => s.showStatusBar)
  const setShowStatusBar = useAppStore((s) => s.setShowStatusBar)
  const showScrollButtons = useAppStore((s) => s.showScrollButtons)
  const setShowScrollButtons = useAppStore((s) => s.setShowScrollButtons)

  const [activeSection, setActiveSection] = useState('appearance')
  const [hexDraft, setHexDraft] = useState(null)

  const hexToRgb = (hex) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '')
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 232, g: 234, b: 237 }
  }

  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')

  const msgRgb = hexToRgb(logMessageColor)

  const handleMsgChannel = (ch, raw) => {
    const n = Math.max(0, Math.min(255, parseInt(raw) || 0))
    const next = { ...msgRgb, [ch]: n }
    setLogMessageColor(rgbToHex(next.r, next.g, next.b))
  }

  const navGhostClass = darkMode
    ? 'text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]'
    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'

  const navItems = useMemo(() => SECTION_ITEMS, [])

  const appearanceOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  const resetVisibility = () => {
    setShowHeader(true)
    setShowFilterBar(true)
    setShowActiveFilters(true)
    setShowKeywordFilter(true)
    setShowStatusBar(true)
    setShowScrollButtons(true)
  }

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden gap-2">
      {/* Desktop sidebar nav */}
      <div className={`hidden md:flex md:flex-col md:flex-shrink-0 md:w-60 lg:w-72 rounded-2xl overflow-hidden ${theme.sidebar}`}>
        <div className="px-4 pt-4 pb-3">
          <h2 className={`text-[13px] font-semibold ${theme.text}`}>Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = activeSection === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-left text-[13.5px] font-medium transition-all duration-150 ease-in-out active:scale-[0.98] hover:translate-x-0.5 ${active ? (darkMode ? 'bg-[#1A3A6B]/50 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]') : navGhostClass}`}
                >
                  {active && (
                    <MotionSpan
                      layoutId="settings-section-indicator"
                      className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${darkMode ? 'bg-[#8AB4F8]' : 'bg-[#1A73E8]'}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={`flex-1 overflow-auto p-4 sm:p-6 ${theme.scrollbar}`}>
        <div className="mx-auto max-w-3xl">
          {/* Mobile tab bar */}
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

          {/* ── General ── */}
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

          {/* ── Appearance ── */}
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

          {/* ── Log Viewer ── */}
          {activeSection === 'log-viewer' && (
            <div className="flex flex-col gap-4">

              {/* Group 1: Log Card */}
              <SettingGroup
                title="Log Card"
                description="How each log entry looks"
                theme={theme}
                darkMode={darkMode}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
              >
                <SubLabel label="Display" theme={theme} />

                <SettingRow
                  title="Density"
                  description="Spacing between log entries"
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
                  title="Font size"
                  description="Size of the log message text"
                  control={(
                    <SegmentedControl
                      value={logFontSize}
                      onChange={setLogFontSize}
                      darkMode={darkMode}
                      ariaLabel="Font size"
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ]}
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Message wrap"
                  description="Wrap long log messages onto multiple lines"
                  control={(
                    <ToggleSwitch
                      value={logMessageWrap}
                      onChange={setLogMessageWrap}
                      darkMode={darkMode}
                      label="Message wrap"
                    />
                  )}
                  theme={theme}
                />

                <SubLabel label="Header" theme={theme} />

                <SettingRow
                  title="Timestamp"
                  description="How timestamps appear in each entry"
                  control={(
                    <SegmentedControl
                      value={logTimestampFormat}
                      onChange={setLogTimestampFormat}
                      darkMode={darkMode}
                      ariaLabel="Timestamp format"
                      options={[
                        { value: 'relative', label: 'Relative' },
                        { value: 'absolute', label: 'Absolute' },
                        { value: 'hidden', label: 'Hidden' },
                      ]}
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Server badge"
                  description="Show the server name chip on each log entry"
                  control={(
                    <ToggleSwitch
                      value={logShowServer}
                      onChange={setLogShowServer}
                      darkMode={darkMode}
                      label="Show server badge"
                    />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Path"
                  description="Show the path on each log entry"
                  control={(
                    <ToggleSwitch
                      value={logShowPath}
                      onChange={setLogShowPath}
                      darkMode={darkMode}
                      label="Show path"
                    />
                  )}
                  theme={theme}
                />

                <SubLabel label="Colors" theme={theme} />

                <SettingRow
                  title="Message color"
                  description={logMessageColor ? 'Custom color applied to all message text' : 'Using theme default text color'}
                  control={(
                    <ToggleSwitch
                      value={logMessageColor !== null}
                      onChange={(on) => { setLogMessageColor(on ? (darkMode ? '#e8eaed' : '#202124') : null); setHexDraft(null) }}
                      darkMode={darkMode}
                      label="Custom message color"
                    />
                  )}
                  border={logMessageColor === null}
                  theme={theme}
                />

                {logMessageColor && (
                  <div className={`pb-5 border-b ${theme.border}`}>
                    {/* Ring swatch + hex row */}
                    <div className="flex items-center gap-3 mt-1 mb-4">
                      {/* Circle ring — clicking opens OS color wheel */}
                      <div
                        className="relative w-12 h-12 shrink-0 cursor-pointer group"
                        title="Open color wheel"
                      >
                        <div
                          className="w-12 h-12 rounded-full shadow-lg ring-2 ring-offset-2 transition-transform duration-150 group-hover:scale-105"
                          style={{
                            backgroundColor: logMessageColor,
                            ringColor: darkMode ? '#5F6368' : '#BDC1C6',
                          }}
                        />
                        <input
                          type="color"
                          value={logMessageColor}
                          onChange={(e) => { setLogMessageColor(e.target.value); setHexDraft(null) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                          aria-label="Open color wheel"
                        />
                      </div>

                      {/* Hex input */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${theme.textMuted}`}>Hex</p>
                        <input
                          type="text"
                          value={hexDraft ?? logMessageColor}
                          onFocus={() => setHexDraft(logMessageColor)}
                          onChange={(e) => {
                            setHexDraft(e.target.value)
                            const clean = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
                            if (/^#[0-9a-fA-F]{6}$/.test(clean)) setLogMessageColor(clean.toLowerCase())
                          }}
                          onBlur={() => setHexDraft(null)}
                          className={`w-full rounded-xl px-3 py-2 text-sm font-mono outline-none border transition-all ${
                            darkMode
                              ? 'bg-[#252525] border-[#3F3F3F] text-[#E8EAED] focus:border-[#8AB4F8]'
                              : 'bg-[#F8F9FA] border-[#E8EAED] text-[#202124] focus:border-[#1A73E8]'
                          }`}
                          maxLength={7}
                          spellCheck={false}
                        />
                      </div>

                      {/* Clear */}
                      <button
                        type="button"
                        onClick={() => { setLogMessageColor(null); setHexDraft(null) }}
                        className={`shrink-0 text-xs font-medium transition-colors ${
                          darkMode ? 'text-[#5F6368] hover:text-[#F28B82]' : 'text-[#9AA0A6] hover:text-[#C5221F]'
                        }`}
                      >
                        Clear
                      </button>
                    </div>

                    {/* RGB Sliders */}
                    <div className="flex flex-col gap-3">
                      {[
                        { ch: 'r', label: 'R', val: msgRgb.r, grad: `linear-gradient(to right, rgb(0,${msgRgb.g},${msgRgb.b}), rgb(255,${msgRgb.g},${msgRgb.b}))` },
                        { ch: 'g', label: 'G', val: msgRgb.g, grad: `linear-gradient(to right, rgb(${msgRgb.r},0,${msgRgb.b}), rgb(${msgRgb.r},255,${msgRgb.b}))` },
                        { ch: 'b', label: 'B', val: msgRgb.b, grad: `linear-gradient(to right, rgb(${msgRgb.r},${msgRgb.g},0), rgb(${msgRgb.r},${msgRgb.g},255))` },
                      ].map(({ ch, label, val, grad }) => (
                        <div key={ch} className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold w-3 shrink-0 font-mono ${theme.textMuted}`}>{label}</span>
                          {/* Gradient track + invisible range input + custom thumb */}
                          <div className="relative flex-1 h-5 flex items-center">
                            <div className="absolute inset-x-0 h-2 rounded-full" style={{ background: grad }} />
                            <div
                              className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                              style={{ left: `calc(${(val / 255) * 100}% - 8px)`, backgroundColor: logMessageColor }}
                            />
                            <input
                              type="range"
                              min={0} max={255}
                              value={val}
                              onChange={(e) => handleMsgChannel(ch, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              aria-label={`${label} channel`}
                            />
                          </div>
                          <input
                            type="number"
                            min={0} max={255}
                            value={val}
                            onChange={(e) => handleMsgChannel(ch, e.target.value)}
                            className={`w-12 shrink-0 rounded-lg px-1.5 py-1 text-xs font-mono text-center outline-none border transition-all ${
                              darkMode
                                ? 'bg-[#252525] border-[#3F3F3F] text-[#E8EAED] focus:border-[#8AB4F8]'
                                : 'bg-[#F8F9FA] border-[#E8EAED] text-[#202124] focus:border-[#1A73E8]'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SettingGroup>

              {/* Group 2: Filters */}
              <SettingGroup
                title="Filters"
                description="Default filter state when opening a topic"
                theme={theme}
                darkMode={darkMode}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />}
              >
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
                  border={false}
                  theme={theme}
                />
              </SettingGroup>

              {/* Group 3: Behavior */}
              <SettingGroup
                title="Behavior"
                description="How the log viewer acts"
                theme={theme}
                darkMode={darkMode}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
              >
                <SettingRow
                  title="Auto-scroll"
                  description="Automatically scroll to new log entries"
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
                  title="Pause on topic switch"
                  description="Pause the stream when switching to a different topic"
                  control={(
                    <ToggleSwitch
                      value={logPauseOnTopicSwitch}
                      onChange={setLogPauseOnTopicSwitch}
                      darkMode={darkMode}
                      label="Pause on topic switch"
                    />
                  )}
                  border={false}
                  theme={theme}
                />
              </SettingGroup>

              {/* Group 4: Layout */}
              <SettingGroup
                title="Layout"
                description="Show or hide parts of the log viewer"
                theme={theme}
                darkMode={darkMode}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />}
              >
                <SettingRow
                  title="Header bar"
                  description="Topic name, controls, and action buttons"
                  control={(
                    <ToggleSwitch value={showHeader} onChange={setShowHeader} darkMode={darkMode} label="Header bar" />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Filter bar"
                  description="Server, path, time range, and search inputs"
                  control={(
                    <ToggleSwitch value={showFilterBar} onChange={setShowFilterBar} darkMode={darkMode} label="Filter bar" />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Keyword filter"
                  description="Keyword chip input for filtering and highlighting"
                  control={(
                    <ToggleSwitch value={showKeywordFilter} onChange={setShowKeywordFilter} darkMode={darkMode} label="Keyword filter" />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Active filters"
                  description="Chips showing which filters are currently applied"
                  control={(
                    <ToggleSwitch value={showActiveFilters} onChange={setShowActiveFilters} darkMode={darkMode} label="Active filters" />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Status bar"
                  description="Connection status, log count, and stream mode"
                  control={(
                    <ToggleSwitch value={showStatusBar} onChange={setShowStatusBar} darkMode={darkMode} label="Status bar" />
                  )}
                  theme={theme}
                />

                <SettingRow
                  title="Scroll buttons"
                  description="Floating scroll-to-top and scroll-to-bottom buttons"
                  control={(
                    <ToggleSwitch value={showScrollButtons} onChange={setShowScrollButtons} darkMode={darkMode} label="Scroll buttons" />
                  )}
                  border={false}
                  theme={theme}
                />

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={resetVisibility}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all duration-150 active:scale-[0.98] ${
                      darkMode
                        ? 'border-[#3F3F3F] bg-[#252525] text-[#BDC1C6] hover:bg-[#303134] hover:text-[#E8EAED] hover:border-[#5F6368]'
                        : 'border-[#E8EAED] bg-[#F8F9FA] text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124] hover:border-[#BDC1C6]'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset layout to defaults
                  </button>
                </div>
              </SettingGroup>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
