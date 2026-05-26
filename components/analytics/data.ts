import type {
  AnalyticsData,
  AnalyticsMonthOption,
  FixedBucketActual,
  FixedBucketPlan,
  LiveMonthAnalysis,
  ManualBucketCalibration,
  MajorTransaction,
  MonthSnapshot,
} from "@/components/analytics/types"

export const ANALYTICS_PLAN: "free" | "pro" = "pro"

export function deriveRhythmCharacter(
  cumulative: number[],
): "steady" | "frontLoaded" | "backLoaded" | "uneven" {
  if (cumulative.length < 4) return "steady"

  const deltas = cumulative.map((value, index) => value - (cumulative[index - 1] ?? 0))
  const midpoint = Math.floor(deltas.length / 2)
  const firstHalf = deltas.slice(0, midpoint)
  const secondHalf = deltas.slice(midpoint)
  const firstAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length
  const overallAvg = deltas.reduce((sum, value) => sum + value, 0) / deltas.length
  const withinSteadyBand = (value: number) => Math.abs(value - overallAvg) <= overallAvg * 0.15

  if (withinSteadyBand(firstAvg) && withinSteadyBand(secondAvg)) return "steady"
  if (firstAvg > secondAvg * 1.15) return "frontLoaded"
  if (secondAvg > firstAvg * 1.15) return "backLoaded"
  return "uneven"
}

const FIXED_PLAN: FixedBucketPlan[] = [
  { id: "fb-rent", name: "Rent", budget: 800, type: "recurring", iconKey: "rent" },
  { id: "fb-spotify", name: "Spotify", budget: 100, type: "recurring", iconKey: "spotify" },
  {
    id: "fb-phone-installment",
    name: "Phone installment",
    budget: 300,
    type: "installment",
    iconKey: "phone-installment",
  },
  { id: "fb-coffee", name: "Coffee", budget: 200, type: "manual", iconKey: "coffee" },
  {
    id: "fb-groceries",
    name: "Groceries",
    budget: 240,
    type: "manual",
    iconKey: "groceries",
  },
]

const majorTransactions_2026_04: MajorTransaction[] = [
  {
    id: "major-2026-04-laptop-battery",
    amount: 480,
    description: "Laptop battery replacement",
    date: "2026-04-18",
    paymentMethodName: "Instapay",
  },
]

const majorTransactions_2026_03: MajorTransaction[] = [
  {
    id: "major-2026-03-clinic",
    amount: 360,
    description: "Clinic visit and scans",
    date: "2026-03-08",
    paymentMethodName: "Instapay",
  },
  {
    id: "major-2026-03-desk",
    amount: 210,
    description: "Desk chair repair",
    date: "2026-03-19",
    paymentMethodName: "Instapay",
  },
  {
    id: "major-2026-03-tires",
    amount: 150,
    description: "Car tire replacement",
    date: "2026-03-24",
    paymentMethodName: "Instapay",
  },
]

const majorTransactions_2026_05: MajorTransaction[] = [
  {
    id: "major-2026-05-course-fee",
    amount: 480,
    description: "Course renewal fee",
    date: "2026-05-12",
    paymentMethodName: "Instapay",
  },
  {
    id: "major-2026-05-lab-tests",
    amount: 260,
    description: "Lab tests package",
    date: "2026-05-08",
    paymentMethodName: "Vodafone Cash",
  },
  {
    id: "major-2026-05-air-purifier",
    amount: 160,
    description: "Air purifier filter set",
    date: "2026-05-16",
    paymentMethodName: "Bank Card",
  },
]

const majorTransactions_2026_05_atRisk: MajorTransaction[] = [
  {
    id: "major-2026-05-phone-screen",
    amount: 900,
    description: "Phone screen replacement",
    date: "2026-05-04",
    paymentMethodName: "Instapay",
  },
  {
    id: "major-2026-05-dental",
    amount: 260,
    description: "Dental treatment deposit",
    date: "2026-05-08",
    paymentMethodName: "Vodafone Cash",
  },
  {
    id: "major-2026-05-appliance",
    amount: 160,
    description: "Water heater part",
    date: "2026-05-11",
    paymentMethodName: "Bank Card",
  },
  {
    id: "major-2026-05-travel",
    amount: 100,
    description: "Family travel booking",
    date: "2026-05-15",
    paymentMethodName: "Cash",
  },
]

