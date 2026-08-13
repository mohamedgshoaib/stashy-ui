import { useTranslations } from "next-intl"
import * as React from "react"

import { TrackerProgress } from "@/components/tracker/tracker-progress"
import { Card, CardContent } from "@/components/ui/card"
import { heroSurfaceClass, statTileClass } from "@/lib/design-system-classes"
import { getSandboxAnalyticsData } from "@/lib/sandbox-budget"
import { cn } from "@/lib/utils"
import { useSandboxStore } from "@/store/sandbox-store"

export function TrackerOverview() {
  const t = useTranslations("Tracker")
  const {
    monthlyBudgetState,
    budgetInjection,
    analyticsHistoryMode,
    fixedBudgetOverrun,
    fixedPaceState,
  } = useSandboxStore()
  const analyticsData = React.useMemo(
    () =>
      getSandboxAnalyticsData({
        monthlyBudgetState,
        budgetInjection,
        analyticsHistoryMode,
        fixedBudgetOverrun,
        fixedPaceState,
      }),
    [monthlyBudgetState, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun, fixedPaceState],
  )
  const month = analyticsData.current
  const budgeted = month.fixedTotalBudget
  const paid = month.fixedTotalSpent
  const remaining = month.fixedTotalBudget - month.fixedTotalSpent
  const paidPct = Math.round(budgeted > 0 ? (paid / budgeted) * 100 : 0)

  return (
    <Card size="sm" className="py-4 shadow-soft">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.0625rem] font-semibold text-foreground">{t("overview.title")}</h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] text-brand uppercase shadow-ring",
              "bg-brand-subtle",
            )}
          >
            {paidPct}%
          </span>
        </div>
        <div className={cn("grid grid-cols-3 gap-2 p-3", heroSurfaceClass)}>
          <OverviewStat label={t("overview.budgeted")} value={formatAmount(budgeted)} />
          <OverviewStat label={t("overview.paid")} value={formatAmount(paid)} />
          <OverviewStat label={t("overview.remaining")} value={formatAmount(remaining)} />
        </div>
        <TrackerProgress value={paidPct} tone="fixed" />
      </CardContent>
    </Card>
  )
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", statTileClass)}>
      <span className="truncate text-[0.6875rem] font-semibold tracking-[0.14em] text-text-tertiary uppercase">
        {label}
      </span>
      <span
        dir="ltr"
        className="truncate text-[0.9375rem] font-semibold text-foreground tabular-nums"
      >
        {value}
      </span>
    </div>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}
