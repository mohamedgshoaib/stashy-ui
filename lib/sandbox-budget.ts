import {
  ArrowDownLeft01Icon,
  BankIcon,
  CreditCardIcon,
  PackageReceiveIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

import {
  getAnalyticsDataForScenario,
  getPreviousSnapshot,
} from "@/components/analytics/data";
import type {
  AnalyticsData,
  LiveMonthAnalysis,
  MonthSnapshot,
} from "@/components/analytics/types";
import type { UpcomingPayment } from "@/components/home/home-data";
import type { BudgetStrip, DailyRate, MajorExpensesRow } from "@/components/home/types";
import type { HistoryTransaction } from "@/components/history/types";

export type SandboxBudgetConfig = {
  monthlyBudgetState: "onTrack" | "atRisk" | "over";
  budgetInjection: "with" | "without";
  analyticsHistoryMode: "withHistory" | "firstMonth";
  fixedBudgetOverrun: "none" | "some";
};

type FixedPaymentMeta = {
  nameKey: string;
  date: string;
  urgency: UpcomingPayment["urgency"];
};

const FIXED_PAYMENT_META: Record<string, FixedPaymentMeta> = {
  "fb-rent": { nameKey: "fixedPayments.rent", date: "Mon, 19/May", urgency: "tomorrow" },
  "fb-phone-installment": {
    nameKey: "fixedPayments.internet",
    date: "Tue, 20/May",
    urgency: "soon",
  },
  "fb-spotify": { nameKey: "fixedPayments.spotify", date: "Fri, 23/May", urgency: "soon" },
};

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(Math.abs(amount)))} EGP`;
}

function getMonthDayIso(month: LiveMonthAnalysis, day: number): string {
  return `${month.month}-${String(Math.max(1, Math.min(month.daysInMonth, day))).padStart(2, "0")}`;
}

function getMonthMetrics(month: LiveMonthAnalysis) {
  const variableBudget = Math.max(0, month.monthlyBudget - month.fixedTotalBudget);
  const variableSpentExcludingMajor = month.totalVariableSpent;
  const majorSpent = month.majorTotal;
  const variableSpentIncludingMajor = variableSpentExcludingMajor + majorSpent;
  const fixedRemaining = month.fixedTotalBudget - month.fixedTotalSpent;
  const variableRemaining = month.effectiveVariableBudget - variableSpentIncludingMajor;

  return {
    variableBudget,
    variableSpentExcludingMajor,
    majorSpent,
    variableSpentIncludingMajor,
    fixedRemaining,
    variableRemaining,
    totalRemaining: fixedRemaining + variableRemaining,
  };
}

export function getSandboxAnalyticsData(config: SandboxBudgetConfig): AnalyticsData {
  let data = getAnalyticsDataForScenario(config.monthlyBudgetState);

  if (config.budgetInjection === "with" && data.current.status === "inProgress") {
    data = {
      ...data,
      current: { ...data.current, injectionTotal: 1000, injectionCount: 1 },
    };
  }

  if (config.analyticsHistoryMode === "firstMonth") {
    data = { ...data, snapshots: [] };
  }

  if (config.analyticsHistoryMode === "withHistory" && data.snapshots.length > 0) {
    const [latestSnapshot, ...rest] = data.snapshots;
    data = {
      ...data,
      snapshots: [
        {
          ...latestSnapshot,
          fixedBuckets: latestSnapshot.fixedBuckets
            .filter((bucket) => bucket.id !== "fb-spotify")
            .map((bucket) => {
              if (bucket.id === "fb-coffee") return { ...bucket, budget: 160 };
              if (bucket.id === "fb-groceries") return { ...bucket, budget: 200 };
              return bucket;
            }),
        },
        ...rest,
      ],
    };
  }

  if (config.fixedBudgetOverrun === "some" && data.current.status === "inProgress") {
    data = {
      ...data,
      current: {
        ...data.current,
        fixedBucketsActual: data.current.fixedBucketsActual.map((actual) => {
          if (actual.id === "fb-coffee") return { ...actual, spent: 240 };
          if (actual.id === "fb-groceries") return { ...actual, spent: 320 };
          return actual;
        }),
      },
    };
  }

  return data;
}

export function getHomeBudgetStrip(month: LiveMonthAnalysis): BudgetStrip {
  const metrics = getMonthMetrics(month);

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
  };
}

export function getHomeMajorExpensesRow(
  month: LiveMonthAnalysis,
  majorScenario: "active" | "none",
): MajorExpensesRow {
  if (majorScenario === "none" || month.majorTotal <= 0) return null;

  const { variableBudget } = getMonthMetrics(month);

  return {
    totalAmount: month.majorTotal,
    percentOfVariable: Math.round((month.majorTotal / Math.max(1, variableBudget)) * 100),
  };
}

export function getHomeUpcomingPayments(month: LiveMonthAnalysis): UpcomingPayment[] {
  const actualById = new Map(month.fixedBucketsActual.map((actual) => [actual.id, actual]));

  return month.fixedBuckets
    .map((bucket) => {
      const meta = FIXED_PAYMENT_META[bucket.id];
      if (!meta) return null;

      const spent = actualById.get(bucket.id)?.spent ?? 0;
      const remaining = Math.max(0, bucket.budget - spent);
      const displayAmount = remaining > 0 ? remaining : bucket.budget;

      return {
        id: bucket.id,
        nameKey: meta.nameKey,
        amount: formatCurrency(displayAmount),
        date: meta.date,
        urgency: meta.urgency,
      } satisfies UpcomingPayment;
    })
    .filter((payment): payment is UpcomingPayment => payment !== null);
}

export function getHomeDailyRate(
  month: LiveMonthAnalysis,
  dailyRateState: "underRate" | "overRate",
  t: (key: string) => string,
): DailyRate {
  const metrics = getMonthMetrics(month);
  const allowanceAmount = Math.max(0, month.todaysRate || month.baseDailyRate);

  if (month.monthlyState === "over") {
    const overByAmount = Math.max(0, Math.round(Math.abs(metrics.totalRemaining) * 100) / 100);

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
    };
  }

  const baselineSpent = Math.round(Math.min(allowanceAmount, month.avgDailySpend) * 100) / 100;
  const overspendExtra = Math.max(60, Math.round(allowanceAmount * 0.12 * 100) / 100);
  const spentAmount =
    dailyRateState === "overRate"
      ? Math.round((allowanceAmount + overspendExtra) * 100) / 100
      : baselineSpent;
  const remainingAmount = Math.round((allowanceAmount - spentAmount) * 100) / 100;
  const variableSpentAfterToday = metrics.variableSpentIncludingMajor + spentAmount;
  const tomorrowAmount =
    month.daysRemaining > 1
      ? Math.round(
          ((month.effectiveVariableBudget - variableSpentAfterToday) / (month.daysRemaining - 1)) * 100,
        ) / 100
      : 0;

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
    status:
      dailyRateState === "overRate" ? t("daily.statusOverspent") : t("daily.statusTrack"),
    statusTone: dailyRateState === "overRate" ? "expense" : "fixed",
    overByAmount: null,
  };
}

function getVariableHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const pureVariableTotal = month.totalVariableSpent;
  if (pureVariableTotal <= 0) return [];

  const largestAmount = Math.min(
    pureVariableTotal,
    month.largestVariableTxn?.amount ?? Math.round(pureVariableTotal * 0.4),
  );
  const remainder = Math.max(0, pureVariableTotal - largestAmount);
  const secondAmount = remainder > 0 ? Math.round(remainder * 0.58) : 0;
  const thirdAmount = Math.max(0, remainder - secondAmount);
  const largestDay = month.largestVariableDay ? Number(month.largestVariableDay.date.slice(-2)) : month.daysTracked;

  const rows: HistoryTransaction[] = [
    {
      id: `${month.month}-variable-main`,
      descriptionLabel: month.largestVariableTxn?.description ?? "Daily variable spending",
      note: "Derived from the live month variable pace",
      budgetTypeKey: "variable",
      typeCategory: "variable",
      amountValue: largestAmount,
      amount: formatCurrency(largestAmount),
      date: "",
      dateISO: month.largestVariableDay?.date ?? getMonthDayIso(month, Math.max(1, largestDay)),
      direction: "expense",
      methodIcon: CreditCardIcon,
      methodTone: "card",
    },
  ];

  if (secondAmount > 0) {
    rows.push({
      id: `${month.month}-variable-secondary`,
      descriptionLabel: "Groceries and basics",
      note: "Variable allocation",
      budgetTypeKey: "variable",
      typeCategory: "variable",
      amountValue: secondAmount,
      amount: formatCurrency(secondAmount),
      date: "",
      dateISO: getMonthDayIso(month, Math.max(1, largestDay - 4)),
      direction: "expense",
      methodIcon: Wallet01Icon,
      methodTone: "cash",
    });
  }

  if (thirdAmount > 0) {
    rows.push({
      id: `${month.month}-variable-tertiary`,
      descriptionLabel: "Transport and errands",
      note: "Variable allocation",
      budgetTypeKey: "variable",
      typeCategory: "variable",
      amountValue: thirdAmount,
      amount: formatCurrency(thirdAmount),
      date: "",
      dateISO: getMonthDayIso(month, Math.max(1, largestDay - 9)),
      direction: "expense",
      methodIcon: Wallet01Icon,
      methodTone: "cash",
    });
  }

  return rows;
}

function getFixedHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const actualById = new Map(month.fixedBucketsActual.map((actual) => [actual.id, actual]));

  return month.fixedBuckets.reduce<HistoryTransaction[]>((rows, bucket, index) => {
      const spent = actualById.get(bucket.id)?.spent ?? 0;
      if (spent <= 0) return rows;

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
        methodIcon: bucket.type === "manual" ? Wallet01Icon : CreditCardIcon,
        methodTone: bucket.type === "manual" ? "cash" : "card",
      });

      return rows;
    }, []);
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
    methodIcon: BankIcon,
    methodTone: transaction.paymentMethodName === "Cash" ? "cash" : "bank",
  }));
}

function getReceivedHistoryRows(month: LiveMonthAnalysis): HistoryTransaction[] {
  const rows: HistoryTransaction[] = [];

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
      methodIcon: ArrowDownLeft01Icon,
      methodTone: "bank",
    });
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
      methodIcon: PackageReceiveIcon,
      methodTone: "card",
    });
  }

  return rows;
}

export function getHistoryTransactions(month: LiveMonthAnalysis): HistoryTransaction[] {
  return [
    ...getVariableHistoryRows(month),
    ...getMajorHistoryRows(month),
    ...getFixedHistoryRows(month),
    ...getReceivedHistoryRows(month),
  ].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
}

export function getHistoryPresetRange(
  month: LiveMonthAnalysis,
  preset: "thisMonth" | "thisWeek" | "today" | "custom",
) {
  const today = getMonthDayIso(month, month.daysTracked);

  if (preset === "today") {
    return { from: today, to: today };
  }

  if (preset === "thisWeek") {
    return {
      from: getMonthDayIso(month, Math.max(1, month.daysTracked - 6)),
      to: today,
    };
  }

  if (preset === "thisMonth") {
    return {
      from: getMonthDayIso(month, 1),
      to: getMonthDayIso(month, month.daysInMonth),
    };
  }

  return null;
}

export function getPreviousMonthSnapshot(
  data: AnalyticsData,
  month: LiveMonthAnalysis,
): MonthSnapshot | null {
  return getPreviousSnapshot(data, month.month);
}