export function deriveManualBucketCalibration(
  fixedBuckets: FixedBucketPlan[],
  fixedBucketsActual: FixedBucketActual[],
): ManualBucketCalibration[] {
  const actualById = new Map(fixedBucketsActual.map((bucket) => [bucket.id, bucket.spent]))

  return fixedBuckets
    .filter((bucket) => bucket.type === "manual")
    .map((bucket) => ({
      bucketId: bucket.id,
      name: bucket.name,
      planned: bucket.budget,
      actual: actualById.get(bucket.id) ?? 0,
    }))
}

export function withManualBucketCalibration<
  T extends { fixedBuckets: FixedBucketPlan[]; fixedBucketsActual: FixedBucketActual[] },
>(month: T): T & { manualBucketCalibration: ManualBucketCalibration[] } {
  return {
    ...month,
    manualBucketCalibration: deriveManualBucketCalibration(
      month.fixedBuckets,
      month.fixedBucketsActual,
    ),
  }
}

const snapshot_2026_04: MonthSnapshot = withManualBucketCalibration({
  month: "2026-04",
  isoDate: "2026-04-01",
  closedAt: "2026-05-01T08:14:00Z",
  closedBy: "user",
  monthlyBudget: 6000,
  daysInMonth: 30,
  fixedTotalBudget: 1640,
  fixedBuckets: FIXED_PLAN,
  totalVariableSpent: 3640,
  fixedTotalSpent: 1900,
  fixedOverspend: 260,
  fixedBucketsActual: [
    { id: "fb-rent", spent: 800, transactionCount: 1 },
    { id: "fb-spotify", spent: 100, transactionCount: 1 },
    { id: "fb-phone-installment", spent: 280, transactionCount: 1 },
    { id: "fb-coffee", spent: 220, transactionCount: 9 },
    { id: "fb-groceries", spent: 500, transactionCount: 7 },
  ],
  majorTotal: 480,
  majorCount: 1,
  majorTransactions: majorTransactions_2026_04,
  // No injections, actual stays within the final effective plan.
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 200,
  effectiveVariableBudgetFinal: 3800,
  baseDailyRate: 145,
  variableSavingsRate: 16,
  rolloverEgpFinal: 160,
  overspentDays: 4,
  dailyVariableCumulative: [
    170, 335, 495, 650, 800, 945, 1085, 1225, 1360, 1490, 1615, 1740, 1860, 1980, 2100, 2220, 2340,
    2460, 2580, 2700, 2810, 2910, 3005, 3100, 3190, 3280, 3370, 3460, 3550, 3640,
  ],
  weeklySpend: [820, 940, 880, 1000],
  weeklyBudgetTarget: 845,
  dayOfWeekSpend: [560, 380, 410, 380, 720, 760, 430],
  largestVariableDay: { date: "2026-04-25", amount: 380 },
  largestVariableTxn: { id: "tx-04-25-a", amount: 240, description: "Dinner with friends" },
  fixedManualOverBudgetCount: 1,
  majorPctOfBudget: 8,
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 1320,
      fixed: 0,
      major: 0,
      total: 1320,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 980,
      fixed: 800,
      major: 480,
      total: 2260,
      fixedByType: { manual: 0, recurring: 800, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 880,
      fixed: 900,
      major: 0,
      total: 1780,
      fixedByType: { manual: 620, recurring: 0, installment: 280 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 460,
      fixed: 200,
      major: 0,
      total: 660,
      fixedByType: { manual: 100, recurring: 100, installment: 0 },
    },
  ],
  fixedTransfers: [
    {
      type: "manual",
      total: 180,
      sources: [
        {
          bucketId: "fb-coffee",
          name: "Coffee",
          amount: 120,
          target: { type: "variable" },
        },
        {
          bucketId: "fb-groceries",
          name: "Groceries",
          amount: 60,
          target: { type: "manual", name: "Coffee" },
        },
      ],
    },
  ],
})

