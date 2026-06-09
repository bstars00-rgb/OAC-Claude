// Report Generator mock data — prebuilt, executive-ready report examples.

export type ReportType =
  | 'CEO Briefing'
  | 'Weekly Sales Report'
  | 'Partner Status Report'
  | 'Issue Escalation Report'
  | 'API Integration Review'
  | 'Commercial Negotiation Summary'
  | 'Hotel Contracting Summary'
  | 'Supplier Onboarding Summary'

export type Audience =
  | 'CEO'
  | 'Sales Team'
  | 'Development Team'
  | 'Operations Team'
  | 'Finance Team'
  | 'Partner'

export type ReportLanguage = 'English' | 'Korean' | 'Vietnamese' | 'Chinese'

export interface ReportSection {
  heading: string
  body: string
}

export interface Report {
  id: string
  entityId: string // 'portfolio' for portfolio-wide reports
  type: ReportType
  audience: Audience
  language: ReportLanguage
  title: string
  date: string
  sections: ReportSection[]
}

export const reportTypes: ReportType[] = [
  'CEO Briefing',
  'Weekly Sales Report',
  'Partner Status Report',
  'Issue Escalation Report',
  'API Integration Review',
  'Commercial Negotiation Summary',
  'Hotel Contracting Summary',
  'Supplier Onboarding Summary',
]

export const audiences: Audience[] = [
  'CEO',
  'Sales Team',
  'Development Team',
  'Operations Team',
  'Finance Team',
  'Partner',
]

export const reportLanguages: ReportLanguage[] = ['English', 'Korean', 'Vietnamese', 'Chinese']

