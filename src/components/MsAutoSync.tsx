import { useEffect, useRef } from 'react'
import { useAiSettings } from '../utils/aiSettings'
import { useCaptureStore } from '../data/captureStore'
import { useRelationships } from '../data/useRelationships'
import { useT } from '../i18n'
import { useToast } from './Toast'
import { restore as msRestore } from '../utils/graph'
import { syncMicrosoft } from '../utils/msSync'

// Periodic Outlook/Teams auto-sync (option B). Runs ONLY while the app is open
// and a Microsoft account is connected, every `msAutoSyncMin` minutes (0 = off).
// It imports new mail/Teams (de-duplicated) but does NOT run the per-company AI
// summaries — those cost API tokens, so they stay on the manual Settings button.
export function MsAutoSync() {
  const ai = useAiSettings()
  const store = useCaptureStore()
  const rel = useRelationships()
  const { lang } = useT()
  const toast = useToast()

  // Keep the latest deps in a ref so the interval callback never goes stale.
  const latest = useRef({ store, rel, lang, ai, toast })
  latest.current = { store, rel, lang, ai, toast }

  const interval = ai.msAutoSyncMin
  const clientId = ai.msClientId
  const tenant = ai.msTenant

  useEffect(() => {
    if (!clientId.trim() || !interval || interval <= 0) return
    const conn = { clientId, tenant }
    let cancelled = false
    let timer: number | undefined
    let running = false

    const runOnce = async () => {
      if (running || cancelled) return
      running = true
      try {
        const l = latest.current
        const r = await syncMicrosoft({
          conn,
          lang: l.lang,
          relList: l.rel.list.map((e) => ({ id: e.id, name: e.name })),
          addEntry: l.store.addEntry,
          summarize: false, // auto-sync never spends API budget silently
        })
        if (!cancelled && r.added > 0) {
          l.toast.notify(
            l.lang === 'ko' ? 'Outlook 자동 동기화' : 'Outlook auto-sync',
            l.lang === 'ko' ? `새 항목 ${r.added}건 · 업체 ${r.companies}곳` : `${r.added} new · ${r.companies} companies`,
          )
        }
      } catch {
        /* transient — try again next tick */
      } finally {
        running = false
      }
    }

    // Only start the loop if a session is actually connected (don't trigger a
    // login popup automatically — that would be intrusive on every page load).
    msRestore(conn)
      .then((name) => {
        if (cancelled || !name) return
        runOnce() // initial catch-up sync on open
        timer = window.setInterval(runOnce, interval * 60_000)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, tenant, interval])

  return null
}
