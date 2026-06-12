// B-2: desktop notifications (Notification API) for due/overdue tasks and new
// synced mail — shown while the app is open (incl. a backgrounded tab). No push
// server: real "app closed" push needs a backend, which this prototype doesn't
// have. Clicking a notification focuses the window and navigates in-app.

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export const notifySupported = (): boolean => typeof window !== 'undefined' && 'Notification' in window

export const notifyPermission = (): NotifyPermission => (notifySupported() ? (Notification.permission as NotifyPermission) : 'unsupported')

export async function requestNotifyPermission(): Promise<boolean> {
  if (!notifySupported()) return false
  if (Notification.permission === 'granted') return true
  try {
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/** Show a notification (no-op without permission). Click → focus + in-app nav. */
export function showNotification(title: string, opts: { body?: string; tag?: string; url?: string } = {}): boolean {
  if (!notifySupported() || Notification.permission !== 'granted') return false
  try {
    const n = new Notification(title, { body: opts.body, tag: opts.tag })
    n.onclick = () => {
      try { window.focus() } catch { /* ignore */ }
      if (opts.url) window.dispatchEvent(new CustomEvent('oac-notify-open', { detail: { url: opts.url } }))
      n.close()
    }
    return true
  } catch {
    return false
  }
}

// De-dup so the same thing isn't notified repeatedly. Keys re-arm daily (the
// stored value is the date it was last fired).
const KEY = 'oac-notified-v1'
type NotifiedMap = Record<string, string>
const today = () => new Date().toISOString().slice(0, 10)

function load(): NotifiedMap {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as NotifiedMap } catch { return {} }
}

/** True if `key` was already notified today (so callers can skip re-firing). */
export function alreadyNotifiedToday(key: string): boolean {
  return load()[key] === today()
}

export function markNotified(key: string): void {
  try {
    const m = load()
    m[key] = today()
    // prune anything not from today to keep it small
    const t = today()
    for (const k of Object.keys(m)) if (m[k] !== t) delete m[k]
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    /* ignore */
  }
}
