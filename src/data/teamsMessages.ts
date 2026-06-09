// Microsoft Teams mock data — internal channel messages with AI extraction.

export interface TeamsMessage {
  id: string
  entityId: string
  date: string // ISO date
  channel: string
  sender: string
  messageSummary: string
  aiExtractedIssue: string
  relatedAction: string
}

export const teamsMessages: TeamsMessage[] = [
  {
    id: 'tm-yeogi-1',
    entityId: 'yeogi',
    date: '2026-06-04',
    channel: '#kr-channel-expansion',
    sender: 'Aiden Park',
    messageSummary:
      'iTANK wants the official inquiry before assigning engineers. Need to confirm whether Chalet Korea and Taiwan HRC ride the same integration.',
    aiExtractedIssue: 'Official iTANK inquiry pending; phase-one supply scope unconfirmed',
    relatedAction: 'Send official API inquiry to helpdesk@itank.net',
  },
  {
    id: 'tm-yeogi-2',
    entityId: 'yeogi',
    date: '2026-06-04',
    channel: '#kr-channel-expansion',
    sender: 'Sophia Kim',
    messageSummary:
      'Chalet Korea willing to participate; Taiwan HRC open but needs settlement-currency clarity. I can prep rate sheets for the CEO briefing.',
    aiExtractedIssue: 'Taiwan HRC settlement currency undecided; rate sheets needed for briefing',
    relatedAction: 'Prepare CEO briefing inventory & rate sheets',
  },
  {
    id: 'tm-itank-1',
    entityId: 'itank',
    date: '2026-06-05',
    channel: '#kr-channel-expansion',
    sender: 'Aiden Park',
    messageSummary:
      'iTANK moved us to helpdesk@itank.net. Drafting a single inquiry covering options, docs, process, commercial model, timeline and partner scope.',
    aiExtractedIssue: 'Formal inquiry must cover all six clarification items in one email',
    relatedAction: 'Draft structured inquiry to helpdesk@itank.net',
  },
  {
    id: 'tm-grandhyatt-1',
    entityId: 'grandhyatt',
    date: '2026-06-08',
    channel: '#kr-hotel-contracting',
    sender: 'Mina Seo',
    messageSummary:
      'Grand Hyatt Jeju open to direct contract. Need July availability, suite rates, ALM, cancellation policy and a summer promotion. Strong VIP family demand.',
    aiExtractedIssue: 'July suite inventory could sell out before terms are locked',
    relatedAction: 'Request net rate, ALM, cancellation policy & summer promo',
  },
  {
    id: 'tm-medkorea-1',
    entityId: 'medkorea',
    date: '2026-06-04',
    channel: '#kr-corporate-sales',
    sender: 'Soyeon Lim',
    messageSummary:
      'MKS unclear on net vs commission. Proposing prepaid during ramp-up. Need to document guarantee booking and per-hotel cancellation rules.',
    aiExtractedIssue: 'Net-rate model and settlement structure not yet explained in writing',
    relatedAction: 'Send structured cooperation & settlement summary',
  },
  {
    id: 'tm-klook-1',
    entityId: 'klook',
    date: '2026-06-03',
    channel: '#sea-partners',
    sender: 'Daniel Cho',
    messageSummary:
      'Klook SLA wants 24/7 support — we only cover 06:00–24:00. Pushing back with an off-hours escalation path and capped compensation. Legal review needed.',
    aiExtractedIssue: 'Excessive SLA liability risk from 24/7 + broad compensation wording',
    relatedAction: 'Counter 24/7 clause and cap compensation with legal',
  },
  {
    id: 'tm-hotelbeds-1',
    entityId: 'hotelbeds',
    date: '2026-06-03',
    channel: '#global-distribution',
    sender: 'Daniel Cho',
    messageSummary:
      'Hotelbeds USD 25,000 fee is non-refundable. Asking for waiver/deferral tied to go-live and a rebate structure. Do not commit before feasibility.',
    aiExtractedIssue: 'Non-refundable fee is a sunk-cost risk before feasibility is proven',
    relatedAction: 'Request fee waiver/deferral tied to go-live & rebate',
  },
  {
    id: 'tm-dida-1',
    entityId: 'dida',
    date: '2026-05-30',
    channel: '#mapping-quality',
    sender: 'Mina Seo',
    messageSummary:
      'Dida offline accuracy issue — room-type code mismatch + cancellation false-positives. Need joint review to separate their invalid codes from our genuine sold-out.',
    aiExtractedIssue: 'Cannot yet distinguish Dida-side invalid codes from genuine sold-out cases',
    relatedAction: 'Schedule joint mapping & room-type validation review',
  },
  {
    id: 'tm-dida-2',
    entityId: 'dida',
    date: '2026-05-30',
    channel: '#mapping-quality',
    sender: 'Mapping Team',
    messageSummary:
      'Can start the validation Monday. Send the master inventory file and the list of mismatch bookings.',
    aiExtractedIssue: 'Mapping team needs master inventory + mismatch booking list to start',
    relatedAction: 'Send master inventory file and mismatch booking list',
  },
  {
    id: 'tm-traveloka-1',
    entityId: 'traveloka',
    date: '2026-06-06',
    channel: '#sea-partners',
    sender: 'Daniel Cho',
    messageSummary:
      'Traveloka prebook success rate nearing the auto-suspension threshold. No Room Available errors up. Need VN/KR/MY/JP monitoring + Atlas schema review.',
    aiExtractedIssue: 'Automated suspension risk if prebook failure rate is not reduced',
    relatedAction: 'Deploy per-market prebook failure monitoring',
  },
  {
    id: 'tm-goglobal-1',
    entityId: 'goglobal',
    date: '2026-06-07',
    channel: '#api-partnerships',
    sender: 'Aiden Park',
    messageSummary:
      'GoGlobal SLA reviewed. Need to confirm seal/signature status and get the API live key. Sophia handling supply readiness.',
    aiExtractedIssue: 'Countersignature/seal status ambiguous; live key timing unknown',
    relatedAction: 'Confirm countersignature status & request live key',
  },
  {
    id: 'tm-webbeds-1',
    entityId: 'webbeds',
    date: '2026-06-01',
    channel: '#api-partnerships',
    sender: 'Aiden Park',
    messageSummary:
      'WebBeds Korea API client expansion — dev priority low. Building a 30-prospect Korea list. JP/VN competitiveness looks weaker than expected.',
    aiExtractedIssue: 'Resource-prioritization decision pending on weak JP/VN competitiveness',
    relatedAction: 'Build 30-prospect Korea list & validate JP/VN rates',
  },
  {
    id: 'tm-poseidon-1',
    entityId: 'poseidon',
    date: '2026-05-31',
    channel: '#activity-suppliers',
    sender: 'Soyeon Lim',
    messageSummary:
      'Poseidon age + cancellation policy confirmed, 50% advance required. Need on-site payment + no-show control and the Naver Smart Store sales process.',
    aiExtractedIssue: 'On-site payment & no-show control undefined; Smart Store listing blocked',
    relatedAction: 'Align on-site payment/no-show control & Smart Store flow',
  },
  {
    id: 'tm-aphrodite-1',
    entityId: 'aphrodite',
    date: '2026-05-29',
    channel: '#activity-suppliers',
    sender: 'Soyeon Lim',
    messageSummary:
      'Aphrodite deposit already paid. Still need payment method, passport policy, weather-cancellation refund, charter condition and beverage payment process.',
    aiExtractedIssue: 'Deposit paid but operating terms undefined — exposure risk',
    relatedAction: 'Confirm payment, passport, weather & charter terms',
  },
  {
    id: 'tm-chaletkorea-1',
    entityId: 'chaletkorea',
    date: '2026-06-04',
    channel: '#kr-channel-expansion',
    sender: 'Aiden Park',
    messageSummary:
      'Chalet Korea tied to iTANK connectivity. Confirm API feasibility and scope supply; relationship type still channel/supplier/B2B TBD.',
    aiExtractedIssue: 'Relationship type ambiguous; supply scope feeds the Yeogi CEO briefing',
    relatedAction: 'Confirm iTANK feasibility & scope Chalet Korea supply',
  },
  {
    id: 'tm-taiwanhrc-1',
    entityId: 'taiwanhrc',
    date: '2026-06-03',
    channel: '#kr-channel-expansion',
    sender: 'Aiden Park',
    messageSummary:
      'Taiwan HRC tied to iTANK connectivity. Need API feasibility, target destinations, settlement (TWD vs USD) and expected volume.',
    aiExtractedIssue: 'Settlement currency undecided; expected volume unknown',
    relatedAction: 'Confirm API feasibility & gather settlement/volume',
  },
]

export const teamsByEntity = (entityId: string): TeamsMessage[] =>
  teamsMessages.filter((t) => t.entityId === entityId)
