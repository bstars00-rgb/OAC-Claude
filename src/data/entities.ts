// ─────────────────────────────────────────────────────────────────────────────
// OAC — Business Relationships (mock data)
//
// OAC is a context-based AI Sales CRM. The user NEVER selects an account type.
// OAC "detects" the business context from the connected data sources
// (meetings, emails, Teams, Excel, internal DB). `detectedContext` +
// `contextConfidence` simulate that AI inference.
// ─────────────────────────────────────────────────────────────────────────────

export type Region =
  | 'Korea'
  | 'Japan'
  | 'Vietnam'
  | 'Global'
  | 'SEA'
  | 'China'
  | 'Taiwan'
  | 'Greece'

export type DataSource =
  | 'Outlook'
  | 'Teams'
  | 'Excel'
  | 'Internal DB'
  | 'Meeting Recorder'
  | 'Contract Notes'

export type HealthBand = 'Healthy' | 'Stable' | 'Watch' | 'At Risk'

export interface Entity {
  id: string
  name: string
  owner: string
  region: Region
  relationshipHealthScore: number // 0–100
  lastContactDate: string // ISO date
  detectedContext: string // OAC Detected Context — AI inferred, never user-selected
  contextConfidence: number // 0–100
  currentFocus: string
  opportunity: string
  summary: string
  openIssues: string[]
  risks: string[]
  recommendedAction: string // strategy paragraph
  nextBestAction: string // single decisive next step
  relatedSources: DataSource[]
}

export const healthBand = (score: number): HealthBand => {
  if (score >= 78) return 'Healthy'
  if (score >= 66) return 'Stable'
  if (score >= 56) return 'Watch'
  return 'At Risk'
}

