import type {
  FixedExpenseItem,
  FixedTrackerSummary,
  InstallmentOverview,
} from "@/components/tracker/types";
import { getTrackerFixedIcon } from "@/components/tracker/fixed-icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progressClass(pct: number): string {
  // Cap display at 100% for the bar width; over_budget shows full bar + red
  const capped = Math.min(Math.round(pct), 100);
  return `basis-[${capped}%]`;
}

function installmentProgressClass(paid: number, total: number): string {
  const pct = Math.round((paid / total) * 100);
  return `basis-[${pct}%]`;
}

// ─── Subscriptions (recurring) ────────────────────────────────────────────────

const netflix: FixedExpenseItem = {
  id: "sub-netflix",
  name: "Netflix",
  iconKey: "media",
  icon: getTrackerFixedIcon("media"),
  type: "recurring",
  budget: 250,
  paid: 250,
  remaining: 0,
  progressPct: 100,
  progressClass: progressClass(100),
  status: "on_track",
  paymentStatus: "paid",
  nextPaymentDate: null,
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [
    {
      id: "txn-netflix-1",
      amount: 250,
      direction: "expense",
      description: "Netflix monthly subscription",
      date: "May 3",
      isAutoPayment: true,
    },
  ],
};

const spotify: FixedExpenseItem = {
  id: "sub-spotify",
  name: "Spotify",
  iconKey: "media",
  icon: getTrackerFixedIcon("media"),
  type: "recurring",
  budget: 100,
  paid: 0,
  remaining: 100,
  progressPct: 0,
  progressClass: progressClass(0),
  status: "on_track",
  paymentStatus: "unpaid",
  nextPaymentDate: "May 15",
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [],
};

const adobeCC: FixedExpenseItem = {
  id: "sub-adobe-cc",
  name: "Adobe Creative Cloud",
  iconKey: "design",
  icon: getTrackerFixedIcon("design"),
  type: "recurring",
  budget: 899,
  paid: 0,
  remaining: 899,
  progressPct: 0,
  progressClass: progressClass(0),
  status: "on_track",
  paymentStatus: "unpaid",
  nextPaymentDate: "May 28",
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [],
};

// ─── Installments ─────────────────────────────────────────────────────────────

const iphoneInstallment: FixedExpenseItem = {
  id: "inst-iphone",
  name: "iPhone",
  iconKey: "phone",
  icon: getTrackerFixedIcon("phone"),
  type: "installment",
  budget: 1200,
  paid: 1200,
  remaining: 0,
  progressPct: 100,
  progressClass: progressClass(100),
  status: "on_track",
  paymentStatus: "paid",
  nextPaymentDate: null,
  installmentsTotal: 12,
  installmentsPaid: 4,
  installmentsRemaining: 8,
  installmentProgressClass: installmentProgressClass(4, 12),
  endDate: "Jan 2026",
  transactions: [
    {
      id: "txn-iphone-1",
      amount: 1200,
      direction: "expense",
      description: "iPhone installment – month 4",
      date: "May 1",
      isAutoPayment: true,
    },
  ],
};

const laptopInstallment: FixedExpenseItem = {
  id: "inst-laptop",
  name: "Laptop",
  iconKey: "phone",
  icon: getTrackerFixedIcon("phone"),
  type: "installment",
  budget: 800,
  paid: 0,
  remaining: 800,
  progressPct: 0,
  progressClass: progressClass(0),
  status: "on_track",
  paymentStatus: "unpaid",
  nextPaymentDate: "May 20",
  installmentsTotal: 12,
  installmentsPaid: 11,
  installmentsRemaining: 1,
  installmentProgressClass: installmentProgressClass(11, 12),
  endDate: "May 2026",
  transactions: [
    {
      id: "txn-laptop-1",
      amount: 800,
      direction: "expense",
      description: "Laptop installment – month 11",
      date: "Apr 20",
      isAutoPayment: true,
    },
  ],
};

const carDownpayment: FixedExpenseItem = {
  id: "inst-car",
  name: "Car downpayment plan",
  iconKey: "car",
  icon: getTrackerFixedIcon("car"),
  type: "installment",
  budget: 3500,
  paid: 3500,
  remaining: 0,
  progressPct: 100,
  progressClass: progressClass(100),
  status: "on_track",
  paymentStatus: "paid",
  nextPaymentDate: null,
  installmentsTotal: 6,
  installmentsPaid: 1,
  installmentsRemaining: 5,
  installmentProgressClass: installmentProgressClass(1, 6),
  endDate: "Oct 2026",
  transactions: [
    {
      id: "txn-car-1",
      amount: 3500,
      direction: "expense",
      description: "Car downpayment – month 1",
      date: "May 2",
      isAutoPayment: true,
    },
  ],
};

// ─── Manual budgets ───────────────────────────────────────────────────────────

const groceries: FixedExpenseItem = {
  id: "bud-groceries",
  name: "Groceries",
  iconKey: "shopping",
  icon: getTrackerFixedIcon("shopping"),
  type: "manual",
  budget: 2000,
  paid: 1650,
  remaining: 350,
  progressPct: 82.5,
  progressClass: progressClass(82.5),
  status: "warning",
  paymentStatus: "unpaid", // not relevant for manual
  nextPaymentDate: null,
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [
    {
      id: "txn-groc-1",
      amount: 800,
      direction: "expense",
      description: "Supermarket",
      date: "May 1",
      isAutoPayment: false,
    },
    {
      id: "txn-groc-2",
      amount: 450,
      direction: "expense",
      description: "Hypermarket",
      date: "May 5",
      isAutoPayment: false,
    },
    {
      id: "txn-groc-3",
      amount: 400,
      direction: "expense",
      description: "Farmers market",
      date: "May 8",
      isAutoPayment: false,
    },
  ],
};

