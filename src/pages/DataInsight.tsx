import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { MetricCard } from '../components/MetricCard'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { InsightBox } from '../components/InsightBox'
import { EntitySelector } from '../components/EntitySelector'
import { DataImportPanel } from '../components/DataImportPanel'
import { BarChart, Sparkline, Donut, GaugeBar } from '../components/DemoChart'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { metricsByEntity } from '../data/salesData'
import { insightByEntity } from '../data/insights'
import { useRelationships } from '../data/useRelationships'
import { formatUsd, formatNumber, formatPct } from '../utils/format'

const SOURCES = ['Outlook', 'Teams', 'Excel', 'Internal DB']

export function DataInsight() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { demoAction } = useToast()
  const { t } = useT()
  const rel = useRelationships()
  const paramId = params.get('entity')
  const initial = paramId && rel.byId(paramId) ? paramId : rel.list[0]?.id ?? ''
  const [entityId, setEntityId] = useState(initial)
  const [range, setRange] = useState('Last 6 months')

  const entity = rel.byId(entityId) ?? rel.list[0]
  if (!entity) {
    return (
      <div className="oac-fade-in">
        <PageHeader title={t('page.data.title')} subtitle={t('page.data.subtitle')} />
        <DataImportPanel />
        <Card className="flex flex-col items-center py-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">{t('data.emptyTitle')}</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">{t('data.emptyDesc')}</p>
          <Button className="mt-4" onClick={() => navigate('/assistant')}>{t('nav.assistant')} →</Button>
        </Card>
      </div>
    )
  }
  const m = metricsByEntity(entity.id)
  const insight = insightByEntity(entity.id)

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.data.title')} subtitle={t('page.data.subtitle')} />

      <DataImportPanel />

      {/* Top controls */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1"><EntitySelector value={entity.id} options={rel.list} onChange={setEntityId} label="Relationship" /></div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Date range</label>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
              <option>Last 6 months</option>
              <option>Last 3 months</option>
              <option>This quarter</option>
              <option>Year to date</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SOURCES.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{s} Connected Demo
              </span>
            ))}
          </div>
        </div>
      </Card>

      {m?.kind === 'booking' ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Bookings / mo" value={formatNumber(m.bookings)} delta="+5% QoQ" deltaTone="up" />
            <MetricCard label="TTV" value={formatUsd(m.ttv)} />
            <MetricCard label="Net Revenue" value={formatUsd(m.netRevenue)} />
            <MetricCard label="Avg Booking Value" value={`$${m.averageBookingValue}`} />
            <MetricCard label="Cancellation Rate" value={formatPct(m.cancellationRate)} deltaTone={m.cancellationRate > 10 ? 'down' : 'neutral'} delta={m.cancellationRate > 10 ? 'High' : 'OK'} />
            <MetricCard label="Failure Rate" value={formatPct(m.failureRate)} deltaTone={m.failureRate > 5 ? 'down' : 'up'} delta={m.failureRate > 5 ? 'Elevated' : 'Healthy'} />
            <MetricCard label="Top Destination" value={m.topDestinations[0]?.name ?? '—'} />
            <MetricCard label="Direct Contract" value={formatPct(m.directContractRatio)} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Booking & TTV Trend" subtitle={`${range} · Excel Connected Demo`} />
              <div className="flex justify-center py-4"><Sparkline data={m.monthlyTrend.map((p) => p.bookings)} width={600} height={130} tone="#1f48f0" /></div>
              <div className="flex justify-between px-2 text-[10px] text-slate-400">{m.monthlyTrend.map((p) => <span key={p.month}>{p.month}</span>)}</div>
            </Card>
            <Card>
              <CardHeader title="Direct vs Third-Party" subtitle="Inventory mix" />
              <div className="flex items-center justify-around py-3">
                <div className="text-center"><Donut value={m.directContractRatio} label={`${m.directContractRatio}%`} /><div className="mt-1 text-[11px] text-slate-500">Direct</div></div>
                <div className="text-center"><Donut value={m.thirdPartyInventoryRatio} label={`${m.thirdPartyInventoryRatio}%`} tone="#7c3aed" /><div className="mt-1 text-[11px] text-slate-500">Third-party</div></div>
              </div>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card><CardHeader title="Destination Mix" subtitle="% of bookings" /><BarChart data={m.destinationMix.map((d) => ({ label: d.name, value: d.value }))} tone="#1f48f0" /></Card>
            <Card><CardHeader title="Top Destinations" subtitle="Bookings" /><BarChart data={m.topDestinations.map((d) => ({ label: d.name, value: d.value }))} tone="#7c3aed" /></Card>
            <Card>
              <CardHeader title="Failure Reason Breakdown" subtitle="% of failures" />
              <div className="space-y-2.5 pt-1">
                {m.failureReasons.map((f) => (
                  <div key={f.reason}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-slate-600">{f.reason}</span><span className="font-semibold text-slate-700">{f.pct}%</span></div>
                    <GaugeBar value={f.pct} tone={f.reason.toLowerCase().includes('sold-out') ? '#10b981' : '#e11d48'} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-5"><InsightBox label="OAC interprets the data" title={`What does ${entity.name}'s data mean?`}>{m.aiComment}</InsightBox></div>
        </>
      ) : m ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <MetricCard label="Pending Confirmations" value={m.pendingConfirmationCount} />
            <MetricCard label="Open Issues" value={entity.openIssues.length} />
            <MetricCard label="Product Setup" value={`${m.productSetupProgress}%`} />
            <MetricCard label="Contract Readiness" value={m.contractReadiness} />
            <MetricCard label="Communication" value={m.communicationActivity} />
            <MetricCard label="Risk Level" value={m.riskLevel} deltaTone={m.riskLevel === 'High' ? 'down' : m.riskLevel === 'Low' ? 'up' : 'neutral'} delta={m.riskLevel} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Operational Readiness" subtitle="Internal DB Connected Demo" />
              <div className="space-y-3">
                <div><div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Product setup progress</span><span className="font-semibold text-slate-700">{m.productSetupProgress}%</span></div><GaugeBar value={m.productSetupProgress} /></div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="slate" dot>Rate: {m.rateStatus}</Badge>
                  <Badge tone="slate" dot>Policy: {m.policyConfirmationStatus}</Badge>
                  <Badge tone="slate" dot>Contract: {m.contractReadiness}</Badge>
                </div>
              </div>
            </Card>
            <InsightBox label="OAC interprets the operation" title="Operational status">{m.aiComment}</InsightBox>
          </div>
        </>
      ) : (
        <Card><p className="text-sm text-slate-400">No data connected for this relationship.</p></Card>
      )}

      {/* Recommended action plan + risk warning */}
      {insight && (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Recommended Action Plan" subtitle="Generated by OAC" />
            <ol className="space-y-2">
              {insight.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">{i + 1}</span>{a}</li>
              ))}
              <li className="flex gap-2.5 text-sm text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">{insight.recommendedActions.length + 1}</span>{insight.nextBestAction}</li>
            </ol>
          </Card>
          <Card className="border-rose-100 bg-rose-50/40">
            <CardHeader title="Risk Warning" />
            <ul className="space-y-2">
              {insight.riskWarnings.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate(`/assistant?q=${encodeURIComponent(`Create a report for ${entity.name}`)}`)}>Generate Sales Report</Button>
        <Button variant="secondary" onClick={() => navigate(`/assistant?q=${encodeURIComponent(`Create a CEO report for ${entity.name}`)}`)}>Create CEO Briefing</Button>
        <Button variant="demo" onClick={() => demoAction('Export Excel Demo')}>Export Excel Demo</Button>
        <Button variant="demo" onClick={() => demoAction('Post to Teams Demo')}>Post Insight to Teams Demo</Button>
      </div>
    </div>
  )
}