const snapshot_2026_03: MonthSnapshot = withManualBucketCalibration({
  month: "2026-03",
  isoDate: "2026-03-01",
  closedAt: "2026-04-02T20:11:00Z",
  closedBy: "user",
  monthlyBudget: 6000,
  daysInMonth: 31,
  fixedTotalBudget: 1640,
  fixedBuckets: FIXED_PLAN,
  totalVariableSpent: 3300,
  fixedTotalSpent: 1540,
  fixedOverspend: 0,
  fixedBucketsActual: [
    { id: "fb-rent", spent: 800, transactionCount: 1 },
    { id: "fb-spotify", spent: 100, transactionCount: 1 },
    { id: "fb-phone-installment", spent: 300, transactionCount: 1 },
    { id: "fb-coffee", spent: 240, transactionCount: 8 },
    { id: "fb-groceries", spent: 160, transactionCount: 5 },
  ],
  majorTotal: 720,
  majorCount: 3,
  majorTransactions: majorTransactions_2026_03,
  // Injections push the effective plan up; actual still lands under it.
  injectionTotal: 200,
  injectionCount: 1,
  variableReceivedTotal: 0,
  effectiveVariableBudgetFinal: 3640,
  baseDailyRate: 141,
  variableSavingsRate: 18,
  rolloverEgpFinal: 340,
  overspentDays: 2,
  dailyVariableCumulative: [
    80, 165, 255, 345, 440, 535, 630, 720, 815, 910, 1010, 1110, 1210, 1310, 1410, 1510, 1615, 1720,
    1830, 1940, 2055, 2170, 2290, 2410, 2535, 2660, 2790, 2920, 3055, 3190, 3300,
  ],
  weeklySpend: [780, 740, 850, 720, 210],
  weeklyBudgetTarget: 822,
  dayOfWeekSpend: [510, 320, 360, 360, 660, 690, 400],
  largestVariableDay: { date: "2026-03-14", amount: 410 },
  largestVariableTxn: { id: "tx-03-14-a", amount: 280, description: "Birthday dinner" },
  fixedManualOverBudgetCount: 0,
  majorPctOfBudget: 12,
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 980,
      fixed: 0,
      major: 0,
      total: 980,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 1220,
      fixed: 540,
      major: 720,
      total: 2480,
      fixedByType: { manual: 0, recurring: 540, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 880,
      fixed: 800,
      major: 0,
      total: 1680,
      fixedByType: { manual: 500, recurring: 0, installment: 300 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 220,
      fixed: 200,
      major: 0,
      total: 420,
      fixedByType: { manual: 140, recurring: 60, installment: 0 },
    },
  ],
  fixedTransfers: [],
})

const snapshot_2026_02: MonthSnapshot = withManualBucketCalibration({
  month: "2026-02",
  isoDate: "2026-02-01",
  closedAt: "2026-03-07T03:00:00Z",
  closedBy: "auto",
  monthlyBudget: 6000,
  daysInMonth: 28,
  fixedTotalBudget: 1640,
  fixedBuckets: FIXED_PLAN,
  totalVariableSpent: 3820,
  fixedTotalSpent: 1780,
  fixedOverspend: 140,
  fixedBucketsActual: [
    { id: "fb-rent", spent: 800, transactionCount: 1 },
    { id: "fb-spotify", spent: 100, transactionCount: 1 },
    { id: "fb-phone-installment", spent: 300, transactionCount: 1 },
    { id: "fb-coffee", spent: 200, transactionCount: 11 },
    { id: "fb-groceries", spent: 240, transactionCount: 6 },
  ],
  majorTotal: 0,
  majorCount: 0,
  majorTransactions: [],
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 0,
  // No injections and actual outruns the effective plan.
  effectiveVariableBudgetFinal: 2720,
  baseDailyRate: 156,
  variableSavingsRate: 11,
  rolloverEgpFinal: -380,
  overspentDays: 6,
  dailyVariableCumulative: [
    170, 335, 495, 650, 800, 945, 1085, 1225, 1360, 1495, 1625, 1755, 1880, 2005, 2150, 2295, 2435,
    2575, 2705, 2835, 2965, 3095, 3220, 3345, 3465, 3585, 3700, 3820,
  ],
  weeklySpend: [1010, 980, 920, 910],
  weeklyBudgetTarget: 952,
  dayOfWeekSpend: [580, 410, 440, 430, 780, 770, 410],
  largestVariableDay: { date: "2026-02-21", amount: 460 },
  largestVariableTxn: { id: "tx-02-21-a", amount: 320, description: "Weekend brunch" },
  fixedManualOverBudgetCount: 2,
  majorPctOfBudget: 25,
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 1420,
      fixed: 0,
      major: 0,
      total: 1420,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 1240,
      fixed: 700,
      major: 0,
      total: 1940,
      fixedByType: { manual: 0, recurring: 700, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 1020,
      fixed: 840,
      major: 0,
      total: 1860,
      fixedByType: { manual: 540, recurring: 0, installment: 300 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 140,
      fixed: 240,
      major: 0,
      total: 380,
      fixedByType: { manual: 40, recurring: 200, installment: 0 },
    },
  ],
  fixedTransfers: [
    {
      type: "manual",
      total: 120,
      sources: [
        {
          bucketId: "fb-coffee",
          name: "Coffee",
          amount: 120,
          target: { type: "variable" },
        },
      ],
    },
  ],
})

