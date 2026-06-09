// Tiny dependency-free SVG charts for the executive-demo look.

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
}: {
  data: { label: string; value: number }[]
  height?: number
  tone?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => {
        const h = (d.value / max) * (height - 28)
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500">
              {d.value >= 1_000_000
                ? `$${(d.value / 1_000_000).toFixed(1)}M`
                : d.value >= 1000
                  ? `${(d.value / 1000).toFixed(0)}k`
                  : d.value}
            </span>
            <div
              className="w-full max-w-[42px] rounded-t-md transition-all"
              style={{ height: Math.max(h, 3), background: `linear-gradient(to top, ${tone}, ${tone}bb)` }}
            />
            <span className="max-w-full truncate text-[10px] text-slate-400" title={d.label}>
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
