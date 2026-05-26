import type { IconSvgElement } from "@hugeicons/react";

export type DrawerKind = "add" | "filter" | "help" | "settings" | "fixed" | "history";
export type DailyScenario = "track" | "overspent" | "emergency";
export type AddActionKind = "variable" | "budget" | "refund";
export type PaymentUrgency = "today" | "tomorrow" | "soon";

export type DailyRate = {
  remaining: string;
  remainingAmount: number;
  allowance: string;
  allowanceAmount: number;
  spent: string;
  spentAmount: number;
  explanation: string;
  tomorrow: string | null;
  tomorrowAmount: number | null;
  status: string;
  statusTone: "fixed" | "expense";
  overByAmount: number | null;
};

export type BudgetStrip = {
  fixedTotal: number;
  fixedPaid: number;
  fixedRemaining: number;

  variableTotal: number;
  variableSpent: number;
  variableRemaining: number;

  majorSpent: number;

  totalRemaining: number;
  daysRemaining: number;
};

export type MajorExpensesRow = {
  totalAmount: number;
  percentOfVariable: number;
} | null;

export type NavItem = {
  value: string;
  labelKey: string;
  icon: IconSvgElement;
};