const coffee: FixedExpenseItem = {
  id: "bud-coffee",
  name: "Coffee & Cafes",
  iconKey: "cafe",
  icon: getTrackerFixedIcon("cafe"),
  type: "manual",
  budget: 500,
  paid: 620,
  remaining: -120,
  progressPct: 124,
  progressClass: progressClass(124), // capped to basis-[100%]
  status: "over_budget",
  paymentStatus: "unpaid",
  nextPaymentDate: null,
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [
    {
      id: "txn-coffee-1",
      amount: 180,
      direction: "expense",
      description: "Cilantro",
      date: "May 2",
      isAutoPayment: false,
    },
    {
      id: "txn-coffee-2",
      amount: 220,
      direction: "expense",
      description: "Costa",
      date: "May 4",
      isAutoPayment: false,
    },
    {
      id: "txn-coffee-3",
      amount: 120,
      direction: "expense",
      description: "Espresso bar",
      date: "May 7",
      isAutoPayment: false,
    },
    {
      id: "txn-coffee-4",
      amount: 100,
      direction: "expense",
      description: "Café run",
      date: "May 9",
      isAutoPayment: false,
    },
  ],
};

const gas: FixedExpenseItem = {
  id: "bud-gas",
  name: "Gas & Transport",
  iconKey: "car",
  icon: getTrackerFixedIcon("car"),
  type: "manual",
  budget: 800,
  paid: 320,
  remaining: 480,
  progressPct: 40,
  progressClass: progressClass(40),
  status: "on_track",
  paymentStatus: "unpaid",
  nextPaymentDate: null,
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [
    {
      id: "txn-gas-1",
      amount: 200,
      direction: "expense",
      description: "Fuel refill",
      date: "May 3",
      isAutoPayment: false,
    },
    {
      id: "txn-gas-2",
      amount: 120,
      direction: "expense",
      description: "Ride-share",
      date: "May 6",
      isAutoPayment: false,
    },
  ],
};

const eatingOut: FixedExpenseItem = {
  id: "bud-eating-out",
  name: "Eating Out",
  iconKey: "dining",
  icon: getTrackerFixedIcon("dining"),
  type: "manual",
  budget: 1000,
  paid: 0,
  remaining: 1000,
  progressPct: 0,
  progressClass: progressClass(0),
  status: "on_track",
  paymentStatus: "unpaid",
  nextPaymentDate: null,
  installmentsTotal: null,
  installmentsPaid: null,
  installmentsRemaining: null,
  installmentProgressClass: null,
  endDate: null,
  transactions: [],
};

// ─── Exported item list ───────────────────────────────────────────────────────

export const fixedItems: FixedExpenseItem[] = [
  netflix,
  spotify,
  adobeCC,
  iphoneInstallment,
  laptopInstallment,
  carDownpayment,
  groceries,
  coffee,
  gas,
  eatingOut,
];

// ─── Derived summary ──────────────────────────────────────────────────────────

function computeOverallStatus(
  paid: number,
  budgeted: number,
): "on_track" | "warning" | "over_budget" {
  if (budgeted === 0) return "on_track";
  const pct = (paid / budgeted) * 100;
  if (pct > 100) return "over_budget";
  if (pct >= 75) return "warning";
  return "on_track";
}

const totalBudgeted = fixedItems.reduce((sum, item) => sum + item.budget, 0);
const totalPaid = fixedItems.reduce((sum, item) => sum + item.paid, 0);
const totalRemaining = totalBudgeted - totalPaid;
const summaryPct = totalBudgeted > 0 ? (totalPaid / totalBudgeted) * 100 : 0;

// Items whose individual envelope is over — shown in the summary card callout
const overBudgetItems = fixedItems
  .filter((item) => item.type === "manual" && item.status === "over_budget")
  .map((item) => ({ name: item.name, overageAmount: Math.abs(item.remaining) }));

// With current data: totalPaid ≈ 7,540 / 11,049 ≈ 68% → on_track overall
// Coffee is over its envelope (120 EGP) → shown in callout, not escalated to summary
export const mockSummary: FixedTrackerSummary = {
  totalBudgeted,
  totalPaid,
  totalRemaining,
  paidProgressClass: progressClass(summaryPct),
  overallStatus: computeOverallStatus(totalPaid, totalBudgeted),
  overBudgetItems,
};

// ─── Installment overview ─────────────────────────────────────────────────────

const installmentItems = fixedItems.filter((item) => item.type === "installment");

export const mockInstallmentOverview: InstallmentOverview = {
  monthlyObligation: installmentItems.reduce((sum, item) => sum + item.budget, 0),
  totalPaidAllTime: installmentItems.reduce(
    (sum, item) => sum + (item.installmentsPaid ?? 0) * item.budget,
    0,
  ),
  totalRemainingAllTime: installmentItems.reduce(
    (sum, item) => sum + (item.installmentsRemaining ?? 0) * item.budget,
    0,
  ),
};
