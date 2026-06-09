// Outlook mock data — simulated email threads with AI intent extraction.

export type EmailPriority = 'High' | 'Medium' | 'Low'

export interface Email {
  id: string
  entityId: string
  date: string // ISO date
  from: string
  to: string
  subject: string
  summary: string
  aiIntent: string
  followUpNeeded: boolean
  priority: EmailPriority
  suggestedReply: string
  unread?: boolean
}

import { getContentLang } from './contentLang'
import { emailKo } from './contentKo'

export const emails: Email[] = [
  {
    id: 'em-yeogi-1',
    entityId: 'yeogi',
    date: '2026-06-05',
    from: 'platform@yeogi.example',
    to: 'aiden.park@ohmyhotel.example',
    subject: 'Re: API integration — next steps',
    summary:
      'Yeogi confirms interest and relays that iTANK requires an official inquiry to helpdesk@itank.net before assigning engineers.',
    aiIntent: 'Requesting Ohmyhotel to send the official iTANK inquiry to unblock engineering',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Confirm we will send the official inquiry to helpdesk@itank.net this week and ask Yeogi to align internally on the Korea/Japan/Vietnam supply scope so the CEO briefing can quote firm numbers.',
    unread: true,
  },
  {
    id: 'em-itank-1',
    entityId: 'itank',
    date: '2026-06-05',
    from: 'helpdesk@itank.net',
    to: 'aiden.park@ohmyhotel.example',
    subject: 'API connection — please submit a formal inquiry',
    summary:
      'iTANK confirms communication must go through helpdesk@itank.net and that a formal inquiry outlining scope and volume is required before connectivity terms are returned.',
    aiIntent: 'Gatekeeping engineering resources behind a formal written inquiry',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Send a structured inquiry covering integration options, required documents, technical process, commercial model, expected timeline and connectable partner scope (Yeogi Eottae, Chalet Korea, Taiwan HRC).',
    unread: true,
  },
  {
    id: 'em-grandhyatt-1',
    entityId: 'grandhyatt',
    date: '2026-06-06',
    from: 'revenue@grandhyattjeju.example',
    to: 'mina.seo@ohmyhotel.example',
    subject: 'July availability & direct-contract discussion',
    summary:
      'Hotel signals openness to a direct contract and asks for Ohmyhotel\'s allotment commitment and target volume for the July peak.',
    aiIntent: 'Willing to contract directly; wants an allotment commitment in return',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Request net rate, July availability, suite-room rates, allotment (ALM), cancellation policy and a summer promotion condition; position family/VIP demand to justify direct terms.',
  },
  {
    id: 'em-medkorea-1',
    entityId: 'medkorea',
    date: '2026-06-04',
    from: 'partnerships@medicalkorea.example',
    to: 'soyeon.lim@ohmyhotel.example',
    subject: 'Cooperation — net rates & settlement questions',
    summary:
      'MKS asks how the net-rate model and settlement work, and whether prepaid is required during ramp-up.',
    aiIntent: 'Seeking clarity on net-rate model, markup responsibility and settlement',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Send a structured cooperation summary: net-rate supply, client-side markup, prepaid settlement during ramp-up, guarantee-booking flow and per-hotel cancellation/change rules.',
    unread: true,
  },
  {
    id: 'em-goglobal-1',
    entityId: 'goglobal',
    date: '2026-06-07',
    from: 'commercial@goglobal.example',
    to: 'aiden.park@ohmyhotel.example',
    subject: 'SLA countersignature & API live key',
    summary:
      'GoGlobal asks Ohmyhotel to confirm the countersignature/seal status and signals the API live key can follow once signing is complete.',
    aiIntent: 'Ready to issue the API live key once countersignature is confirmed',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Confirm whether our company seal is complete and the signature is no longer pending, then explicitly ask when the API live key will be issued. Cc Sophia for supply readiness.',
  },
  {
    id: 'em-klook-1',
    entityId: 'klook',
    date: '2026-06-04',
    from: 'partnerships@klook.example',
    to: 'daniel.cho@ohmyhotel.example',
    subject: 'SLA draft — support & compensation',
    summary:
      'Klook\'s SLA draft requires 24/7 support and broad CS compensation wording.',
    aiIntent: 'Pushing a 24/7 support obligation and broad compensation liability',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Counter with the actual 06:00–24:00 coverage plus an off-hours escalation path, and propose capping compensation to documented, attributable failures pending legal review.',
    unread: true,
  },
  {
    id: 'em-hotelbeds-1',
    entityId: 'hotelbeds',
    date: '2026-06-03',
    from: 'commercial@hotelbeds.example',
    to: 'daniel.cho@ohmyhotel.example',
    subject: 'Integration fee — USD 25,000',
    summary:
      'Hotelbeds states the USD 25,000 integration fee is non-refundable and requests confirmation to proceed with TGX.',
    aiIntent: 'Seeking commitment to a non-refundable integration fee before go-live',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Request a waiver or deferral until go-live, ask to tie any fee to a volume/rebate structure, and make TGX approval a precondition before any commitment.',
  },
  {
    id: 'em-dida-1',
    entityId: 'dida',
    date: '2026-05-30',
    from: 'tech@dida.example',
    to: 'mina.seo@ohmyhotel.example',
    subject: 'Offline accuracy — room-type & cancellation issues',
    summary:
      'Dida reports room-type code mismatches and cancellation-policy false-positives and asks for a joint review.',
    aiIntent: 'Escalating offline accuracy issues and requesting a joint technical review',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Propose a joint review to build shared room-type validation that separates Dida-side invalid codes from genuine sold-out cases, with a remediation timeline.',
    unread: true,
  },
  {
    id: 'em-traveloka-1',
    entityId: 'traveloka',
    date: '2026-06-06',
    from: 'connectivity@traveloka.example',
    to: 'daniel.cho@ohmyhotel.example',
    subject: 'Prebook failures & suspension threshold',
    summary:
      'Traveloka warns the prebook success rate is approaching the automated suspension threshold and cites "No Room Available" errors.',
    aiIntent: 'Warning that prebook failures may trigger automated channel suspension',
    followUpNeeded: true,
    priority: 'High',
    suggestedReply:
      'Acknowledge and share a per-market (VN/KR/MY/JP) monitoring plan plus the Atlas API schema update status; commit to reducing failures before volume expansion.',
  },
  {
    id: 'em-webbeds-1',
    entityId: 'webbeds',
    date: '2026-06-01',
    from: 'apipartners@webbeds.example',
    to: 'aiden.park@ohmyhotel.example',
    subject: 'Korea API client expansion — prospects',
    summary:
      'WebBeds proposes a Korea API client-expansion effort and asks for a prospect shortlist.',
    aiIntent: 'Exploring a Korea-focused API client expansion partnership',
    followUpNeeded: true,
    priority: 'Medium',
    suggestedReply:
      'Offer to build a 30-prospect Korea-first list and note that JP/VN competitiveness needs validation before committing development resource.',
  },
]