export const reports: Report[] = [
  {
    id: 'rp-yeogi-ceo-ko',
    entityId: 'yeogi',
    type: 'CEO Briefing',
    audience: 'CEO',
    language: 'Korean',
    title: '여기어때 / iTANK API 연동 검토 보고',
    date: '2026-06-09',
    sections: [
      {
        heading: '1. 배경',
        body: '여기어때와의 API 연동을 통해 국내 및 인바운드 공급을 확장할 수 있는 기회가 확인되었습니다. 연동은 기술 파트너인 iTANK를 통해 이루어지며, Chalet Korea 및 Taiwan HRC의 동시 연동 가능성도 검토 중입니다.',
      },
      {
        heading: '2. 현재 진행 상황',
        body: 'iTANK는 공식 문의를 helpdesk@itank.net으로 접수해야 엔지니어 리소스를 배정한다고 회신했습니다. 커뮤니케이션은 메신저에서 공식 이메일로 전환되었으며, 공식 문의 발송이 다음 단계의 전제 조건입니다.',
      },
      {
        heading: '3. 주요 확인 필요 사항',
        body: '• 연동 옵션 및 필요 서류\n• 기술 연동 프로세스\n• 연결 가능 파트너 범위 (여기어때, Chalet Korea, Taiwan HRC)\n• 상업적 조건 (연동비/리베이트)\n• 검토 및 온보딩 예상 일정\n• 한국/일본/베트남 공급 범위',
      },
      {
        heading: '4. 리스크',
        body: '• 공식 문의가 지연되면 전체 한국 연동 클러스터 진행이 멈춥니다.\n• 공급 범위가 확정되지 않으면 CEO 보고에 정확한 인벤토리 수치를 제시할 수 없습니다.\n• 상업적 모델이 불명확할 경우 예상치 못한 연동 비용이 발생할 수 있습니다.',
      },
      {
        heading: '5. 제안',
        body: 'iTANK 공식 문의(helpdesk@itank.net)를 금주 내 발송하고, Chalet Korea·Taiwan HRC 공급 범위를 병행 확정하여 CEO 보고 시 구체적인 인벤토리 및 상업 조건을 제시할 것을 제안합니다. 단일 연동으로 다수 파트너를 동시에 연결하는 채널 확장 플랫폼 관점으로 접근합니다.',
      },
      {
        heading: '6. 다음 액션',
        body: '• (즉시) helpdesk@itank.net 공식 API 연동 문의 발송 — 담당: Aiden Park\n• (금주) 한국/일본/베트남 공급 범위 및 Chalet Korea·Taiwan HRC 연결 확정 — 담당: Sophia Kim\n• (차주) CEO 브리핑 자료 작성 (인벤토리 수치 + 상업 조건 포함)',
      },
    ],
  },
  {
    id: 'rp-portfolio-weekly-en',
    entityId: 'portfolio',
    type: 'Weekly Sales Report',
    audience: 'Sales Team',
    language: 'English',
    title: 'Weekly Sales & Relationship Report — Week of June 8, 2026',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Portfolio Snapshot',
        body: 'Live booking partners delivered ~151,340 bookings and ~USD 43.2M TTV this month, up ~6% QoQ. Average failure rate across live partners is ~4.2%. GoGlobal and Traveloka lead volume; Dida is the only partner in decline.',
      },
      {
        heading: 'Wins',
        body: '• GoGlobal SLA reviewed — go-live pending live key.\n• WebBeds Korea pipeline up +22% QoQ.\n• Yeogi Eottae API opportunity progressing to formal iTANK inquiry.',
      },
      {
        heading: 'Watch Items',
        body: '• Klook SLA / 24/7 support liability under negotiation.\n• Traveloka prebook failures approaching auto-suspension threshold.\n• Hotelbeds USD 25,000 fee unresolved.',
      },
      {
        heading: 'At Risk',
        body: '• Dida: room-type mapping accuracy issue, -6.7% QoQ, worst-in-portfolio failure/cancellation rates. Joint review scheduled.',
      },
      {
        heading: 'Focus for Next Week',
        body: 'Send the iTANK inquiry, counter the Klook SLA, lock Grand Hyatt Jeju July terms, and run the Dida mapping review.',
      },
    ],
  },
  {
    id: 'rp-goglobal-partner-en',
    entityId: 'goglobal',
    type: 'Partner Status Report',
    audience: 'Partner',
    language: 'English',
    title: 'GoGlobal Travel — Partner Status Report',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Relationship Health',
        body: 'Healthy (79/100). Live and scaling with a low 1.8% failure rate. Commercial PIC: Aiden Park. Supply coordination: Sophia Kim.',
      },
      {
        heading: 'Performance',
        body: '31,240 bookings / month, ~USD 9.12M TTV, +8% QoQ. Japan inventory outperforms on rate; SEA and Korea contribute the balance.',
      },
      {
        heading: 'Open Items',
        body: '• Confirm SLA countersignature (seal complete? signature pending?).\n• Receive the API live key to enable go-live.\n• Align Vietnam direct-supply expansion with Sophia.',
      },
      {
        heading: 'Next Steps',
        body: 'Confirm countersignature status in writing, request the live-key issuance date, and prepare the Vietnam direct-contract proposal for the Q3 review.',
      },
    ],
  },
  {
    id: 'rp-dida-issue-en',
    entityId: 'dida',
    type: 'Issue Escalation Report',
    audience: 'Operations Team',
    language: 'English',
    title: 'Dida — Technical Accuracy Issue Escalation',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Issue',
        body: 'Offline accuracy failures: room-type code mismatches and cancellation-policy false-positives. Booking-failure rate 7.9% and cancellation 12.4% — both worst-in-portfolio. Volume -6.7% QoQ.',
      },
      {
        heading: 'Root Cause',
        body: '52% of failures trace to Dida-side invalid room-type codes, not genuine Ohmyhotel sold-out (21%). This is a technical accuracy issue, not a demand or inventory problem.',
      },
      {
        heading: 'Impact',
        body: 'Guest complaints from incorrect room descriptions, rising offline bookings, and eroding partner trust. Mis-attributed sold-out cases inflate dispute volume.',
      },
      {
        heading: 'Action Plan',
        body: '• Joint mapping & room-type validation review (this week).\n• Shared classification separating invalid codes from genuine sold-out.\n• Remediation timeline delivered within five business days.\n• Weekly check-ins until baseline is restored.',
      },
      {
        heading: 'Escalation Trigger',
        body: 'If complaint volume does not fall within two weeks, escalate to a joint technical task force.',
      },
    ],
  },
  {
    id: 'rp-itank-api-en',
    entityId: 'itank',
    type: 'API Integration Review',
    audience: 'Development Team',
    language: 'English',
    title: 'iTANK — API Integration Review',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Scope',
        body: 'Evaluate an API integration via iTANK to connect Yeogi Eottae, Chalet Korea and Taiwan HRC for Korea / Japan / Vietnam supply distribution.',
      },
      {
        heading: 'Status',
        body: 'Communication moved to the official channel (helpdesk@itank.net). iTANK requires a formal inquiry before allocating engineers. Six items remain unconfirmed.',
      },
      {
        heading: 'Open Technical Questions',
        body: '• Available integration options and required documents.\n• Technical process and endpoint specifications.\n• Connectable-partner scope.\n• Commercial model and integration fee.\n• Expected review and onboarding timeline.',
      },
      {
        heading: 'Recommendation',
        body: 'Submit one structured inquiry covering all open items, then convene development and commercial teams on iTANK\'s response before committing effort.',
      },
      {
        heading: 'Next Action',
        body: 'Send the structured inquiry to helpdesk@itank.net (owner: Aiden Park).',
      },
    ],
  },
  {
    id: 'rp-hotelbeds-commercial-en',
    entityId: 'hotelbeds',
    type: 'Commercial Negotiation Summary',
    audience: 'Finance Team',
    language: 'English',
    title: 'Hotelbeds — Commercial Negotiation Summary',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Negotiation Item',
        body: 'USD 25,000 integration fee with a non-refundable condition, proposed as a precondition to proceed with TGX.',
      },
      {
        heading: 'Ohmyhotel Position',
        body: 'Request a waiver or deferral until successful go-live; tie any fee to a committed volume and rebate structure; make TGX approval a precondition.',
      },
      {
        heading: 'Commercial Context',
        body: 'Hotelbeds volume is flat-to-soft (-1.3% QoQ) with low direct-contract share (12%). Committing non-refundable cost before feasibility is a poor risk/return trade-off.',
      },
      {
        heading: 'Recommendation',
        body: 'Do not commit the fee before feasibility. Convert it from a flat charge into a success-linked, volume-tied term, with rebates clarified in writing.',
      },
    ],
  },
  {
    id: 'rp-grandhyatt-contract-en',
    entityId: 'grandhyatt',
    type: 'Hotel Contracting Summary',
    audience: 'Sales Team',
    language: 'English',
    title: 'Grand Hyatt Jeju — Hotel Contracting Summary',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Opportunity',
        body: 'Direct contract on Jeju\'s flagship luxury property to anchor Korea inbound and VIP family demand for the July peak.',
      },
      {
        heading: 'Status',
        body: 'Hotel open to a direct contract and requesting an allotment commitment. Strong family/luxury demand confirmed; occupancy pace +9% YoY.',
      },
      {
        heading: 'Open Terms',
        body: '• Net rate and suite-room rates (July).\n• July availability.\n• Allotment (ALM) for peak weekends.\n• Cancellation policy.\n• Summer promotion condition.',
      },
      {
        heading: 'Recommendation',
        body: 'Send one structured request covering all open terms; trade a protected peak allotment for direct rates. Lock terms before July suite inventory sells out.',
      },
    ],
  },
  {
    id: 'rp-supdanang-supplier-en',
    entityId: 'supdanang',
    type: 'Supplier Onboarding Summary',
    audience: 'Operations Team',
    language: 'English',
    title: 'SUP Da Nang — Supplier Onboarding Summary',
    date: '2026-06-09',
    sections: [
      {
        heading: 'Product',
        body: 'Sunrise and Sunset SUP Paddle Tour selected as the launch product (high-margin Da Nang activity).',
      },
      {
        heading: 'Setup Status',
        body: 'Product setup ~45% complete. Schedule, net price and operating policies still outstanding.',
      },
      {
        heading: 'Pending Confirmations',
        body: '• Final product sheet and net price.\n• Schedule and reservation cut-off time.\n• Weather-cancellation policy.\n• Settlement method.\n• Customer preparation items.',
      },
      {
        heading: 'Recommendation',
        body: 'Request the final product sheet bundled with all operating conditions. Lock the weather-cancellation policy first — it is the main launch blocker for a water activity.',
      },
    ],
  },
]

export const reportsByEntity = (entityId: string): Report[] =>
  reports.filter((r) => r.entityId === entityId)

export const reportByEntityAndType = (
  entityId: string,
  type: ReportType,
): Report | undefined => reports.find((r) => r.entityId === entityId && r.type === type)
