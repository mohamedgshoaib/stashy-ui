import {
  Analytics01Icon,
  Calendar03Icon,
  Home01Icon,
  Invoice03Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import type {
  BudgetStrip,
  MajorExpensesRow,
  NavItem,
  PaymentUrgency,
} from "@/components/home/types";

export type UpcomingPayment = {
  id: string;
  nameKey: string;
  amount: string;
  date: string;
  urgency: PaymentUrgency;
};

export const upcomingPayments: UpcomingPayment[] = [
  {
    id: "rent",
    nameKey: "fixedPayments.rent",
    amount: "3,000 EGP",
    date: "Sun, 19/Apr",
    urgency: "tomorrow",
  },
  {
    id: "internet",
    nameKey: "fixedPayments.internet",
    amount: "260 EGP",
    date: "Mon, 20/Apr",
    urgency: "soon",
  },
  {
    id: "spotify",
    nameKey: "fixedPayments.spotify",
    amount: "120 EGP",
    date: "Thu, 23/Apr",
    urgency: "soon",
  },
];

export const mockBudgetStrip: BudgetStrip = {
  fixedTotal: 2400,
  fixedPaid: 1160,
  fixedRemaining: 1240,
  variableTotal: 7600,
  variableSpent: 3640,
  variableRemaining: 3960,
  majorSpent: 3000,
  totalRemaining: 5200,
  daysRemaining: 12,
};

export const mockMajorExpensesRow: MajorExpensesRow = {
  totalAmount: 3000,
  percentOfVariable: 38,
};

export const navItems: NavItem[] = [
  { value: "home", labelKey: "nav.home", icon: Home01Icon },
  { value: "tracker", labelKey: "nav.tracker", icon: Invoice03Icon },
  { value: "history", labelKey: "nav.history", icon: Calendar03Icon },
  { value: "analytics", labelKey: "nav.analytics", icon: Analytics01Icon },
  { value: "settings", labelKey: "nav.settings", icon: Settings02Icon },
];
