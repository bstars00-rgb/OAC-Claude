import { useEffect } from 'react'
import { useAiSettings } from '../utils/aiSettings'
import { exportBackup } from '../utils/backup'
import { isConfigured, getSession, onAuthChange, pullState, pushState } from '../utils/supabaseClient'

// Runs app-wide (mounted once in App). When the user has configured Supabase and
// is signed in:
//  • pull on login ONLY if local is empty (fresh device → get your data; never
//    silently overwrite local edits),
//  • otherwise auto-push local changes to the cloud (debounced) so the cloud
//    stays current. Manual upload/download buttons live in Settings.
export function CloudAutoSync() {
  const ai = useAiSettings()
  const cfg = { url: ai.supabaseUrl, anonKey: ai.supabaseAnonKey }

  useEffect(() => {
    if (!isConfigured(cfg)) return
    let cancelled = false
    let unsub = () => {}
    let timer: number | undefined
    let lastPushed = ''

    const localEmpty = () => {
      try {
        const caps = JSON.parse(localStorage.getItem('oac-captures-v1') || '[]')
        const ds = JSON.parse(localStorage.getItem('oac-datasets-v1') || '[]')
        const chat = JSON.parse(localStorage.getItem('oac-chat-v1') || '[]')
        // treat as empty only if there are no captures, datasets, AND no chat —
        // otherwise an auto-pull could overwrite a chat-only device's local data.
        return !caps?.length && !ds?.length && !chat?.length
      } catch {
        return true
      }
    }
    const stateSig = () => exportBackup('').replace(/"exportedAt":"[^"]*"/, '')

    const startPush = () => {
      if (timer) return
      lastPushed = stateSig()
      timer = window.setInterval(async () => {
        try {
          const sig = stateSig()
          if (sig === lastPushed) return
          await pushState(cfg, new Date().toISOString())
          lastPushed = sig
        } catch {
          /* offline / transient — try again next tick */
        }
      }, 8000)
    }

    const onSignedIn = async () => {
      try {
        // pull once per page-load (guard against a pull→reload→pull loop)
        if (localEmpty() && !sessionStorage.getItem('oac-cloud-pulled')) {
          sessionStorage.setItem('oac-cloud-pulled', '1')
          const applied = await pullState(cfg)
          if (applied && !cancelled) {
            window.location.reload()
            return
          }
        }
        startPush()
      } catch {
        /* ignore */
      }
    }

    ;(async () => {
      try {
        const session = await getSession(cfg)
        if (cancelled) return
        if (session) await onSignedIn()
        unsub = await onAuthChange(cfg, (s) => {
          if (s) onSignedIn()
          else if (timer) {
            clearInterval(timer)
            timer = undefined
          }
        })
      } catch {
        /* ignore */
      }
    })()

    return () => {
      cancelled = true
      unsub()
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.supabaseUrl, ai.supabaseAnonKey])

  return null
}
