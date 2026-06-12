import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAiSettings } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { useT } from '../i18n'
import { notifyPermission, showNotification, alreadyNotifiedToday, markNotified } from '../utils/notify'

// App-wide notifier. When desktop notifications are enabled and permitted, fires
// a once-a-day summary of due/overdue tasks (the new-mail notifications come from
// MsAutoSync). Runs only while the app is open.
export function Notifier() {
  const ai = useAiSettings()
  const store = useCaptureStore()
  const { lang } = useT()
  const navigate = useNavigate()

  // notification click → navigate in-app
  useEffect(() => {
    const on = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail?.url
      if (url) navigate(url)
    }
    window.addEventListener('oac-notify-open', on)
    return () => window.removeEventListener('oac-notify-open', on)
  }, [navigate])

  useEffect(() => {
    if (!ai.notifyEnabled || notifyPermission() !== 'granted') return
    const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

    const scan = () => {
      const day = new Date().toISOString().slice(0, 10)
      const overdue = store.entries.flatMap((e) =>
        e.todos.filter((t) => !t.done && t.due && t.due <= day).map((t) => ({ text: t.text, account: e.accountName })),
      )
      if (!overdue.length) return
      const key = 'due-daily' // re-arms each day via markNotified's date stamp
      if (alreadyNotifiedToday(key)) return
      markNotified(key)
      showNotification(
        L(`마감·연체 ${overdue.length}건`, `${overdue.length} task(s) due/overdue`),
        { body: L(`예: ${overdue[0].text} · ${overdue[0].account}`, `e.g. ${overdue[0].text} · ${overdue[0].account}`), tag: 'oac-due', url: '/' },
      )
    }

    scan()
    const timer = window.setInterval(scan, 15 * 60_000) // re-check every 15 min
    return () => clearInterval(timer)
  }, [ai.notifyEnabled, store.entries, lang])

  return null
}
