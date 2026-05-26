"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import { formatAnalyticsCurrency } from "@/components/analytics/formatters"
import { HowMonthLandedPopup } from "@/components/analytics/how-month-landed-popup"
import type { LiveMonthAnalysis, WholeBudgetVerdict } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type BudgetPathCardProps = {
  month: LiveMonthAnalysis
}

type StepRow = {
  id: string
  label: string
  amount: number
  amountClassName: string
  emphasis: "anchor" | "delta" | "bridge" | "final"
  detail?: string
}

function StepperRow({ row, locale }: { row: StepRow; locale: string }) {
  const sign =
    row.emphasis === "anchor"
      ? ""
      : row.amount > 0
        ? "+"
        : row.amount < 0
          ? "−"
          : ""

  const isDelta = row.emphasis === "delta"
  const isAnchor = row.emphasis === "anchor"
  const isFinal = row.emphasis === "final"

  return (
    <div className={cn("flex items-start justify-between gap-3", isDelta && "ps-3.5")}>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            isDelta ? "text-xs text-text-secondary" : "text-sm text-foreground",
            (isAnchor || isFinal) && "font-medium",
          )}
        >
          {row.label}
        </p>
        {row.detail ? (
          <p className="mt-0.5 text-[11px] leading-[1.4] text-text-tertiary text-pretty">
            {row.detail}
          </p>
        ) : null}
      </div>
      <p
        dir="ltr"
        className={cn(
          "shrink-0 whitespace-nowrap tabular-nums",
          isDelta ? "text-xs font-semibold" : "pt-0.5 text-sm font-semibold",
          isFinal && "pt-0 text-[1.0625rem]",
          row.amountClassName,
        )}
      >
        {sign}
        {formatAnalyticsCurrency(locale, Math.abs(row.amount))}
      </p>
    </div>
  )
}

