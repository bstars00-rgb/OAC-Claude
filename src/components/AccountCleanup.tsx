import { useMemo, useState } from 'react'
import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { useT } from '../i18n'
import { useCaptureStore } from '../data/captureStore'
import { formatDate } from '../utils/format'

// Clean up the workspace: merge duplicate accounts and remove one-off / noise
// accounts (e.g. auto-created from a single synced email).
export function AccountCleanup() {
  const { lang } = useT()
  const store = useCaptureStore()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')

  const kindByAccount = useMemo(() => {
    const m = new Map<string, Record<string, number>>()
    for (const e of store.entries) {
      const cur = m.get(e.accountId) ?? {}
      const k = e.kind ?? 'note'
      cur[k] = (cur[k] ?? 0) + 1
      m.set(e.accountId, cur)
    }
    return m
  }, [store.entries])

  const list = store.accounts.filter((a) => !q.trim() || a.accountName.toLowerCase().includes(q.trim().toLowerCase()))
  const noiseIds = store.accounts.filter((a) => a.entryCount === 1).map((a) => a.accountId)
  const selArr = [...sel]

  const toggle = (id: string) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const doDelete = () => {
    if (!selArr.length) return
    if (window.confirm(L(`선택한 ${selArr.length}개 계정과 그 기록을 삭제할까요?`, `Delete ${selArr.length} selected accounts and their records?`))) {
      store.deleteAccounts(selArr); setSel(new Set())
    }
  }
  const doMerge = (targetId: string, targetName: string) => {
    store.mergeAccounts(selArr, targetId, targetName)
    setSel(new Set())
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader title={L('계정 정리 / 병합', 'Account cleanup / merge')} subtitle={L(`${store.accounts.length}개 계정 · 중복 병합·노이즈 정리`, `${store.accounts.length} accounts · merge duplicates, remove noise`)} icon={<BroomIcon />} />
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>{open ? L('닫기', 'Close') : L('정리하기', 'Clean up')}</Button>
      </div>

      {open && (
        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('계정 검색…', 'Search accounts…')} className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
            <Button size="sm" variant="secondary" onClick={() => setSel(new Set(noiseIds))} disabled={!noiseIds.length}>{L(`노이즈(1건) ${noiseIds.length}개 선택`, `Select ${noiseIds.length} one-off`)}</Button>
            {sel.size > 0 && <button onClick={() => setSel(new Set())} className="text-[11px] text-slate-500 hover:text-slate-600">{L('선택 해제', 'Clear')}</button>}
          </div>

          {/* action bar */}
          {sel.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 p-2.5 text-xs dark:bg-brand-500/10">
              <span className="font-semibold text-brand-700">{sel.size} {L('선택됨', 'selected')}</span>
              <Button size="sm" variant="secondary" onClick={doDelete}>{L('선택 삭제', 'Delete')}</Button>
              {sel.size >= 2 && (
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500">{L('병합 대상:', 'Merge into:')}</span>
                  {selArr.map((id) => {
                    const a = store.accounts.find((x) => x.accountId === id)
                    if (!a) return null
                    return <button key={id} onClick={() => doMerge(id, a.accountName)} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700">{a.accountName}</button>
                  })}
                </span>
              )}
            </div>
          )}

          <div className="max-h-[360px] divide-y divide-slate-100 overflow-auto rounded-lg border border-slate-200 dark:divide-white/5 dark:border-white/10">
            {list.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">{L('계정이 없습니다.', 'No accounts.')}</p>
            ) : list.map((a) => {
              const kinds = kindByAccount.get(a.accountId) ?? {}
              const kindStr = Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(' · ')
              return (
                <label key={a.accountId} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-white/5">
                  <input type="checkbox" checked={sel.has(a.accountId)} onChange={() => toggle(a.accountId)} className="h-4 w-4 shrink-0 accent-brand-600" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800">{a.accountName}</span>
                      {a.entryCount === 1 && <Badge tone="amber">{L('1건', '1×')}</Badge>}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">{a.entryCount} {L('기록', 'records')}{kindStr ? ` · ${kindStr}` : ''} · {formatDate(a.lastDate)}</span>
                  </span>
                </label>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-500">{L('병합: 2개 이상 선택 → "병합 대상"에서 남길 계정을 누르면 나머지가 합쳐집니다. (백업/클라우드 켜져 있으면 복원 가능)', 'Merge: select 2+, then click the account to keep. (Restorable if backup/cloud is on.)')}</p>
        </div>
      )}
    </Card>
  )
}

function BroomIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5l-9 9M14 4l3 3M11 13l-5 5-3-1 2-4 6-3M7 17l1 3" /></svg>
}
