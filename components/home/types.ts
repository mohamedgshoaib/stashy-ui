import type { IconSvgElement } from "@hugeicons/react"

export type DrawerKind = "add" | "filter" | "help" | "settings" | "fixed" | "history"
export type AddActionKind = "variable" | "budget" | "refund"
export type PaymentUrgency = "today" | "tomorrow" | "soon"

export type DailyRate = {
  remainingAmount: number
  allowanceAmount: number
  spentAmount: number
  tomorrowAmount: number | null
  overByAmount: number | null
}

export type BudgetStrip = {
  fixedTotal: number
  fixedRemaining: number

  variableTotal: number
  variableSpent: number
  variableRemaining: number

  majorSpent: number

  totalRemaining: number
  daysRemaining: number
}

export type MajorExpensesRow = {
  totalAmount: number
  percentOfVariable: number
} | null

export type RunningHotCount = number | null

export type NavItem = {
  value: string
  labelKey: string
  icon: IconSvgElement
}
