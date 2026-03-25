import useAppStore, { selectTheme } from '../../store/useAppStore'

export default function StoragePage() {
  const theme = useAppStore(selectTheme)

  return (
    <div className={`flex-1 p-6 overflow-auto ${theme.scrollbar}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-2xl font-bold mb-2 ${theme.text}`}>Storage</h1>
        <p className={theme.textSecondary}>Storage management coming soon.</p>
      </div>
    </div>
  )
}