export function BudgetPathCard({ month }: BudgetPathCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")
  const [popupOpen, setPopupOpen] = React.useState(false)

  if (month.status === "inProgress") {
    return null
  }

  const wholeBudget = month.wholeBudgetCloseout
  const adjustedBudgetTotal = wholeBudget.adjustedBudgetTotal
  const remainder = wholeBudget.remainder
  const verdict = wholeBudget.verdict as WholeBudgetVerdict

  const bucketsWithDelta = month.manualBucketCalibration
    .filter((bucket) => bucket.actual !== bucket.planned)
    .map((bucket) => ({
      ...bucket,
      delta: bucket.actual - bucket.planned,
      absDelta: Math.abs(bucket.actual - bucket.planned),
    }))
    .sort((a, b) => b.absDelta - a.absDelta)

  const hasAdjustedBudget = adjustedBudgetTotal !== month.monthlyBudget

  const variableOutcome =
    month.rolloverEgp > 0
      ? {
          label: t("howMonthLanded.budgetBreakdown.rows.variableLeft"),
          amount: month.rolloverEgp,
          amountClassName: semanticTextClass.income,
        }
      : month.rolloverEgp < 0
        ? {
            label: t("howMonthLanded.budgetBreakdown.rows.variableOver"),
            amount: month.rolloverEgp,
            amountClassName: semanticTextClass.expense,
          }
        : {
            label: t("howMonthLanded.budgetBreakdown.rows.variableExact"),
            amount: 0,
            amountClassName: semanticTextClass.fixed,
          }

  // Group 1: how the budget was formed
  const group1Rows: StepRow[] = [
    {
      id: "base",
      label: t("howMonthLanded.budgetBreakdown.baseLabel"),
      amount: month.monthlyBudget,
      amountClassName: "text-foreground",
      emphasis: "anchor",
    },
    ...(month.injectionTotal > 0
      ? [
          {
            id: "injection",
            label: t("howMonthLanded.budgetBreakdown.rows.injection"),
            amount: month.injectionTotal,
            amountClassName: semanticTextClass.injection,
            emphasis: "delta" as const,
          },
        ]
      : []),
    ...(hasAdjustedBudget
      ? [
          {
            id: "adjusted",
            label: t("howMonthLanded.budgetBreakdown.adjustedLabel"),
            amount: adjustedBudgetTotal,
            amountClassName: "text-foreground",
            emphasis: "anchor" as const,
          },
        ]
      : []),
  ]

  // Group 2: how the month settled
  const group2Rows: StepRow[] = [
    {
      id: "variable-close",
      label: variableOutcome.label,
      amount: variableOutcome.amount,
      amountClassName: variableOutcome.amountClassName,
      emphasis: "bridge",
      detail: t("howMonthLanded.budgetBreakdown.variableHint"),
    },
    ...(wholeBudget.manualFixedUnusedTotal > 0
      ? [
          {
            id: "manual-fixed-returned",
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedReturned"),
            amount: wholeBudget.manualFixedUnusedTotal,
            amountClassName: semanticTextClass.income,
            emphasis: "delta" as const,
          },
        ]
      : []),
    ...(wholeBudget.manualFixedOverspendTotal > 0
      ? [
          {
            id: "manual-fixed-overspend",
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedOverspend"),
            amount: -wholeBudget.manualFixedOverspendTotal,
            amountClassName: semanticTextClass.expense,
            emphasis: "delta" as const,
          },
        ]
      : []),
  ]

  const finalRow: StepRow = {
    id: "final",
    label: t("howMonthLanded.budgetBreakdown.finalLabel"),
    amount: remainder,
    amountClassName:
      remainder > 0
        ? semanticTextClass.income
        : remainder < 0
          ? semanticTextClass.expense
          : "text-foreground",
    emphasis: "final",
  }

  return (
    <>
      <Card size="sm" className="py-4">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="space-y-1">
            <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
              {t("howMonthLanded.budgetBreakdown.eyebrow")}
            </p>
            <h2 className="text-[1.0625rem] font-medium text-foreground">
              {t("howMonthLanded.budgetBreakdown.title")}
            </h2>
            <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("howMonthLanded.budgetBreakdown.subtitle", {
                base: formatAnalyticsCurrency(locale, month.monthlyBudget),
                final: formatAnalyticsCurrency(locale, remainder),
              })}
            </p>
          </div>

          <div className="divide-y divide-border-subtle overflow-hidden rounded-[var(--radius-md)] bg-surface-offset shadow-ring">
            <div className="space-y-3 px-4 py-3.5">
              {group1Rows.map((row) => (
                <StepperRow key={row.id} row={row} locale={locale} />
              ))}
            </div>
            <div className="space-y-3 px-4 py-3.5">
              {group2Rows.map((row) => (
                <StepperRow key={row.id} row={row} locale={locale} />
              ))}
            </div>
            <div className="px-4 py-3.5">
              <StepperRow row={finalRow} locale={locale} />
            </div>
          </div>

          {bucketsWithDelta.length > 0 ? (
            <button
              type="button"
              onClick={() => setPopupOpen(true)}
              className="-m-1 flex min-h-12 w-full rounded-[calc(var(--radius-sm)+4px)] p-1 text-start transition-[transform,opacity] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <div className="flex w-full flex-col gap-3 rounded-[var(--radius-md)] bg-surface-offset px-4 py-3.5 shadow-ring">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("howMonthLanded.manualFixed.title")}
                    </p>
                    <p className="mt-0.5 text-xs leading-[1.45] text-text-secondary text-pretty">
                      {t("howMonthLanded.manualFixed.summaryCount", {
                        count: bucketsWithDelta.length,
                      })}
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-text-tertiary rtl:rotate-180"
                  />
                </div>

                {wholeBudget.manualFixedUnusedTotal > 0 ||
                wholeBudget.manualFixedOverspendTotal > 0 ? (
                  <div className="flex items-center gap-2">
                    {wholeBudget.manualFixedUnusedTotal > 0 ? (
                      <div className="rounded-[var(--radius-sm)] bg-card px-2.5 py-1.5 shadow-ring">
                        <p
                          dir="ltr"
                          className={cn(
                            "text-sm font-semibold tabular-nums whitespace-nowrap",
                            semanticTextClass.income,
                          )}
                        >
                          +{formatAnalyticsCurrency(locale, wholeBudget.manualFixedUnusedTotal)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-secondary">
                          {t("howMonthLanded.manualFixed.returnedLabel")}
                        </p>
                      </div>
                    ) : null}

                    {wholeBudget.manualFixedOverspendTotal > 0 ? (
                      <div className="rounded-[var(--radius-sm)] bg-card px-2.5 py-1.5 shadow-ring">
                        <p
                          dir="ltr"
                          className={cn(
                            "text-sm font-semibold tabular-nums whitespace-nowrap",
                            semanticTextClass.expense,
                          )}
                        >
                          {formatAnalyticsCurrency(locale, wholeBudget.manualFixedOverspendTotal)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-secondary">
                          {t("howMonthLanded.manualFixed.pressureLabel")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </button>
          ) : null}
        </CardContent>
      </Card>

      <HowMonthLandedPopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        monthIsoDate={month.isoDate}
        verdict={verdict}
        wholeMonthSpent={wholeBudget.spentTotal}
        adjustedBudgetTotal={adjustedBudgetTotal}
        rows={bucketsWithDelta}
      />
    </>
  )
}
