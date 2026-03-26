import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { styles } from '../constants/theme'

const useAppStore = create(
  persist(
    (set) => ({
      // 'dark' | 'light' | 'system'
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Tracks OS preference (updated by a media query listener in App.jsx)
      systemDark: typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : true,
      setSystemDark: (val) => set({ systemDark: val }),

      sidebarCollapsed: false,
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      sidebarCollapsedByDefault: false,
      setSidebarCollapsedByDefault: (val) => set({ sidebarCollapsedByDefault: val }),

      logAutoScroll: true,
      setLogAutoScroll: (val) => set({ logAutoScroll: val }),

      logTimestampFormat: 'relative',
      setLogTimestampFormat: (val) => set({ logTimestampFormat: val }),

      logDensity: 'comfortable',
      setLogDensity: (val) => set({ logDensity: val }),

      logPauseOnTopicSwitch: false,
      setLogPauseOnTopicSwitch: (val) => set({ logPauseOnTopicSwitch: val }),

      logDefaultTimeRange: 'all',
      setLogDefaultTimeRange: (val) => set({ logDefaultTimeRange: val }),

      logMessageWrap: false,
      setLogMessageWrap: (val) => set({ logMessageWrap: val }),
    }),
    {
      name: 'logdash-prefs',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarCollapsedByDefault: state.sidebarCollapsedByDefault,
        logAutoScroll: state.logAutoScroll,
        logTimestampFormat: state.logTimestampFormat,
        logDensity: state.logDensity,
        logPauseOnTopicSwitch: state.logPauseOnTopicSwitch,
        logDefaultTimeRange: state.logDefaultTimeRange,
        logMessageWrap: state.logMessageWrap,
      }),
    },
  ),
)

export const selectDarkMode = (state) =>
  state.themeMode === 'dark' || (state.themeMode === 'system' && state.systemDark)

export const selectTheme = (state) =>
  selectDarkMode(state) ? styles.dark : styles.light

export const selectLogPrefs = (s) => ({
  autoScroll: s.logAutoScroll,
  timestampFormat: s.logTimestampFormat,
  density: s.logDensity,
  pauseOnTopicSwitch: s.logPauseOnTopicSwitch,
  defaultTimeRange: s.logDefaultTimeRange,
  messageWrap: s.logMessageWrap,
})

export default useAppStore
