import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/Home'
import StoragePage from './pages/Storage'
import SettingsPage from './pages/Settings'

export default function App() {
  const setSystemDark = useAppStore((s) => s.setSystemDark)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setSystemDark])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/logs" element={<></>} />
        <Route path="/storage" element={<StoragePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
