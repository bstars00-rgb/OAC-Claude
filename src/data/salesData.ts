// Excel / Internal DB mock data.
//
// Two shapes:
//  • BookingMetrics    — distribution/API partners with live booking volume
//  • OperationalMetrics — hotel-contracting & supplier relationships pre-volume
// Discriminated by `kind`.

export interface NamedValue {
  name: string
  value: number
}

export interface FailureReason {
  reason: string
  pct: number
}

export interface MonthlyPoint {
  month: string
  bookings: number
  ttv: number
}

export interface BookingMetrics {
  kind: 'booking'
  entityId: string
  bookings: number
  ttv: number // total transaction value (USD)
  netRevenue: number // USD
  cancellationRate: number // %
  failureRate: number // %
  averageBookingValue: number // USD
  destinationMix: NamedValue[] // % by region
  directContractRatio: number // %
  thirdPartyInventoryRatio: number // %
  topDestinations: NamedValue[] // bookings by city
  topHotels: NamedValue[] // bookings by hotel
  failureReasons: FailureReason[]
  monthlyTrend: MonthlyPoint[]
  aiComment: string
}

export type ContractReadiness = 'Not Started' | 'Early' | 'In Progress' | 'Near Ready' | 'Ready'
export type StatusLabel = 'Pending' | 'Partial' | 'Confirmed'
export type ActivityLevel = 'Low' | 'Moderate' | 'High'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface OperationalMetrics {
  kind: 'operational'
  entityId: string
  pendingConfirmationCount: number
  productSetupProgress: number // %
  contractReadiness: ContractReadiness
  rateStatus: StatusLabel
  policyConfirmationStatus: StatusLabel
  communicationActivity: ActivityLevel
  riskLevel: RiskLevel
  aiComment: string
}

export type Metrics = BookingMetrics | OperationalMetrics

const m = (month: string, bookings: number, ttv: number): MonthlyPoint => ({ month, bookings, ttv })