export const entities: Entity[] = [
  {
    id: 'yeogi',
    name: 'Yeogi Eottae',
    owner: 'Aiden Park',
    region: 'Korea',
    relationshipHealthScore: 72,
    lastContactDate: '2026-06-05',
    detectedContext: 'API Integration / Channel Expansion',
    contextConfidence: 94,
    currentFocus: 'Open the official iTANK API inquiry and confirm supply scope for a CEO briefing',
    opportunity:
      'A single API connection via iTANK could unlock Korea, Japan and Vietnam hotel supply distribution through one of Korea\'s largest domestic OTAs.',
    summary:
      'Yeogi Eottae is a potential API integration and channel-expansion opportunity. The connection runs through iTANK, who asked Ohmyhotel to move the conversation to an official inquiry at helpdesk@itank.net before allocating resources. We still need to confirm hotel supply scope (including Chalet Korea and Taiwan HRC connectivity), the technical process, and commercial conditions. The opportunity is large enough that a CEO briefing will likely be required before committing.',
    openIssues: [
      'Official API inquiry to helpdesk@itank.net not yet sent',
      'Hotel supply scope (Korea / Japan / Vietnam, incl. Chalet Korea & Taiwan HRC) not confirmed',
      'Technical integration process undefined',
      'Commercial conditions for the connection unconfirmed',
    ],
    risks: [
      'Momentum stalls if the official inquiry slips another week',
      'CEO briefing cannot quote a firm inventory number until supply scope is confirmed',
    ],
    recommendedAction:
      'Send the official inquiry to helpdesk@itank.net today — it is the single gating action and simultaneously advances iTANK, Chalet Korea and Taiwan HRC. In parallel, confirm the Korea/Japan/Vietnam supply scope so the CEO briefing can present concrete inventory and commercial framing.',
    nextBestAction: 'Send the official API integration inquiry to helpdesk@itank.net',
    relatedSources: ['Outlook', 'Teams', 'Excel', 'Meeting Recorder', 'Internal DB'],
  },
  {
    id: 'itank',
    name: 'iTANK',
    owner: 'Aiden Park',
    region: 'Korea',
    relationshipHealthScore: 69,
    lastContactDate: '2026-06-05',
    detectedContext: 'Technology Partner / API Connectivity',
    contextConfidence: 91,
    currentFocus: 'Submit the formal helpdesk inquiry and clarify integration options & commercial model',
    opportunity:
      'iTANK is the connectivity layer behind Yeogi Eottae, Chalet Korea and Taiwan HRC — one integration could open multiple distribution partners at once.',
    summary:
      'Communication with iTANK has moved from messenger to official email: they asked Ohmyhotel to contact helpdesk@itank.net to proceed formally. We need to clarify the available integration options, required documents, technical process, commercial model, expected timeline, and which partners can be connected through iTANK. They are gatekeeping engineering resources behind the formal inquiry.',
    openIssues: [
      'Formal inquiry to helpdesk@itank.net pending from Ohmyhotel',
      'Integration options and required documents unknown',
      'Commercial model and expected timeline undefined',
      'Connected-partner scope (Chalet Korea, Taiwan HRC, others) unconfirmed',
    ],
    risks: [
      'Engineering allocation is blocked until the formal process is satisfied',
      'Unclear commercial model could surface unexpected integration costs',
    ],
    recommendedAction:
      'Treat iTANK as the unblocker for the entire Korea connectivity cluster. Send one structured inquiry to helpdesk@itank.net covering integration options, technical process, partner connectivity scope, commercial conditions and timeline, then route their reply to development and commercial teams.',
    nextBestAction: 'Email helpdesk@itank.net requesting integration options, process, scope & timeline',
    relatedSources: ['Outlook', 'Contract Notes', 'Internal DB'],
  },
  {
    id: 'grandhyatt',
    name: 'Grand Hyatt Jeju',
    owner: 'Mina Seo',
    region: 'Korea',
    relationshipHealthScore: 76,
    lastContactDate: '2026-06-08',
    detectedContext: 'Hotel Contracting / Rate Negotiation',
    contextConfidence: 96,
    currentFocus: 'Confirm July availability, suite rates and contracting conditions',
    opportunity:
      'A direct contract on Jeju\'s flagship luxury property would anchor Korea inbound and VIP family demand for the summer peak.',
    summary:
      'Grand Hyatt Jeju is a hotel-contracting and rate-negotiation opportunity. We need to check direct-contract possibility, confirm July room availability and suite-room rates, and gauge family/luxury demand. Cancellation policy, promotion and allotment terms still need to be confirmed. The property is strategically useful for Korea inbound and high-value VIP family bookings in the summer peak.',
    openIssues: [
      'Direct-contract possibility not yet confirmed',
      'July room availability unconfirmed',
      'Suite-room rates and net rates outstanding',
      'Cancellation policy, allotment and summer promotion not finalized',
    ],
    risks: [
      'July suite inventory may sell out before terms are locked',
      'Without allotment, peak VIP family demand cannot be guaranteed',
    ],
    recommendedAction:
      'Send a single structured request covering net rate, July availability, suite-room rates, allotment (ALM), cancellation policy and a summer promotion condition. Position the family/luxury VIP demand to justify a direct contract and a protected allotment for peak weekends.',
    nextBestAction: 'Request net rate, ALM, cancellation policy and summer promotion for July',
    relatedSources: ['Outlook', 'Excel', 'Meeting Recorder', 'Internal DB', 'Contract Notes'],
  },
  {
    id: 'medkorea',
    name: 'Medical Korea Service',
    owner: 'Soyeon Lim',
    region: 'Korea',
    relationshipHealthScore: 67,
    lastContactDate: '2026-06-04',
    detectedContext: 'Corporate Client / Net Rate Sales',
    contextConfidence: 90,
    currentFocus: 'Explain the net-rate, markup and prepaid settlement model clearly',
    opportunity:
      'A corporate net-rate program for inbound medical-tourism guests creates recurring long-stay demand near Seoul clinics.',
    summary:
      'Medical Korea Service (MKS) is considering cooperation with Ohmyhotel as a corporate client. The model is net-rate: Ohmyhotel supplies net rates and MKS adds its own markup. We must clearly explain the net settlement model, and a prepaid structure may be required until volume is stable. The guarantee-booking process and per-hotel cancellation/change rules also need to be explained before MKS commits.',
    openIssues: [
      'Net-rate + markup model not yet explained in writing',
      'Prepaid settlement structure (until volume stabilizes) not agreed',
      'Guarantee-booking process unclear to the client',
      'Per-hotel cancellation and change rules need to be documented',
    ],
    risks: [
      'Misunderstanding the net vs. commission model could stall the deal',
      'Without prepaid terms early, settlement risk rises before volume is proven',
    ],
    recommendedAction:
      'Send a structured cooperation-condition summary that explains the net-rate model, the markup responsibility on the client side, the prepaid settlement structure for the ramp-up phase, the guarantee-booking flow, and the per-hotel cancellation/change policy. Lead with clarity on settlement to build trust.',
    nextBestAction: 'Send a structured net-rate cooperation & prepaid settlement summary',
    relatedSources: ['Outlook', 'Teams', 'Internal DB'],
  },
  {
    id: 'supdanang',
    name: 'SUP Da Nang',
    owner: 'Soyeon Lim',
    region: 'Vietnam',
    relationshipHealthScore: 63,
    lastContactDate: '2026-06-03',
    detectedContext: 'Supplier Product / Operation Setup',
    contextConfidence: 88,
    currentFocus: 'Finalize the Sunrise/Sunset SUP Paddle Tour product sheet and operating conditions',
    opportunity:
      'A well-operated sunrise/sunset paddle tour is a high-margin activity product for the growing Da Nang leisure market.',
    summary:
      'SUP Da Nang is an activity supplier. The Sunrise and Sunset SUP Paddle Tour has been selected as the potential product. To publish it we still need the final product sheet, net price, schedule, reservation cut-off time, weather-cancellation policy, settlement method, and the customer preparation items (what guests must bring/wear).',
    openIssues: [
      'Final product sheet and net price outstanding',
      'Schedule and reservation cut-off time not set',
      'Weather-cancellation policy not finalized',
      'Settlement method and customer preparation items undefined',
    ],
    risks: [
      'Weather-cancellation ambiguity is the top guest-experience failure point for water activities',
      'Unclear cut-off time leads to last-minute operational conflicts',
    ],
    recommendedAction:
      'Request the final product sheet bundled with net price, schedule, reservation cut-off, weather-cancellation policy, settlement method and customer preparation list. Lock the weather-cancellation policy before publishing — it is the main launch blocker.',
    nextBestAction: 'Request the final product sheet and full operating conditions',
    relatedSources: ['Teams', 'Contract Notes', 'Internal DB'],
  },
  {
    id: 'danangsurf',
    name: 'Danang Holiday Surf',
    owner: 'Soyeon Lim',
    region: 'Vietnam',
    relationshipHealthScore: 61,
    lastContactDate: '2026-06-02',
    detectedContext: 'Supplier Product / Reservation Operation',
    contextConfidence: 86,
    currentFocus: 'Confirm reservation cut-off, payment, and weather/seasonal operation rules',
    opportunity:
      'Surf lessons with rental + photo included and free same-day surfing is a strong bundled activity product for Da Nang.',
    summary:
      'Danang Holiday Surf offers surf classes at 09:00 and 14:30; the lesson includes board rental and photos, plus free surfing after the lesson on the same day. To operate cleanly we need to manage the booking cut-off and payment method, clarify the weather-cancellation and refund policy, and confirm the operating process for winter and rainy days.',
    openIssues: [
      'Booking cut-off and payment method not finalized',
      'Weather-cancellation and refund policy unclear',
      'Winter / rainy-day operation process unconfirmed',
    ],
    risks: [
      'Seasonal (winter/monsoon) availability confusion could cause cancellations',
      'No-show and refund disputes likely without a written policy',
    ],
    recommendedAction:
      'Confirm the 09:00 / 14:30 schedule with a clear booking cut-off and payment method, then document the weather-cancellation/refund policy and the winter/rainy-day operation rules. Consider bundling with SUP Da Nang for Da Nang cross-sell.',
    nextBestAction: 'Confirm cut-off, payment method and weather/seasonal operation rules',
    relatedSources: ['Outlook', 'Teams', 'Internal DB'],
  },
  {
    id: 'goglobal',
    name: 'GoGlobal Travel',
    owner: 'Aiden Park',
    region: 'Global',
    relationshipHealthScore: 79,
    lastContactDate: '2026-06-07',
    detectedContext: 'SLA / API Partnership',
    contextConfidence: 92,
    currentFocus: 'Close the SLA countersignature and obtain the API live key',
    opportunity:
      'GoGlobal is a live, scaling API partner — finalizing the SLA and live key unlocks immediate distribution at volume.',
    summary:
      'The GoGlobal Travel SLA has been reviewed. Ohmyhotel needs to confirm the countersignature process and check whether the company seal is completed and whether the signature is still pending. The commercial PIC has changed to Aiden, with supply-side coordination handled by Sophia. The key open question is when the API live key can be received so the partnership can go live.',
    openIssues: [
      'SLA countersignature process not confirmed (seal complete? signature pending?)',
      'API live key not yet received',
      'Supply-side coordination with Sophia still in progress',
    ],
    risks: [
      'Go-live slips if the countersignature/seal status is left ambiguous',
      'PIC handover (to Aiden) could drop context if not documented',
    ],
    recommendedAction:
      'Confirm the countersignature status (seal completed vs. signature pending) in writing, then ask GoGlobal directly when the API live key will be issued. Align with Sophia on supply-side readiness so go-live is not blocked on inventory.',
    nextBestAction: 'Confirm countersignature status and request the API live key timing',
    relatedSources: ['Outlook', 'Teams', 'Contract Notes', 'Internal DB'],
  },
  {
    id: 'klook',
    name: 'Klook',
    owner: 'Daniel Cho',
    region: 'SEA',
    relationshipHealthScore: 64,
    lastContactDate: '2026-06-04',
    detectedContext: 'SLA / Contract Risk',
    contextConfidence: 93,
    currentFocus: 'Protect Ohmyhotel from excessive SLA liability on support and compensation',
    opportunity:
      'A balanced SLA with Klook preserves a major SEA distribution channel without exposing Ohmyhotel to unbounded liability.',
    summary:
      'Klook\'s draft SLA requires 24/7 support, which is not feasible — Ohmyhotel support coverage is 06:00–24:00. We need to clarify compensation responsibility and review the settlement cycle, deposit, refund and CS compensation wording. The priority is to protect Ohmyhotel from excessive SLA liability while keeping the channel.',
    openIssues: [
      '24/7 support obligation not feasible (coverage is 06:00–24:00)',
      'Compensation responsibility wording unresolved',
      'Settlement cycle, deposit and refund terms need review',
      'CS compensation clause exposes Ohmyhotel to excessive liability',
    ],
    risks: [
      'Unbounded SLA compensation exposure if wording is not capped',
      'Agreeing to 24/7 support sets an operational obligation we cannot meet',
    ],
    recommendedAction:
      'Counter the 24/7 clause with the actual 06:00–24:00 coverage window and propose a defined escalation path for off-hours. Cap compensation to documented, attributable failures, and review settlement/deposit/refund wording with legal before agreeing to any CS compensation language.',
    nextBestAction: 'Counter the 24/7 SLA clause and cap compensation wording with legal',
    relatedSources: ['Outlook', 'Excel', 'Meeting Recorder', 'Internal DB', 'Contract Notes'],
  },
  {
    id: 'hotelbeds',
    name: 'Hotelbeds',
    owner: 'Daniel Cho',
    region: 'Global',
    relationshipHealthScore: 62,
    lastContactDate: '2026-06-03',
    detectedContext: 'Commercial Negotiation / Integration Fee',
    contextConfidence: 90,
    currentFocus: 'Waive or defer the USD 25,000 non-refundable integration fee',
    opportunity:
      'Hotelbeds adds large global third-party inventory — but only worth it if the integration cost is tied to proven business feasibility.',
    summary:
      'Hotelbeds has proposed a USD 25,000 integration fee. The non-refundable condition is the core problem. Ohmyhotel has requested a waiver or deferral, and the rebate terms still need clarification. TGX approval and go-live conditions need review. The principle is to avoid committing cost before business feasibility is confirmed.',
    openIssues: [
      'USD 25,000 integration fee — non-refundable condition problematic',
      'Waiver or deferral requested, not yet granted',
      'Rebate terms unclear',
      'TGX approval and go-live conditions need review',
    ],
    risks: [
      'Paying a non-refundable fee before feasibility is proven is a sunk-cost risk',
      'Slight QoQ volume softening weakens negotiating leverage on the fee',
    ],
    recommendedAction:
      'Reframe the fee as success-linked: request a waiver or deferral until go-live, tie any fee to a committed volume/rebate structure, and make TGX approval a precondition. Do not commit the USD 25,000 before business feasibility is confirmed.',
    nextBestAction: 'Request waiver/deferral of the USD 25,000 fee tied to go-live & rebate terms',
    relatedSources: ['Outlook', 'Excel', 'Internal DB', 'Contract Notes'],
  },
  {
    id: 'dida',
    name: 'Dida',
    owner: 'Mina Seo',
    region: 'China',
    relationshipHealthScore: 55,
    lastContactDate: '2026-05-30',
    detectedContext: 'Booking Failure / Technical Accuracy Issue',
    contextConfidence: 95,
    currentFocus: 'Run a joint mapping & room-type validation review to fix offline accuracy',
    opportunity:
      'Resolving the mapping accuracy issue restores trust and protects existing Dida volume from churn.',
    summary:
      'Dida has an offline accuracy issue: room-type code mismatches and cancellation-policy false-positive cases. A joint review is needed. Mapping and room-type validation are the key concerns — specifically distinguishing Dida-side invalid room-type codes from genuine Ohmyhotel sold-out cases, so blame and fixes are assigned correctly.',
    openIssues: [
      'Offline accuracy issue — room-type code mismatch',
      'Cancellation-policy false-positive cases',
      'No joint review scheduled yet',
      'Cannot yet distinguish Dida-side invalid codes from genuine sold-out cases',
    ],
    risks: [
      'Continued mapping errors erode partner trust and signal churn',
      'Mis-attributed sold-out cases create unnecessary dispute volume',
    ],
    recommendedAction:
      'Schedule a joint technical review focused on room-type code mapping and cancellation-policy validation. Build a shared classification that separates Dida-side invalid room-type codes from genuine Ohmyhotel sold-out responses, then deliver a remediation timeline.',
    nextBestAction: 'Schedule a joint mapping & room-type validation review with Dida',
    relatedSources: ['Teams', 'Excel', 'Internal DB', 'Contract Notes'],
  },
  {
    id: 'traveloka',
    name: 'Traveloka',
    owner: 'Daniel Cho',
    region: 'SEA',
    relationshipHealthScore: 66,
    lastContactDate: '2026-06-06',
    detectedContext: 'Prebook Failure / API Monitoring',
    contextConfidence: 89,
    currentFocus: 'Reduce prebook failures before the automated suspension threshold is hit',
    opportunity:
      'Stabilizing the prebook success rate protects strong Indonesia/Vietnam volume and clears the path for expansion.',
    summary:
      'Traveloka has an automated suspension threshold tied to prebook success rate. We are seeing prebook failures and "No Room Available" errors and must monitor failure rates across VN, KR, MY and JP. Atlas API schema updates are under review. The goal is to reduce failed prebook cases before expanding volume, so the channel is not auto-suspended.',
    openIssues: [
      'Prebook success rate trending toward the automated suspension threshold',
      '"No Room Available" errors elevated',
      'Failure-rate monitoring needed across VN, KR, MY, JP',
      'Atlas API schema updates under review',
    ],
    risks: [
      'Automated suspension if prebook failure rate crosses the threshold',
      'Expanding volume before fixing failures would amplify the problem',
    ],
    recommendedAction:
      'Stand up per-market (VN/KR/MY/JP) prebook failure monitoring, prioritize the largest "No Room Available" sources, and complete the Atlas API schema update review. Reduce failures first, then expand volume — do not scale into an unstable prebook path.',
    nextBestAction: 'Deploy per-market prebook failure monitoring and finish the Atlas schema review',
    relatedSources: ['Outlook', 'Excel', 'Internal DB'],
  },
  {
    id: 'webbeds',
    name: 'WebBeds',
    owner: 'Aiden Park',
    region: 'Global',
    relationshipHealthScore: 60,
    lastContactDate: '2026-06-01',
    detectedContext: 'Channel Expansion / Prospect Development',
    contextConfidence: 84,
    currentFocus: 'Decide whether to prioritize development resource for Korea API client expansion',
    opportunity:
      'WebBeds opens a Korea API client-expansion path with ~30 potential prospects across Korea, Japan and Vietnam direct contracts.',
    summary:
      'WebBeds represents a Korea API client-expansion opportunity, but development priority is currently low. We need to identify ~30 potential prospects with a Korea/Japan/Vietnam direct-contract focus. Early signals suggest Japan and Vietnam competitiveness is weaker than expected. The key decision is whether to prioritize development resource now or defer.',
    openIssues: [
      'Development priority currently low',
      '~30 potential prospects not yet identified',
      'Japan and Vietnam competitiveness weaker than expected',
      'Resource-prioritization decision pending',
    ],
    risks: [
      'Investing development resource into weak JP/VN competitiveness could waste effort',
      'Delaying too long cedes the Korea direct-contract opportunity to competitors',
    ],
    recommendedAction:
      'Build the 30-prospect Korea-first list and validate Japan/Vietnam competitiveness with real rate comparisons before committing development resource. Make a clear go/defer decision based on Korea direct-contract strength.',
    nextBestAction: 'Build the 30-prospect Korea list and validate JP/VN rate competitiveness',
    relatedSources: ['Excel', 'Teams', 'Internal DB'],
  },
  {
    id: 'poseidon',
    name: 'Poseidon',
    owner: 'Soyeon Lim',
    region: 'Greece',
    relationshipHealthScore: 68,
    lastContactDate: '2026-05-31',
    detectedContext: 'Supplier Policy / Activity Product Operation',
    contextConfidence: 85,
    currentFocus: 'Align advance-payment, on-site payment and no-show control, then finalize sales setup',
    opportunity:
      'Poseidon\'s activity products can be sold through Naver Smart Store for the Korean outbound market once policy and sales setup are aligned.',
    summary:
      'Poseidon\'s age rules and cancellation policy are confirmed. The payment policy requires at least 50% advance payment. We still need to align on on-site payment handling and no-show control, and to clarify the product images and the Naver Smart Store sales process before listing.',
    openIssues: [
      'On-site payment handling not aligned',
      'No-show control process undefined',
      'Product images not finalized',
      'Naver Smart Store sales process not clarified',
    ],
    risks: [
      'Weak no-show control with on-site payment increases revenue leakage',
      'Incomplete product images/process delays Smart Store listing',
    ],
    recommendedAction:
      'Lock the on-site-payment and no-show-control rules on top of the confirmed 50% advance-payment policy, then finalize product images and the Naver Smart Store sales flow so the products can be listed for Korean outbound.',
    nextBestAction: 'Align on-site payment & no-show control, then finalize Smart Store listing',
    relatedSources: ['Outlook', 'Meeting Recorder', 'Internal DB'],
  },
  {
    id: 'aphrodite',
    name: 'Aphrodite Yacht',
    owner: 'Soyeon Lim',
    region: 'Greece',
    relationshipHealthScore: 64,
    lastContactDate: '2026-05-29',
    detectedContext: 'Supplier Product / Yacht Operation',
    contextConfidence: 83,
    currentFocus: 'Confirm payment, passport, weather-cancellation, charter and beverage processes',
    opportunity:
      'A premium Aegean yacht-charter product differentiates the Greece outbound portfolio; a deposit is already in place.',
    summary:
      'Aphrodite Yacht is a luxury charter product where a deposit has already been made to the supplier. To operate we still need to confirm the payment method, the passport-information policy, the weather-cancellation and refund rule, the charter condition, and the on-board beverage payment process.',
    openIssues: [
      'Payment method not confirmed',
      'Passport-information policy undefined',
      'Weather-cancellation and refund rule outstanding',
      'Charter condition and beverage payment process unclear',
    ],
    risks: [
      'A deposit is already paid — unclear terms increase exposure if bookings fall through',
      'High-value charters carry elevated payment and cancellation risk',
    ],
    recommendedAction:
      'Since the deposit is already made, prioritize locking the payment method, passport policy, weather-cancellation/refund rule, charter condition and beverage payment flow before publishing — watertight terms protect the prepaid position.',
    nextBestAction: 'Confirm payment, passport, weather-cancellation, charter & beverage terms',
    relatedSources: ['Teams', 'Contract Notes', 'Internal DB'],
  },
  {
    id: 'chaletkorea',
    name: 'Chalet Korea',
    owner: 'Aiden Park',
    region: 'Korea',
    relationshipHealthScore: 70,
    lastContactDate: '2026-06-04',
    detectedContext: 'Partner Connectivity / B2B Sales Opportunity',
    contextConfidence: 87,
    currentFocus: 'Confirm whether API connection via iTANK is possible and define the relationship type',
    opportunity:
      'Chalet Korea could become a connected supply partner through the iTANK integration, adding Korea inventory to the channel.',
    summary:
      'Chalet Korea is a potential partner related to iTANK connectivity. We need to confirm whether an API connection is possible, check sales potential and hotel supply scope, and — based on future communication — clarify whether this is a channel, supplier, or B2B-partner context. OAC has tentatively detected a Partner Connectivity / B2B sales context.',
    openIssues: [
      'API connection feasibility via iTANK unconfirmed',
      'Sales potential and hotel supply scope unknown',
      'Relationship type (channel / supplier / B2B) not yet clear',
    ],
    risks: [
      'Context ambiguity could lead to mis-prioritized effort',
      'Supply scope is on the critical path for the Yeogi Eottae CEO briefing',
    ],
    recommendedAction:
      'Confirm with iTANK whether Chalet Korea can be connected via the same integration, then scope the inventory and sales potential. Tie the supply confirmation to the Yeogi Eottae CEO briefing so it can quote a firm number.',
    nextBestAction: 'Confirm iTANK API feasibility and scope Chalet Korea supply',
    relatedSources: ['Teams', 'Excel', 'Internal DB', 'Contract Notes'],
  },
  {
    id: 'taiwanhrc',
    name: 'Taiwan HRC',
    owner: 'Aiden Park',
    region: 'Taiwan',
    relationshipHealthScore: 65,
    lastContactDate: '2026-06-03',
    detectedContext: 'Partner Connectivity / B2B Expansion',
    contextConfidence: 82,
    currentFocus: 'Confirm API feasibility, target destinations, settlement and expected volume',
    opportunity:
      'Taiwan HRC could add Taiwan inventory and outbound demand to the channel via the iTANK connection.',
    summary:
      'Taiwan HRC is a potential partner related to iTANK connectivity. We need to confirm whether an API connection is possible and understand their target destinations, settlement condition (currency/cycle) and expected sales volume before including them in the integration scope.',
    openIssues: [
      'API connection feasibility via iTANK unconfirmed',
      'Target destinations not yet understood',
      'Settlement condition (currency / cycle) undecided',
      'Expected sales volume unknown',
    ],
    risks: [
      'Currency/settlement friction could delay supply confirmation',
      'Unknown volume makes prioritization difficult',
    ],
    recommendedAction:
      'Confirm iTANK API feasibility for Taiwan HRC, then gather target destinations, settlement currency/cycle and an expected-volume estimate so they can be confirmed alongside Chalet Korea for the API briefing.',
    nextBestAction: 'Confirm API feasibility and gather destinations, settlement & volume',
    relatedSources: ['Outlook', 'Excel', 'Internal DB'],
  },
]

export const entityById = (id: string): Entity | undefined =>
  entities.find((e) => e.id === id)

export const entityByName = (name: string): Entity | undefined =>
  entities.find((e) => e.name.toLowerCase() === name.toLowerCase())

/** Lightweight fuzzy search for the global search bar & Ask OAC. */
export const searchEntities = (query: string): Entity[] => {
  const q = query.trim().toLowerCase()
  if (!q) return entities
  return entities.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.detectedContext.toLowerCase().includes(q) ||
      e.region.toLowerCase().includes(q) ||
      e.owner.toLowerCase().includes(q) ||
      e.currentFocus.toLowerCase().includes(q),
  )
}

/** Unique detected contexts, used to group "Contexts Needing Attention". */
export const contextGroups = (): { context: string; entityIds: string[] }[] => {
  const map = new Map<string, string[]>()
  for (const e of entities) {
    map.set(e.detectedContext, [...(map.get(e.detectedContext) ?? []), e.id])
  }
  return [...map.entries()].map(([context, entityIds]) => ({ context, entityIds }))
}
