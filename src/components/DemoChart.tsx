// Tiny dependency-free SVG charts for the executive-demo look.

// Shared categorical palette for multi-series charts (pie / grouped bars).
export const CHART_COLORS = ['#1f48f0', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#64748b', '#14b8a6']

// Multi-segment donut (composition / share) with an optional legend.
export function PieChart({
  data,
  size = 180,
  thickness = 26,
  unit = '',
}: {
  data: { label: string; value: number }[]
  size?: number
  thickness?: number
  unit?: string
}) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1
  const r = (size - thickness) / 2
  const c = size / 2
  const fmt = (n: number) => (unit === 'yen' ? '¥' : '') + Math.round(n).toLocaleString()
  let acc = 0
  const segs = data.map((d, i) => {
    const start = (acc / total) * 2 * Math.PI
    acc += Math.max(0, d.value)
    const end = (acc / total) * 2 * Math.PI
    const large = end - start > Math.PI ? 1 : 0
    const x1 = c + r * Math.cos(start - Math.PI / 2)
    const y1 = c + r * Math.sin(start - Math.PI / 2)
    const x2 = c + r * Math.cos(end - Math.PI / 2)
    const y2 = c + r * Math.sin(end - Math.PI / 2)
    return { label: d.label, value: d.value, color: CHART_COLORS[i % CHART_COLORS.length], path: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`, pct: (d.value / total) * 100 }
  })
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg width={size} height={size} className="shrink-0">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} className="dark:opacity-20" />
        {segs.map((s) => (
          <path key={s.label} d={s.path} fill="none" stroke={s.color} strokeWidth={thickness} transform={`rotate(0 ${c} ${c})`} />
        ))}
        <text x={c} y={c - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">{unit === 'yen' ? 'JPY' : 'Total'}</text>
        <text x={c} y={c + 12} textAnchor="middle" className="fill-slate-800 text-xs font-bold dark:fill-slate-100">{fmt(total)}</text>
      </svg>
      <ul className="min-w-[140px] flex-1 space-y-1">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[11px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300" title={s.label}>{s.label}</span>
            <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-200">{s.pct.toFixed(0)}%</span>
            <span className="w-20 shrink-0 text-right text-slate-500">{fmt(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  tone = '#1f48f0',
}: {
  data: number[]
  width?: number
  height?: number
  tone?: string
}) {
  if (data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const step = width / Math.max(data.length - 1, 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / span) * (height - 4) - 2
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${path} L${width},${height} L0,${height} Z`
  const id = `spark-${tone.replace('#', '')}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.18" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={tone} />
      )}
    </svg>
  )
}

export function BarChart({
  data,
  height = 160,
  tone = '#1f48f0',
  unit = '',
}: {
  data: { label: string; value: number }[]
  height?: number
  tone?: string
  unit?: 'yen' | ''
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const sym = unit === 'yen' ? '¥' : ''
  const abbr = (v: number) =>
    v >= 1_000_000 ? `${sym}${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${sym}${(v / 1000).toFixed(0)}k` : `${sym}${Math.round(v)}`
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => {
        const h = (d.value / max) * (height - 28)
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500">{abbr(d.value)}</span>
            <div
              className="w-full max-w-[42px] rounded-t-md transition-all"
              style={{ height: Math.max(h, 3), background: `linear-gradient(to top, ${tone}, ${tone}bb)` }}
            />
            <span className="max-w-full truncate text-[10px] text-slate-500" title={d.label}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Horizontal progress / gauge bar
export function GaugeBar({ value, tone = '#1f48f0' }: { value: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }}
      />
    </div>
  )
}

// Donut chart for share/percentage
export function Donut({
  value,
  size = 64,
  tone = '#1f48f0',
  label,
}: {
  value: number
  size?: number
  tone?: string
  label?: string
}) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-slate-700">{label ?? `${value}`}</span>
    </div>
  )
}