const liveFixedBucketsActual: FixedBucketActual[] = [
  { id: "fb-rent", spent: 800, transactionCount: 1 },
  { id: "fb-spotify", spent: 100, transactionCount: 1 },
  { id: "fb-phone-installment", spent: 300, transactionCount: 1 },
  { id: "fb-coffee", spent: 195, transactionCount: 8 },
  { id: "fb-groceries", spent: 110, transactionCount: 4 },
]

const liveMonth_2026_05: LiveMonthAnalysis = withManualBucketCalibration({
  month: "2026-05",
  isoDate: "2026-05-01",
  daysTracked: 18,
  daysRemaining: 13,
  daysInMonth: 31,
  status: "inProgress",
  closedBy: null,
  monthlyState: "onTrack",

  monthlyBudget: 6000,
  fixedTotalBudget: 1640,
  fixedBuckets: FIXED_PLAN,

  totalVariableSpent: 1820,
  fixedTotalSpent: 1505,
  fixedOverspend: 0,
  fixedBucketsActual: liveFixedBucketsActual,
  majorTotal: 900,
  majorCount: 3,
  majorTransactions: majorTransactions_2026_05,
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 0,

  effectiveVariableBudget: 3760,
  baseDailyRate: 141,
  todaysRate: 149,
  variableSavingsRateMtd: 22,
  rolloverEgp: 364,
  pacingDeltaPct: -16,
  budgetUsedPct: 48,
  monthProgressPct: 58,
  overspentDaysMtd: 3,
  dailyVariableCumulative: [
    80, 170, 265, 350, 460, 560, 665, 755, 875, 970, 1070, 1180, 1270, 1375, 1495, 1590, 1705, 1820,
  ],
  weeklySpend: [560, 520, 480, 260],
  weeklyBudgetTarget: 875,
  dayOfWeekSpend: [320, 180, 220, 200, 380, 360, 160],
  largestVariableDay: { date: "2026-05-09", amount: 290 },
  largestVariableTxn: { id: "tx-05-09-a", amount: 210, description: "Weekend takeaway" },
  fixedManualOverBudgetCount: 0,
  majorPctOfBudget: 15,

  projectionConfidenceDay: 18,
  avgDailySpend: 101,
  projectedEndSpend: 3131,
  projectedSavings: 629,
  projectedSavingsRate: 17,

  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 160,
      fixed: 0,
      major: 0,
      total: 160,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 840,
      fixed: 700,
      major: 480,
      total: 2020,
      fixedByType: { manual: 0, recurring: 700, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 260,
      fixed: 605,
      major: 260,
      total: 1125,
      fixedByType: { manual: 305, recurring: 0, installment: 300 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 560,
      fixed: 200,
      major: 160,
      total: 920,
      fixedByType: { manual: 0, recurring: 200, installment: 0 },
    },
  ],
  fixedTransfers: [
    {
      type: "manual",
      total: 95,
      sources: [
        {
          bucketId: "fb-coffee",
          name: "Coffee",
          amount: 55,
          target: { type: "variable" },
        },
        {
          bucketId: "fb-groceries",
          name: "Groceries",
          amount: 40,
          target: { type: "manual", name: "Coffee" },
        },
      ],
    },
  ],
})

const liveMonth_firstMonth: LiveMonthAnalysis = {
  ...liveMonth_2026_05,
  injectionTotal: 0,
  injectionCount: 0,
  variableSavingsRateMtd: 18,
}

