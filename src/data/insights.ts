// AI insight mock data — one structured insight per business relationship.
// Simulates the "AI Engine Demo" output used on Relationship 360, Data Insight,
// Ask OAC and the Dashboard.

export interface Insight {
  entityId: string
  insightSummary: string
  recommendedActions: string[]
  riskWarnings: string[]
  strategicDirection: string
  nextBestAction: string
}

import { getContentLang } from './contentLang'
import { insightKo, todaysBriefingKo } from './contentKo'

export const insights: Insight[] = [
  {
    entityId: 'yeogi',
    insightSummary:
      'Yeogi Eottae is a high-leverage API integration opportunity blocked by a single outbound action. Detected context: API Integration / Channel Expansion.',
    recommendedActions: [
      'Send the official inquiry to helpdesk@itank.net today',
      'Confirm Korea/Japan/Vietnam supply scope including Chalet Korea & Taiwan HRC',
      'Prepare a CEO briefing with a concrete inventory number',
      'Ask development to confirm API feasibility and effort',
    ],
    riskWarnings: [
      'Momentum stalls if the inquiry slips another week',
      'CEO briefing cannot proceed without a firm supply figure',
    ],
    strategicDirection:
      'Use one iTANK integration to open Korea, Japan and Vietnam supply at once — treat it as a channel-expansion platform, not a single-partner connection.',
    nextBestAction: 'Send the official API integration inquiry to helpdesk@itank.net',
  },
  {
    entityId: 'itank',
    insightSummary:
      'iTANK is the connectivity gatekeeper for the entire Korea cluster. Detected context: Technology Partner / API Connectivity.',
    recommendedActions: [
      'Submit one structured inquiry covering all six clarification items',
      'Request the connectable-partner scope (Yeogi, Chalet Korea, Taiwan HRC)',
      'Ask for required documents and the technical process',
      'Confirm the commercial model and expected timeline',
    ],
    riskWarnings: [
      'Engineering allocation is blocked until the formal inquiry is filed',
      'An unclear commercial model could surface unexpected integration costs',
    ],
    strategicDirection:
      'Treat iTANK as a platform partner: one clean integration unlocks multiple distribution partners, so invest in clarifying scope up front.',
    nextBestAction: 'Email helpdesk@itank.net with the full structured inquiry',
  },
  {
    entityId: 'grandhyatt',
    insightSummary:
      'Grand Hyatt Jeju is ready for a direct contract; only commercial terms remain. Detected context: Hotel Contracting / Rate Negotiation.',
    recommendedActions: [
      'Request net rate, July availability and suite rates',
      'Agree allotment (ALM) for peak weekends',
      'Confirm cancellation policy and a summer promotion',
      'Position family/VIP demand to justify direct terms',
    ],
    riskWarnings: ['July suite inventory may sell out before terms are locked'],
    strategicDirection:
      'Anchor Korea inbound and VIP family demand with a flagship Jeju direct contract and a protected peak allotment.',
    nextBestAction: 'Request net rate, ALM, cancellation policy and summer promotion',
  },
  {
    entityId: 'medkorea',
    insightSummary:
      'Medical Korea Service needs settlement clarity before committing. Detected context: Corporate Client / Net Rate Sales.',
    recommendedActions: [
      'Send a structured net-rate cooperation summary',
      'Explain prepaid settlement during the ramp-up phase',
      'Document the guarantee-booking process',
      'Compile per-hotel cancellation and change rules',
    ],
    riskWarnings: [
      'Net vs. commission confusion could stall the deal',
      'Settlement risk rises without prepaid terms before volume is proven',
    ],
    strategicDirection:
      'Win recurring long-stay medical-tourism demand by making the net-rate and settlement model transparent and low-risk.',
    nextBestAction: 'Send the structured net-rate & prepaid settlement summary',
  },
  {
    entityId: 'supdanang',
    insightSummary:
      'SUP Da Nang product setup is blocked on operating conditions. Detected context: Supplier Product / Operation Setup.',
    recommendedActions: [
      'Request the final product sheet and net price',
      'Set the schedule and reservation cut-off time',
      'Lock the weather-cancellation policy',
      'Confirm settlement method and customer preparation items',
    ],
    riskWarnings: ['Weather-cancellation ambiguity is the top guest-experience risk'],
    strategicDirection:
      'Launch a clean, high-margin activity product by resolving the weather policy first — it is the make-or-break operational detail.',
    nextBestAction: 'Request the final product sheet and full operating conditions',
  },
  {
    entityId: 'danangsurf',
    insightSummary:
      'Danang Holiday Surf needs reservation and seasonal operation rules. Detected context: Supplier Product / Reservation Operation.',
    recommendedActions: [
      'Confirm booking cut-off and payment method',
      'Document weather-cancellation and refund policy',
      'Define winter / rainy-day operation rules',
      'Consider a surf + SUP bundle for Da Nang cross-sell',
    ],
    riskWarnings: ['Seasonal availability confusion could cause monsoon-period cancellations'],
    strategicDirection:
      'Package the lesson + rental + photo + free-surf inclusion as a differentiated Da Nang activity bundle.',
    nextBestAction: 'Confirm cut-off, payment and weather/seasonal operation rules',
  },
  {
    entityId: 'goglobal',
    insightSummary:
      'GoGlobal is one signature and one key from go-live. Detected context: SLA / API Partnership.',
    recommendedActions: [
      'Confirm whether the company seal is complete and signature pending',
      'Ask GoGlobal when the API live key will be issued',
      'Align supply readiness with Sophia',
      'Document the PIC handover to Aiden',
    ],
    riskWarnings: ['Go-live slips if countersignature status stays ambiguous'],
    strategicDirection:
      'Convert a reviewed SLA into live distribution quickly — the partner is ready and the blockers are administrative, not commercial.',
    nextBestAction: 'Confirm countersignature status and request the API live key',
  },
  {
    entityId: 'klook',
    insightSummary:
      'Klook\'s SLA exposes Ohmyhotel to excessive liability. Detected context: SLA / Contract Risk.',
    recommendedActions: [
      'Counter the 24/7 clause with 06:00–24:00 + escalation path',
      'Cap compensation to documented, attributable failures',
      'Review settlement cycle, deposit and refund wording with legal',
      'Share a flash-sale failure-rate mitigation plan',
    ],
    riskWarnings: [
      'Unbounded compensation exposure if wording is not capped',
      'Agreeing to 24/7 sets an obligation operations cannot meet',
    ],
    strategicDirection:
      'Keep a major SEA channel while ring-fencing liability — balance, not concession, protects the partnership long-term.',
    nextBestAction: 'Counter the 24/7 SLA clause and cap compensation with legal',
  },
  {
    entityId: 'hotelbeds',
    insightSummary:
      'Hotelbeds wants a non-refundable fee before feasibility is proven. Detected context: Commercial Negotiation / Integration Fee.',
    recommendedActions: [
      'Request a waiver or deferral of the USD 25,000 fee until go-live',
      'Tie any fee to a committed volume and rebate structure',
      'Make TGX approval a precondition',
      'Confirm go-live conditions before any commitment',
    ],
    riskWarnings: [
      'Paying a non-refundable fee before feasibility is a sunk-cost risk',
      'Flat QoQ volume weakens leverage on the fee',
    ],
    strategicDirection:
      'Only commit cost against proven business value — convert the fee from a flat charge into a success-linked, volume-tied term.',
    nextBestAction: 'Request waiver/deferral tied to go-live and rebate terms',
  },
  {
    entityId: 'dida',
    insightSummary:
      'Dida\'s failures are mostly its own invalid room-type codes, not our sold-out. Detected context: Booking Failure / Technical Accuracy Issue.',
    recommendedActions: [
      'Schedule a joint mapping & room-type validation review',
      'Build shared rules separating invalid codes from genuine sold-out',
      'Send the master inventory file and mismatch booking list',
      'Deliver a remediation timeline to Dida',
    ],
    riskWarnings: [
      'Continued mapping errors erode trust and signal churn',
      'Mis-attributed sold-out cases inflate dispute volume',
    ],
    strategicDirection:
      'Recover the largest single failure source (52% Dida-side invalid codes) through a joint technical fix — this is a recoverable, not structural, decline.',
    nextBestAction: 'Schedule the joint mapping & room-type validation review',
  },
  {
    entityId: 'traveloka',
    insightSummary:
      'Traveloka prebook failures are approaching the auto-suspension threshold. Detected context: Prebook Failure / API Monitoring.',
    recommendedActions: [
      'Deploy per-market (VN/KR/MY/JP) prebook failure monitoring',
      'Prioritize the largest "No Room Available" sources',
      'Complete the Atlas API schema update review',
      'Hold volume expansion until failures fall',
    ],
    riskWarnings: ['Automated suspension if the failure rate crosses the threshold'],
    strategicDirection:
      'Stabilize the prebook path before scaling — protect strong Indonesia/Vietnam volume rather than risk an auto-suspension.',
    nextBestAction: 'Deploy per-market prebook failure monitoring',
  },
  {
    entityId: 'webbeds',
    insightSummary:
      'WebBeds is a Korea-first opportunity with weak JP/VN economics. Detected context: Channel Expansion / Prospect Development.',
    recommendedActions: [
      'Build the 30-prospect Korea-first list',
      'Validate Japan/Vietnam rate competitiveness with real comparisons',
      'Make a clear go/defer decision on development resource',
      'Focus direct-contract effort where Korea is strongest',
    ],
    riskWarnings: [
      'Investing into weak JP/VN competitiveness could waste development resource',
      'Delaying too long cedes the Korea opportunity to competitors',
    ],
    strategicDirection:
      'Prioritize Korea direct-contract expansion where the data is strong; defer JP/VN until competitiveness is proven.',
    nextBestAction: 'Build the 30-prospect Korea list and validate JP/VN rates',
  },
  {
    entityId: 'poseidon',
    insightSummary:
      'Poseidon is near ready; only sales-operation details remain. Detected context: Supplier Policy / Activity Product Operation.',
    recommendedActions: [
      'Align on-site payment handling and no-show control',
      'Finalize product images',
      'Clarify the Naver Smart Store sales process',
      'List products for the Korean outbound market',
    ],
    riskWarnings: ['Weak no-show control with on-site payment increases revenue leakage'],
    strategicDirection:
      'Bring confirmed activity products to the Korean outbound market via Naver Smart Store with tight no-show control.',
    nextBestAction: 'Align on-site payment & no-show control, finalize Smart Store listing',
  },
  {
    entityId: 'aphrodite',
    insightSummary:
      'Aphrodite has a paid deposit but undefined operating terms. Detected context: Supplier Product / Yacht Operation.',
    recommendedActions: [
      'Confirm the payment method',
      'Define the passport-information policy',
      'Lock the weather-cancellation and refund rule',
      'Clarify charter condition and beverage payment process',
    ],
    riskWarnings: ['Deposit already paid — undefined terms increase financial exposure'],
    strategicDirection:
      'Differentiate the Greece portfolio with a premium yacht-charter product, protected by watertight high-value booking terms.',
    nextBestAction: 'Confirm payment, passport, weather-cancellation and charter terms',
  },
  {
    entityId: 'chaletkorea',
    insightSummary:
      'Chalet Korea connectivity depends on iTANK and feeds the Yeogi briefing. Detected context: Partner Connectivity / B2B Sales Opportunity.',
    recommendedActions: [
      'Confirm with iTANK whether Chalet Korea can connect',
      'Scope inventory and sales potential',
      'Determine the relationship type from future communication',
      'Tie supply confirmation to the Yeogi CEO briefing',
    ],
    riskWarnings: ['Supply scope is on the critical path for the Yeogi Eottae briefing'],
    strategicDirection:
      'Confirm Chalet Korea supply early so the Yeogi Eottae CEO briefing can present a firm inventory number.',
    nextBestAction: 'Confirm iTANK feasibility and scope Chalet Korea supply',
  },
  {
    entityId: 'taiwanhrc',
    insightSummary:
      'Taiwan HRC connectivity is blocked on settlement clarity. Detected context: Partner Connectivity / B2B Expansion.',
    recommendedActions: [
      'Confirm iTANK API feasibility for Taiwan HRC',
      'Understand target destinations',
      'Decide settlement currency (TWD vs USD) and cycle',
      'Estimate expected sales volume',
    ],
    riskWarnings: ['Currency/settlement friction could delay supply confirmation'],
    strategicDirection:
      'Add Taiwan inventory and outbound demand to the channel, resolving settlement currency first to keep the API scope on schedule.',
    nextBestAction: 'Confirm API feasibility and gather destinations, settlement & volume',
  },
]

export const insightByEntity = (entityId: string): Insight | undefined => {
  const i = insights.find((x) => x.entityId === entityId)
  if (!i) return undefined
  if (getContentLang() !== 'ko') return i
  const ko = insightKo[entityId]
  return ko ? { ...i, ...ko } : i
}

// Natural-language portfolio briefing for the Dashboard "Today's AI Briefing".
const todaysBriefingEn =
  'Today, OAC detected several priority contexts. Yeogi Eottae requires an official iTANK inquiry for API connectivity. Klook has SLA risk related to 24/7 support and compensation wording. Grand Hyatt Jeju requires hotel contracting follow-up for July rates and availability. Medical Korea Service needs a clear net-rate and prepaid settlement explanation. Dida requires technical review due to offline accuracy issues.'

export const getTodaysBriefing = (): string =>
  getContentLang() === 'ko' ? todaysBriefingKo : todaysBriefingEn
