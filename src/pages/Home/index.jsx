import { useNavigate } from 'react-router-dom'
import useAppStore, { selectTheme } from '../../store/useAppStore'

export default function HomePage() {
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)

  const features = [
    { name: 'Log Viewer', description: 'Real-time log monitoring across topics', path: '/logs' },
    { name: 'Storage', description: 'Manage storage servers and data', path: '/storage' },
    { name: 'Settings', description: 'Configure your dashboard', path: '/settings' },
  ]

  return (
    <div className={`flex-1 p-6 overflow-auto ${theme.scrollbar}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-2xl font-bold mb-2 ${theme.text}`}>Dashboard</h1>
        <p className={`mb-8 ${theme.textSecondary}`}>Welcome to LogStream - your real-time monitoring dashboard.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className={`${theme.card} rounded-2xl p-5 text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className={`font-semibold text-[15px] mb-1 ${theme.text}`}>{f.name}</div>
              <div className={`text-[13px] ${theme.textSecondary}`}>{f.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
