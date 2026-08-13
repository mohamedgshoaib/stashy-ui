import { getTrackerFixedIcon } from "@/components/tracker/fixed-icons"
import type { FixedExpenseItem } from "@/components/tracker/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progressClass(pct: number): string {
  // Cap display at 100% for the bar width; over_budget shows full bar + red
  const capped = Math.min(Math.round(pct), 100)
  return `basis-[${capped}%]`
}

function installmentProgressClass(paid: number, total: number): string {
  const pct = Math.round((paid / total) * 100)
  return `basis-[${pct}%]`
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
}

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
}

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
}

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
}

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
}

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
}

// ─── Exported Fixed-owned data ────────────────────────────────────────────────

export const fixedNonManualItems: FixedExpenseItem[] = [
  netflix,
  spotify,
  adobeCC,
  iphoneInstallment,
  laptopInstallment,
  carDownpayment,
]

export const fixedManualPresentationFixtures: Record<
  string,
  Pick<FixedExpenseItem, "transactions">
> = {
  "fb-coffee": {
    transactions: [
      {
        id: "txn-fb-coffee-1",
        amount: 70,
        direction: "expense",
        description: "Morning coffee",
        date: "May 4",
        isAutoPayment: false,
      },
      {
        id: "txn-fb-coffee-2",
        amount: 65,
        direction: "expense",
        description: "Coffee with friends",
        date: "May 10",
        isAutoPayment: false,
      },
      {
        id: "txn-fb-coffee-3",
        amount: 60,
        direction: "expense",
        description: "Afternoon coffee",
        date: "May 16",
        isAutoPayment: false,
      },
    ],
  },
  "fb-groceries": {
    transactions: [
      {
        id: "txn-fb-groceries-1",
        amount: 65,
        direction: "expense",
        description: "Neighborhood market",
        date: "May 6",
        isAutoPayment: false,
      },
      {
        id: "txn-fb-groceries-2",
        amount: 45,
        direction: "expense",
        description: "Fresh produce",
        date: "May 14",
        isAutoPayment: false,
      },
    ],
  },
  "fb-transport": {
    transactions: [
      {
        id: "txn-fb-transport-1",
        amount: 150,
        direction: "expense",
        description: "Fuel refill",
        date: "May 3",
        isAutoPayment: false,
      },
      {
        id: "txn-fb-transport-2",
        amount: 90,
        direction: "expense",
        description: "Ride-share",
        date: "May 9",
        isAutoPayment: false,
      },
      {
        id: "txn-fb-transport-3",
        amount: 70,
        direction: "expense",
        description: "Fuel top-up",
        date: "May 15",
        isAutoPayment: false,
      },
    ],
  },
}
