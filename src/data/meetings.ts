// Meeting Recorder mock data — simulated transcribed & AI-summarized meetings.

export interface Meeting {
  id: string
  entityId: string
  date: string // ISO date
  title: string
  participants: string[]
  rawNotes: string
  aiSummary: string
  keyPoints: string[]
  decisions: string[]
  openIssues: string[]
  followUps: string[]
  risks: string[]
}

export const meetings: Meeting[] = [
  {
    id: 'mtg-yeogi-0605',
    entityId: 'yeogi',
    date: '2026-06-05',
    title: 'Yeogi Eottae — API Integration Scoping',
    participants: ['Aiden Park (Ohmyhotel)', 'Platform Lead (Yeogi Eottae)', 'iTANK Liaison'],
    rawNotes:
      'Yeogi interested in API connection for domestic + inbound supply. iTANK says move to official channel - email helpdesk@itank.net before any engineering. Asked if Chalet Korea / Taiwan HRC can ride same integration. Yeogi wants Korea + Japan + Vietnam scope eventually. CEO will want an inventory number + commercial terms before approving resource.',
    aiSummary:
      'Yeogi Eottae confirmed interest in an API integration covering Korea, Japan and Vietnam supply. iTANK requires the conversation to move to an official inquiry (helpdesk@itank.net) before allocating engineers. Chalet Korea and Taiwan HRC were raised as candidate partners on the same integration. A CEO briefing with a concrete inventory number and commercial terms is the gate to approval.',
    keyPoints: [
      'iTANK requires an official email inquiry before resource allocation',
      'Target supply scope spans Korea, Japan and Vietnam',
      'Chalet Korea and Taiwan HRC raised as same-integration candidates',
      'CEO approval needs inventory figure + commercial terms',
    ],
    decisions: [
      'Proceed via the iTANK technology layer rather than direct integration',
      'Official inquiry to be sent before engineering is engaged',
    ],
    openIssues: [
      'Supply scope (Korea/Japan/Vietnam) not yet quantified',
      'Commercial conditions undefined',
    ],
    followUps: [
      'Send official API inquiry to helpdesk@itank.net',
      'Confirm Chalet Korea & Taiwan HRC connectivity scope',
      'Prepare CEO briefing with inventory and commercial framing',
    ],
    risks: ['Opportunity stalls without the official inquiry; CEO briefing blocked on supply numbers'],
  },
  {
    id: 'mtg-itank-0605',
    entityId: 'itank',
    date: '2026-06-05',
    title: 'iTANK — Official Channel & Integration Options',
    participants: ['Aiden Park (Ohmyhotel)', 'iTANK Partnerships'],
    rawNotes:
      'Moved from messenger to email. iTANK: please send everything via helpdesk@itank.net. Need from them: integration options, required docs, technical process, commercial model, expected timeline, list of partners we can connect (Yeogi, Chalet Korea, Taiwan HRC). They will not assign engineers until formal inquiry received.',
    aiSummary:
      'Communication with iTANK has formally moved from messenger to email. iTANK asked Ohmyhotel to submit all requests via helpdesk@itank.net. Ohmyhotel needs to obtain integration options, required documents, the technical process, the commercial model, the expected timeline and the list of connectable partners. Engineering resources are gated on the formal inquiry.',
    keyPoints: [
      'All communication to go through helpdesk@itank.net',
      'Six items to clarify: options, documents, process, commercial model, timeline, partner scope',
      'Engineering allocation gated on the formal inquiry',
    ],
    decisions: ['Submit a single structured inquiry covering all six items'],
    openIssues: ['Integration options, commercial model and timeline all unknown'],
    followUps: ['Draft and send the structured inquiry to helpdesk@itank.net'],
    risks: ['Delay in formal inquiry blocks the whole Korea connectivity cluster'],
  },
  {
    id: 'mtg-grandhyatt-0608',
    entityId: 'grandhyatt',
    date: '2026-06-08',
    title: 'Grand Hyatt Jeju — July Contracting & Rates',
    participants: ['Mina Seo (Ohmyhotel)', 'Revenue Manager (Grand Hyatt Jeju)', 'Cluster DOSM'],
    rawNotes:
      'Checking direct contract feasibility. July peak - need availability + suite rates. Family/luxury VIP demand looks strong. Need cancellation policy, allotment (ALM), and a summer promotion. Hotel open to direct but wants a clear allotment commitment.',
    aiSummary:
      'Grand Hyatt Jeju is open to a direct contract. For the July peak, Ohmyhotel needs confirmed availability and suite-room rates. Family and luxury VIP demand is strong. Cancellation policy, allotment (ALM) and a summer promotion still need to be agreed; the hotel wants a clear allotment commitment in return for direct terms.',
    keyPoints: [
      'Hotel open to a direct contract',
      'July availability and suite rates are the immediate need',
      'Strong family / luxury VIP demand signal',
      'Allotment commitment expected in return for direct terms',
    ],
    decisions: ['Pursue a direct contract with a protected July allotment'],
    openIssues: ['Suite rates, ALM, cancellation policy and summer promotion unconfirmed'],
    followUps: [
      'Request net rate, July availability and suite rates',
      'Agree allotment (ALM) and cancellation policy',
      'Propose a summer promotion condition',
    ],
    risks: ['July suite inventory may sell out before terms are locked'],
  },
  {
    id: 'mtg-medkorea-0604',
    entityId: 'medkorea',
    date: '2026-06-04',
    title: 'Medical Korea Service — Cooperation & Net-Rate Model',
    participants: ['Soyeon Lim (Ohmyhotel)', 'Partnerships Director (MKS)'],
    rawNotes:
      'MKS wants to cooperate. Model: we supply net rate, they add markup. Need to explain net settlement clearly. Likely prepaid until volume stable. Guarantee booking process unclear to them. Cancellation/change differs by hotel - must document.',
    aiSummary:
      'Medical Korea Service wants to cooperate on a net-rate model: Ohmyhotel supplies net rates and MKS applies its own markup. The net settlement model must be explained clearly, with a prepaid structure likely until volume stabilizes. The guarantee-booking process is unclear to MKS, and per-hotel cancellation/change rules need to be documented.',
    keyPoints: [
      'Net-rate model with client-side markup',
      'Prepaid settlement expected during ramp-up',
      'Guarantee-booking process needs explanation',
      'Cancellation/change rules vary by hotel',
    ],
    decisions: ['Proceed with a net-rate cooperation, prepaid during ramp-up'],
    openIssues: ['Settlement model, guarantee booking and cancellation rules undocumented'],
    followUps: [
      'Send a structured cooperation-condition summary',
      'Document the guarantee-booking flow',
      'Compile per-hotel cancellation/change rules',
    ],
    risks: ['Net vs. commission confusion could stall the deal'],
  },
  {
    id: 'mtg-supdanang-0603',
    entityId: 'supdanang',
    date: '2026-06-03',
    title: 'SUP Da Nang — Paddle Tour Product Setup',
    participants: ['Soyeon Lim (Ohmyhotel)', 'Owner (SUP Da Nang)'],
    rawNotes:
      'Selected Sunrise/Sunset SUP Paddle Tour. Need product sheet, net price, schedule, reservation cutoff, weather cancellation policy, settlement method, customer preparation items. Weather cancellation is the tricky part for water activity.',
    aiSummary:
      'The Sunrise and Sunset SUP Paddle Tour was selected for setup. To publish, Ohmyhotel needs the final product sheet, net price, schedule, reservation cut-off, weather-cancellation policy, settlement method and customer preparation items. The weather-cancellation policy is the key operational risk for a water activity.',
    keyPoints: [
      'Sunrise/Sunset SUP Paddle Tour confirmed as the product',
      'Product sheet, net price and schedule outstanding',
      'Weather-cancellation policy is the main operational concern',
    ],
    decisions: ['Proceed to product setup once the sheet and policies are received'],
    openIssues: ['Net price, cut-off, weather policy, settlement and prep items undefined'],
    followUps: ['Request final product sheet and full operating conditions'],
    risks: ['Weather-cancellation ambiguity risks guest-experience complaints at launch'],
  },
  {
    id: 'mtg-danangsurf-0602',
    entityId: 'danangsurf',
    date: '2026-06-02',
    title: 'Danang Holiday Surf — Reservation Operation',
    participants: ['Soyeon Lim (Ohmyhotel)', 'Manager (Danang Holiday Surf)'],
    rawNotes:
      'Classes at 09:00 and 14:30. Lesson includes rental + photo. Free surfing same day after lesson. Need booking cutoff + payment method. Weather cancellation + refund policy unclear. Winter/rainy day operation needs a rule.',
    aiSummary:
      'Danang Holiday Surf offers 09:00 and 14:30 classes including rental and photos, with free same-day surfing after the lesson. Operationally, Ohmyhotel needs to set the booking cut-off and payment method, clarify the weather-cancellation/refund policy, and confirm the winter/rainy-day operation process.',
    keyPoints: [
      'Fixed 09:00 / 14:30 class schedule with rental + photo + free same-day surfing',
      'Booking cut-off and payment method undefined',
      'Winter/rainy-day operation needs an explicit rule',
    ],
    decisions: ['Document operation rules before listing the product'],
    openIssues: ['Cut-off, payment, weather refund and seasonal operation unconfirmed'],
    followUps: ['Confirm cut-off & payment method', 'Document weather/seasonal operation rules'],
    risks: ['Seasonal availability confusion could cause monsoon-period cancellations'],
  },
  {
    id: 'mtg-goglobal-0607',
    entityId: 'goglobal',
    date: '2026-06-07',
    title: 'GoGlobal Travel — SLA Countersignature & Live Key',
    participants: ['Aiden Park (Ohmyhotel)', 'Sophia Kim (Ohmyhotel Supply)', 'GoGlobal Commercial'],
    rawNotes:
      'SLA reviewed. Need to confirm countersignature process - is the seal done? signature still pending? Commercial PIC now Aiden. Supply coordination via Sophia. Main blocker: when do we get the API live key? Want go-live ASAP.',
    aiSummary:
      'The GoGlobal SLA has been reviewed. The open process question is the countersignature — whether the company seal is complete and whether the signature is still pending. Aiden is now the commercial PIC; Sophia handles supply-side coordination. The main blocker to go-live is the timing of the API live key.',
    keyPoints: [
      'SLA reviewed; countersignature/seal status ambiguous',
      'Commercial PIC handed over to Aiden, supply coordination via Sophia',
      'API live key timing is the go-live blocker',
    ],
    decisions: ['Confirm countersignature status in writing and request live-key timing'],
    openIssues: ['Seal/signature status unclear; live key not received'],
    followUps: [
      'Confirm whether seal is complete and signature pending',
      'Ask GoGlobal when the API live key will be issued',
      'Align supply readiness with Sophia',
    ],
    risks: ['Go-live slips if countersignature status stays ambiguous'],
  },
  {
    id: 'mtg-klook-0604',
    entityId: 'klook',
    date: '2026-06-04',
    title: 'Klook — SLA & Support Obligation Review',
    participants: ['Daniel Cho (Ohmyhotel)', 'Partnerships (Klook)', 'Legal (Klook)'],
    rawNotes:
      'Klook SLA wants 24/7 support - we only cover 06:00-24:00. Compensation responsibility unclear. Need to review settlement cycle, deposit, refund, CS compensation wording. Must protect us from excessive liability. Off-hours escalation path could be a compromise.',
    aiSummary:
      'Klook\'s SLA requires 24/7 support, which Ohmyhotel cannot meet (coverage is 06:00–24:00). Compensation responsibility is unclear and the settlement cycle, deposit, refund and CS compensation wording need review. The objective is to protect Ohmyhotel from excessive liability, with an off-hours escalation path proposed as a compromise.',
    keyPoints: [
      '24/7 support obligation is not feasible (06:00–24:00 coverage)',
      'Compensation wording could create excessive liability',
      'Settlement cycle, deposit and refund terms need review',
    ],
    decisions: ['Counter the 24/7 clause with coverage window + off-hours escalation'],
    openIssues: ['Compensation cap and CS wording unresolved'],
    followUps: [
      'Counter 24/7 clause with 06:00–24:00 + escalation path',
      'Cap compensation to attributable failures (legal review)',
      'Review settlement/deposit/refund wording',
    ],
    risks: ['Unbounded compensation exposure if wording is not capped'],
  },
  {
    id: 'mtg-hotelbeds-0603',
    entityId: 'hotelbeds',
    date: '2026-06-03',
    title: 'Hotelbeds — Integration Fee Negotiation',
    participants: ['Daniel Cho (Ohmyhotel)', 'Commercial (Hotelbeds)'],
    rawNotes:
      'USD 25,000 integration fee, non-refundable - that is the problem. We asked for waiver or deferral. Rebate terms unclear. TGX approval + go-live conditions need review. Do not want to commit cost before feasibility is confirmed.',
    aiSummary:
      'Hotelbeds proposed a USD 25,000 integration fee with a non-refundable condition, which is the core issue. Ohmyhotel requested a waiver or deferral. Rebate terms are unclear and TGX approval plus go-live conditions need review. The guiding principle is to avoid committing cost before business feasibility is confirmed.',
    keyPoints: [
      'USD 25,000 non-refundable integration fee is the blocker',
      'Waiver or deferral requested',
      'Rebate terms and TGX approval/go-live conditions unclear',
    ],
    decisions: ['Do not commit the fee before feasibility; pursue success-linked terms'],
    openIssues: ['Fee waiver/deferral not granted; rebate terms undefined'],
    followUps: [
      'Request waiver or deferral tied to go-live',
      'Clarify rebate structure and volume commitment',
      'Make TGX approval a precondition',
    ],
    risks: ['Paying a non-refundable fee before feasibility is a sunk-cost risk'],
  },
  {
    id: 'mtg-dida-0530',
    entityId: 'dida',
    date: '2026-05-30',
    title: 'Dida — Offline Accuracy & Mapping Review',
    participants: ['Mina Seo (Ohmyhotel)', 'Mapping Team (Ohmyhotel)', 'Technical (Dida)'],
    rawNotes:
      'Offline accuracy issue. Room type code mismatch. Cancellation policy false positives. Need joint review. Key: separate Dida-side invalid room type code from our genuine sold-out cases. Otherwise we get blamed for their bad codes.',
    aiSummary:
      'Dida is experiencing offline accuracy problems: room-type code mismatches and cancellation-policy false-positives. A joint review is needed. The central task is to distinguish Dida-side invalid room-type codes from genuine Ohmyhotel sold-out cases so faults are attributed correctly and the right fixes are applied.',
    keyPoints: [
      'Room-type code mismatch causing offline issues',
      'Cancellation-policy false-positive cases',
      'Need to separate invalid-code errors from genuine sold-out',
    ],
    decisions: ['Run a joint mapping & room-type validation review'],
    openIssues: ['No shared classification yet for invalid-code vs. sold-out'],
    followUps: [
      'Schedule joint technical review',
      'Build shared room-type validation rules',
      'Deliver a remediation timeline to Dida',
    ],
    risks: ['Continued mapping errors erode trust and signal churn'],
  },
  {
    id: 'mtg-traveloka-0606',
    entityId: 'traveloka',
    date: '2026-06-06',
    title: 'Traveloka — Prebook Failure & API Monitoring',
    participants: ['Daniel Cho (Ohmyhotel)', 'Connectivity (Traveloka)'],
    rawNotes:
      'Automated suspension threshold tied to prebook success. Seeing No Room Available errors. Need failure-rate monitoring per market - VN, KR, MY, JP. Atlas API schema updates under review. Reduce failures before expanding volume or risk auto-suspend.',
    aiSummary:
      'Traveloka enforces an automated suspension threshold based on prebook success rate. "No Room Available" errors are elevated. Failure-rate monitoring is needed across VN, KR, MY and JP, and Atlas API schema updates are under review. Failures must be reduced before volume expansion to avoid automated suspension.',
    keyPoints: [
      'Automated suspension threshold on prebook success rate',
      'Elevated "No Room Available" errors',
      'Per-market monitoring (VN/KR/MY/JP) required',
      'Atlas API schema updates under review',
    ],
    decisions: ['Reduce prebook failures before any volume expansion'],
    openIssues: ['No per-market failure monitoring in place yet'],
    followUps: [
      'Deploy per-market prebook failure monitoring',
      'Prioritize largest No-Room-Available sources',
      'Complete Atlas API schema review',
    ],
    risks: ['Automated suspension if the failure rate crosses the threshold'],
  },
  {
    id: 'mtg-poseidon-0531',
    entityId: 'poseidon',
    date: '2026-05-31',
    title: 'Poseidon — Policy & Smart Store Sales Setup',
    participants: ['Soyeon Lim (Ohmyhotel)', 'Managing Director (Poseidon)'],
    rawNotes:
      'Age rules confirmed. Cancellation policy confirmed. Payment needs >=50% advance. Need to align on-site payment + no-show control. Product images + Naver Smart Store sales process still to clarify.',
    aiSummary:
      'Poseidon\'s age rules and cancellation policy are confirmed, and the payment policy requires at least 50% advance payment. Remaining work is to align on-site payment handling and no-show control, and to clarify product images and the Naver Smart Store sales process before listing.',
    keyPoints: [
      'Age rules and cancellation policy confirmed',
      '50% advance payment required',
      'On-site payment, no-show control and Smart Store process outstanding',
    ],
    decisions: ['Finalize on-site/no-show rules then list on Naver Smart Store'],
    openIssues: ['On-site payment, no-show control and product images unresolved'],
    followUps: [
      'Align on-site payment & no-show control',
      'Finalize product images',
      'Clarify Naver Smart Store sales process',
    ],
    risks: ['Weak no-show control with on-site payment increases revenue leakage'],
  },
  {
    id: 'mtg-aphrodite-0529',
    entityId: 'aphrodite',
    date: '2026-05-29',
    title: 'Aphrodite Yacht — Charter Operation Setup',
    participants: ['Soyeon Lim (Ohmyhotel)', 'Operations (Aphrodite Yacht)'],
    rawNotes:
      'Deposit already paid to Aphrodite. Need payment method, passport info policy, weather cancellation + refund rule, charter condition, beverage payment process. High-value product - terms must be tight.',
    aiSummary:
      'A deposit has already been paid to Aphrodite Yacht. To operate, Ohmyhotel needs to confirm the payment method, passport-information policy, weather-cancellation and refund rule, charter condition and the on-board beverage payment process. As a high-value charter product, the terms must be tightly defined.',
    keyPoints: [
      'Deposit already paid to the supplier',
      'Payment, passport, weather-cancellation, charter and beverage terms outstanding',
    ],
    decisions: ['Lock all operating terms before publishing the product'],
    openIssues: ['Payment method, passport policy and weather refund rule undefined'],
    followUps: ['Confirm payment, passport, weather-cancellation, charter & beverage terms'],
    risks: ['Deposit is already paid — unclear terms increase exposure if bookings fall through'],
  },
  {
    id: 'mtg-chaletkorea-0604',
    entityId: 'chaletkorea',
    date: '2026-06-04',
    title: 'Chalet Korea — iTANK Connectivity & Supply Scope',
    participants: ['Aiden Park (Ohmyhotel)', 'Sales (Chalet Korea)'],
    rawNotes:
      'Potential partner tied to iTANK connectivity. Confirm if API connection possible. Check sales potential + hotel supply scope. Still unclear if this is channel, supplier, or B2B - depends on next comms. Could feed Yeogi CEO briefing inventory.',
    aiSummary:
      'Chalet Korea is a candidate partner tied to the iTANK connectivity. We need to confirm whether an API connection is possible, assess sales potential and hotel supply scope, and determine whether the relationship is channel, supplier or B2B based on future communication. Their supply could feed the Yeogi Eottae CEO briefing inventory figure.',
    keyPoints: [
      'Connectivity depends on the iTANK integration',
      'Sales potential and supply scope not yet known',
      'Relationship type still ambiguous',
    ],
    decisions: ['Confirm iTANK feasibility, then scope supply'],
    openIssues: ['API feasibility, supply scope and relationship type unconfirmed'],
    followUps: [
      'Confirm with iTANK whether Chalet Korea can connect',
      'Scope inventory and sales potential',
      'Tie supply confirmation to the Yeogi CEO briefing',
    ],
    risks: ['Supply scope is on the critical path for the Yeogi Eottae briefing'],
  },
  {
    id: 'mtg-taiwanhrc-0603',
    entityId: 'taiwanhrc',
    date: '2026-06-03',
    title: 'Taiwan HRC — Connectivity & Commercial Scope',
    participants: ['Aiden Park (Ohmyhotel)', 'Business Dev (Taiwan HRC)'],
    rawNotes:
      'Potential partner tied to iTANK connectivity. Confirm API possible. Understand target destinations, settlement condition (TWD vs USD, cycle), expected sales volume. Currency/reporting could be friction.',
    aiSummary:
      'Taiwan HRC is a candidate partner tied to the iTANK connectivity. We must confirm whether an API connection is feasible and understand their target destinations, settlement condition (currency and cycle) and expected sales volume. Currency and reporting could introduce friction.',
    keyPoints: [
      'Connectivity depends on the iTANK integration',
      'Target destinations and settlement currency/cycle unknown',
      'Expected volume not yet estimated',
    ],
    decisions: ['Confirm iTANK feasibility, then gather commercial details'],
    openIssues: ['API feasibility, settlement currency and volume unconfirmed'],
    followUps: [
      'Confirm iTANK API feasibility for Taiwan HRC',
      'Gather target destinations, settlement and volume estimate',
    ],
    risks: ['Currency/settlement friction could delay supply confirmation'],
  },
]

export const meetingsByEntity = (entityId: string): Meeting[] =>
  meetings.filter((m) => m.entityId === entityId)

export const latestMeetings = (n: number): Meeting[] =>
  [...meetings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
