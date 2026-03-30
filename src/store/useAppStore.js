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

      // Log viewer — behavior
      logAutoScroll: true,
      setLogAutoScroll: (val) => set({ logAutoScroll: val }),

      logPauseOnTopicSwitch: false,
      setLogPauseOnTopicSwitch: (val) => set({ logPauseOnTopicSwitch: val }),

      // Log viewer — display (log card)
      logDensity: 'comfortable',
      setLogDensity: (val) => set({ logDensity: val }),

      logFontSize: 'medium',
      setLogFontSize: (val) => set({ logFontSize: val }),

      logMessageWrap: false,
      setLogMessageWrap: (val) => set({ logMessageWrap: val }),

      logTimestampFormat: 'relative',
      setLogTimestampFormat: (val) => set({ logTimestampFormat: val }),

      logShowServer: true,
      setLogShowServer: (val) => set({ logShowServer: val }),

      logShowPath: true,
      setLogShowPath: (val) => set({ logShowPath: val }),

      // Log viewer — colors
      // null = use theme default, string = custom color applied to all message text
      logMessageColor: null,
      setLogMessageColor: (val) => set({ logMessageColor: val }),

      // Log viewer — filters
      logDefaultTimeRange: 'all',
      setLogDefaultTimeRange: (val) => set({ logDefaultTimeRange: val }),

      // Log viewer — visibility
      showHeader: true,
      setShowHeader: (val) => set({ showHeader: val }),

      showFilterBar: true,
      setShowFilterBar: (val) => set({ showFilterBar: val }),

      showActiveFilters: true,
      setShowActiveFilters: (val) => set({ showActiveFilters: val }),

      showKeywordFilter: true,
      setShowKeywordFilter: (val) => set({ showKeywordFilter: val }),

      showStatusBar: true,
      setShowStatusBar: (val) => set({ showStatusBar: val }),

      showScrollButtons: true,
      setShowScrollButtons: (val) => set({ showScrollButtons: val }),
    }),
    {
      name: 'logdash-prefs',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarCollapsedByDefault: state.sidebarCollapsedByDefault,
        logAutoScroll: state.logAutoScroll,
        logPauseOnTopicSwitch: state.logPauseOnTopicSwitch,
        logDensity: state.logDensity,
        logFontSize: state.logFontSize,
        logMessageWrap: state.logMessageWrap,
        logTimestampFormat: state.logTimestampFormat,
        logShowServer: state.logShowServer,
        logShowPath: state.logShowPath,
        logMessageColor: state.logMessageColor,
        logDefaultTimeRange: state.logDefaultTimeRange,
        showHeader: state.showHeader,
        showFilterBar: state.showFilterBar,
        showActiveFilters: state.showActiveFilters,
        showKeywordFilter: state.showKeywordFilter,
        showStatusBar: state.showStatusBar,
        showScrollButtons: state.showScrollButtons,
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
  fontSize: s.logFontSize,
  pauseOnTopicSwitch: s.logPauseOnTopicSwitch,
  defaultTimeRange: s.logDefaultTimeRange,
  messageWrap: s.logMessageWrap,
  showServer: s.logShowServer,
  showPath: s.logShowPath,
  messageColor: s.logMessageColor,
})

export default useAppStore
