import type { IconSvgElement } from "@hugeicons/react";

export type HistoryTransactionType =
  | "variable"
  | "monthly"
  | "budget"
  | "major"
  | "transfer";
export type HistoryDirection = "expense" | "received" | "transfer";

export type HistoryTransaction = {
  id: string;
  descriptionKey?: string;
  descriptionLabel?: string;
  note?: string;
  budgetTypeKey?: string;
  budgetTypeLabel?: string;
  fixedTypeKey?: string;
  fixedTypeLabel?: string;
  isAutoPay?: boolean;
  typeCategory: HistoryTransactionType;
  amountValue?: number;
  amount: string;
  date: string;
  dateISO: string;
  direction: HistoryDirection;
  icon: IconSvgElement;
  methodIcon: IconSvgElement;
  methodTone: "cash" | "card" | "bank";
  isTransfer?: boolean;
};

export type HistoryFilterState = {
  type: "all" | "variable" | "monthly" | "budget" | "major";
  direction: "all" | "expense" | "received";
  method: "all" | "cash" | "card" | "bank";
  preset: "thisMonth" | "thisWeek" | "today" | "custom";
  from: string;
  to: string;
};
