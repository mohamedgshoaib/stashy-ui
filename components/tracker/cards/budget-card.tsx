import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import { TrackerProgress } from "@/components/tracker/tracker-progress"
import type { FixedExpenseItem, FixedExpenseStatus } from "@/components/tracker/types"
import { surfacePanelClass } from "@/lib/design-system-classes"
import { semanticTextClass } from "@/lib/semantic-styles"
import { cn, getCardTint } from "@/lib/utils"

type BudgetCardProps = {
  item: FixedExpenseItem
  fasterThanUsual: boolean
  onTap: (item: FixedExpenseItem) => void
}

const statusProgressTone = {
  on_track: "income",
  warning: "warning",
  over_budget: "expense",
} as const satisfies Record<FixedExpenseStatus, "income" | "warning" | "expense">

const statusTextClass = {
  on_track: semanticTextClass.income,
  warning: semanticTextClass.warning,
  over_budget: semanticTextClass.expense,
} as const satisfies Record<FixedExpenseStatus, string>

const statusTintTone = {
  on_track: "success",
  warning: "warning",
  over_budget: "danger",
} as const satisfies Record<FixedExpenseStatus, "success" | "warning" | "danger">

export function BudgetCard({ item, fasterThanUsual, onTap }: BudgetCardProps) {
  const t = useTranslations("Tracker.fixed")
  const tAnalyticsFixed = useTranslations("Analytics.fixed")
  const tone = statusProgressTone[item.status]
  const overClass = statusTextClass[item.status]

  const isOver = item.status === "over_budget"
  const overAmount = Math.abs(item.remaining)

  return (
    <button
      type="button"
      className={cn(
        surfacePanelClass,
        "bg-card flex w-full flex-col gap-2.5 px-4 py-3 text-start",
        getCardTint(statusTintTone[item.status]),
      )}
      onClick={() => onTap(item)}
    >
      {/* Top row: name + spent/budget */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-ring-sm",
              semanticTextClass.fixed,
            )}
          >
            <HugeiconsIcon icon={item.icon} size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">{item.name}</p>
              {fasterThanUsual ? (
                <span className="shrink-0 rounded-full bg-surface-offset px-2 py-0.5 text-[0.625rem] font-medium text-text-tertiary shadow-ring">
                  {tAnalyticsFixed("paceTagFaster")}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-text-tertiary">{t("types.manual")}</p>
          </div>
        </div>
        <div className="shrink-0 text-end">
          <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
            {formatAmount(item.paid)}{" "}
            <span className="font-normal text-text-tertiary">/ {formatAmount(item.budget)}</span>
          </p>
          {item.transactions.length > 0 && (
            <p className="mt-0.5 text-xs text-text-tertiary">
              {t("transactionCount", { count: item.transactions.length })}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <TrackerProgress value={item.progressPct} tone={tone} showPercent />

      {/* Remaining / over amount */}
      {item.budget > 0 && (
        <p className={cn("text-[0.6875rem] font-medium", overClass)}>
          {isOver
            ? t("over", { amount: formatAmount(overAmount) })
            : t("remaining", { amount: formatAmount(item.remaining) })}
        </p>
      )}
    </button>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}
