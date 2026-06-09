import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { InsightBox } from '../components/InsightBox'
import { ContextBadge } from '../components/ContextBadge'
import { EntitySelector } from '../components/EntitySelector'
import { useToast } from '../components/Toast'
import { entities, entityById } from '../data/entities'
import { meetingsByEntity, type Meeting } from '../data/meetings'
import { reportByEntityAndType } from '../data/reports'
import { draftSeedForEntity } from '../data/emails'
import { detectContext } from '../utils/contextDetection'
import { formatDate, TODAY } from '../utils/format'

interface GeneratedOutput {
  contextLabel: string
  contextConfidence: number
  summary: string
  keyPoints: string[]
  decisions: string[]
  openIssues: string[]
  risks: string[]
  followUps: string[]
}

export function MeetingRecorder() {
  const navigate = useNavigate()
  const { demoAction, notify } = useToast()

  const [entityId, setEntityId] = useState(entities[2].id) // Grand Hyatt Jeju
  const seedMeeting = meetingsByEntity(entityId)[0]
  const [title, setTitle] = useState(seedMeeting?.title ?? '')
  const [date, setDate] = useState(seedMeeting?.date ?? TODAY)
  const [participants, setParticipants] = useState(seedMeeting?.participants.join(', ') ?? '')
  const [notes, setNotes] = useState(seedMeeting?.rawNotes ?? '')
  const [generating, setGenerating] = useState(false)
  const [output, setOutput] = useState<GeneratedOutput | null>(null)

  const entity = entityById(entityId)

  const onEntityChange = (id: string) => {
    setEntityId(id)
    const m = meetingsByEntity(id)[0]
    setTitle(m?.title ?? '')
    setDate(m?.date ?? TODAY)
    setParticipants(m?.participants.join(', ') ?? '')
    setNotes(m?.rawNotes ?? '')
    setOutput(null)
  }

  const generate = () => {
    setGenerating(true)
    setOutput(null)
    notify('AI Engine Demo', 'Transcribing & summarizing the meeting…')
    window.setTimeout(() => {
      setOutput(buildOutput(meetingsByEntity(entityId)[0], notes, entityId))
      setGenerating(false)
    }, 1300)
  }

  return (
    <div className="oac-fade-in">
      <PageHeader title="Meeting Recorder" subtitle="Paste meeting notes or upload a recording. OAC turns it into CRM intelligence." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader title="Meeting Input" subtitle="Meeting Recorder Demo" />
          <div className="space-y-3">
            <EntitySelector value={entityId} onChange={onEntityChange} label="Relationship (or type a name in notes)" />
            <Field label="Meeting title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Q3 Rate Review" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Participants">
                <input value={participants} onChange={(e) => setParticipants(e.target.value)} className={inputCls} placeholder="comma separated" />
              </Field>
            </div>
            <Field label="Meeting notes">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={9} placeholder="Paste meeting notes or transcript here." className={`${inputCls} resize-none font-mono text-[13px] leading-relaxed`} />
            </Field>

            {/* Dummy audio upload */}
            <button onClick={() => demoAction('Meeting Recorder Demo')} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-brand-300 hover:bg-brand-50/40">
              <UploadIcon /> Upload a recording (demo) — drag & drop or browse
            </button>

            <Button className="w-full" onClick={generate} disabled={generating || !notes.trim()} icon={<SparkIcon />}>
              {generating ? 'Generating…' : 'Generate AI Summary'}
            </Button>
          </div>
        </Card>

        {/* Output */}
        <div className="space-y-5">
          {!output && !generating && (
            <Card className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><SparkIcon big /></span>
              <h3 className="mt-3 text-sm font-semibold text-slate-800">One meeting → many outputs</h3>
              <p className="mt-1 max-w-xs text-xs text-slate-500">OAC will produce a summary, key points, decisions, issues, risks, follow-up tasks, an email draft and a CEO briefing.</p>
            </Card>
          )}
          {generating && (
            <Card className="flex h-full min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-brand-600"><span className="oac-typing text-brand-500"><span /><span /><span /></span> OAC is processing the meeting…</div>
            </Card>
          )}
          {output && (
            <>
              <div className="flex items-center justify-between">
                <ContextBadge context={output.contextLabel} confidence={output.contextConfidence} size="sm" />
                <Badge tone="brand" dot>AI Generated</Badge>
              </div>
              <InsightBox label="Meeting Summary" title={title || 'Meeting summary'}>{output.summary}</InsightBox>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <OutCard title="Key Discussion Points" items={output.keyPoints} tone="brand" />
                <OutCard title="Decisions" items={output.decisions} tone="green" />
                <OutCard title="Open Issues" items={output.openIssues} tone="amber" />
                <OutCard title="Risks" items={output.risks} tone="rose" />
              </div>
              <Card>
                <CardHeader title="Follow-up Tasks" subtitle="Auto-extracted by OAC" />
                <ul className="space-y-2">
                  {output.followUps.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2.5 text-sm text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 text-[10px] text-slate-400">{i + 1}</span>{f}
                    </li>
                  ))}
                </ul>
              </Card>
              <SuggestedOutputs entityId={entityId} navigate={navigate} />
              <Card>
                <CardHeader title="Timeline Update Preview" subtitle="What OAC will save" />
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><Badge tone="brand">Meeting</Badge><span className="text-slate-600">{title} · {formatDate(date)}</span></li>
                  {output.followUps.slice(0, 2).map((f, i) => (
                    <li key={i} className="flex gap-2"><Badge tone="slate">Task</Badge><span className="text-slate-600">{f}</span></li>
                  ))}
                </ul>
              </Card>
              <div className="flex flex-wrap gap-2">
                <Button variant="demo" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
                <Button variant="demo" onClick={() => demoAction('Create Tasks Demo')}>Create Tasks Demo</Button>
                <Button variant="secondary" onClick={() => navigate(`/email?entity=${entityId}`)}>Draft Email</Button>
                <Button variant="secondary" onClick={() => navigate(`/report?entity=${entityId}`)}>Create Report</Button>
              </div>
            </>
          )}
        </div>
      </div>

      {entity && !output && (
        <p className="mt-3 text-xs text-slate-400">Tip: notes are pre-filled from the latest {entity.name} meeting — edit them or paste your own, then Generate.</p>
      )}
    </div>
  )

  function SuggestedOutputs({ entityId, navigate }: { entityId: string; navigate: (to: string) => void }) {
    const seed = draftSeedForEntity(entityId)
    const ceo = reportByEntityAndType(entityId, 'CEO Briefing') ?? reportByEntityAndType(entityId, 'Hotel Contracting Summary') ?? reportByEntityAndType(entityId, 'API Integration Review')
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Suggested Email Draft" />
          <p className="text-sm font-medium text-slate-800">{seed ? seed.subject : 'Follow-up email'}</p>
          <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-slate-500">{seed ? seed.body.slice(0, 160) + '…' : 'OAC will draft a follow-up email from this meeting.'}</p>
          <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => navigate(`/email?entity=${entityId}`)}>Open in Email Assistant</Button>
        </Card>
        <Card>
          <CardHeader title="Suggested CEO Briefing" />
          <p className="text-sm font-medium text-slate-800">{ceo ? ceo.title : 'CEO briefing'}</p>
          <p className="mt-1 line-clamp-3 text-xs text-slate-500">{ceo?.sections[0]?.body ?? 'OAC will assemble a CEO briefing from this meeting and connected data.'}</p>
          <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => navigate(`/report?entity=${entityId}`)}>Open in Report Generator</Button>
        </Card>
      </div>
    )
  }
}

