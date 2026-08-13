export type FixedBucketType = "manual" | "recurring" | "installment"

export type FixedBucketIconKey = "rent" | "spotify" | "phone-installment" | "coffee" | "groceries"

export type FixedBucketPlan = {
  id: string
  name: string
  budget: number
  type: FixedBucketType
  iconKey: FixedBucketIconKey
}

export type FixedBucketActual = {
  id: string
  spent: number
  transactionCount: number
  dailyCumulative?: number[]
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

export type MajorTransaction = {
  id: string
  amount: number
  description: string
  date: string
  paymentMethodName: string
}

// Plan-vs-actual for a single manual fixed bucket at month close.
export type ManualBucketCalibration = {
  bucketId: string
  name: string
  planned: number
  actual: number
}

export type ClosedMonthVerdict = "withinPlan" | "adjustedInFlight" | "outranThePlan"

export type WholeBudgetVerdict = "underBudget" | "exactBudget" | "overBudget"

export type WholeBudgetCloseout = {
  adjustedBudgetTotal: number
  spentTotal: number
  remainder: number
  manualFixedUnusedTotal: number
  manualFixedOverspendTotal: number
  fixedSpentTotal: number
  variableSpentTotal: number
  majorSpentTotal: number
  verdict: WholeBudgetVerdict
}

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
  majorTransactions: MajorTransaction[]
  manualBucketCalibration: ManualBucketCalibration[]
  closedMonthVerdict: ClosedMonthVerdict
  wholeBudgetCloseout: WholeBudgetCloseout
  injectionTotal: number
  injectionCount: number
  variableReceivedTotal: number

  baseVariableBudget: number
  adjustedVariableBudget: number
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
  majorTransactions: MajorTransaction[]
  manualBucketCalibration: ManualBucketCalibration[]
  closedMonthVerdict: ClosedMonthVerdict | null
  wholeBudgetCloseout: WholeBudgetCloseout
  injectionTotal: number
  injectionCount: number
  variableReceivedTotal: number

  baseVariableBudget: number
  adjustedVariableBudget: number
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
