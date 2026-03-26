import { create } from 'zustand'
import { styles } from '../constants/theme'

const useAppStore = create((set) => ({
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
}))

export const selectDarkMode = (state) =>
  state.themeMode === 'dark' || (state.themeMode === 'system' && state.systemDark)

export const selectTheme = (state) =>
  selectDarkMode(state) ? styles.dark : styles.light

export default useAppStore
