import type {
  AnalyticsData,
  AnalyticsMonthOption,
  ClosedMonthVerdict,
  FixedBucketActual,
  FixedBucketPlan,
  LiveMonthAnalysis,
  ManualBucketCalibration,
  MajorTransaction,
  MonthSnapshot,
  WholeBudgetCloseout,
} from "@/components/analytics/types"

export const ANALYTICS_PLAN: "free" | "pro" = "pro"
export const RHYTHM_STEADY_BAND = 0.15

export function buildDailyCumulative(
  length: number,
  total: number,
  progressExponent = 1,
): number[] {
  if (length <= 0) return []

  return Array.from({ length }, (_, index) => {
    if (index === length - 1) return total
    return Math.round(total * Math.pow((index + 1) / length, progressExponent))
  })
}

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
  const withinSteadyBand = (value: number) =>
    Math.abs(value - overallAvg) <= overallAvg * RHYTHM_STEADY_BAND

  if (withinSteadyBand(firstAvg) && withinSteadyBand(secondAvg)) return "steady"
  if (firstAvg > secondAvg * (1 + RHYTHM_STEADY_BAND)) return "frontLoaded"
  if (secondAvg > firstAvg * (1 + RHYTHM_STEADY_BAND)) return "backLoaded"
  return "uneven"
}

function interpolateCumulative(cumulative: number[], fractionalIndex: number): number | null {
  if (cumulative.length === 0 || !Number.isFinite(fractionalIndex)) return null

  const lastIndex = cumulative.length - 1
  const lowerIndex = Math.max(0, Math.min(lastIndex, Math.floor(fractionalIndex)))
  const upperIndex = Math.max(0, Math.min(lastIndex, Math.ceil(fractionalIndex)))
  const fraction = fractionalIndex - Math.floor(fractionalIndex)
  const lowerValue = cumulative[lowerIndex]
  const upperValue = cumulative[upperIndex]

  return lowerValue + (upperValue - lowerValue) * fraction
}