const loc = (e: Email): Email => {
  if (getContentLang() !== 'ko') return e
  const ko = emailKo[e.id]
  return ko ? { ...e, ...ko } : e
}

export const emailsByEntity = (entityId: string): Email[] =>
  emails.filter((e) => e.entityId === entityId).map(loc)

export const latestEmails = (n: number): Email[] =>
  [...emails].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n).map(loc)

export const draftEmails = (): Email[] => emails.filter((e) => e.followUpNeeded).map(loc)

// ── Base draft seeds used by the Email Assistant as a starting point ─────────
export interface EmailDraftSeed {
  to: string
  subject: string
  body: string
}

const SEEDS: Record<string, EmailDraftSeed> = {
  itank: {
    to: 'helpdesk@itank.net',
    subject: 'API Integration and Partner Connectivity Inquiry',
    body: `Dear iTANK Team,

This is Aiden from Ohmyhotel.

Following our recent discussion, I would like to officially inquire about the possible API integration scope with your platform.

In particular, we would like to check whether integration may be available for partners such as Yeogi Eottae, Chalet Korea, Taiwan HRC, and other potential distribution channels.

Could you kindly let us know the following details?

1. Available integration options
2. Required technical process
3. Possible partner connectivity scope
4. Commercial conditions
5. Expected timeline for review and onboarding

Once we receive your guidance, we will review internally with our development and commercial teams.

Thank you.

Best regards,
Aiden Park
Ohmyhotel`,
  },
  yeogi: {
    to: 'platform@yeogi.example',
    subject: 'API Integration — Next Steps & Supply Scope',
    body: `Dear Yeogi Eottae Team,

This is Aiden from Ohmyhotel.

Thank you for the productive discussion on the API integration. We are submitting the official inquiry to iTANK (helpdesk@itank.net) this week to confirm the technical process and commercial conditions.

In parallel, to prepare an internal briefing, could you help us align on the target supply scope across Korea, Japan and Vietnam? This will allow us to confirm inventory and commercial framing quickly.

We will keep you updated as soon as we receive iTANK's guidance.

Best regards,
Aiden Park
Ohmyhotel`,
  },
  grandhyatt: {
    to: 'revenue@grandhyattjeju.example',
    subject: 'July Rate, Allotment & Summer Promotion Request',
    body: `Dear Grand Hyatt Jeju Revenue Team,

Thank you for the positive discussion on a direct contract. To move forward for the July peak, could you kindly share the following?

1. Net rate and suite-room rates for July
2. July room availability
3. Allotment (ALM) proposal for peak weekends
4. Cancellation policy
5. A summer promotion condition we can feature

We are seeing strong family and luxury VIP demand and would like to position Grand Hyatt Jeju prominently for Korea inbound.

Best regards,
Mina Seo
Ohmyhotel`,
  },
  medkorea: {
    to: 'partnerships@medicalkorea.example',
    subject: 'Cooperation Conditions — Net Rate & Settlement',
    body: `Dear Medical Korea Service Team,

Thank you for your interest in cooperating with Ohmyhotel. Please find a summary of the proposed cooperation conditions:

1. Supply model: Ohmyhotel provides net rates; your team adds its own markup.
2. Settlement: net settlement, with a prepaid structure during the initial ramp-up until volume is stable.
3. Guarantee booking: bookings are guaranteed upon confirmation; we will share the step-by-step process.
4. Cancellation & change: policies vary by hotel; we will provide a per-hotel reference sheet.

We are happy to walk through any of the above on a short call.

Best regards,
Soyeon Lim
Ohmyhotel`,
  },
  klook: {
    to: 'partnerships@klook.example',
    subject: 'SLA — Support Coverage & Compensation Wording',
    body: `Dear Klook Partnerships Team,

Thank you for sharing the SLA draft. We would like to propose two adjustments to ensure a sustainable partnership:

1. Support coverage: our standard coverage is 06:00–24:00. For off-hours, we propose a defined escalation path rather than a 24/7 obligation.
2. Compensation: we propose capping compensation to documented, attributable service failures, with clear wording on settlement cycle, deposit and refund.

We are confident we can finalize balanced terms quickly and remain fully committed to the partnership.

Best regards,
Daniel Cho
Ohmyhotel`,
  },
  hotelbeds: {
    to: 'commercial@hotelbeds.example',
    subject: 'Integration Fee — Waiver / Deferral Proposal',
    body: `Dear Hotelbeds Commercial Team,

Thank you for the details on the USD 25,000 integration fee. To align cost with proven business value, we propose the following:

1. Waiver or deferral of the integration fee until successful go-live.
2. Linking any fee to a committed volume and rebate structure.
3. Confirming TGX approval and go-live conditions as a precondition.

This keeps both teams focused on growth and avoids committing cost before business feasibility is confirmed.

Best regards,
Daniel Cho
Ohmyhotel`,
  },
  dida: {
    to: 'tech@dida.example',
    subject: 'Joint Review — Room-Type Mapping & Cancellation Accuracy',
    body: `Dear Dida Technical Team,

Thank you for flagging the offline accuracy issues. We propose a joint review focused on:

1. Room-type code mapping validation.
2. Cancellation-policy false-positive cases.
3. A shared classification that separates Dida-side invalid room-type codes from genuine Ohmyhotel sold-out responses.

We will share the audit findings and a remediation timeline within five business days of the review.

Best regards,
Mina Seo
Ohmyhotel`,
  },
}

export const draftSeedForEntity = (entityId: string): EmailDraftSeed | undefined =>
  SEEDS[entityId]
