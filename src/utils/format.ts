// Formatting helpers.

export const formatUsd = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export const formatNumber = (value: number): string =>
  value.toLocaleString('en-US')

export const formatPct = (value: number, withSign = false): string => {
  const sign = withSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Format an ISO date as e.g. "Jun 5, 2026"
export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${months[m - 1]} ${d}, ${y}`
}

// "today" is fixed for the prototype so the demo always reads consistently.
export const TODAY = '2026-06-09'

export const daysAgo = (iso: string): string => {
  const a = new Date(`${TODAY}T00:00:00`)
  const b = new Date(`${iso}T00:00:00`)
  const diff = Math.round((a.getTime() - b.getTime()) / 86_400_000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
