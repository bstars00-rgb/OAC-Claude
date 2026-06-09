import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { ContextBadge } from '../components/ContextBadge'
import { InsightBox } from '../components/InsightBox'
import { EntitySelector } from '../components/EntitySelector'
import { useToast } from '../components/Toast'
import { useT } from '../i18n'
import { entities, entityById } from '../data/entities'
import { emailsByEntity } from '../data/emails'
import {
  buildEmailDraft,
  emailPurposes,
  emailTones,
  emailLanguages,
  type EmailPurpose,
  type EmailTone,
  type EmailLanguage,
  type GeneratedDraft,
} from '../utils/mockAI'
import { formatDate } from '../utils/format'

// Map a relationship's detected context to a sensible default purpose.
const defaultPurpose = (entityId: string): EmailPurpose => {
  const ctx = entityById(entityId)?.detectedContext ?? ''
  if (ctx.includes('API') || ctx.includes('Connectivity')) return 'API Integration Inquiry'
  if (ctx.includes('Hotel Contracting')) return 'Hotel Rate Request'
  if (ctx.includes('Net Rate')) return 'Corporate Cooperation Proposal'
  if (ctx.includes('SLA')) return 'SLA Clarification'
  if (ctx.includes('Integration Fee')) return 'Commercial Condition Confirmation'
  if (ctx.includes('Booking Failure') || ctx.includes('Prebook')) return 'Issue Escalation'
  if (ctx.includes('Supplier')) return 'Supplier Product Confirmation'
  return 'Follow-up After Meeting'
}

export function EmailAssistant() {
  const [params] = useSearchParams()
  const { demoAction, notify } = useToast()
  const { t } = useT()
  const initial = params.get('entity') && entityById(params.get('entity')!) ? params.get('entity')! : entities[1].id // iTANK
  const [entityId, setEntityId] = useState(initial)
  const [purpose, setPurpose] = useState<EmailPurpose>(defaultPurpose(initial))
  const [tone, setTone] = useState<EmailTone>('Professional')
  const [language, setLanguage] = useState<EmailLanguage>('English')
  const [instructions, setInstructions] = useState('')
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<GeneratedDraft>(() => buildEmailDraft(entityById(initial)!, defaultPurpose(initial), 'Professional', 'English'))

  const entity = entityById(entityId)!
  const inbox = emailsByEntity(entityId)

  const generate = () => {
    setGenerating(true)
    notify('AI Engine Demo', 'Drafting a context-aware email…')
    window.setTimeout(() => {
      setDraft(buildEmailDraft(entity, purpose, tone, language))
      setGenerating(false)
    }, 850)
  }

  // When the relationship changes (incl. deep-link), reset purpose & regenerate.
  useEffect(() => {
    const p = defaultPurpose(entityId)
    setPurpose(p)
    setDraft(buildEmailDraft(entityById(entityId)!, p, tone, language))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId])

  const makeShorter = () => {
    const firstPara = draft.body.split('\n\n').slice(0, 2).join('\n\n')
    setDraft({ ...draft, body: firstPara + '\n\n' + draft.body.split('\n\n').slice(-1)[0] })
    demoAction('Make Shorter')
  }
  const makeFormal = () => {
    setDraft({ ...draft, body: draft.body.replace(/hope you're well\.?/gi, '').replace(/Hi /g, 'Dear ') })
    demoAction('Make More Formal')
  }
  const translate = () => {
    const next: EmailLanguage = language === 'English' ? 'Korean' : 'English'
    setLanguage(next)
    setDraft(buildEmailDraft(entity, purpose, tone, next))
    demoAction('Translate')
  }
  const copyDraft = () => {
    const text = `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {})
    notify('Copied to clipboard', 'Draft copied (demo).')
  }

  return (
    <div className="oac-fade-in">
      <PageHeader title={t('page.email.title')} subtitle={t('page.email.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-5">
          <Card>
            <EntitySelector value={entityId} onChange={setEntityId} label="Relationship / Recipient" />
            <div className="mt-3"><ContextBadge context={entity.detectedContext} confidence={entity.contextConfidence} size="sm" /></div>

            <div className="mt-4 space-y-3">
              <Field label="Recipient email">
                <input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Purpose">
                <select value={purpose} onChange={(e) => setPurpose(e.target.value as EmailPurpose)} className={inputCls}>
                  {emailPurposes.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tone">
                  <select value={tone} onChange={(e) => setTone(e.target.value as EmailTone)} className={inputCls}>
                    {emailTones.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Language">
                  <select value={language} onChange={(e) => setLanguage(e.target.value as EmailLanguage)} className={inputCls}>
                    {emailLanguages.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Additional instructions">
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="e.g. mention the July deadline, keep it under 150 words" className={`${inputCls} resize-none`} />
              </Field>
              <Button className="w-full" onClick={generate} disabled={generating} icon={<SparkIcon />}>
                {generating ? 'Generating…' : 'Generate Draft'}
              </Button>
            </div>
          </Card>

          <InsightBox label="Why this email" title="OAC's reasoning">
            This draft targets <strong>{entity.currentFocus}</strong>. {entity.nextBestAction}.
          </InsightBox>

          <Card>
            <CardHeader title="Recent Outlook Thread" subtitle="Connected Demo" />
            {inbox.length ? inbox.map((e) => (
              <div key={e.id} className="mb-2 rounded-lg border border-slate-100 p-2.5 last:mb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-slate-700">{e.subject}</span>
                  {e.unread && <Badge tone="brand">New</Badge>}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">{e.from} · {formatDate(e.date)}</div>
              </div>
            )) : <p className="text-xs text-slate-400">No prior thread.</p>}
          </Card>
        </div>

        {/* Draft */}
        <div className="lg:col-span-2">
          <Card className="relative">
            {generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-brand-600"><span className="oac-typing text-brand-500"><span /><span /><span /></span> OAC is writing…</div>
              </div>
            )}
            <CardHeader title="Email Draft" subtitle="Outlook Connected Demo" action={<div className="flex gap-1.5"><Badge tone="violet" dot>{tone}</Badge><Badge tone="sky">{language}</Badge></div>} />
            <div className="space-y-3">
              <Field label="To"><input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className={inputCls} /></Field>
              <Field label="Subject"><input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={`${inputCls} font-medium`} /></Field>
              <Field label="Body"><textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={18} className={`${inputCls} resize-none leading-relaxed`} /></Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button variant="demo" onClick={() => demoAction('Send via Outlook Demo')} icon={<SendIcon />}>Send via Outlook Demo</Button>
              <Button variant="secondary" onClick={copyDraft}>Copy Draft</Button>
              <Button variant="secondary" onClick={() => demoAction('Save to Timeline Demo')}>Save to Timeline Demo</Button>
              <Button variant="secondary" onClick={() => demoAction('Mark as Sent Demo')}>Mark as Sent Demo</Button>
              <Button variant="ghost" onClick={makeShorter}>Make Shorter</Button>
              <Button variant="ghost" onClick={makeFormal}>Make More Formal</Button>
              <Button variant="ghost" onClick={translate}>Translate</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
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

function SparkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3z" /></svg> }
function SendIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg> }
