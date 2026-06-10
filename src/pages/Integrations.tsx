import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { InsightBox } from '../components/InsightBox'
import { useToast } from '../components/Toast'

type IntegrationStatus = 'Connected Demo' | 'Prototype'

interface Integration {
  name: string
  status: IntegrationStatus
  description: string
  tone: string
  icon: 'mail' | 'teams' | 'excel' | 'db' | 'mic' | 'ai'
}

const integrations: Integration[] = [
  { name: 'Outlook', status: 'Connected Demo', tone: 'sky', icon: 'mail', description: 'Reads relationship-related email threads and helps generate context-aware email drafts.' },
  { name: 'Microsoft Teams', status: 'Connected Demo', tone: 'violet', icon: 'teams', description: 'Summarizes relationship-related Teams messages and posts AI-generated updates to selected channels.' },
  { name: 'Excel / SharePoint', status: 'Connected Demo', tone: 'emerald', icon: 'excel', description: 'Uses sales files, booking reports, and operational spreadsheets for relationship-level data analysis.' },
  { name: 'Ohmyhotel Internal DB', status: 'Connected Demo', tone: 'slate', icon: 'db', description: 'Uses internal booking, inventory, mapping, rate, and partner data to generate relationship intelligence.' },
  { name: 'AI Engine', status: 'Prototype', tone: 'brand', icon: 'ai', description: 'Generates summaries, recommendations, emails, reports, and data insights — and powers the OAC Assistant.' },
]

const toneMap: Record<string, string> = {
  sky: 'from-sky-500 to-sky-600',
  violet: 'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  slate: 'from-slate-500 to-slate-600',
  brand: 'from-brand-600 to-violet-600',
}

const phases = [
  { name: 'Phase 1 — Demo MVP', tone: 'brand' as const, items: ['Local mock data', 'Manual meeting notes', 'Simulated Outlook / Teams / Excel connection', 'AI-generated summaries and drafts'] },
  { name: 'Phase 2 — Internal Pilot', tone: 'sky' as const, items: ['Supabase database', 'Excel upload', 'Manual email import', 'Timeline saving', 'Task management'] },
  { name: 'Phase 3 — Real Enterprise Integration', tone: 'slate' as const, items: ['Microsoft Graph API', 'Outlook email read / send', 'Teams channel posting', 'SharePoint / Excel sync', 'Internal DB connection', 'Role-based access control'] },
]

export function IntegrationsContent() {
  const { demoAction } = useToast()

  return (
    <div>
      <div className="mb-5">
        <InsightBox label="Prototype Notice" variant="ai" title="This is a concept-validation prototype">
          All connections below are <strong>demo / prototype connections</strong>. No real Microsoft Graph, Outlook, Teams, Excel, audio transcription, or database integration is performed. Real integration will be added in the development phase.
        </InsightBox>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((it) => (
          <Card key={it.name} className="flex flex-col">
            <div className="flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${toneMap[it.tone]} text-white`}><IntegrationIcon icon={it.icon} /></span>
              <Badge tone={it.status === 'Connected Demo' ? 'green' : 'violet'} dot>{it.status}</Badge>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{it.name}</h3>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{it.description}</p>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <Button size="sm" variant="secondary" onClick={() => demoAction(`${it.name} ${it.status}`)}>{it.status === 'Connected Demo' ? 'Sync Demo' : 'Open Demo'}</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Roadmap */}
      <h2 className="mb-3 mt-7 text-sm font-bold text-slate-900">Integration Roadmap</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {phases.map((p, idx) => (
          <Card key={p.name} className={idx === 0 ? 'border-brand-200 bg-brand-50/30' : ''}>
            <div className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white ${idx === 0 ? 'bg-brand-600' : idx === 1 ? 'bg-sky-500' : 'bg-slate-500'}`}>{idx + 1}</span>
              <span className="text-sm font-semibold text-slate-900">{p.name}</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {p.items.map((i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-sky-400' : 'bg-slate-400'}`} />{i}</li>
              ))}
            </ul>
            {idx === 0 && <Badge tone="brand" className="mt-3">Current</Badge>}
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">Demo Actions Reference</h3>
        <p className="mt-1 text-xs text-slate-500">Every integration action in OAC is a demo action. Try one:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Send via Outlook Demo', 'Post to Teams Demo', 'Export to Word Demo', 'Export Excel Demo', 'Save to Timeline Demo', 'Create Task Demo', 'Mark as Sent Demo'].map((d) => (
            <Button key={d} size="sm" variant="demo" onClick={() => demoAction(d)}>{d}</Button>
          ))}
        </div>
      </Card>
    </div>
  )
}

function IntegrationIcon({ icon }: { icon: Integration['icon'] }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (icon) {
    case 'mail': return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
    case 'teams': return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7" /></svg>
    case 'excel': return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8l8 8M16 8l-8 8" /></svg>
    case 'db': return <svg {...common}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>
    case 'mic': return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></svg>
    case 'ai': return <svg {...common}><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg>
  }
}