export function deriveBucketPaceFlag(
  bucketId: string,
  month: LiveMonthAnalysis,
  snapshots: MonthSnapshot[],
): boolean {
  const currentPlan = month.fixedBuckets.find(
    (bucket) => bucket.id === bucketId && bucket.type === "manual",
  )
  const currentActual = month.fixedBucketsActual.find((bucket) => bucket.id === bucketId)

  if (
    !currentPlan ||
    currentPlan.budget <= 0 ||
    month.daysInMonth <= 0 ||
    !currentActual?.dailyCumulative?.length
  ) {
    return false
  }

  const pointInMonth = month.status === "closed" ? 1 : month.daysTracked / month.daysInMonth
  if (pointInMonth <= 0) return false

  const spentAtEvaluationPoint = currentActual.dailyCumulative.at(-1)
  if (spentAtEvaluationPoint === undefined) return false

  const thisMonthPace = spentAtEvaluationPoint / currentPlan.budget / pointInMonth
  const priorPaces = snapshots
    .filter((snapshot) => snapshot.isoDate < month.isoDate)
    .toSorted((a, b) => b.isoDate.localeCompare(a.isoDate))
    .flatMap((snapshot) => {
      const plan = snapshot.fixedBuckets.find(
        (bucket) => bucket.id === bucketId && bucket.type === "manual",
      )
      const actual = snapshot.fixedBucketsActual.find((bucket) => bucket.id === bucketId)
      if (
        !plan ||
        plan.budget <= 0 ||
        snapshot.daysInMonth <= 0 ||
        !actual?.dailyCumulative?.length
      ) {
        return []
      }

      const spent = interpolateCumulative(
        actual.dailyCumulative,
        pointInMonth * snapshot.daysInMonth,
      )
      return spent === null ? [] : [spent / plan.budget / pointInMonth]
    })

  if (priorPaces.length === 0) return false

  const reference =
    priorPaces.length < 3
      ? priorPaces[0]
      : priorPaces.reduce((sum, pace) => sum + pace, 0) / priorPaces.length

  return thisMonthPace > reference * (1 + RHYTHM_STEADY_BAND)
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

const LIVE_FIXED_PLAN: FixedBucketPlan[] = [
  ...FIXED_PLAN,
  {
    id: "fb-transport",
    name: "Transport",
    budget: 400,
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

type MonthTruthMetrics = {
  baseVariableBudget: number
  adjustedVariableBudget: number
  effectiveVariableBudget: number
  actualVariableSpent: number
  remainingVariableBudget: number
  budgetUsedPct: number
  majorPctOfBudget: number
  fixedManualOverBudgetCount: number
  monthProgressPct: number
  avgDailySpend: number
  projectedEndSpend: number
  projectedSavings: number
  projectedSavingsRate: number
  rolloverEgp: number
  monthlyState: LiveMonthAnalysis["monthlyState"]
  baseDailyRate: number
  todaysRate: number
}

function countManualOverBudget(
  fixedBuckets: FixedBucketPlan[],
  fixedBucketsActual: FixedBucketActual[],
): number {
  const actualById = new Map(fixedBucketsActual.map((bucket) => [bucket.id, bucket.spent]))

  return fixedBuckets.filter((bucket) => {
    if (bucket.type !== "manual") return false
    return (actualById.get(bucket.id) ?? 0) > bucket.budget
  }).length
}

function sumFixedTotalSpent(fixedBucketsActual: FixedBucketActual[]): number {
  return fixedBucketsActual.reduce((sum, bucket) => sum + bucket.spent, 0)
}

function deriveWholeBudgetCloseout({
  monthlyBudget,
  fixedTotalBudget,
  injectionTotal,
  variableReceivedTotal,
  fixedBuckets,
  fixedBucketsActual,
  totalVariableSpent,
  majorTotal,
}: {
  monthlyBudget: number
  fixedTotalBudget: number
  injectionTotal: number
  variableReceivedTotal: number
  fixedBuckets: FixedBucketPlan[]
  fixedBucketsActual: FixedBucketActual[]
  totalVariableSpent: number
  majorTotal: number
}): WholeBudgetCloseout {
  const actualById = new Map(fixedBucketsActual.map((bucket) => [bucket.id, bucket.spent]))

  const manualBuckets = fixedBuckets.filter((bucket) => bucket.type === "manual")
  const manualFixedUnusedTotal = manualBuckets.reduce(
    (sum, bucket) => sum + Math.max(0, bucket.budget - (actualById.get(bucket.id) ?? 0)),
    0,
  )
  const manualFixedOverspendTotal = manualBuckets.reduce(
    (sum, bucket) => sum + Math.max(0, (actualById.get(bucket.id) ?? 0) - bucket.budget),
    0,
  )
  const fixedOverspendTotal = Math.max(0, sumFixedTotalSpent(fixedBucketsActual) - fixedTotalBudget)
  const fixedSpentTotal = fixedTotalBudget + fixedOverspendTotal
  const netVariableSpent = Math.max(0, totalVariableSpent - variableReceivedTotal)
  const spentTotal = fixedSpentTotal + netVariableSpent + majorTotal
  const adjustedBudgetTotal = monthlyBudget + injectionTotal + manualFixedUnusedTotal
  const remainder = adjustedBudgetTotal - spentTotal
  const verdict = remainder > 0 ? "underBudget" : remainder < 0 ? "overBudget" : "exactBudget"

  return {
    adjustedBudgetTotal,
    spentTotal,
    remainder,
    manualFixedUnusedTotal,
    manualFixedOverspendTotal,
    fixedSpentTotal,
    variableSpentTotal: netVariableSpent,
    majorSpentTotal: majorTotal,
    verdict,
  }
}

function deriveMonthTruthMetrics({
  monthlyBudget,
  fixedTotalBudget,
  totalVariableSpent,
  majorTotal,
  injectionTotal,
  variableReceivedTotal,
  daysTracked,
  daysRemaining,
  daysInMonth,
  fixedBuckets,
  fixedBucketsActual,
}: {
  monthlyBudget: number
  fixedTotalBudget: number
  totalVariableSpent: number
  majorTotal: number
  injectionTotal: number
  variableReceivedTotal: number
  daysTracked: number
  daysRemaining: number
  daysInMonth: number
  fixedBuckets: FixedBucketPlan[]
  fixedBucketsActual: FixedBucketActual[]
}): MonthTruthMetrics {
  const fixedTotalSpent = sumFixedTotalSpent(fixedBucketsActual)
  const fixedOverspend = Math.max(0, fixedTotalSpent - fixedTotalBudget)
  const baseVariableBudget = Math.max(0, monthlyBudget - fixedTotalBudget)
  const adjustedVariableBudget = Math.max(0, baseVariableBudget + injectionTotal)
  const effectiveVariableBudget = Math.max(0, adjustedVariableBudget - fixedOverspend - majorTotal)
  const actualVariableSpent = Math.max(0, totalVariableSpent - variableReceivedTotal)
  const remainingVariableBudget = effectiveVariableBudget - actualVariableSpent
  const budgetUsedPct = Math.round(
    (actualVariableSpent / Math.max(1, effectiveVariableBudget)) * 100,
  )
  const monthProgressPct = Math.round((daysTracked / Math.max(1, daysInMonth)) * 100)
  const isClosedMonth = daysRemaining === 0 || daysTracked >= daysInMonth
  const avgDailySpend = Math.round(actualVariableSpent / Math.max(1, daysTracked))
  const projectedEndSpend = isClosedMonth
    ? actualVariableSpent
    : Math.round(avgDailySpend * daysInMonth)
  const projectedSavings = effectiveVariableBudget - projectedEndSpend
  const projectedSavingsRate = Math.round(
    (projectedSavings / Math.max(1, effectiveVariableBudget)) * 100,
  )
  const rolloverEgp = effectiveVariableBudget - projectedEndSpend
  const baseDailyRate = Math.round(baseVariableBudget / Math.max(1, daysInMonth))
  const todaysRate =
    daysRemaining > 0
      ? Math.round(Math.max(0, remainingVariableBudget) / Math.max(1, daysRemaining))
      : 0
  const monthlyState: LiveMonthAnalysis["monthlyState"] =
    remainingVariableBudget < 0 ? "over" : projectedSavings < 0 ? "atRisk" : "onTrack"

  return {
    baseVariableBudget,
    adjustedVariableBudget,
    effectiveVariableBudget,
    actualVariableSpent,
    remainingVariableBudget,
    budgetUsedPct,
    majorPctOfBudget: Math.round((majorTotal / Math.max(1, monthlyBudget)) * 100),
    fixedManualOverBudgetCount: countManualOverBudget(fixedBuckets, fixedBucketsActual),
    monthProgressPct,
    avgDailySpend,
    projectedEndSpend,
    projectedSavings,
    projectedSavingsRate,
    rolloverEgp,
    monthlyState,
    baseDailyRate,
    todaysRate,
  }
}

function deriveClosedMonthVerdict({
  actualVariableSpent,
  effectiveVariableBudget,
  injectionTotal,
}: {
  actualVariableSpent: number
  effectiveVariableBudget: number
  injectionTotal: number
}): ClosedMonthVerdict {
  if (actualVariableSpent > effectiveVariableBudget) return "outranThePlan"
  if (injectionTotal > 0) return "adjustedInFlight"
  return "withinPlan"
}

function normalizeLiveMonth(month: LiveMonthAnalysis): LiveMonthAnalysis {
  const truth = deriveMonthTruthMetrics({
    monthlyBudget: month.monthlyBudget,
    fixedTotalBudget: month.fixedTotalBudget,
    totalVariableSpent: month.totalVariableSpent,
    majorTotal: month.majorTotal,
    injectionTotal: month.injectionTotal,
    variableReceivedTotal: month.variableReceivedTotal,
    daysTracked: month.daysTracked,
    daysRemaining: month.daysRemaining,
    daysInMonth: month.daysInMonth,
    fixedBuckets: month.fixedBuckets,
    fixedBucketsActual: month.fixedBucketsActual,
  })
  const wholeBudgetCloseout = deriveWholeBudgetCloseout({
    monthlyBudget: month.monthlyBudget,
    fixedTotalBudget: month.fixedTotalBudget,
    injectionTotal: month.injectionTotal,
    variableReceivedTotal: month.variableReceivedTotal,
    fixedBuckets: month.fixedBuckets,
    fixedBucketsActual: month.fixedBucketsActual,
    totalVariableSpent: month.totalVariableSpent,
    majorTotal: month.majorTotal,
  })

  return withManualBucketCalibration({
    ...month,
    closedMonthVerdict:
      month.status === "closed"
        ? deriveClosedMonthVerdict({
            actualVariableSpent: truth.actualVariableSpent,
            effectiveVariableBudget: truth.effectiveVariableBudget,
            injectionTotal: month.injectionTotal,
          })
        : null,
    fixedTotalSpent: sumFixedTotalSpent(month.fixedBucketsActual),
    fixedOverspend: Math.max(
      0,
      sumFixedTotalSpent(month.fixedBucketsActual) - month.fixedTotalBudget,
    ),
    wholeBudgetCloseout,
    monthlyState: truth.monthlyState,
    baseVariableBudget: truth.baseVariableBudget,
    adjustedVariableBudget: truth.adjustedVariableBudget,
    effectiveVariableBudget: truth.effectiveVariableBudget,
    baseDailyRate: truth.baseDailyRate,
    todaysRate: truth.todaysRate,
    variableSavingsRateMtd: truth.projectedSavingsRate,
    rolloverEgp: truth.rolloverEgp,
    pacingDeltaPct: truth.budgetUsedPct - truth.monthProgressPct,
    budgetUsedPct: truth.budgetUsedPct,
    monthProgressPct: truth.monthProgressPct,
    fixedManualOverBudgetCount: truth.fixedManualOverBudgetCount,
    majorPctOfBudget: truth.majorPctOfBudget,
    avgDailySpend: truth.avgDailySpend,
    projectedEndSpend: truth.projectedEndSpend,
    projectedSavings: truth.projectedSavings,
    projectedSavingsRate: truth.projectedSavingsRate,
  })
}

function normalizeSnapshot(snapshot: MonthSnapshot): MonthSnapshot {
  const truth = deriveMonthTruthMetrics({
    monthlyBudget: snapshot.monthlyBudget,
    fixedTotalBudget: snapshot.fixedTotalBudget,
    totalVariableSpent: snapshot.totalVariableSpent,
    majorTotal: snapshot.majorTotal,
    injectionTotal: snapshot.injectionTotal,
    variableReceivedTotal: snapshot.variableReceivedTotal,
    daysTracked: snapshot.daysInMonth,
    daysRemaining: 0,
    daysInMonth: snapshot.daysInMonth,
    fixedBuckets: snapshot.fixedBuckets,
    fixedBucketsActual: snapshot.fixedBucketsActual,
  })
  const wholeBudgetCloseout = deriveWholeBudgetCloseout({
    monthlyBudget: snapshot.monthlyBudget,
    fixedTotalBudget: snapshot.fixedTotalBudget,
    injectionTotal: snapshot.injectionTotal,
    variableReceivedTotal: snapshot.variableReceivedTotal,
    fixedBuckets: snapshot.fixedBuckets,
    fixedBucketsActual: snapshot.fixedBucketsActual,
    totalVariableSpent: snapshot.totalVariableSpent,
    majorTotal: snapshot.majorTotal,
  })

  return withManualBucketCalibration({
    ...snapshot,
    closedMonthVerdict: deriveClosedMonthVerdict({
      actualVariableSpent: truth.actualVariableSpent,
      effectiveVariableBudget: truth.effectiveVariableBudget,
      injectionTotal: snapshot.injectionTotal,
    }),
    fixedTotalSpent: sumFixedTotalSpent(snapshot.fixedBucketsActual),
    fixedOverspend: Math.max(
      0,
      sumFixedTotalSpent(snapshot.fixedBucketsActual) - snapshot.fixedTotalBudget,
    ),
    wholeBudgetCloseout,
    baseVariableBudget: truth.baseVariableBudget,
    adjustedVariableBudget: truth.adjustedVariableBudget,
    effectiveVariableBudgetFinal: truth.effectiveVariableBudget,
    baseDailyRate: truth.baseDailyRate,
    variableSavingsRate: truth.projectedSavingsRate,
    rolloverEgpFinal: truth.rolloverEgp,
    fixedManualOverBudgetCount: truth.fixedManualOverBudgetCount,
    majorPctOfBudget: truth.majorPctOfBudget,
  })
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
    {
      id: "fb-coffee",
      spent: 220,
      transactionCount: 9,
      dailyCumulative: buildDailyCumulative(30, 220, 0.18),
    },
    {
      id: "fb-groceries",
      spent: 500,
      transactionCount: 7,
      dailyCumulative: buildDailyCumulative(30, 500, 0.08),
    },
  ],
  majorTotal: 480,
  majorCount: 1,
  majorTransactions: majorTransactions_2026_04,
  closedMonthVerdict: "withinPlan",
  wholeBudgetCloseout: {
    adjustedBudgetTotal: 6200,
    spentTotal: 6020,
    remainder: 180,
    manualFixedUnusedTotal: 60,
    manualFixedOverspendTotal: 280,
    fixedSpentTotal: 1900,
    variableSpentTotal: 3640,
    majorSpentTotal: 480,
    verdict: "underBudget",
  },
  // No injections, actual stays within the final effective plan.
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 200,
  baseVariableBudget: 4360,
  adjustedVariableBudget: 4560,
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
    {
      id: "fb-coffee",
      spent: 240,
      transactionCount: 8,
      dailyCumulative: buildDailyCumulative(31, 240, 0.18),
    },
    {
      id: "fb-groceries",
      spent: 160,
      transactionCount: 5,
      dailyCumulative: buildDailyCumulative(31, 160, 0.08),
    },
  ],
  majorTotal: 720,
  majorCount: 3,
  majorTransactions: majorTransactions_2026_03,
  closedMonthVerdict: "adjustedInFlight",
  wholeBudgetCloseout: {
    adjustedBudgetTotal: 6280,
    spentTotal: 5660,
    remainder: 620,
    manualFixedUnusedTotal: 80,
    manualFixedOverspendTotal: 0,
    fixedSpentTotal: 1640,
    variableSpentTotal: 3300,
    majorSpentTotal: 720,
    verdict: "underBudget",
  },
  // Injections push the effective plan up; actual still lands under it.
  injectionTotal: 200,
  injectionCount: 1,
  variableReceivedTotal: 0,
  baseVariableBudget: 4360,
  adjustedVariableBudget: 4560,
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
    {
      id: "fb-coffee",
      spent: 200,
      transactionCount: 11,
      dailyCumulative: buildDailyCumulative(28, 200, 0.18),
    },
    {
      id: "fb-groceries",
      spent: 240,
      transactionCount: 6,
      dailyCumulative: buildDailyCumulative(28, 240, 0.08),
    },
  ],
  majorTotal: 0,
  majorCount: 0,
  majorTransactions: [],
  closedMonthVerdict: "outranThePlan",
  wholeBudgetCloseout: {
    adjustedBudgetTotal: 6000,
    spentTotal: 5460,
    remainder: 540,
    manualFixedUnusedTotal: 0,
    manualFixedOverspendTotal: 0,
    fixedSpentTotal: 1640,
    variableSpentTotal: 3820,
    majorSpentTotal: 0,
    verdict: "underBudget",
  },
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 0,
  baseVariableBudget: 4360,
  adjustedVariableBudget: 4360,
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
  {
    id: "fb-coffee",
    spent: 195,
    transactionCount: 8,
    dailyCumulative: buildDailyCumulative(18, 195, 0.9),
  },
  {
    id: "fb-groceries",
    spent: 110,
    transactionCount: 4,
    dailyCumulative: buildDailyCumulative(18, 110, 0.75),
  },
  {
    id: "fb-transport",
    spent: 310,
    transactionCount: 10,
    dailyCumulative: buildDailyCumulative(18, 310, 0.85),
  },
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

  monthlyBudget: 6400,
  fixedTotalBudget: 2040,
  fixedBuckets: LIVE_FIXED_PLAN,

  totalVariableSpent: 1820,
  fixedTotalSpent: 1815,
  fixedOverspend: 0,
  fixedBucketsActual: liveFixedBucketsActual,
  majorTotal: 900,
  majorCount: 3,
  majorTransactions: majorTransactions_2026_05,
  closedMonthVerdict: null,
  wholeBudgetCloseout: {
    adjustedBudgetTotal: 6625,
    spentTotal: 4760,
    remainder: 1865,
    manualFixedUnusedTotal: 225,
    manualFixedOverspendTotal: 0,
    fixedSpentTotal: 2040,
    variableSpentTotal: 1820,
    majorSpentTotal: 900,
    verdict: "underBudget",
  },
  injectionTotal: 0,
  injectionCount: 0,
  variableReceivedTotal: 0,
  baseVariableBudget: 4360,
  adjustedVariableBudget: 4360,

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
      fixed: 310,
      major: 0,
      total: 470,
      fixedByType: { manual: 310, recurring: 0, installment: 0 },
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
      fixed: 310,
      major: 100,
      total: 670,
      fixedByType: { manual: 310, recurring: 0, installment: 0 },
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
  totalVariableSpent: 4480,
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
    190, 412, 645, 888, 1141, 1405, 1680, 1939, 2187, 2430, 2663, 2911, 3165, 3429, 3703, 3973,
    4226, 4480,
  ],
  weeklySpend: [980, 1120, 1240, 1140],
  dayOfWeekSpend: [580, 420, 560, 480, 680, 820, 940],
  largestVariableDay: { date: "2026-05-14", amount: 620 },
  largestVariableTxn: { id: "tx-05-14-a", amount: 540, description: "Emergency repair" },
  fixedManualOverBudgetCount: 2,
  paymentMethods: [
    {
      id: "pm1",
      name: "Cash",
      variable: 420,
      fixed: 310,
      major: 0,
      total: 730,
      fixedByType: { manual: 310, recurring: 0, installment: 0 },
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
      variable: 1480,
      fixed: 200,
      major: 0,
      total: 1680,
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
  const truth = deriveMonthTruthMetrics({
    monthlyBudget: snapshot.monthlyBudget,
    fixedTotalBudget: snapshot.fixedTotalBudget,
    totalVariableSpent: snapshot.totalVariableSpent,
    majorTotal: snapshot.majorTotal,
    injectionTotal: snapshot.injectionTotal,
    variableReceivedTotal: snapshot.variableReceivedTotal,
    daysTracked: snapshot.daysInMonth,
    daysRemaining: 0,
    daysInMonth: snapshot.daysInMonth,
    fixedBuckets: snapshot.fixedBuckets,
    fixedBucketsActual: snapshot.fixedBucketsActual,
  })

  return withManualBucketCalibration({
    month: snapshot.month,
    isoDate: snapshot.isoDate,
    daysTracked: snapshot.daysInMonth,
    daysRemaining: 0,
    daysInMonth: snapshot.daysInMonth,
    status: "closed",
    closedBy: snapshot.closedBy,
    monthlyState: truth.monthlyState,

    monthlyBudget: snapshot.monthlyBudget,
    fixedTotalBudget: snapshot.fixedTotalBudget,
    fixedBuckets: snapshot.fixedBuckets,

    totalVariableSpent: snapshot.totalVariableSpent,
    fixedTotalSpent: sumFixedTotalSpent(snapshot.fixedBucketsActual),
    fixedOverspend: Math.max(
      0,
      sumFixedTotalSpent(snapshot.fixedBucketsActual) - snapshot.fixedTotalBudget,
    ),
    fixedBucketsActual: snapshot.fixedBucketsActual,
    majorTotal: snapshot.majorTotal,
    majorCount: snapshot.majorCount,
    majorTransactions: snapshot.majorTransactions,
    closedMonthVerdict: deriveClosedMonthVerdict({
      actualVariableSpent: truth.actualVariableSpent,
      effectiveVariableBudget: truth.effectiveVariableBudget,
      injectionTotal: snapshot.injectionTotal,
    }),
    wholeBudgetCloseout: deriveWholeBudgetCloseout({
      monthlyBudget: snapshot.monthlyBudget,
      fixedTotalBudget: snapshot.fixedTotalBudget,
      injectionTotal: snapshot.injectionTotal,
      variableReceivedTotal: snapshot.variableReceivedTotal,
      fixedBuckets: snapshot.fixedBuckets,
      fixedBucketsActual: snapshot.fixedBucketsActual,
      totalVariableSpent: snapshot.totalVariableSpent,
      majorTotal: snapshot.majorTotal,
    }),
    injectionTotal: snapshot.injectionTotal,
    injectionCount: snapshot.injectionCount,
    variableReceivedTotal: snapshot.variableReceivedTotal,

    baseVariableBudget: truth.baseVariableBudget,
    adjustedVariableBudget: truth.adjustedVariableBudget,
    effectiveVariableBudget: truth.effectiveVariableBudget,
    baseDailyRate: truth.baseDailyRate,
    todaysRate: 0,
    variableSavingsRateMtd: truth.projectedSavingsRate,
    rolloverEgp: truth.rolloverEgp,
    pacingDeltaPct: truth.budgetUsedPct - 100,
    budgetUsedPct: truth.budgetUsedPct,
    monthProgressPct: 100,
    overspentDaysMtd: snapshot.overspentDays,
    dailyVariableCumulative: snapshot.dailyVariableCumulative,
    weeklySpend: snapshot.weeklySpend,
    weeklyBudgetTarget: snapshot.weeklyBudgetTarget,
    dayOfWeekSpend: snapshot.dayOfWeekSpend,
    largestVariableDay: snapshot.largestVariableDay,
    largestVariableTxn: snapshot.largestVariableTxn,
    fixedManualOverBudgetCount: truth.fixedManualOverBudgetCount,
    majorPctOfBudget: truth.majorPctOfBudget,

    projectionConfidenceDay: snapshot.daysInMonth,
    avgDailySpend: truth.avgDailySpend,
    projectedEndSpend: snapshot.totalVariableSpent,
    projectedSavings: truth.effectiveVariableBudget - snapshot.totalVariableSpent,
    projectedSavingsRate: truth.projectedSavingsRate,

    paymentMethods: snapshot.paymentMethods,
    fixedTransfers: snapshot.fixedTransfers ?? [],
  })
}

export function getMonthView(data: AnalyticsData, monthId: string): LiveMonthAnalysis {
  if (monthId === data.current.month) return normalizeLiveMonth(data.current)
  const snapshot = data.snapshots.find((s) => s.month === monthId)
  return snapshot ? snapshotToView(normalizeSnapshot(snapshot)) : normalizeLiveMonth(data.current)
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
