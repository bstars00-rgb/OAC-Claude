import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { ContextBadge } from '../components/ContextBadge'
import { EntitySelector } from '../components/EntitySelector'
import { useToast } from '../components/Toast'
import { entities, entityById } from '../data/entities'
import {
  reportByEntityAndType,
  reportTypes,
  audiences,
  reportLanguages,
  type ReportType,
  type Audience,
  type ReportLanguage,
  type Report,
  type ReportSection,
} from '../data/reports'
import { insightByEntity } from '../data/insights'
import { metricsByEntity } from '../data/salesData'
import { formatUsd, formatNumber, formatPct, formatDate, TODAY } from '../utils/format'

type DetailLevel = '3-line summary' | 'Executive summary' | 'Detailed report'
const detailLevels: DetailLevel[] = ['3-line summary', 'Executive summary', 'Detailed report']

export function ReportGenerator() {
  const [params] = useSearchParams()
  const { demoAction, notify } = useToast()
  const initial = params.get('entity') && entityById(params.get('entity')!) ? params.get('entity')! : 'yeogi'
  const [entityId, setEntityId] = useState(initial)
  const [type, setType] = useState<ReportType>('CEO Briefing')
  const [audience, setAudience] = useState<Audience>('CEO')
  const [language, setLanguage] = useState<ReportLanguage>(initial === 'yeogi' ? 'Korean' : 'English')
  const [detail, setDetail] = useState<DetailLevel>('Detailed report')
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<GeneratedReport | null>(null)

  const entity = entityById(entityId)!

  const generate = () => {
    setGenerating(true)
    setReport(null)
    notify('AI Engine Demo', 'Assembling the report from meetings, emails & Excel…')
    window.setTimeout(() => {
      setReport(buildReport(entityId, type, audience, language))
      setGenerating(false)
    }, 1100)
  }

  useEffect(() => {
    setReport(buildReport(entityId, type, audience, language))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections = report ? sliceByDetail(report.sections, detail) : []

  return (
    <div className="oac-fade-in">
      <PageHeader title="Report Generator" subtitle="Create CEO briefings, partner status reports, issue reports, and sales updates from OAC context." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-5">
          <Card>
            <EntitySelector value={entityId} onChange={(id) => { setEntityId(id); }} label="Relationship" />
            <div className="mt-3"><ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} size="sm" /></div>
            <div className="mt-4 space-y-3">
              <Field label="Report type">
                <select value={type} onChange={(e) => setType(e.target.value as ReportType)} className={inputCls}>
                  {reportTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Audience">
                  <select value={audience} onChange={(e) => setAudience(e.target.value as Audience)} className={inputCls}>
                    {audiences.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Language">
                  <select value={language} onChange={(e) => setLanguage(e.target.value as ReportLanguage)} className={inputCls}>
                    {reportLanguages.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Detail level">
                <div className="grid grid-cols-1 gap-1.5">
                  {detailLevels.map((d) => (
                    <button key={d} onClick={() => setDetail(d)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${detail === d ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{d}</button>
                  ))}
                </div>
              </Field>
              <Button className="w-full" onClick={generate} disabled={generating} icon={<SparkIcon />}>{generating ? 'Generating…' : 'Generate Report'}</Button>
            </div>
          </Card>
          <Card>
            <CardHeader title="Sources Used" subtitle="AI Engine Demo" />
            <div className="flex flex-wrap gap-1.5">
              {entity.relatedSources.map((s) => <Badge key={s} tone="slate" dot>{s}</Badge>)}
            </div>
          </Card>
        </div>

        {/* Report */}
        <div className="lg:col-span-2">
          <Card className="relative min-h-[420px]">
            {generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-brand-600"><span className="oac-typing text-brand-500"><span /><span /><span /></span> OAC is assembling the report…</div>
              </div>
            )}
            {report && (
              <article>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand" dot>{report.type}</Badge>
                      <Badge tone="slate">{audience}</Badge>
                      <Badge tone="sky">{language}</Badge>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">{report.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-400">Prepared for {report.generatedForLabel} · {formatDate(report.date)} · OAC AI Engine Demo</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-black text-white">OAC</div>
                </div>
                <div className="mt-4 space-y-4">
                  {sections.map((s, i) => (
                    <section key={i}>
                      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">{s.heading}</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{s.body}</p>
                    </section>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button variant="demo" onClick={() => demoAction('Export to Word Demo')}>Export to Word Demo</Button>
                  <Button variant="secondary" onClick={() => demoAction('Post to Teams Demo')}>Post to Teams Demo</Button>
                  <Button variant="secondary" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
                  <Button variant="ghost" onClick={() => setDetail('3-line summary')}>Generate 3-line Summary</Button>
                  <Button variant="ghost" onClick={() => { setLanguage('English'); setReport(buildReport(entityId, type, audience, 'English')) }}>Generate English Version</Button>
                </div>
              </article>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// Report carries a display label for the audience line.
type GeneratedReport = Report & { generatedForLabel: string }

function buildReport(entityId: string, type: ReportType, audience: Audience, language: ReportLanguage): GeneratedReport {
  const prebaked = reportByEntityAndType(entityId, type)
  if (prebaked && (language === prebaked.language || language === 'English')) {
    return { ...prebaked, generatedForLabel: audience }
  }
  const entity = entityById(entityId)!
  const insight = insightByEntity(entityId)
  const m = metricsByEntity(entityId)
  const dataLine = m
    ? m.kind === 'booking'
      ? `Bookings ${formatNumber(m.bookings)} / mo, TTV ${formatUsd(m.ttv)}, failure ${formatPct(m.failureRate)}, cancellation ${formatPct(m.cancellationRate)}.`
      : `${m.pendingConfirmationCount} pending confirmations, setup ${m.productSetupProgress}%, risk ${m.riskLevel}.`
    : 'No production data yet.'

  const sections: ReportSection[] = [
    { heading: 'Detected Context', body: `${entity.detectedContext} (${entity.contextConfidence}% confidence). Current focus: ${entity.currentFocus}.` },
    { heading: 'Status', body: entity.summary },
    { heading: 'Key Data', body: dataLine },
    { heading: 'Open Issues', body: entity.openIssues.map((i) => `• ${i}`).join('\n') },
    { heading: 'Risks', body: entity.risks.map((r) => `• ${r}`).join('\n') },
    { heading: 'Recommendation', body: insight?.strategicDirection ?? entity.recommendedAction },
    { heading: 'Next Action', body: entity.nextBestAction },
  ]
  return {
    id: `gen-${entityId}-${type}`,
    entityId,
    type,
    audience,
    language,
    title: `${entity.name} — ${type}`,
    date: TODAY,
    sections,
    generatedForLabel: audience,
  }
}

function sliceByDetail(sections: ReportSection[], detail: DetailLevel): ReportSection[] {
  if (detail === '3-line summary') {
    const lines = sections.slice(0, 3).map((s) => `• ${s.body.split('\n')[0]}`)
    return [{ heading: '3-Line Summary', body: lines.join('\n') }]
  }
  if (detail === 'Executive summary') return sections.slice(0, Math.min(4, sections.length))
  return sections
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}
const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'

function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
