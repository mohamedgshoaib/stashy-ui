"use client"

import { useLocale, useTranslations } from "next-intl"

import {
  formatAnalyticsCurrency,
  formatAnalyticsMonthLabel,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import type { LiveMonthAnalysis, WholeBudgetVerdict } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { semanticProgressClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type HowMonthLandedCardProps = {
  month: LiveMonthAnalysis
}

type BarGeometry = {
  fillPct: number
  planTickPct: number
}

function getBarGeometry(actual: number, plan: number): BarGeometry {
  if (actual <= 0 || plan <= 0) {
    return {
      fillPct: 0,
      planTickPct: 100,
    }
  }

  if (actual <= plan) {
    return {
      fillPct: (actual / plan) * 100,
      planTickPct: 100,
    }
  }

  return {
    fillPct: 100,
    planTickPct: (plan / actual) * 100,
  }
}

function getSummaryTone(verdict: WholeBudgetVerdict) {
  if (verdict === "overBudget") {
    return {
      amountTextClass: semanticTextClass.expense,
      progressClass: semanticProgressClass.expense,
      tickClassName: "bg-expense/70",
      actualValueClass: "text-expense",
    }
  }

  return {
    amountTextClass: semanticTextClass.income,
    progressClass: semanticProgressClass.income,
    tickClassName: "bg-income/70",
    actualValueClass: "text-foreground",
  }
}

function Bar({
  actual,
  plan,
  fillClassName,
  trackClassName,
  tickClassName,
}: {
  actual: number
  plan: number
  fillClassName: string
  trackClassName: string
  tickClassName?: string
}) {
  const geometry = getBarGeometry(actual, plan)

  return (
    <div dir="ltr" className={cn("relative h-full w-full rounded-full", trackClassName)}>
      <div
        className={cn("absolute inset-y-0 start-0 rounded-full", fillClassName)}
        style={{ width: `${Math.min(100, geometry.fillPct)}%` }}
      />
      <div
        className={cn(
          "absolute inset-y-0 w-[1.5px] -translate-x-1/2 rounded-full bg-text-tertiary/70",
          tickClassName,
        )}
        style={{ insetInlineStart: `${Math.min(100, geometry.planTickPct)}%` }}
      />
    </div>
  )
}

export function HowMonthLandedCard({ month }: HowMonthLandedCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")

  const monthShort = formatAnalyticsMonthShort(locale, month.isoDate)
  const monthLong = formatAnalyticsMonthLabel(locale, month.isoDate)

  const wholeBudget = month.wholeBudgetCloseout
  const adjustedBudgetTotal = wholeBudget.adjustedBudgetTotal
  const wholeMonthSpent = wholeBudget.spentTotal
  const verdict = wholeBudget.verdict
  const remainder = wholeBudget.remainder

  const totalDelta = Math.abs(remainder)
  const summaryTone = getSummaryTone(verdict)

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="space-y-1">
          <h2 className="text-[1.0625rem] font-medium text-foreground">
            {t("howMonthLanded.title")}
          </h2>
          <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
            {t("howMonthLanded.subtitleClosed", { month: monthLong })}
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] bg-surface-offset p-4 shadow-ring">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-text-secondary shadow-ring">
                {t("howMonthLanded.verdict.badge", { month: monthShort })}
              </span>
              <p className="text-[1.25rem] font-medium leading-[1.2] text-foreground text-balance">
                {t(`howMonthLanded.verdictWhole.${verdict}`)}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  {t("howMonthLanded.summaryWhole.spentLabel")}
                </p>
                <p
                  dir="ltr"
                  className={cn(
                    "text-sm font-semibold tabular-nums whitespace-nowrap",
                    summaryTone.actualValueClass,
                  )}
                >
                  {formatAnalyticsCurrency(locale, wholeMonthSpent)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  {t("howMonthLanded.summaryWhole.budgetLabel")}
                </p>
                <p dir="ltr" className="text-sm font-semibold tabular-nums whitespace-nowrap text-foreground">
                  {formatAnalyticsCurrency(locale, adjustedBudgetTotal)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div dir="ltr" className="h-2.5 rounded-full bg-card shadow-ring">
                <Bar
                  actual={wholeMonthSpent}
                  plan={adjustedBudgetTotal}
                  fillClassName={summaryTone.progressClass}
                  trackClassName="bg-card"
                  tickClassName={summaryTone.tickClassName}
                />
              </div>

              <div className="flex items-baseline justify-between gap-3 px-0.5">
                <p className="min-w-0 flex-1 truncate text-xs text-text-secondary">
                  {t(`howMonthLanded.summaryWhole.${verdict}`)}
                </p>
                <p
                  dir="ltr"
                  className={cn(
                    "shrink-0 whitespace-nowrap text-[1.375rem] font-semibold leading-none tracking-[-0.03em] tabular-nums",
                    summaryTone.amountTextClass,
                  )}
                >
                  {remainder > 0 ? "+" : remainder < 0 ? "−" : ""}
                  {formatAnalyticsCurrency(locale, totalDelta)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
