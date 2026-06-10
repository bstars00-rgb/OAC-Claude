import { useMemo, useRef, useState } from 'react'
import { Card, CardHeader } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { useToast } from './Toast'
import { useT } from '../i18n'
import { useDatasets } from '../data/datasetStore'
import { TODAY } from '../utils/format'
import {
  parseFile,
  inferNumericHeaders,
  suggestMapping,
  derivePeriodLabel,
  buildSnapshot,
  type ImportProfile,
  type ParsedSheet,
  type MetricMap,
} from '../utils/dataImport'

const PROFILES: { id: ImportProfile; ko: string; en: string; hintKo: string; hintEn: string }[] = [
  { id: 'checkout', ko: 'By Check Out (체크아웃)', en: 'By Check Out', hintKo: '월 단위 확정 실적 · 전월 갱신', hintEn: 'Monthly confirmed results' },
  { id: 'booking', ko: 'By Booking Date (부킹)', en: 'By Booking Date', hintKo: '매주 토 · 전주 토~금', hintEn: 'Weekly (Sat–Fri)' },
]

const fmt = (n: number) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString() : String(Math.round(n * 100) / 100))

export function DataImportPanel() {
  const { lang } = useT()
  const toast = useToast()
  const ds = useDatasets()
  const fileRef = useRef<HTMLInputElement>(null)
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en)

  const [profile, setProfile] = useState<ImportProfile>('booking')
  const [parsed, setParsed] = useState<ParsedSheet | null>(null)
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // mapping state
  const [period, setPeriod] = useState('')
  const [dimension, setDimension] = useState('')
  const [extraDims, setExtraDims] = useState<string[]>([])
  const [metrics, setMetrics] = useState<MetricMap[]>([])
  const [preset, setPreset] = useState<'ohmyhotel' | 'generic'>('generic')
  const [openImport, setOpenImport] = useState(false)

  const numericHeaders = useMemo(
    () => (parsed ? inferNumericHeaders(parsed.rows, parsed.headers) : []),
    [parsed],
  )

  const reset = () => {
    setParsed(null); setFileName(''); setError(''); setDimension(''); setExtraDims([]); setMetrics([]); setPeriod(''); setPreset('generic')
    if (fileRef.current) fileRef.current.value = ''
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true); setError('')
    try {
      const p = await parseFile(file)
      if (!p.rows.length) throw new Error(L('빈 시트입니다. 데이터가 있는 파일을 선택하세요.', 'The sheet is empty.'))
      setParsed(p)
      setFileName(file.name)
      // smart defaults — recognize the Ohmyhotel RawData schema first (profile-aware)
      const sug = suggestMapping(p.headers, profile)
      setPreset(sug.preset)
      if (sug.preset === 'ohmyhotel' && sug.metrics.length) {
        setDimension(sug.dimension)
        setExtraDims(sug.extraDimensions)
        setMetrics(sug.metrics)
        const rawPv = sug.periodColumn ? p.rows.find((r) => r[sug.periodColumn!])?.[sug.periodColumn!] : ''
        const pv = derivePeriodLabel(rawPv, profile)
        setPeriod(pv || (profile === 'checkout' ? TODAY.slice(0, 7) : TODAY))
      } else {
        const textCols = p.headers.filter((h) => !inferNumericHeaders(p.rows, [h]).length)
        setDimension(textCols[0] ?? p.headers[0] ?? '')
        const nums = inferNumericHeaders(p.rows, p.headers)
        setMetrics(nums.slice(0, 4).map((h) => ({ header: h, label: h })))
        setPeriod(profile === 'checkout' ? TODAY.slice(0, 7) : TODAY)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      reset()
    } finally {
      setBusy(false)
    }
  }

  const toggleExtra = (h: string) =>
    setExtraDims((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]))
  const toggleMetric = (h: string) =>
    setMetrics((prev) => (prev.some((m) => m.header === h) ? prev.filter((m) => m.header !== h) : [...prev, { header: h, label: h }]))

  const doImport = () => {
    if (!parsed || !dimension || metrics.length === 0 || !period.trim()) {
      setError(L('차원·지표·기간을 모두 지정하세요.', 'Pick a dimension, at least one metric, and a period.'))
      return
    }
    const snap = buildSnapshot({
      profile,
      periodLabel: period.trim(),
      fileName,
      importedAt: TODAY,
      rows: parsed.rows,
      mapping: { dimension, extraDimensions: extraDims, metrics },
    })
    ds.addSnapshot(snap)
    toast.notify(
      L('가져오기 완료', 'Import complete'),
      L(`${snap.groups.length}개 ${dimension} · ${snap.rowCount}행 · ${period}`, `${snap.groups.length} groups · ${snap.rowCount} rows · ${period}`),
    )
    reset()
    setOpenImport(false)
  }

  const snapshots = ds.snapshots

  return (
    <Card className="mb-5">
      <div className="flex items-center justify-between">
        <CardHeader
          title={L('데이터 가져오기 (RawData)', 'Import data (RawData)')}
          subtitle={L('어드민 통계 .xlsx를 올리면 컬럼을 매핑해 관계·지표로 정리합니다', 'Upload the admin .xlsx — map columns once to turn rows into metrics')}
          icon={<UploadIcon />}
        />
        {!openImport && (
          <Button size="sm" onClick={() => setOpenImport(true)}>{L('+ 파일 가져오기', '+ Import file')}</Button>
        )}
      </div>

      {openImport && (
        <div className="mt-3 rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
          {/* profile */}
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROFILES.map((p) => (
              <button key={p.id} onClick={() => setProfile(p.id)} className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${profile === p.id ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${profile === p.id ? 'border-brand-600' : 'border-slate-300'}`}>{profile === p.id && <span className="h-2 w-2 rounded-full bg-brand-600" />}</span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{L(p.ko, p.en)}</span>
                  <span className="block text-[11px] text-slate-500">{L(p.hintKo, p.hintEn)}</span>
                </span>
              </button>
            ))}
          </div>

          {/* dropzone / file */}
          {!parsed ? (
            <div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-7 text-center transition hover:border-brand-400 hover:bg-brand-50/30">
                <UploadIcon />
                <span className="text-sm font-medium text-slate-600">{busy ? L('읽는 중…', 'Reading…') : L('.xlsx 파일 선택', 'Choose .xlsx file')}</span>
                <span className="text-[11px] text-slate-400">{L('파일은 브라우저에서만 처리되며 어디로도 전송되지 않습니다', 'Parsed in your browser — never uploaded anywhere')}</span>
              </button>
              <div className="mt-2 text-right">
                <button onClick={() => setOpenImport(false)} className="text-[11px] text-slate-400 hover:text-slate-600">{L('닫기', 'Close')}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <Badge tone="green" dot>{fileName}</Badge>
                <span className="text-slate-400">{parsed.rows.length} {L('행', 'rows')} · {parsed.headers.length} {L('열', 'cols')}</span>
                {preset === 'ohmyhotel' && <Badge tone="brand" dot>{L(`Ohmyhotel 형식 자동 인식 · ¥ · ${profile === 'checkout' ? '월 단위' : '주 단위'}`, `Ohmyhotel format detected · ¥ · ${profile === 'checkout' ? 'monthly' : 'weekly'}`)}</Badge>}
                <button onClick={reset} className="ml-auto text-[11px] text-slate-400 hover:text-rose-500">{L('다른 파일', 'Change file')}</button>
              </div>

              {preset === 'ohmyhotel' && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">{L('이 기준으로 묶기:', 'Group by:')}</span>
                  {[
                    { label: L('호텔', 'Hotel'), cands: ['Hotel Name'] },
                    { label: L('판매처(Seller)', 'Seller'), cands: ['Seller Name'] },
                    { label: L('공급사(Vendor)', 'Vendor'), cands: ['Vendor Name'] },
                    { label: L('국가', 'Country'), cands: ['Hotel Country'] },
                    { label: L('체인', 'Chain'), cands: ['Chain Brand'] },
                  ].map((opt) => {
                    const h = parsed.headers.find((x) => x.toLowerCase().replace(/\s+/g, ' ').trim() === opt.cands[0].toLowerCase())
                    if (!h) return null
                    return (
                      <button key={opt.label} onClick={() => setDimension(h)} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${dimension === h ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{opt.label}</button>
                    )
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500">{L('기간 라벨', 'Period label')}</label>
                  <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder={profile === 'checkout' ? '2026-05' : '2026-W23'} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-500">{L('관계 기준 컬럼 (차원)', 'Group-by column (dimension)')}</label>
                  <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-400 focus:outline-none">
                    {parsed.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">{L('지표 컬럼 (합계, 복수 선택)', 'Metric columns (summed, multi)')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {(numericHeaders.length ? numericHeaders : parsed.headers).map((h) => (
                    <button key={h} onClick={() => toggleMetric(h)} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${metrics.some((m) => m.header === h) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{h}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">{L('추가 차원 (필터용, 선택)', 'Extra dimensions (optional)')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.headers.filter((h) => h !== dimension && !metrics.some((m) => m.header === h)).map((h) => (
                    <button key={h} onClick={() => toggleExtra(h)} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${extraDims.includes(h) ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{h}</button>
                  ))}
                </div>
              </div>

              {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => setOpenImport(false)}>{L('취소', 'Cancel')}</Button>
                <Button size="sm" onClick={doImport}>{L('가져오기', 'Import')}</Button>
              </div>
            </div>
          )}
          {error && !parsed && <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</div>}
        </div>
      )}

      {/* snapshots */}
      {snapshots.length > 0 && (
        <div className="mt-4 space-y-3">
          {snapshots.slice(0, 6).map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={s.profile === 'checkout' ? 'sky' : 'violet'} dot>{s.profile === 'checkout' ? 'Check Out' : 'Booking'}</Badge>
                <span className="text-sm font-semibold text-slate-800">{s.periodLabel}</span>
                <span className="text-[11px] text-slate-400">{s.groups.length} {s.mapping.dimension} · {s.rowCount} {L('행', 'rows')} · {s.fileName}</span>
                <button onClick={() => ds.removeSnapshot(s.id)} className="ml-auto text-[11px] text-slate-400 hover:text-rose-500">{L('삭제', 'Delete')}</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {s.mapping.metrics.map((m) => (
                  <span key={m.label} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] dark:bg-white/5">
                    <span className="text-slate-400">{m.label}</span> <span className="font-semibold text-slate-700">{fmt(s.totals[m.label] ?? 0)}</span>
                  </span>
                ))}
              </div>
              {/* top groups */}
              <div className="mt-2.5 overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="py-1 pr-3 font-medium">{s.mapping.dimension}</th>
                      <th className="py-1 pr-3 text-right font-medium">{L('건수', 'Count')}</th>
                      {s.mapping.metrics.map((m) => <th key={m.label} className="py-1 pr-3 text-right font-medium">{m.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {s.groups.slice(0, 8).map((g) => (
                      <tr key={g.key} className="border-t border-slate-100 dark:border-white/5">
                        <td className="py-1 pr-3 font-medium text-slate-700">{g.key}</td>
                        <td className="py-1 pr-3 text-right text-slate-500">{g.rows.toLocaleString()}</td>
                        {s.mapping.metrics.map((m) => <td key={m.label} className="py-1 pr-3 text-right text-slate-600">{fmt(g.metrics[m.label] ?? 0)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {s.groups.length > 8 && <div className="mt-1 text-[10px] text-slate-400">+{s.groups.length - 8} {L('개 더', 'more')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function UploadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
}
