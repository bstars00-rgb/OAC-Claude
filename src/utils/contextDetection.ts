// Simulated "OAC Detected Context" engine.
//
// In production this would run over meeting notes, emails, Teams messages,
// Excel data, contracts, etc. Here we infer a context label from keywords so
// the demo *feels* like the AI is reading the data sources — the user never
// selects an account type.

export interface DetectedContext {
  label: string
  confidence: number
  rationale: string
}

interface Rule {
  label: string
  keywords: string[]
  rationale: string
}

const RULES: Rule[] = [
  {
    label: 'API Integration / Channel Expansion',
    keywords: ['api', 'integration', 'channel', 'connect', 'endpoint'],
    rationale: 'Meeting notes and emails reference API connection and channel expansion.',
  },
  {
    label: 'Technology Partner / API Connectivity',
    keywords: ['helpdesk', 'connectivity', 'technology partner', 'engineering'],
    rationale: 'Communication centers on connectivity terms and engineering enablement.',
  },
  {
    label: 'Hotel Contracting / Rate Negotiation',
    keywords: ['rate', 'bar', 'allotment', 'contracting', 'negotiation', 'hotel'],
    rationale: 'Discussions revolve around rates, allotment and hotel contracting.',
  },
  {
    label: 'Corporate Client / Net Rate Sales',
    keywords: ['net rate', 'corporate', 'medical', 'fixed rate'],
    rationale: 'Requests focus on corporate net-rate programs.',
  },
  {
    label: 'Supplier Product / Operation Setup',
    keywords: ['product setup', 'operation', 'voucher', 'capacity', 'charter', 'activity setup'],
    rationale: 'Activity covers product and operational onboarding.',
  },
  {
    label: 'SLA / Contract Risk',
    keywords: ['sla', 'compensation', 'service level', 'contract risk'],
    rationale: 'Negotiation concerns SLA compensation and service-level terms.',
  },
  {
    label: 'Booking Failure / Technical Accuracy Issue',
    keywords: ['failure', 'mapping', 'accuracy', 'offline', 'room-type', 'complaint'],
    rationale: 'Signals point to booking-failure and technical accuracy issues.',
  },
  {
    label: 'Commercial Negotiation / Integration Fee',
    keywords: ['integration fee', 'fee waiver', 'commercial', 'renewal'],
    rationale: 'Commercial thread is driven by integration-fee negotiation.',
  },
  {
    label: 'Partner Connectivity / B2B Expansion',
    keywords: ['b2b', 'expansion', 'partner', 'supply expansion'],
    rationale: 'Focus is B2B connectivity and supply expansion.',
  },
  {
    label: 'Supplier Policy / Activity Product Operation',
    keywords: ['policy', 'seasonal', 'no-show', 'surf', 'monsoon'],
    rationale: 'Onboarding hinges on supplier policy for activity operations.',
  },
  {
    label: 'Strategic Partnership',
    keywords: ['strategic', 'partnership', 'dmc', 'package'],
    rationale: 'Conversation frames a strategic, multi-component partnership.',
  },
  {
    label: 'Settlement / Finance Follow-up',
    keywords: ['settlement', 'reconciliation', 'finance', 'payment flow'],
    rationale: 'Open items are settlement and finance reconciliation.',
  },
  {
    label: 'Prebook Failure / API Monitoring',
    keywords: ['prebook', 'no room available', 'suspension', 'atlas', 'failure rate', 'monitoring'],
    rationale: 'Signals point to prebook failures and API monitoring thresholds.',
  },
  {
    label: 'SLA / API Partnership',
    keywords: ['live key', 'countersignature', 'seal', 'api partnership', 'go-live'],
    rationale: 'Discussion concerns SLA signing and API go-live readiness.',
  },
  {
    label: 'Supplier Product / Reservation Operation',
    keywords: ['cutoff', 'cut-off', 'class', 'lesson', 'rental', 'refund policy'],
    rationale: 'Activity covers reservation cut-off and operational policy for a supplier product.',
  },
  {
    label: 'Supplier Product / Yacht Operation',
    keywords: ['yacht', 'charter', 'passport', 'beverage', 'deposit'],
    rationale: 'Setup covers charter, passport and high-value booking operations.',
  },
  {
    label: 'Channel Expansion / Prospect Development',
    keywords: ['prospect', 'client expansion', 'competitiveness', 'development priority'],
    rationale: 'Focus is prospect development and channel expansion prioritization.',
  },
  {
    label: 'Partner Connectivity / B2B Sales Opportunity',
    keywords: ['connectivity', 'b2b sales', 'supply scope', 'itank'],
    rationale: 'Conversation explores partner connectivity and B2B sales potential.',
  },
]

/**
 * Infer a business context from a free-text blob (e.g. concatenated notes).
 * Returns the best-matching label with a synthetic confidence score.
 */
export const detectContext = (text: string): DetectedContext => {
  const t = text.toLowerCase()
  let best: { rule: Rule; hits: number } | null = null
  for (const rule of RULES) {
    const hits = rule.keywords.reduce((n, kw) => (t.includes(kw) ? n + 1 : n), 0)
    if (hits > 0 && (!best || hits > best.hits)) best = { rule, hits }
  }
  if (!best) {
    return {
      label: 'Strategic Partnership',
      confidence: 71,
      rationale: 'No strong single signal; defaulting to a general partnership context.',
    }
  }
  const confidence = Math.min(97, 78 + best.hits * 5)
  return { label: best.rule.label, confidence, rationale: best.rule.rationale }
}

export const allContextLabels = (): string[] => RULES.map((r) => r.label)