function buildOutput(meeting: Meeting | undefined, notes: string, entityId: string): GeneratedOutput {
  const det = detectContext(notes)
  const entity = entityById(entityId)
  if (meeting) {
    return {
      contextLabel: entity?.detectedContext ?? det.label,
      contextConfidence: entity?.contextConfidence ?? det.confidence,
      summary: meeting.aiSummary,
      keyPoints: meeting.keyPoints,
      decisions: meeting.decisions,
      openIssues: meeting.openIssues,
      risks: meeting.risks,
      followUps: meeting.followUps,
    }
  }
  // Synthesize from free-text notes
  const firstSentences = notes.split(/[.\n]/).map((s) => s.trim()).filter(Boolean)
  return {
    contextLabel: det.label,
    contextConfidence: det.confidence,
    summary: `OAC detected a ${det.label} context. ${det.rationale} ${firstSentences[0] ?? ''}.`,
    keyPoints: firstSentences.slice(0, 4),
    decisions: ['Proceed based on the points discussed (review with owner).'],
    openIssues: firstSentences.slice(4, 7).length ? firstSentences.slice(4, 7) : ['Confirm open items from the notes.'],
    risks: ['Unconfirmed items may delay the next step.'],
    followUps: ['Send a follow-up summary to the partner', 'Confirm the next action owner & due date'],
  }
}

function OutCard({ title, items, tone }: { title: string; items: string[]; tone: 'brand' | 'green' | 'amber' | 'rose' }) {
  const dot = { brand: 'bg-brand-400', green: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' }[tone]
  return (
    <Card>
      <CardHeader title={title} />
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />{it}</li>
        ))}
      </ul>
    </Card>
  )
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

function SparkIcon({ big = false }: { big?: boolean }) { const s = big ? 22 : 15; return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function UploadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg> }
