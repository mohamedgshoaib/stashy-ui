import {
  Alert01Icon,
  ArrowDownLeft01Icon,
  BankIcon,
  Building01Icon,
  CafeIcon,
  CreditCardIcon,
  DiscAlbumIcon,
  PackageReceiveIcon,
  SmartPhone01Icon,
  ShoppingBag01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import {
  buildDailyCumulative,
  getAnalyticsDataForScenario,
  getPreviousSnapshot,
  withManualBucketCalibration,
} from "@/components/analytics/data"
import type {
  AnalyticsData,
  FixedBucketActual,
  FixedBucketIconKey,
  FixedBucketPlan,
  LiveMonthAnalysis,
  MonthSnapshot,
} from "@/components/analytics/types"
import type { HistoryTransaction } from "@/components/history/types"
import type { UpcomingPayment } from "@/components/home/home-data"
import type { BudgetStrip, DailyRate, MajorExpensesRow } from "@/components/home/types"
import { getTrackerFixedIcon } from "@/components/tracker/fixed-icons"
import type {
  FixedExpenseIconKey,
  FixedExpenseItem,
  FixedTransaction,
} from "@/components/tracker/types"
import { fixedManualPresentationFixtures, fixedNonManualItems } from "@/data/fixed-tracker-mock"

export type SandboxBudgetConfig = {
  monthlyBudgetState: "onTrack" | "atRisk" | "over"
  budgetInjection: "with" | "without"
  analyticsHistoryMode: "withHistory" | "firstMonth"
  fixedBudgetOverrun: "none" | "some"
  fixedPaceState: "steady" | "faster"
}

type FixedPaymentMeta = {
  nameKey: string
  date: string
  urgency: UpcomingPayment["urgency"]
}

const FIXED_PAYMENT_META: Record<string, FixedPaymentMeta> = {
  "fb-rent": { nameKey: "fixedPayments.rent", date: "Mon, 19/May", urgency: "tomorrow" },
  "fb-phone-installment": {
    nameKey: "fixedPayments.internet",
    date: "Tue, 20/May",
    urgency: "soon",
  },
  "fb-spotify": { nameKey: "fixedPayments.spotify", date: "Fri, 23/May", urgency: "soon" },
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(Math.abs(amount)))} EGP`
}

function getMonthDayIso(month: LiveMonthAnalysis, day: number): string {
  return `${month.month}-${String(Math.max(1, Math.min(month.daysInMonth, day))).padStart(2, "0")}`
}

function getMonthMetrics(month: LiveMonthAnalysis) {
  const variableBudget = Math.max(0, month.monthlyBudget - month.fixedTotalBudget)
  const variableSpentExcludingMajor = month.totalVariableSpent
  const majorSpent = month.majorTotal
  const variableSpentIncludingMajor = variableSpentExcludingMajor + majorSpent
  const fixedRemaining = Math.max(0, month.fixedTotalBudget - month.fixedTotalSpent)
  const variableRemaining = month.effectiveVariableBudget - variableSpentIncludingMajor

  return {
    variableBudget,
    variableSpentExcludingMajor,
    majorSpent,
    variableSpentIncludingMajor,
    fixedRemaining,
    variableRemaining,
    totalRemaining: fixedRemaining + variableRemaining,
  }
}

function withRescaledSpend(actual: FixedBucketActual, spent: number): FixedBucketActual {
  const cumulative = actual.dailyCumulative
  if (!cumulative || cumulative.length === 0 || actual.spent <= 0) return { ...actual, spent }

  const scale = spent / actual.spent
  return {
    ...actual,
    spent,
    dailyCumulative: cumulative.map((value, index) =>
      index === cumulative.length - 1 ? spent : Math.round(value * scale),
    ),
  }
}

function withFixedPaceState(
  data: AnalyticsData,
  fixedPaceState: SandboxBudgetConfig["fixedPaceState"],
): AnalyticsData {
  if (fixedPaceState === "steady") return data

  const snapshotExponentByMonth: Record<string, number> = {
    "2026-04": 0.5,
    "2026-03": 1.3,
    "2026-02": 0.93,
  }

  return {
    ...data,
    current: {
      ...data.current,
      fixedBucketsActual: data.current.fixedBucketsActual.map((actual) =>
        actual.id === "fb-coffee"
          ? {
              ...actual,
              dailyCumulative: buildDailyCumulative(data.current.daysTracked, actual.spent, 0.55),
            }
          : actual,
      ),
    },
    snapshots: data.snapshots.map((snapshot) => ({
      ...snapshot,
      fixedBucketsActual: snapshot.fixedBucketsActual.map((actual) =>
        actual.id === "fb-coffee"
          ? {
              ...actual,
              dailyCumulative: buildDailyCumulative(
                snapshot.daysInMonth,
                actual.spent,
                snapshotExponentByMonth[snapshot.month] ?? 1,
              ),
            }
          : actual,
      ),
    })),
  }
}

export function getSandboxAnalyticsData(config: SandboxBudgetConfig): AnalyticsData {
  let data = getAnalyticsDataForScenario(config.monthlyBudgetState)

  if (config.budgetInjection === "with" && data.current.status === "inProgress") {
    data = {
      ...data,
      current: { ...data.current, injectionTotal: 1000, injectionCount: 1 },
    }
  }

  if (config.analyticsHistoryMode === "firstMonth") {
    data = { ...data, snapshots: [] }
  }

  if (config.analyticsHistoryMode === "withHistory" && data.snapshots.length > 0) {
    const [latestSnapshot, ...rest] = data.snapshots
    data = {
      ...data,
      snapshots: [
        {
          ...latestSnapshot,
          fixedBuckets: latestSnapshot.fixedBuckets
            .filter((bucket) => bucket.id !== "fb-spotify")
            .map((bucket) => {
              if (bucket.id === "fb-coffee") return { ...bucket, budget: 160 }
              if (bucket.id === "fb-groceries") return { ...bucket, budget: 200 }
              return bucket
            }),
        },
        ...rest,
      ],
    }
  }

  data = withFixedPaceState(data, config.fixedPaceState)

  if (config.fixedBudgetOverrun === "some" && data.current.status === "inProgress") {
    data = {
      ...data,
      current: {
        ...data.current,
        fixedBucketsActual: data.current.fixedBucketsActual.map((actual) => {
          if (actual.id === "fb-coffee") return withRescaledSpend(actual, 240)
          if (actual.id === "fb-groceries") return withRescaledSpend(actual, 320)
          if (actual.id === "fb-transport") return withRescaledSpend(actual, 470)
          return actual
        }),
      },
    }
  }

  data = {
    ...data,
    current: withManualBucketCalibration(data.current),
    snapshots: data.snapshots.map((snapshot) => withManualBucketCalibration(snapshot)),
  }

  return data
}

export function getHomeBudgetStrip(month: LiveMonthAnalysis): BudgetStrip {
  const metrics = getMonthMetrics(month)

  return {
    fixedTotal: month.fixedTotalBudget,
    fixedPaid: month.fixedTotalSpent,
    fixedRemaining: metrics.fixedRemaining,
    variableTotal: metrics.variableBudget,
    variableSpent: metrics.variableSpentIncludingMajor,
    variableRemaining: metrics.variableRemaining,
    majorSpent: metrics.majorSpent,
    totalRemaining: metrics.totalRemaining,
    daysRemaining: month.daysRemaining,
  }
}

function getFixedManualIconKey(bucketId: string): FixedExpenseIconKey {
  const iconKeyByBucketId: Record<string, FixedExpenseIconKey> = {
    "fb-coffee": "cafe",
    "fb-groceries": "shopping",
    "fb-transport": "car",
  }

  return iconKeyByBucketId[bucketId] ?? "shopping"
}

function getFixedExpenseStatus(progressPct: number): FixedExpenseItem["status"] {
  if (progressPct > 100) return "over_budget"
  if (progressPct >= 75) return "warning"
  return "on_track"
}

function scaleFixedTransactions(
  transactions: FixedTransaction[],
  spent: number,
): FixedTransaction[] {
  if (spent <= 0 || transactions.length === 0) return []

  const fixtureTotal = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  if (fixtureTotal <= 0) return transactions

  let assigned = 0
  return transactions.map((transaction, index) => {
    const amount =
      index === transactions.length - 1
        ? Math.max(0, spent - assigned)
        : Math.round((transaction.amount / fixtureTotal) * spent)
    assigned += amount

    return { ...transaction, amount }
  })
}

function deriveManualFixedExpenseItem(
  bucket: FixedBucketPlan,
  actual: FixedBucketActual | undefined,
): FixedExpenseItem {
  const paid = actual?.spent ?? 0
  const progressPct = bucket.budget > 0 ? (paid / bucket.budget) * 100 : 0
  const iconKey = getFixedManualIconKey(bucket.id)
  const fixture = fixedManualPresentationFixtures[bucket.id]

  return {
    id: bucket.id,
    name: bucket.name,
    iconKey,
    icon: getTrackerFixedIcon(iconKey),
    type: "manual",
    budget: bucket.budget,
    paid,
    remaining: bucket.budget - paid,
    progressPct,
    progressClass: `basis-[${Math.min(Math.round(progressPct), 100)}%]`,
    status: getFixedExpenseStatus(progressPct),
    paymentStatus: "unpaid",
    nextPaymentDate: null,
    installmentsTotal: null,
    installmentsPaid: null,
    installmentsRemaining: null,
    installmentProgressClass: null,
    endDate: null,
    transactions: scaleFixedTransactions(fixture?.transactions ?? [], paid),
  }
}

export function getFixedExpenseItems(month: LiveMonthAnalysis): FixedExpenseItem[] {
  const actualById = new Map(month.fixedBucketsActual.map((actual) => [actual.id, actual]))
  const manualItems = month.fixedBuckets
    .filter((bucket) => bucket.type === "manual")
    .map((bucket) => deriveManualFixedExpenseItem(bucket, actualById.get(bucket.id)))

  return [...fixedNonManualItems, ...manualItems]
}

export function getHomeMajorExpensesRow(
  month: LiveMonthAnalysis,
  majorScenario: "active" | "none",
): MajorExpensesRow {
  if (majorScenario === "none" || month.majorTotal <= 0) return null

  const { variableBudget } = getMonthMetrics(month)

  return {
    totalAmount: month.majorTotal,
    percentOfVariable: Math.round((month.majorTotal / Math.max(1, variableBudget)) * 100),
  }
}

export function getHomeUpcomingPayments(month: LiveMonthAnalysis): UpcomingPayment[] {
  const actualById = new Map(month.fixedBucketsActual.map((actual) => [actual.id, actual]))

  return month.fixedBuckets
    .map((bucket) => {
      const meta = FIXED_PAYMENT_META[bucket.id]
      if (!meta) return null

      const spent = actualById.get(bucket.id)?.spent ?? 0
      const remaining = Math.max(0, bucket.budget - spent)
      const displayAmount = remaining > 0 ? remaining : bucket.budget

      return {
        id: bucket.id,
        nameKey: meta.nameKey,
        amount: formatCurrency(displayAmount),
        date: meta.date,
        urgency: meta.urgency,
      } satisfies UpcomingPayment
    })
    .filter((payment): payment is UpcomingPayment => payment !== null)
}

export function getHomeDailyRate(
  month: LiveMonthAnalysis,
  dailyRateState: "underRate" | "overRate",
  t: (key: string) => string,
): DailyRate {
  const metrics = getMonthMetrics(month)
  const allowanceAmount = Math.max(0, month.todaysRate || month.baseDailyRate)

  if (month.monthlyState === "over") {
    const overByAmount = Math.max(0, Math.round(Math.abs(metrics.totalRemaining) * 100) / 100)

    return {
      remaining: `-${formatCurrency(overByAmount)}`,
      remainingAmount: -overByAmount,
      allowance: formatCurrency(allowanceAmount),
      allowanceAmount,
      spent: formatCurrency(allowanceAmount + overByAmount),
      spentAmount: allowanceAmount + overByAmount,
      explanation: "",
      tomorrow: null,
      tomorrowAmount: null,
      status: t("daily.statusEmergency"),
      statusTone: "expense",
      overByAmount,
    }
  }

  const baselineSpent = Math.round(Math.min(allowanceAmount, month.avgDailySpend) * 100) / 100
  const overspendExtra = Math.max(60, Math.round(allowanceAmount * 0.12 * 100) / 100)
  const spentAmount =
    dailyRateState === "overRate"
      ? Math.round((allowanceAmount + overspendExtra) * 100) / 100
      : baselineSpent
  const remainingAmount = Math.round((allowanceAmount - spentAmount) * 100) / 100
  const variableSpentAfterToday = metrics.variableSpentIncludingMajor + spentAmount
  const tomorrowAmount =
    month.daysRemaining > 1
      ? Math.round(
          ((month.effectiveVariableBudget - variableSpentAfterToday) / (month.daysRemaining - 1)) *
            100,
        ) / 100
      : 0

  return {
    remaining: `${remainingAmount < 0 ? "-" : ""}${formatCurrency(remainingAmount)}`,
    remainingAmount,
    allowance: formatCurrency(allowanceAmount),
    allowanceAmount,
    spent: formatCurrency(spentAmount),
    spentAmount,
    explanation:
      dailyRateState === "overRate" ? t("daily.explanationOverspent") : t("daily.explanationTrack"),
    tomorrow: formatCurrency(tomorrowAmount),
    tomorrowAmount,
    status: dailyRateState === "overRate" ? t("daily.statusOverspent") : t("daily.statusTrack"),
    statusTone: dailyRateState === "overRate" ? "expense" : "fixed",
    overByAmount: null,
  }
}

type VariableTemplate = {
  id: string
  label: string
  note: string
  dayAbs: number
  pct: number // proportion of `remaining`; last entry uses actual remainder
  method: "card" | "cash" | "bank"
}

const VARIABLE_HISTORY_ICON = Wallet01Icon
const MAJOR_HISTORY_ICON = Alert01Icon

function getFixedBucketIcon(iconKey: FixedBucketIconKey) {
  switch (iconKey) {
    case "rent":
      return Building01Icon
    case "spotify":
      return DiscAlbumIcon
    case "phone-installment":
      return SmartPhone01Icon
    case "coffee":
      return CafeIcon
    case "groceries":
      return ShoppingBag01Icon
  }
}

function getVariableHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const pureVariableTotal = month.totalVariableSpent
  if (pureVariableTotal <= 0) return []

  const largestAmount = Math.min(
    pureVariableTotal,
    month.largestVariableTxn?.amount ?? Math.round(pureVariableTotal * 0.15),
  )
  const largestDateISO =
    month.largestVariableDay?.date ?? getMonthDayIso(month, Math.max(1, month.daysTracked - 9))
  const largestDay = Number(largestDateISO.slice(-2))
  const dt = month.daysTracked

  // Anchor row: the month's single biggest variable transaction
  const anchor: HistoryTransaction = {
    id: `${month.month}-variable-main`,
    descriptionLabel: month.largestVariableTxn?.description ?? "Daily variable spending",
    note: "Largest variable transaction this month",
    budgetTypeKey: "variable",
    typeCategory: "variable",
    amountValue: largestAmount,
    amount: formatCurrency(largestAmount),
    date: "",
    dateISO: largestDateISO,
    direction: "expense",
    icon: VARIABLE_HISTORY_ICON,
    methodIcon: CreditCardIcon,
    methodTone: "card",
  }

  const remaining = Math.max(0, pureVariableTotal - largestAmount)
  if (remaining <= 0) return [anchor]

  // Ten supporting rows spread across 8 distinct day slots.
  // dayAbs values are chosen to deliberately land on the same days as fixed
  // buckets (dt, dt-1, dt-2, dt-4) and known major transactions (ld+3, ld-1)
  // so the day-grouping UI is exercised across many dates.
  //
  // Proportions of `remaining` — first 9 are fixed; last one absorbs rounding.
  const templates: VariableTemplate[] = [
    {
      id: "restaurant",
      label: "Restaurant dinner",
      note: "Variable spending",
      dayAbs: dt,
      pct: 0.17,
      method: "card",
    },
    {
      id: "cafe-snacks",
      label: "Coffee & snacks",
      note: "Variable spending",
      dayAbs: dt - 1,
      pct: 0.04,
      method: "cash",
    },
    {
      id: "supermarket",
      label: "Supermarket run",
      note: "Variable spending",
      dayAbs: dt - 2,
      pct: 0.14,
      method: "card",
    },
    {
      id: "household",
      label: "Household supplies",
      note: "Variable spending",
      dayAbs: dt - 4,
      pct: 0.09,
      method: "cash",
    },
    {
      id: "online",
      label: "Online shopping",
      note: "Variable spending",
      dayAbs: Math.max(1, Math.min(dt, largestDay + 3)),
      pct: 0.11,
      method: "card",
    },
    {
      id: "transport",
      label: "Transport & Uber",
      note: "Variable spending",
      dayAbs: largestDay, // same day as anchor → triggers day group
      pct: 0.06,
      method: "cash",
    },
    {
      id: "pharmacy",
      label: "Pharmacy",
      note: "Variable spending",
      dayAbs: Math.max(1, largestDay - 1),
      pct: 0.07,
      method: "cash",
    },
    {
      id: "groceries",
      label: "Groceries and basics",
      note: "Variable spending",
      dayAbs: Math.max(1, largestDay - 3),
      pct: 0.13,
      method: "cash",
    },
    {
      id: "cafe-meeting",
      label: "Café & meeting",
      note: "Variable spending",
      dayAbs: Math.max(1, largestDay - 6),
      pct: 0.04,
      method: "cash",
    },
    {
      id: "errands",
      label: "Errands & services",
      note: "Variable spending — remainder",
      dayAbs: Math.max(1, largestDay - 6), // same day as café → triggers day group
      pct: 0, // remainder
      method: "cash",
    },
  ]

  const fixedPctTotal = templates.reduce((sum, t) => sum + t.pct, 0)
  let allocated = 0
  const rows: HistoryTransaction[] = [anchor]

  templates.forEach((t, i) => {
    const isLast = i === templates.length - 1
    const amount = isLast ? Math.max(0, remaining - allocated) : Math.round(remaining * t.pct)

    if (amount <= 0) return

    if (!isLast) allocated += amount

    rows.push({
      id: `${month.month}-variable-${t.id}`,
      descriptionLabel: t.label,
      note: t.note,
      budgetTypeKey: "variable",
      typeCategory: "variable",
      amountValue: amount,
      amount: formatCurrency(amount),
      date: "",
      dateISO: getMonthDayIso(month, t.dayAbs),
      direction: "expense",
      icon: VARIABLE_HISTORY_ICON,
      methodIcon:
        t.method === "cash" ? Wallet01Icon : t.method === "bank" ? BankIcon : CreditCardIcon,
      methodTone: t.method,
    })
  })

  // Suppress the fixedPctTotal reference so TS does not complain about unused
  void fixedPctTotal

  return rows
}

function getFixedHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const actualById = new Map(month.fixedBucketsActual.map((actual) => [actual.id, actual]))

  return month.fixedBuckets.reduce<HistoryTransaction[]>((rows, bucket, index) => {
    const spent = actualById.get(bucket.id)?.spent ?? 0
    if (spent <= 0) return rows

    rows.push({
      id: `${month.month}-${bucket.id}`,
      descriptionLabel: bucket.name,
      note: bucket.type === "manual" ? "Manual fixed bucket" : "Planned fixed payment",
      budgetTypeKey: "fixed",
      fixedTypeLabel: bucket.name,
      isAutoPay: bucket.type !== "manual",
      typeCategory: bucket.type === "manual" ? "budget" : "monthly",
      amountValue: spent,
      amount: `-${formatCurrency(spent)}`,
      date: "",
      dateISO: getMonthDayIso(month, Math.max(1, month.daysTracked - index)),
      direction: "expense",
      icon: getFixedBucketIcon(bucket.iconKey),
      methodIcon: bucket.type === "manual" ? Wallet01Icon : CreditCardIcon,
      methodTone: bucket.type === "manual" ? "cash" : "card",
    })

    return rows
  }, [])
}

function getMajorHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  return month.majorTransactions.map((transaction, index) => ({
    id: transaction.id,
    descriptionLabel: transaction.description,
    note: "Flagged as major",
    budgetTypeKey: "major",
    typeCategory: "major",
    amountValue: transaction.amount,
    amount: formatCurrency(transaction.amount),
    date: "",
    dateISO: transaction.date || getMonthDayIso(month, Math.max(1, month.daysTracked - index)),
    direction: "expense",
    icon: MAJOR_HISTORY_ICON,
    methodIcon: BankIcon,
    methodTone: transaction.paymentMethodName === "Cash" ? "cash" : "bank",
  }))
}

function getReceivedHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const rows: HistoryTransaction[] = []

  if (month.injectionTotal > 0) {
    rows.push({
      id: `${month.month}-injection`,
      descriptionLabel: "Budget injection",
      note: "Added back into this month",
      budgetTypeKey: "injection",
      typeCategory: "budget",
      amountValue: month.injectionTotal,
      amount: formatCurrency(month.injectionTotal),
      date: "",
      dateISO: getMonthDayIso(month, Math.max(1, month.daysTracked - 2)),
      direction: "received",
      icon: ArrowDownLeft01Icon,
      methodIcon: ArrowDownLeft01Icon,
      methodTone: "bank",
    })
  }

  if (month.variableReceivedTotal > 0) {
    rows.push({
      id: `${month.month}-received-variable`,
      descriptionLabel: "Refund / received",
      note: "Counts as variable recovery",
      budgetTypeKey: "received",
      typeCategory: "variable",
      amountValue: month.variableReceivedTotal,
      amount: formatCurrency(month.variableReceivedTotal),
      date: "",
      dateISO: getMonthDayIso(month, Math.max(1, month.daysTracked - 5)),
      direction: "received",
      icon: PackageReceiveIcon,
      methodIcon: PackageReceiveIcon,
      methodTone: "card",
    })
  }

  return rows
}

export function getHistoryTransactions(month: LiveMonthAnalysis): HistoryTransaction[] {
  return [
    ...getVariableHistoryRows(month),
    ...getMajorHistoryRows(month),
    ...getFixedHistoryRows(month),
    ...getReceivedHistoryRows(month),
  ].sort((a, b) => b.dateISO.localeCompare(a.dateISO))
}

export function getHistoryPresetRange(
  month: LiveMonthAnalysis,
  preset: "thisMonth" | "thisWeek" | "today" | "custom",
) {
  const today = getMonthDayIso(month, month.daysTracked)

  if (preset === "today") {
    return { from: today, to: today }
  }

  if (preset === "thisWeek") {
    return {
      from: getMonthDayIso(month, Math.max(1, month.daysTracked - 6)),
      to: today,
    }
  }

  if (preset === "thisMonth") {
    return {
      from: getMonthDayIso(month, 1),
      to: getMonthDayIso(month, month.daysInMonth),
    }
  }

  return null
}

export function getPreviousMonthSnapshot(
  data: AnalyticsData,
  month: LiveMonthAnalysis,
): MonthSnapshot | null {
  return getPreviousSnapshot(data, month.month)
}
