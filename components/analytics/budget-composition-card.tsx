"use client"

import { useLocale, useTranslations } from "next-intl"

import { formatAnalyticsCurrency } from "@/components/analytics/formatters"
import type { LiveMonthAnalysis } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"

export function BudgetCompositionCard({ month }: { month: LiveMonthAnalysis }) {
  const locale = useLocale()
  const t = useTranslations("Analytics")

  const fixedEgp = month.fixedTotalBudget
  const totalBudget = month.monthlyBudget
  const variableEgp = totalBudget - fixedEgp
  const fixedPct = Math.round((fixedEgp / Math.max(1, totalBudget)) * 100)
  const variablePct = 100 - fixedPct

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="text-[1.0625rem] font-medium text-foreground">
              {t("composition.title")}
            </h2>
            <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("composition.subtitle")}
            </p>
          </div>
          <div className="shrink-0 text-end">
            <p dir="ltr" className="text-[1.125rem] font-semibold tabular-nums text-foreground">
              {formatAnalyticsCurrency(locale, totalBudget)}
            </p>
            <p className="text-xs text-text-tertiary">{t("composition.totalBudgetLabel")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex h-3 w-full overflow-hidden rounded-full shadow-ring">
            <div
              className="bg-fixed"
              style={{ width: `${fixedPct}%` }}
              aria-label={`${t("composition.fixedLabel")} ${fixedPct}%`}
            />
            <div
              className="bg-variable"
              style={{ width: `${variablePct}%` }}
              aria-label={`${t("composition.variableLabel")} ${variablePct}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[var(--radius-sm)] bg-fixed-subtle px-3 py-2.5 shadow-ring">
              <p className="text-xs font-semibold text-fixed">{t("composition.fixedLabel")}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                  {formatAnalyticsCurrency(locale, fixedEgp)}
                </p>
                <p dir="ltr" className="rounded-full bg-card px-2 py-0.5 text-xs tabular-nums text-text-tertiary shadow-ring">
                  {fixedPct}%
                </p>
              </div>
            </div>

            <div className="rounded-[var(--radius-sm)] bg-variable-subtle px-3 py-2.5 shadow-ring">
              <p className="text-xs font-semibold text-variable">{t("composition.variableLabel")}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                  {formatAnalyticsCurrency(locale, variableEgp)}
                </p>
                <p dir="ltr" className="rounded-full bg-card px-2 py-0.5 text-xs tabular-nums text-text-tertiary shadow-ring">
                  {variablePct}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