export const analyticsData: AnalyticsData = {
  current: liveMonth_2026_05,
  snapshots: [snapshot_2026_04, snapshot_2026_03, snapshot_2026_02],
}

export const analyticsDataFirstMonth: AnalyticsData = {
  current: liveMonth_firstMonth,
  snapshots: [],
}

// ─── Named scenario datasets ───────────────────────────────────────────────────

export const analyticsDataOnTrack: AnalyticsData = analyticsData

const liveMonth_atRisk: LiveMonthAnalysis = {
  ...liveMonth_2026_05,
  monthlyState: "atRisk",
  totalVariableSpent: 2600,
  majorTotal: 1420,
  majorCount: 4,
  majorTransactions: majorTransactions_2026_05_atRisk,
  rolloverEgp: -320,
  pacingDeltaPct: 18,
  budgetUsedPct: 70,
  overspentDaysMtd: 9,
  avgDailySpend: 144,
  projectedEndSpend: 4360,
  projectedSavings: -280,
  projectedSavingsRate: -7,
  dailyVariableCumulative: [
    220, 430, 635, 825, 1005, 1175, 1340, 1500, 1650, 1785, 1910, 2030, 2145, 2255, 2355, 2450,
    2530, 2600,
  ],
  weeklySpend: [720, 760, 680, 440],
  dayOfWeekSpend: [440, 260, 380, 340, 460, 480, 240],
  largestVariableDay: { date: "2026-05-10", amount: 380 },
  largestVariableTxn: { id: "tx-05-10-a", amount: 280, description: "Dinner out" },
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 260,
      fixed: 0,
      major: 100,
      total: 360,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 1180,
      fixed: 700,
      major: 900,
      total: 2780,
      fixedByType: { manual: 0, recurring: 700, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 420,
      fixed: 605,
      major: 260,
      total: 1285,
      fixedByType: { manual: 305, recurring: 0, installment: 300 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 740,
      fixed: 200,
      major: 160,
      total: 1100,
      fixedByType: { manual: 0, recurring: 200, installment: 0 },
    },
  ],
}

export const analyticsDataAtRisk: AnalyticsData = {
  current: liveMonth_atRisk,
  snapshots: [snapshot_2026_04, snapshot_2026_03, snapshot_2026_02],
}

const liveMonth_over: LiveMonthAnalysis = {
  ...liveMonth_2026_05,
  monthlyState: "over",
  totalVariableSpent: 4240,
  majorTotal: 0,
  majorCount: 0,
  majorTransactions: [],
  rolloverEgp: -1840,
  pacingDeltaPct: 42,
  budgetUsedPct: 113,
  overspentDaysMtd: 14,
  avgDailySpend: 236,
  projectedEndSpend: 6320,
  projectedSavings: -1240,
  projectedSavingsRate: -33,
  dailyVariableCumulative: [
    180, 390, 610, 840, 1080, 1330, 1590, 1835, 2070, 2300, 2520, 2755, 2995, 3245, 3505, 3760,
    4000, 4240,
  ],
  weeklySpend: [980, 1120, 1240, 900],
  dayOfWeekSpend: [580, 420, 560, 480, 680, 820, 700],
  largestVariableDay: { date: "2026-05-14", amount: 620 },
  largestVariableTxn: { id: "tx-05-14-a", amount: 540, description: "Emergency repair" },
  fixedManualOverBudgetCount: 2,
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 420,
      fixed: 0,
      major: 0,
      total: 420,
      fixedByType: { manual: 0, recurring: 0, installment: 0 },
    },
    {
      id: "pm2",
      name: "Instapay",
      variable: 1620,
      fixed: 700,
      major: 0,
      total: 2320,
      fixedByType: { manual: 0, recurring: 700, installment: 0 },
    },
    {
      id: "pm3",
      name: "Vodafone Cash",
      variable: 960,
      fixed: 605,
      major: 0,
      total: 1565,
      fixedByType: { manual: 305, recurring: 0, installment: 300 },
    },
    {
      id: "pm4",
      name: "Bank Card",
      variable: 1240,
      fixed: 200,
      major: 0,
      total: 1440,
      fixedByType: { manual: 0, recurring: 200, installment: 0 },
    },
  ],
}

export const analyticsDataOver: AnalyticsData = {
  current: liveMonth_over,
  snapshots: [snapshot_2026_04, snapshot_2026_03, snapshot_2026_02],
}

