export type FixedBucketType = "manual" | "recurring" | "installment"

export type FixedBucketPlan = {
  id: string
  name: string
  budget: number
  type: FixedBucketType
}

export type FixedBucketActual = {
  id: string
  spent: number
  transactionCount: number
}

export type PaymentMethodBreakdown = {
  id: string
  name: string
  variable: number
  fixed: number
  major: number
  total: number
  fixedByType?: {
    manual: number
    recurring: number
    installment: number
  }
}

export type FixedTransferSummary = {
  type: FixedBucketType
  total: number
  sources: Array<{
    bucketId: string
    name: string
    amount: number
    target: {
      type: "variable" | "manual"
      name?: string
    }
  }>
}

export type LargestDay = { date: string; amount: number }
export type LargestTxn = { id: string; amount: number; description: string }

export type MonthSnapshot = {
  month: string
  isoDate: string
  closedAt: string
  closedBy: "user" | "auto"

  monthlyBudget: number
  daysInMonth: number
  fixedTotalBudget: number
  fixedBuckets: FixedBucketPlan[]

  totalVariableSpent: number
  fixedTotalSpent: number
  fixedOverspend: number
  fixedBucketsActual: FixedBucketActual[]
  majorTotal: number
  majorCount: number
  injectionTotal: number
  injectionCount: number
  variableReceivedTotal: number

  effectiveVariableBudgetFinal: number
  baseDailyRate: number
  variableSavingsRate: number
  rolloverEgpFinal: number
  overspentDays: number
  dailyVariableCumulative: number[]
  weeklySpend: number[]
  weeklyBudgetTarget: number
  dayOfWeekSpend: number[]
  largestVariableDay: LargestDay | null
  largestVariableTxn: LargestTxn | null
  fixedManualOverBudgetCount: number
  majorPctOfBudget: number

  paymentMethods: PaymentMethodBreakdown[]
  fixedTransfers?: FixedTransferSummary[]
}

export type LiveMonthAnalysis = {
  month: string
  isoDate: string
  daysTracked: number
  daysRemaining: number
  daysInMonth: number
  status: "inProgress" | "closed"
  closedBy: "user" | "auto" | null
  monthlyState: "onTrack" | "atRisk" | "over"

  monthlyBudget: number
  fixedTotalBudget: number
  fixedBuckets: FixedBucketPlan[]

  totalVariableSpent: number
  fixedTotalSpent: number
  fixedOverspend: number
  fixedBucketsActual: FixedBucketActual[]
  majorTotal: number
  majorCount: number
  injectionTotal: number
  injectionCount: number
  variableReceivedTotal: number

  effectiveVariableBudget: number
  baseDailyRate: number
  todaysRate: number
  variableSavingsRateMtd: number
  rolloverEgp: number
  pacingDeltaPct: number
  budgetUsedPct: number
  monthProgressPct: number
  overspentDaysMtd: number
  dailyVariableCumulative: number[]
  weeklySpend: number[]
  weeklyBudgetTarget: number
  dayOfWeekSpend: number[]
  largestVariableDay: LargestDay | null
  largestVariableTxn: LargestTxn | null
  fixedManualOverBudgetCount: number
  majorPctOfBudget: number

  projectionConfidenceDay: number
  avgDailySpend: number
  projectedEndSpend: number
  projectedSavings: number
  projectedSavingsRate: number

  paymentMethods: PaymentMethodBreakdown[]
  fixedTransfers?: FixedTransferSummary[]
}

export type AnalyticsData = {
  current: LiveMonthAnalysis
  snapshots: MonthSnapshot[]
}

export type ComparisonTone = "positive" | "negative" | "neutral"

export type AnalyticsMonthOption = {
  id: string
  isoDate: string
  status: "inProgress" | "closed"
}
