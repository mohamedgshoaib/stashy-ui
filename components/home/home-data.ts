import {
  Analytics01Icon,
  Calendar03Icon,
  Home01Icon,
  Invoice03Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import type { NavItem, PaymentUrgency } from "@/components/home/types"

export type UpcomingPayment = {
  id: string
  nameKey: string
  amount: string
  date: string
  urgency: PaymentUrgency
}

export const navItems: NavItem[] = [
  { value: "home", labelKey: "nav.home", icon: Home01Icon },
  { value: "tracker", labelKey: "nav.tracker", icon: Invoice03Icon },
  { value: "history", labelKey: "nav.history", icon: Calendar03Icon },
  { value: "analytics", labelKey: "nav.analytics", icon: Analytics01Icon },
  { value: "settings", labelKey: "nav.settings", icon: Settings02Icon },
]