export function getAnalyticsDataForScenario(
  monthlyBudgetState: "onTrack" | "atRisk" | "over",
): AnalyticsData {
  if (monthlyBudgetState === "atRisk") return analyticsDataAtRisk
  if (monthlyBudgetState === "over") return analyticsDataOver
  return analyticsDataOnTrack
}

export function snapshotToView(snapshot: MonthSnapshot): LiveMonthAnalysis {
  const budgetUsedPct = Math.round(
    (snapshot.totalVariableSpent / Math.max(1, snapshot.effectiveVariableBudgetFinal)) * 100,
  )
  return withManualBucketCalibration({
    month: snapshot.month,
    isoDate: snapshot.isoDate,
    daysTracked: snapshot.daysInMonth,
    daysRemaining: 0,
    daysInMonth: snapshot.daysInMonth,
    status: "closed",
    closedBy: snapshot.closedBy,
    monthlyState: "onTrack",

    monthlyBudget: snapshot.monthlyBudget,
    fixedTotalBudget: snapshot.fixedTotalBudget,
    fixedBuckets: snapshot.fixedBuckets,

    totalVariableSpent: snapshot.totalVariableSpent,
    fixedTotalSpent: snapshot.fixedTotalSpent,
    fixedOverspend: snapshot.fixedOverspend,
    fixedBucketsActual: snapshot.fixedBucketsActual,
    majorTotal: snapshot.majorTotal,
    majorCount: snapshot.majorCount,
    majorTransactions: snapshot.majorTransactions,
    injectionTotal: snapshot.injectionTotal,
    injectionCount: snapshot.injectionCount,
    variableReceivedTotal: snapshot.variableReceivedTotal,

    effectiveVariableBudget: snapshot.effectiveVariableBudgetFinal,
    baseDailyRate: snapshot.baseDailyRate,
    todaysRate: 0,
    variableSavingsRateMtd: snapshot.variableSavingsRate,
    rolloverEgp: snapshot.rolloverEgpFinal,
    pacingDeltaPct: 0,
    budgetUsedPct,
    monthProgressPct: 100,
    overspentDaysMtd: snapshot.overspentDays,
    dailyVariableCumulative: snapshot.dailyVariableCumulative,
    weeklySpend: snapshot.weeklySpend,
    weeklyBudgetTarget: snapshot.weeklyBudgetTarget,
    dayOfWeekSpend: snapshot.dayOfWeekSpend,
    largestVariableDay: snapshot.largestVariableDay,
    largestVariableTxn: snapshot.largestVariableTxn,
    fixedManualOverBudgetCount: snapshot.fixedManualOverBudgetCount,
    majorPctOfBudget: snapshot.majorPctOfBudget,

    projectionConfidenceDay: snapshot.daysInMonth,
    avgDailySpend: Math.round(snapshot.totalVariableSpent / snapshot.daysInMonth),
    projectedEndSpend: snapshot.totalVariableSpent,
    projectedSavings: Math.max(
      0,
      snapshot.effectiveVariableBudgetFinal - snapshot.totalVariableSpent,
    ),
    projectedSavingsRate: snapshot.variableSavingsRate,

    paymentMethods: snapshot.paymentMethods,
    fixedTransfers: snapshot.fixedTransfers ?? [],
  })
}

export function getMonthView(data: AnalyticsData, monthId: string): LiveMonthAnalysis {
  if (monthId === data.current.month) return data.current
  const snapshot = data.snapshots.find((s) => s.month === monthId)
  return snapshot ? snapshotToView(snapshot) : data.current
}

export function getAnalyticsMonthOptions(data: AnalyticsData): AnalyticsMonthOption[] {
  return [
    { id: data.current.month, isoDate: data.current.isoDate, status: "inProgress" },
    ...data.snapshots.map<AnalyticsMonthOption>((s) => ({
      id: s.month,
      isoDate: s.isoDate,
      status: "closed",
    })),
  ]
}

export function getPreviousSnapshot(data: AnalyticsData, monthId: string): MonthSnapshot | null {
  if (monthId === data.current.month) {
    return data.snapshots[0] ?? null
  }
  const idx = data.snapshots.findIndex((s) => s.month === monthId)
  if (idx < 0) return null
  return data.snapshots[idx + 1] ?? null
}
