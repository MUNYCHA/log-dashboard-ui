import { useEffect, useState, useMemo } from 'react'
import useAppStore, { selectTheme, selectDarkMode } from '../../store/useAppStore'
import config from '../../config'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function statusInfo(pct) {
  if (pct >= 90) return { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-500', bar: 'bg-red-500', dot: 'bg-red-500' }
  if (pct >= 75) return { label: 'Warning', bg: 'bg-amber-500/10', text: 'text-amber-500', bar: 'bg-amber-500', dot: 'bg-amber-500' }
  return { label: 'Healthy', bg: 'bg-emerald-500/10', text: 'text-emerald-500', bar: 'bg-emerald-500', dot: 'bg-emerald-500' }
}

function StatusChip({ usedPercent }) {
  const s = statusInfo(usedPercent)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function UsageBar({ usedPercent, dark }) {
  const s = statusInfo(usedPercent)
  return (
    <div className={`w-full h-2 rounded-full ${dark ? 'bg-white/[0.08]' : 'bg-black/[0.06]'} overflow-hidden`}>
      <div
        className={`h-full rounded-full ${s.bar} transition-all duration-500`}
        style={{ width: `${Math.min(usedPercent, 100)}%` }}
      />
    </div>
  )
}

/* ── Overview card with combined usage bar ── */
function OverviewCard({ summary, theme, dark }) {
  const usedPct = summary.totalBytes > 0 ? (summary.usedBytes / summary.totalBytes) * 100 : 0
  const freeBytes = summary.totalBytes - summary.usedBytes
  const s = statusInfo(usedPct)

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.card} p-6`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className={`text-[13px] ${theme.textMuted} mb-1`}>Total storage across all systems</div>
          <div className={`text-[28px] font-semibold tracking-tight tabular-nums ${theme.text}`}>
            {formatBytes(summary.usedBytes)}
            <span className={`text-[15px] font-normal ${theme.textMuted}`}> / {formatBytes(summary.totalBytes)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[13px] ${theme.textMuted} mb-1`}>Available</div>
          <div className={`text-[20px] font-semibold tabular-nums ${theme.text}`}>{formatBytes(freeBytes)}</div>
        </div>
      </div>

      <div className={`w-full h-3 rounded-full ${dark ? 'bg-white/[0.08]' : 'bg-black/[0.06]'} overflow-hidden mb-4`}>
        <div
          className={`h-full rounded-full ${s.bar} transition-all duration-700`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <Stat label="Systems" value={summary.systemCount} theme={theme} />
        <Stat label="Servers" value={summary.serverCount} theme={theme} />
        <Stat label="Mounts" value={summary.mountCount} theme={theme} />
        {summary.critical > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {summary.critical} critical
          </span>
        )}
        {summary.warning > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {summary.warning} warning
          </span>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, theme }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[12px] ${theme.textMuted}`}>{label}</span>
      <span className={`text-[13px] font-semibold tabular-nums ${theme.text}`}>{value}</span>
    </div>
  )
}

/* ── Mount path row (indented under server) ── */
function MountRow({ mount, theme, dark }) {
  const s = statusInfo(mount.usedPercent)
  const free = mount.totalBytes - mount.usedBytes

  return (
    <div className={`ml-9 py-2.5 flex items-center gap-4 border-t ${theme.border}`}>
      <code className={`text-[12px] ${theme.textMuted} w-28 shrink-0 truncate`}>{mount.path}</code>
      <div className="flex-1 max-w-48">
        <UsageBar usedPercent={mount.usedPercent} dark={dark} />
      </div>
      <span className={`text-[12px] tabular-nums font-medium w-14 text-right ${s.text}`}>
        {mount.usedPercent.toFixed(1)}%
      </span>
      <span className={`text-[12px] tabular-nums ${theme.textSecondary} w-20 text-right`}>
        {formatBytes(mount.usedBytes)}
      </span>
      <span className={`text-[12px] tabular-nums ${theme.textMuted} w-20 text-right hidden sm:block`}>
        {formatBytes(mount.totalBytes)}
      </span>
      <span className={`text-[12px] tabular-nums ${theme.textMuted} w-20 text-right hidden sm:block`}>
        {formatBytes(free)}
      </span>
    </div>
  )
}

/* ── Server row with expandable mounts ── */
function ServerRow({ server, theme, dark }) {
  const [expanded, setExpanded] = useState(true)
  const maxPercent = Math.max(...server.mountPathStorageUsages.map((m) => m.usedPercent))

  return (
    <div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${theme.hover} rounded-lg group`}
      >
        <svg
          className={`w-4 h-4 ${theme.textMuted} transition-transform duration-200 shrink-0 ${expanded ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-medium ${theme.text}`}>{server.serverName}</span>
            <span className={`text-[11px] ${theme.textMuted}`}>{server.serverIp}</span>
          </div>
        </div>

        <span className={`text-[11px] ${theme.textMuted} hidden sm:block`}>{timeAgo(server.collectedAt)}</span>

        <StatusChip usedPercent={maxPercent} />

        <span className={`text-[12px] tabular-nums font-medium w-14 text-right ${statusInfo(maxPercent).text}`}>
          {maxPercent.toFixed(1)}%
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-2">
          {/* Mount header */}
          <div className={`ml-9 flex items-center gap-4 pb-1.5 text-[11px] ${theme.textMuted} font-medium uppercase tracking-wider`}>
            <span className="w-28 shrink-0">Path</span>
            <span className="flex-1 max-w-48">Usage</span>
            <span className="w-14 text-right">%</span>
            <span className="w-20 text-right">Used</span>
            <span className="w-20 text-right hidden sm:block">Total</span>
            <span className="w-20 text-right hidden sm:block">Free</span>
          </div>
          {server.mountPathStorageUsages.map((mount) => (
            <MountRow key={mount.path} mount={mount} theme={theme} dark={dark} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── System section (outlined card) ── */
function SystemSection({ systemName, servers, theme, dark }) {
  const allMounts = servers.flatMap((s) => s.mountPathStorageUsages)
  const totalBytes = allMounts.reduce((sum, m) => sum + m.totalBytes, 0)
  const usedBytes = allMounts.reduce((sum, m) => sum + m.usedBytes, 0)
  const systemPct = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0

  return (
    <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
      {/* System header */}
      <div className={`px-5 py-4 flex items-center justify-between border-b ${theme.border}`}>
        <div>
          <h2 className={`text-[15px] font-semibold ${theme.text}`}>{systemName}</h2>
          <div className={`text-[12px] ${theme.textMuted} mt-0.5`}>
            {servers.length} server{servers.length > 1 ? 's'  : ''} &middot; {formatBytes(usedBytes)} of {formatBytes(totalBytes)} used
          </div>
        </div>
        <StatusChip usedPercent={systemPct} />
      </div>

      {/* Server rows */}
      <div className="divide-y divide-transparent">
        {servers.map((server) => (
          <ServerRow
            key={`${server.systemId}-${server.serverIp}`}
            server={server}
            theme={theme}
            dark={dark}
          />
        ))}
      </div>
    </div>
  )
}

export default function StoragePage() {
  const theme = useAppStore(selectTheme)
  const dark = useAppStore(selectDarkMode)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(`${config.storageApiUrl}/api/server-storage-usage/latest`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setServers(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const systemGroups = useMemo(() => {
    const grouped = new Map()
    for (const server of servers) {
      if (!grouped.has(server.systemId)) {
        grouped.set(server.systemId, { systemName: server.systemName, servers: [] })
      }
      grouped.get(server.systemId).servers.push(server)
    }
    return [...grouped.values()]
      .sort((a, b) => a.systemName.localeCompare(b.systemName))
      .map((group) => ({
        ...group,
        servers: group.servers.sort((a, b) => {
          const maxA = Math.max(...a.mountPathStorageUsages.map((m) => m.usedPercent))
          const maxB = Math.max(...b.mountPathStorageUsages.map((m) => m.usedPercent))
          return maxB - maxA
        }),
      }))
  }, [servers])

  const summary = useMemo(() => {
    const allMounts = servers.flatMap((s) => s.mountPathStorageUsages)
    const totalBytes = allMounts.reduce((sum, m) => sum + m.totalBytes, 0)
    const usedBytes = allMounts.reduce((sum, m) => sum + m.usedBytes, 0)
    const critical = allMounts.filter((m) => m.usedPercent >= 90).length
    const warning = allMounts.filter((m) => m.usedPercent >= 75 && m.usedPercent < 90).length
    return { totalBytes, usedBytes, critical, warning, systemCount: systemGroups.length, serverCount: servers.length, mountCount: allMounts.length }
  }, [servers, systemGroups])

  return (
    <div className={`flex-1 p-6 overflow-auto ${theme.scrollbar}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${theme.text}`}>Storage</h1>
          <p className={`text-[14px] ${theme.textSecondary}`}>Server disk usage overview</p>
        </div>

        {loading && (
          <div className={`rounded-xl border ${theme.border} p-12 text-center`}>
            <div className={`text-[14px] ${theme.textMuted} animate-pulse`}>Loading storage data...</div>
          </div>
        )}

        {error && (
          <div className={`rounded-xl border border-red-500/30 p-5`}>
            <div className="text-red-500 text-[14px] font-medium mb-1">Failed to load storage data</div>
            <div className={`text-[13px] ${theme.textMuted}`}>{error}</div>
            <button
              onClick={() => window.location.reload()}
              className={`mt-3 text-[13px] px-3 py-1.5 rounded-lg ${theme.button}`}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && servers.length === 0 && (
          <div className={`rounded-xl border ${theme.border} p-12 text-center`}>
            <div className={`text-[14px] ${theme.textMuted}`}>No storage data available</div>
          </div>
        )}

        {!loading && !error && servers.length > 0 && (
          <>
            <OverviewCard summary={summary} theme={theme} dark={dark} />

            <div className="space-y-4">
              {systemGroups.map((group) => (
                <SystemSection
                  key={group.systemName}
                  systemName={group.systemName}
                  servers={group.servers}
                  theme={theme}
                  dark={dark}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
