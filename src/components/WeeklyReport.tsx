import { useMemo, useState } from 'react'
import { Button } from './Button'
import { useT } from '../i18n'
import { useCaptureStore } from '../data/captureStore'
import { useDatasets } from '../data/datasetStore'
import { useAiSettings } from '../utils/aiSettings'
import { callText } from '../utils/aiClient'
import { useToast } from './Toast'
import { formatDate } from '../utils/format'
import { exportTextAsWord, exportTextAsPdf, exportExcel } from '../utils/exportFile'
import { listChats, postToChat, type TeamsChat } from '../utils/graph'

// B-7: a weekly digest compiled from the last 7 days of captured activity plus
// the latest imported data. Deterministic by default; AI narrative on demand.
// (File export — Excel/Word/PDF — is handled separately in C-8.)
function daysBack(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function WeeklyReport() {
  const { lang } = useT()
  const store = useCaptureStore()
  const ds = useDatasets()
  const ai = useAiSettings()
  const toast = useToast()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [open, setOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [busy, setBusy] = useState(false)
  // C-9: Teams share flow
  const [chats, setChats] = useState<TeamsChat[] | null>(null)
  const [teamsBusy, setTeamsBusy] = useState(false)

  const since = daysBack(7)
  const report = useMemo(() => {
    const recent = store.entries.filter((e) => e.date >= since)
    const byAccount = new Map<string, number>()
    for (const e of recent) byAccount.set(e.accountName, (byAccount.get(e.accountName) ?? 0) + 1)
    const openTodos = store.entries.flatMap((e) => e.todos.filter((t) => !t.done))
    const overdue = openTodos.filter((t) => t.due && t.due < new Date().toISOString().slice(0, 10))
    const newRisks = recent.flatMap((e) => e.risks.map((r) => ({ r, account: e.accountName })))
    const movers = [...byAccount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { recent, byAccount, openTodos, overdue, newRisks, movers }
  }, [store.entries, since])

  const text = useMemo(() => {
    const lines: string[] = []
    const title = L(`주간 리포트 — ${formatDate(since)} ~ ${formatDate(new Date().toISOString().slice(0, 10))}`, `Weekly report — ${formatDate(since)} to ${formatDate(new Date().toISOString().slice(0, 10))}`)
    lines.push(title)
    lines.push('')
    lines.push(L(`■ 이번 주 활동: 신규 기록 ${report.recent.length}건, 관여 고객사 ${report.byAccount.size}곳`, `■ This week: ${report.recent.length} new record(s) across ${report.byAccount.size} account(s)`))
    if (report.movers.length) {
      lines.push(L('  가장 활발한 고객사:', '  Most active:'))
      for (const [name, n] of report.movers) lines.push(`   - ${name}: ${n}${L('건', '')}`)
    }
    lines.push('')
    lines.push(L(`■ 할 일: 미완료 ${report.openTodos.length}건 (연체 ${report.overdue.length}건)`, `■ To-dos: ${report.openTodos.length} open (${report.overdue.length} overdue)`))
    for (const t of report.overdue.slice(0, 5)) lines.push(`   ⚠ ${t.text} (${L('마감', 'due')} ${formatDate(t.due)})`)
    lines.push('')
    if (report.newRisks.length) {
      lines.push(L(`■ 신규 리스크 ${report.newRisks.length}건`, `■ New risks: ${report.newRisks.length}`))
      for (const x of report.newRisks.slice(0, 5)) lines.push(`   - [${x.account}] ${x.r}`)
      lines.push('')
    }
    const booking = ds.byProfile('booking')[0]
    const checkout = ds.byProfile('checkout')[0]
    if (booking || checkout) {
      lines.push(L('■ 데이터', '■ Data'))
      for (const snap of [booking, checkout].filter(Boolean)) {
        const s = snap!
        const label = s.mapping.metrics[0]?.label ?? ''
        lines.push(`   - ${s.profile === 'booking' ? L('부킹', 'Booking') : L('체크아웃', 'Check Out')} ${s.periodLabel}: ${label} ${Math.round(s.totals[label] ?? 0).toLocaleString()}`)
      }
    }
    return lines.join('\n')
  }, [report, since, ds, lang])

  const askAi = async () => {
    if (busy || !ai.isLive) return
    setBusy(true)
    try {
      const system = L(
        '당신은 오마이호텔 영업 매니저입니다. 아래 주간 데이터를 바탕으로 경영진에게 보고할 주간 리포트를 작성하세요: 핵심 성과, 주의가 필요한 항목(연체/리스크), 다음 주 우선순위 3가지. 구체적 숫자/고객사명을 인용하고, 데이터에 없는 건 추측하지 마세요. 한국어로, 간결하게.',
        'You are an Ohmyhotel sales manager. From the weekly data below, write an executive weekly report: key wins, what needs attention (overdue/risks), and the top 3 priorities for next week. Cite concrete numbers/account names; never invent anything not present. Be concise.',
      )
      const out = await callText({ provider: ai.provider, apiKey: ai.activeKey, model: ai.model, system, user: text })
      setAiText(out || text)
    } catch {
      setAiText(L('AI 리포트 생성에 실패했습니다.', 'Could not generate an AI report.'))
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(aiText || text)
      toast.notify(L('리포트를 복사했습니다.', 'Report copied.'))
    } catch {
      toast.notify(L('복사에 실패했습니다.', 'Copy failed.'))
    }
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const exportWord = () => { exportTextAsWord(L('주간 리포트', 'Weekly report'), aiText || text, `OAC-weekly-${stamp}`); toast.notify(L('Word(.doc) 파일을 저장했습니다.', 'Saved Word (.doc).')) }
  const exportPdf = () => { if (!exportTextAsPdf(L('주간 리포트', 'Weekly report'), aiText || text)) toast.notify(L('팝업이 차단되었습니다. 허용 후 다시 시도하세요.', 'Popup blocked — allow popups and retry.')) }
  const exportXlsx = async () => {
    const sheets = [
      { name: L('활동', 'Activity'), rows: report.recent.map((e) => ({ [L('날짜', 'Date')]: e.date, [L('고객사', 'Account')]: e.accountName, [L('유형', 'Kind')]: e.kind ?? 'note', [L('내용', 'Title')]: e.timeline.title, [L('요약', 'Summary')]: e.summary })) },
      { name: L('할일', 'To-dos'), rows: report.openTodos.map((t) => ({ [L('할 일', 'To-do')]: t.text, [L('마감', 'Due')]: t.due, [L('우선순위', 'Priority')]: t.priority })) },
      { name: L('리스크', 'Risks'), rows: report.newRisks.map((x) => ({ [L('고객사', 'Account')]: x.account, [L('리스크', 'Risk')]: x.r })) },
    ]
    await exportExcel(sheets, `OAC-weekly-${stamp}`)
    toast.notify(L('Excel(.xlsx) 파일을 저장했습니다.', 'Saved Excel (.xlsx).'))
  }

  // C-9: load the user's Teams chats, then post the report to the chosen one.
  const conn = { clientId: ai.msClientId, tenant: ai.msTenant }
  const loadChats = async () => {
    setTeamsBusy(true)
    try {
      setChats(await listChats(conn))
    } catch {
      toast.notify(L('Teams 채팅을 불러오지 못했습니다. Microsoft 365 연결을 확인하세요.', 'Could not load Teams chats — check the Microsoft 365 connection.'))
      setChats(null)
    } finally {
      setTeamsBusy(false)
    }
  }
  const postToTeams = async (chat: TeamsChat) => {
    if (!window.confirm(L(`"${chat.name}" 채팅에 주간 리포트를 게시할까요?`, `Post the weekly report to "${chat.name}"?`))) return
    setTeamsBusy(true)
    try {
      await postToChat(conn, chat.id, aiText || text)
      toast.notify(L(`Teams "${chat.name}"에 게시했습니다.`, `Posted to Teams "${chat.name}".`))
      setChats(null)
    } catch {
      toast.notify(L('Teams 게시에 실패했습니다.', 'Failed to post to Teams.'))
    } finally {
      setTeamsBusy(false)
    }
  }

  const hasData = store.entries.length > 0 || ds.snapshots.length > 0
  if (!hasData) return null

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} icon={<DocIcon />}>{L('주간 리포트', 'Weekly report')}</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-[8vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-white/5">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><DocIcon /> {L('주간 자동 리포트', 'Weekly auto report')}</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-auto px-5 py-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">{aiText || text}</pre>
              {aiText && <span className="mt-2 block text-[10px] uppercase tracking-wide text-brand-400">{L('AI 생성', 'AI generated')} · {ai.model.replace('claude-', '')}</span>}
              {chats && (
                <div className="mt-3 rounded-lg border border-slate-200 p-2 dark:border-white/10">
                  <div className="mb-1 px-1 text-[11px] font-semibold text-slate-500">{L('게시할 Teams 채팅 선택', 'Pick a Teams chat to post to')}</div>
                  {chats.length === 0 ? <p className="px-1 py-2 text-xs text-slate-400">{L('최근 채팅이 없습니다.', 'No recent chats.')}</p> : (
                    <div className="max-h-40 space-y-0.5 overflow-auto">
                      {chats.map((c) => (
                        <button key={c.id} onClick={() => postToTeams(c)} disabled={teamsBusy} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-white/5">
                          <TeamsIcon /> <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 dark:border-white/5">
              {ai.isLive && <Button size="sm" variant="secondary" onClick={askAi} disabled={busy}>{busy ? L('AI 분석 중…', 'Analyzing…') : aiText ? L('다시 생성', 'Regenerate') : L('✨ AI 요약', '✨ AI summary')}</Button>}
              <Button size="sm" variant="secondary" onClick={copy}>{L('복사', 'Copy')}</Button>
              {ai.msClientId && <Button size="sm" variant="secondary" onClick={loadChats} disabled={teamsBusy}>{teamsBusy ? L('Teams…', 'Teams…') : L('Teams 공유', 'Share to Teams')}</Button>}
              <span className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">{L('내보내기', 'Export')}:</span>
                <button onClick={exportWord} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700">Word</button>
                <button onClick={exportPdf} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700">PDF</button>
                <button onClick={exportXlsx} className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700">Excel</button>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DocIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v5h5M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5zM8 13h8M8 17h6" /></svg>
}

function TeamsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
}
