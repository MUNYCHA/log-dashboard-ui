import { Outlet, useLocation } from 'react-router-dom'
import useAppStore, { selectTheme } from '../../store/useAppStore'
import NavSidebar from '../sidebar/NavSidebar'
import BottomNav from './BottomNav'
import LogsPage from '../../pages/Logs'

export default function AppShell() {
  const theme = useAppStore(selectTheme)
  const location = useLocation()
  const isLogs = location.pathname === '/logs'

  return (
    <div className={`
      flex flex-col h-screen overflow-hidden
      p-2 gap-2
      md:flex-row
      ${theme.background} ${theme.text} transition-colors duration-200
    `}>
      {/* Desktop sidebar */}
      <NavSidebar />

      {/* Main content area */}
      <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* LogsPage always mounted — WebSocket stays alive across navigation */}
        <div className={`flex-1 min-w-0 overflow-hidden ${isLogs ? 'flex' : 'hidden'}`}>
          <LogsPage />
        </div>

        {/* All other pages via Outlet */}
        {!isLogs && <Outlet />}
      </div>

      {/* Mobile bottom nav — flex-shrink-0 in the column, no fixed positioning */}
      <BottomNav />
    </div>
  )
}