export const salesData: Metrics[] = [
  {
    kind: 'booking',
    entityId: 'yeogi',
    bookings: 18420,
    ttv: 6_540_000,
    netRevenue: 612_000,
    cancellationRate: 9.2,
    failureRate: 3.1,
    averageBookingValue: 355,
    destinationMix: [
      { name: 'Korea', value: 71 },
      { name: 'Japan', value: 18 },
      { name: 'Vietnam', value: 11 },
    ],
    directContractRatio: 58,
    thirdPartyInventoryRatio: 42,
    topDestinations: [
      { name: 'Jeju', value: 5200 },
      { name: 'Seoul', value: 4800 },
      { name: 'Busan', value: 3100 },
      { name: 'Osaka', value: 2100 },
      { name: 'Da Nang', value: 1500 },
    ],
    topHotels: [
      { name: 'Grand Hyatt Jeju', value: 1450 },
      { name: 'Lotte Hotel Seoul', value: 1180 },
      { name: 'Chalet Korea Pyeongchang', value: 940 },
      { name: 'Paradise City Incheon', value: 820 },
    ],
    failureReasons: [
      { reason: 'Rate/availability mismatch', pct: 41 },
      { reason: 'Mapping gap', pct: 27 },
      { reason: 'Timeout', pct: 19 },
      { reason: 'Other', pct: 13 },
    ],
    monthlyTrend: [
      m('Jan', 14200, 4_980_000),
      m('Feb', 15100, 5_260_000),
      m('Mar', 15800, 5_540_000),
      m('Apr', 16900, 5_910_000),
      m('May', 17600, 6_180_000),
      m('Jun', 18420, 6_540_000),
    ],
    aiComment:
      'Pipeline volume is climbing steadily with a Korea-heavy mix. Direct-contract share (58%) is healthy; the API integration would let you scale Japan and Vietnam supply where demand already exists.',
  },
  {
    kind: 'booking',
    entityId: 'goglobal',
    bookings: 31240,
    ttv: 9_120_000,
    netRevenue: 845_000,
    cancellationRate: 7.4,
    failureRate: 1.8,
    averageBookingValue: 292,
    destinationMix: [
      { name: 'Japan', value: 46 },
      { name: 'Korea', value: 24 },
      { name: 'SEA', value: 20 },
      { name: 'Other', value: 10 },
    ],
    directContractRatio: 41,
    thirdPartyInventoryRatio: 59,
    topDestinations: [
      { name: 'Tokyo', value: 7400 },
      { name: 'Osaka', value: 6100 },
      { name: 'Seoul', value: 4300 },
      { name: 'Bangkok', value: 3200 },
      { name: 'Da Nang', value: 2400 },
    ],
    topHotels: [
      { name: 'Shinjuku Granbell', value: 1620 },
      { name: 'Namba Oriental', value: 1410 },
      { name: 'Lotte Hotel Seoul', value: 1090 },
    ],
    failureReasons: [
      { reason: 'Timeout', pct: 38 },
      { reason: 'Rate mismatch', pct: 33 },
      { reason: 'Mapping gap', pct: 18 },
      { reason: 'Other', pct: 11 },
    ],
    monthlyTrend: [
      m('Jan', 27800, 8_100_000),
      m('Feb', 28600, 8_350_000),
      m('Mar', 29400, 8_580_000),
      m('Apr', 30100, 8_790_000),
      m('May', 30700, 8_960_000),
      m('Jun', 31240, 9_120_000),
    ],
    aiComment:
      'A strong, low-failure (1.8%) live partner. Japan inventory outperforms on rate. The lever is breadth — once the SLA and live key close, expanding Vietnam direct supply should lift volume further.',
  },
  {
    kind: 'booking',
    entityId: 'klook',
    bookings: 26760,
    ttv: 7_350_000,
    netRevenue: 681_000,
    cancellationRate: 8.8,
    failureRate: 5.6,
    averageBookingValue: 275,
    destinationMix: [
      { name: 'SEA', value: 52 },
      { name: 'Korea', value: 21 },
      { name: 'Japan', value: 17 },
      { name: 'Other', value: 10 },
    ],
    directContractRatio: 33,
    thirdPartyInventoryRatio: 67,
    topDestinations: [
      { name: 'Bangkok', value: 6300 },
      { name: 'Singapore', value: 4900 },
      { name: 'Seoul', value: 3800 },
      { name: 'Bali', value: 3100 },
    ],
    topHotels: [
      { name: 'Centara Grand Bangkok', value: 1280 },
      { name: 'Marina Bay Sands', value: 1040 },
      { name: 'Lotte Hotel Seoul', value: 870 },
    ],
    failureReasons: [
      { reason: 'Flash-sale peak load', pct: 47 },
      { reason: 'Rate mismatch', pct: 24 },
      { reason: 'Timeout', pct: 18 },
      { reason: 'Other', pct: 11 },
    ],
    monthlyTrend: [
      m('Jan', 24900, 6_840_000),
      m('Feb', 25400, 6_980_000),
      m('Mar', 25900, 7_110_000),
      m('Apr', 26100, 7_170_000),
      m('May', 26500, 7_280_000),
      m('Jun', 26760, 7_350_000),
    ],
    aiComment:
      'Failure rate (5.6%) is elevated and concentrated at flash-sale peaks — the same events driving the SLA dispute. Cap compensation to attributable peak failures and ship a flash-sale mitigation plan before finalizing terms.',
  },
  {
    kind: 'booking',
    entityId: 'hotelbeds',
    bookings: 22080,
    ttv: 6_010_000,
    netRevenue: 520_000,
    cancellationRate: 6.1,
    failureRate: 2.9,
    averageBookingValue: 272,
    destinationMix: [
      { name: 'Europe', value: 38 },
      { name: 'SEA', value: 26 },
      { name: 'Korea', value: 20 },
      { name: 'Other', value: 16 },
    ],
    directContractRatio: 12,
    thirdPartyInventoryRatio: 88,
    topDestinations: [
      { name: 'Barcelona', value: 3900 },
      { name: 'Bangkok', value: 3400 },
      { name: 'Seoul', value: 2800 },
      { name: 'Rome', value: 2200 },
    ],
    topHotels: [
      { name: 'H10 Marina Barcelona', value: 980 },
      { name: 'Centara Grand Bangkok', value: 910 },
    ],
    failureReasons: [
      { reason: 'Rate mismatch', pct: 44 },
      { reason: 'Mapping gap', pct: 29 },
      { reason: 'Timeout', pct: 16 },
      { reason: 'Other', pct: 11 },
    ],
    monthlyTrend: [
      m('Jan', 23000, 6_260_000),
      m('Feb', 22800, 6_200_000),
      m('Mar', 22600, 6_150_000),
      m('Apr', 22400, 6_100_000),
      m('May', 22300, 6_070_000),
      m('Jun', 22080, 6_010_000),
    ],
    aiComment:
      'Volume has softened slightly (-1.3% QoQ) and direct-contract share is low (12%). The integration fee should be success-linked: a flat non-refundable USD 25,000 is poor value while volume is flat.',
  },
  {
    kind: 'booking',
    entityId: 'dida',
    bookings: 14280,
    ttv: 3_840_000,
    netRevenue: 318_000,
    cancellationRate: 12.4,
    failureRate: 7.9,
    averageBookingValue: 269,
    destinationMix: [
      { name: 'China', value: 58 },
      { name: 'Korea', value: 22 },
      { name: 'SEA', value: 14 },
      { name: 'Other', value: 6 },
    ],
    directContractRatio: 9,
    thirdPartyInventoryRatio: 91,
    topDestinations: [
      { name: 'Shanghai', value: 3600 },
      { name: 'Seoul', value: 2700 },
      { name: 'Beijing', value: 2300 },
      { name: 'Jeju', value: 1500 },
    ],
    topHotels: [
      { name: 'Jin Jiang Shanghai', value: 760 },
      { name: 'Lotte Hotel Seoul', value: 640 },
    ],
    failureReasons: [
      { reason: 'Invalid room-type code (Dida-side)', pct: 52 },
      { reason: 'Genuine sold-out', pct: 21 },
      { reason: 'Cancellation false-positive', pct: 17 },
      { reason: 'Other', pct: 10 },
    ],
    monthlyTrend: [
      m('Jan', 16800, 4_520_000),
      m('Feb', 16200, 4_360_000),
      m('Mar', 15600, 4_190_000),
      m('Apr', 15100, 4_060_000),
      m('May', 14700, 3_950_000),
      m('Jun', 14280, 3_840_000),
    ],
    aiComment:
      'Worst-in-portfolio failure (7.9%) and cancellation (12.4%) rates, declining -6.7% QoQ. 52% of failures are Dida-side invalid room-type codes, not genuine sold-out — a joint mapping review should recover most of the loss.',
  },
  {
    kind: 'booking',
    entityId: 'traveloka',
    bookings: 28940,
    ttv: 7_980_000,
    netRevenue: 712_000,
    cancellationRate: 8.0,
    failureRate: 4.7,
    averageBookingValue: 276,
    destinationMix: [
      { name: 'Indonesia', value: 39 },
      { name: 'Vietnam', value: 24 },
      { name: 'SEA', value: 22 },
      { name: 'Korea/Japan', value: 15 },
    ],
    directContractRatio: 27,
    thirdPartyInventoryRatio: 73,
    topDestinations: [
      { name: 'Jakarta', value: 6800 },
      { name: 'Da Nang', value: 5100 },
      { name: 'Bali', value: 4200 },
      { name: 'Ho Chi Minh', value: 3300 },
    ],
    topHotels: [
      { name: 'Vinpearl Da Nang', value: 1340 },
      { name: 'The Trans Bali', value: 1020 },
    ],
    failureReasons: [
      { reason: 'No Room Available (prebook)', pct: 49 },
      { reason: 'Atlas schema mismatch', pct: 23 },
      { reason: 'Timeout', pct: 18 },
      { reason: 'Other', pct: 10 },
    ],
    monthlyTrend: [
      m('Jan', 26100, 7_200_000),
      m('Feb', 26800, 7_390_000),
      m('Mar', 27400, 7_560_000),
      m('Apr', 27900, 7_700_000),
      m('May', 28400, 7_840_000),
      m('Jun', 28940, 7_980_000),
    ],
    aiComment:
      'Volume is healthy but 49% of failures are prebook "No Room Available" — the exact metric tied to Traveloka\'s auto-suspension threshold. Fix the per-market prebook path before expanding volume.',
  },
  {
    kind: 'booking',
    entityId: 'webbeds',
    bookings: 9620,
    ttv: 2_410_000,
    netRevenue: 198_000,
    cancellationRate: 7.0,
    failureRate: 3.4,
    averageBookingValue: 250,
    destinationMix: [
      { name: 'Korea', value: 34 },
      { name: 'Japan', value: 28 },
      { name: 'Vietnam', value: 22 },
      { name: 'Other', value: 16 },
    ],
    directContractRatio: 18,
    thirdPartyInventoryRatio: 82,
    topDestinations: [
      { name: 'Seoul', value: 2600 },
      { name: 'Tokyo', value: 2200 },
      { name: 'Da Nang', value: 1700 },
    ],
    topHotels: [
      { name: 'Lotte Hotel Seoul', value: 540 },
      { name: 'Shinjuku Granbell', value: 470 },
    ],
    failureReasons: [
      { reason: 'Rate competitiveness (JP/VN)', pct: 46 },
      { reason: 'Mapping gap', pct: 28 },
      { reason: 'Timeout', pct: 15 },
      { reason: 'Other', pct: 11 },
    ],
    monthlyTrend: [
      m('Jan', 6400, 1_600_000),
      m('Feb', 7100, 1_780_000),
      m('Mar', 7900, 1_980_000),
      m('Apr', 8500, 2_130_000),
      m('May', 9100, 2_280_000),
      m('Jun', 9620, 2_410_000),
    ],
    aiComment:
      'Fast Korea growth (+22% QoQ) but 46% of failures stem from weak JP/VN rate competitiveness — matching the concern about prioritizing development resource. Korea is the strong case; validate JP/VN before investing.',
  },

  // ── Operational (no booking volume yet) ──────────────────────────────────
  {
    kind: 'operational',
    entityId: 'itank',
    pendingConfirmationCount: 6,
    productSetupProgress: 20,
    contractReadiness: 'Early',
    rateStatus: 'Pending',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'High',
    riskLevel: 'Medium',
    aiComment:
      'Six items await iTANK\'s response (options, documents, process, commercial model, timeline, partner scope). Engineering is gated on the formal inquiry — send it to unblock the whole cluster.',
  },
  {
    kind: 'operational',
    entityId: 'grandhyatt',
    pendingConfirmationCount: 4,
    productSetupProgress: 55,
    contractReadiness: 'In Progress',
    rateStatus: 'Pending',
    policyConfirmationStatus: 'Partial',
    communicationActivity: 'High',
    riskLevel: 'Medium',
    aiComment:
      'Hotel is open to a direct contract; rates, ALM, cancellation policy and summer promotion are the four pending confirmations. July inventory is time-sensitive — lock terms before the peak.',
  },
  {
    kind: 'operational',
    entityId: 'medkorea',
    pendingConfirmationCount: 3,
    productSetupProgress: 40,
    contractReadiness: 'In Progress',
    rateStatus: 'Partial',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'Cooperation hinges on explaining the net-rate and prepaid settlement model. Document settlement, guarantee booking and per-hotel cancellation rules to convert interest into commitment.',
  },
  {
    kind: 'operational',
    entityId: 'supdanang',
    pendingConfirmationCount: 5,
    productSetupProgress: 45,
    contractReadiness: 'In Progress',
    rateStatus: 'Pending',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'Product selected (Sunrise/Sunset SUP Paddle Tour). Net price, cut-off, weather policy, settlement and prep items pending. The weather-cancellation policy is the key launch blocker.',
  },
  {
    kind: 'operational',
    entityId: 'danangsurf',
    pendingConfirmationCount: 3,
    productSetupProgress: 50,
    contractReadiness: 'In Progress',
    rateStatus: 'Partial',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'Schedule and inclusions are clear (09:00 / 14:30, rental + photo + free surf). Cut-off, payment and winter/rainy-day operation rules remain — document these to avoid seasonal disputes.',
  },
  {
    kind: 'operational',
    entityId: 'poseidon',
    pendingConfirmationCount: 4,
    productSetupProgress: 65,
    contractReadiness: 'Near Ready',
    rateStatus: 'Confirmed',
    policyConfirmationStatus: 'Partial',
    communicationActivity: 'Moderate',
    riskLevel: 'Low',
    aiComment:
      'Age and cancellation policies plus 50% advance payment are confirmed. Remaining: on-site payment, no-show control, product images and the Naver Smart Store flow before listing.',
  },
  {
    kind: 'operational',
    entityId: 'aphrodite',
    pendingConfirmationCount: 5,
    productSetupProgress: 50,
    contractReadiness: 'In Progress',
    rateStatus: 'Partial',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'A deposit is already paid, raising exposure. Payment method, passport policy, weather-cancellation refund, charter condition and beverage payment must be locked before publishing.',
  },
  {
    kind: 'operational',
    entityId: 'chaletkorea',
    pendingConfirmationCount: 3,
    productSetupProgress: 35,
    contractReadiness: 'Early',
    rateStatus: 'Partial',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'Connectivity depends on iTANK. Confirm API feasibility, then scope supply and sales potential — this inventory feeds the Yeogi Eottae CEO briefing number.',
  },
  {
    kind: 'operational',
    entityId: 'taiwanhrc',
    pendingConfirmationCount: 4,
    productSetupProgress: 30,
    contractReadiness: 'Early',
    rateStatus: 'Pending',
    policyConfirmationStatus: 'Pending',
    communicationActivity: 'Moderate',
    riskLevel: 'Medium',
    aiComment:
      'Connectivity depends on iTANK. Target destinations, settlement currency (TWD vs USD) and expected volume are unknown — resolve settlement first to keep the API scope on track.',
  },
]

export const metricsByEntity = (entityId: string): Metrics | undefined =>
  salesData.find((s) => s.entityId === entityId)

export const bookingEntities = (): BookingMetrics[] =>
  salesData.filter((s): s is BookingMetrics => s.kind === 'booking')

// ── Portfolio rollups for the Data Insight & Dashboard pages ────────────────
export const portfolioTotals = () => {
  const b = bookingEntities()
  const totalBookings = b.reduce((a, s) => a + s.bookings, 0)
  const totalTtv = b.reduce((a, s) => a + s.ttv, 0)
  const totalNet = b.reduce((a, s) => a + s.netRevenue, 0)
  const avgFailure = b.reduce((a, s) => a + s.failureRate, 0) / Math.max(b.length, 1)
  return { totalBookings, totalTtv, totalNet, avgFailure }
}
