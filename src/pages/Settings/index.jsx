import useAppStore, { selectTheme } from '../../store/useAppStore'

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
]

export default function SettingsPage() {
  const theme = useAppStore(selectTheme)
  const darkMode = useAppStore((s) =>
    s.themeMode === 'dark' || (s.themeMode === 'system' && s.systemDark)
  )
  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)

  return (
    <div className={`flex-1 p-6 overflow-auto ${theme.scrollbar}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Settings</h1>

        <div className={`${theme.card} rounded-2xl p-5`}>
          <h2 className={`text-[14px] font-semibold mb-1 ${theme.text}`}>Appearance</h2>
          <p className={`text-[12px] mb-4 ${theme.textSecondary}`}>Choose how the dashboard looks</p>

          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = themeMode === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setThemeMode(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-150 ease-in-out active:scale-[0.98] ${
                    isSelected
                      ? darkMode
                        ? 'border-[#8AB4F8] bg-[#1A3A6B]/30 text-[#8AB4F8]'
                        : 'border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]'
                      : darkMode
                        ? 'border-[#303134] bg-[#1E1E1E] text-[#BDC1C6] hover:border-[#5F6368]'
                        : 'border-[#E8EAED] bg-white text-[#5F6368] hover:border-[#BDC1C6]'
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {opt.icon}
                  </svg>
                  <span className="text-[13px] font-medium">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
