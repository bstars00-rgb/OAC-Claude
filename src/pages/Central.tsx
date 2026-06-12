import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useT } from '../i18n'
import { useAiSettings } from '../utils/aiSettings'
import { isConfigured, myOrg, listOrgMembers, type OrgMemberData, type OrgMembership } from '../utils/supabaseClient'
import { formatDate, initials } from '../utils/format'
import type { CaptureEntry } from '../data/captureStore'

interface AggAccount {
  name: string
  owners: string[]
  entries: (CaptureEntry & { owner: string })[]
  lastDate: string
}

function aggregate(members: OrgMemberData[]): AggAccount[] {
  const map = new Map<string, AggAccount>()
  for (const m of members) {
    const blob = (m.data as { data?: Record<string, unknown> })?.data
    const caps = (blob?.['oac-captures-v1'] as CaptureEntry[]) ?? []
    for (const c of caps) {
      const key = c.accountName?.trim() || c.accountId
      if (!key) continue
      const a = map.get(key) ?? { name: c.accountName || key, owners: [], entries: [], lastDate: '' }
      a.entries.push({ ...c, owner: m.name })
      if (!a.owners.includes(m.name)) a.owners.push(m.name)
      if (c.date > a.lastDate) a.lastDate = c.date
      map.set(key, a)
    }
  }
  for (const a of map.values()) a.entries.sort((x, y) => y.date.localeCompare(x.date))
  return [...map.values()].sort((x, y) => y.lastDate.localeCompare(x.lastDate))
}

export function Central() {
  const { lang } = useT()
  const ai = useAiSettings()
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)
  const cfg = { url: ai.supabaseUrl, anonKey: ai.supabaseAnonKey }
  const configured = isConfigured(cfg)

  const [membership, setMembership] = useState<OrgMembership | null>(null)
  const [members, setMembers] = useState<OrgMemberData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!configured) return
    let alive = true
    setLoading(true); setError('')
    ;(async () => {
      try {
        const mem = await myOrg(cfg)
        if (!alive) return
        setMembership(mem)
        if (mem) setMembers(await listOrgMembers(cfg))
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.supabaseUrl, ai.supabaseAnonKey])

  const accounts = useMemo(() => (members ? aggregate(members) : []), [members])
  const filtered = q.trim() ? accounts.filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase())) : accounts
  const sel = selected ? accounts.find((a) => a.name === selected) : undefined

  if (!configured) {
    return (
      <div className="oac-fade-in">
        <PageHeader title={L('전사 히스토리', 'Central')} subtitle={L('팀 전체의 관계·히스토리를 한곳에서', 'Every salesperson’s relationships & history in one place')} />
        <Card className="py-10 text-center text-sm text-slate-500">{L('먼저 설정 → 클라우드 동기화(Supabase)를 구성하고 로그인하세요.', 'Set up Cloud Sync (Supabase) in Settings and sign in first.')}</Card>
      </div>
    )
  }
  if (!membership) {
    return (
      <div className="oac-fade-in">
        <PageHeader title={L('전사 히스토리', 'Central')} subtitle={L('팀 전체의 관계·히스토리를 한곳에서', 'Every salesperson’s relationships & history in one place')} />
        <Card className="py-10 text-center">
          <p className="text-sm text-slate-500">{loading ? L('불러오는 중…', 'Loading…') : L('아직 조직에 참여하지 않았습니다. 설정 → 팀/조직에서 조직을 만들거나 참여하세요.', 'You haven’t joined an org yet. Create or join one in Settings → Team.')}</p>
        </Card>
        {error && <Card className="mt-3 text-[11px] text-rose-700">{error}</Card>}
      </div>
    )
  }

  return (
    <div className="oac-fade-in">
      <PageHeader title={L('전사 히스토리', 'Central')} subtitle={L(`조직 ${membership.orgId} · 팀 전체 관계·히스토리 (읽기 전용)`, `Org ${membership.orgId} · all relationships & history (read-only)`)} />

      {/* team members */}
      <Card className="mb-5">
        <CardHeader title={L('팀 멤버', 'Team members')} subtitle={`${members?.length ?? 0}`} />
        <div className="flex flex-wrap gap-2">
          {(members ?? []).map((m) => (
            <span key={m.userId} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs dark:bg-white/5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 dark:bg-white/10">{initials(m.name)}</span>
              {m.name}{m.role === 'admin' && <Badge tone="brand">admin</Badge>}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* aggregated relationships */}
        <div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('업체 검색…', 'Search company…')} className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">{L('전사 관계', 'All relationships')} <Badge tone="slate">{accounts.length}</Badge></div>
          <div className="space-y-2">
            {filtered.length === 0 && <Card className="py-6 text-center text-sm text-slate-500">{L('아직 기록이 없습니다.', 'No records yet.')}</Card>}
            {filtered.map((a) => (
              <button key={a.name} onClick={() => setSelected(a.name)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selected === a.name ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50 dark:bg-white/5'}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-xs font-bold text-white">{initials(a.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{a.name}</span>
                  <span className="block truncate text-[11px] text-slate-500">{a.entries.length} {L('기록', 'records')} · {a.owners.join(', ')}</span>
                </span>
                <span className="shrink-0 text-[11px] text-slate-500">{formatDate(a.lastDate)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* selected account history */}
        <div>
          {sel ? (
            <Card>
              <CardHeader title={sel.name} subtitle={L(`${sel.entries.length}개 기록 · 담당: ${sel.owners.join(', ')}`, `${sel.entries.length} records · owners: ${sel.owners.join(', ')}`)} />
              <ul className="space-y-2.5">
                {sel.entries.map((e) => (
                  <li key={e.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">{e.timeline?.title || e.summary}</span>
                      <span className="text-[11px] text-slate-500">{formatDate(e.date)}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{e.detectedContext} · {L('담당', 'by')} {e.owner}</div>
                    <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{e.summary}</p>
                    {e.detail && <p className="mt-1 line-clamp-4 whitespace-pre-line text-[11px] text-slate-500">{e.detail}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card className="py-12 text-center text-sm text-slate-500">{L('왼쪽에서 업체를 선택하면 전체 히스토리가 보입니다.', 'Pick a company to see its full history.')}</Card>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-500">{L('이 화면은 팀 동료들이 클라우드에 동기화한 데이터를 모아 보여줍니다 (읽기 전용). 신규 입사자 교육·인수인계에 사용하세요.', 'This aggregates teammates’ cloud-synced data (read-only) — use it for onboarding & handover.')}</p>
    </div>
  )
}
