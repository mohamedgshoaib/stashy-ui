"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import {
  formatAnalyticsCurrency,
  formatAnalyticsMonthLabel,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import { HowMonthLandedPopup } from "@/components/analytics/how-month-landed-popup"
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

type StepRow = {
  id: string
  label: string
  amount: number
  markerClassName: string
  amountClassName: string
  variant: "snapshot" | "delta" | "result" | "anchor"
  emphasis?: "anchor" | "bridge" | "final"
  detail?: string
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
  if (verdict === "underBudget") {
    return {
      amountTextClass: semanticTextClass.income,
      progressClass: semanticProgressClass.income,
      tickClassName: "bg-income/70",
      actualValueClass: "text-foreground",
    }
  }

  if (verdict === "overBudget") {
    return {
      amountTextClass: semanticTextClass.expense,
      progressClass: semanticProgressClass.expense,
      tickClassName: "bg-expense/70",
      actualValueClass: "text-expense",
    }
  }

  return {
    amountTextClass: semanticTextClass.fixed,
    progressClass: semanticProgressClass.fixed,
    tickClassName: "bg-fixed/65",
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

function StepperRow({ row, locale }: { row: StepRow; locale: string }) {
  const amountPrefix =
    row.variant === "snapshot" || row.variant === "anchor"
      ? ""
      : row.amount > 0
        ? "+"
        : row.amount < 0
          ? "−"
          : ""

  const isAnchor = row.emphasis === "anchor"
  const isResult = row.emphasis === "bridge" || row.emphasis === "final"

  return (
    <div
      className={cn(
        "relative flex items-start justify-between gap-3 rounded-[var(--radius-sm)] ps-6 pe-3 py-2.5",
        isAnchor && "bg-card shadow-ring",
        isResult && "bg-card shadow-ring",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute start-[0.3125rem] rounded-full",
          isAnchor ? "top-3 size-3 shadow-ring" : "top-3.5 size-2.5",
          row.markerClassName,
        )}
      />

      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm text-foreground",
              isAnchor || isResult ? "font-medium" : "font-normal",
            )}
          >
            {row.label}
          </p>
          {row.detail ? (
            <p className="mt-1 text-[11px] leading-[1.45] text-text-secondary text-pretty">
              {row.detail}
            </p>
          ) : null}
        </div>
        <p
          dir="ltr"
          className={cn("shrink-0 whitespace-nowrap pt-0.5 text-sm font-semibold tabular-nums", row.amountClassName)}
        >
          {amountPrefix}
          {formatAnalyticsCurrency(locale, Math.abs(row.amount))}
        </p>
      </div>
    </div>
  )
}

export function HowMonthLandedCard({ month }: HowMonthLandedCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")
  const [popupOpen, setPopupOpen] = React.useState(false)

  const monthShort = formatAnalyticsMonthShort(locale, month.isoDate)
  const monthLong = formatAnalyticsMonthLabel(locale, month.isoDate)

  if (month.status === "inProgress") {
    return (
      <Card size="sm" className="py-4">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="space-y-1">
            <h2 className="text-[1.0625rem] font-medium text-foreground">
              {t("howMonthLanded.title")}
            </h2>
            <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("howMonthLanded.subtitle")}
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] bg-surface-offset p-4 shadow-ring">
            <div className="space-y-3.5">
              <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-text-secondary shadow-ring">
                {t("howMonthLanded.teaser.badge", { month: monthShort })}
              </span>
              <div className="space-y-2">
                <p className="max-w-[18ch] text-[1.125rem] font-medium leading-[1.25] text-foreground text-balance">
                  {t("howMonthLanded.teaser.title")}
                </p>
                <p className="max-w-[30ch] text-sm leading-[1.6] text-text-secondary text-pretty">
                  {t("howMonthLanded.teaser.body", { month: monthLong })}
                </p>
              </div>
              <div className="h-px w-16 bg-border-subtle" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const wholeBudget = month.wholeBudgetCloseout
  const adjustedBudgetTotal = wholeBudget.adjustedBudgetTotal
  const wholeMonthSpent = wholeBudget.spentTotal
  const verdict = wholeBudget.verdict
  const remainder = wholeBudget.remainder

  const totalDelta = Math.abs(remainder)
  const summaryTone = getSummaryTone(verdict)
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
  const budgetSupportRows: StepRow[] = [
    ...(month.injectionTotal > 0
      ? [
          {
            id: "injection",
            label: t("howMonthLanded.budgetBreakdown.rows.injection"),
            amount: month.injectionTotal,
            markerClassName: "bg-injection",
            amountClassName: semanticTextClass.injection,
            variant: "delta" as const,
          },
        ]
      : []),
    ...(month.variableReceivedTotal > 0
      ? [
          {
            id: "received",
            label: t("howMonthLanded.budgetBreakdown.rows.received"),
            amount: month.variableReceivedTotal,
            markerClassName: "bg-income",
            amountClassName: semanticTextClass.income,
            variant: "delta" as const,
          },
        ]
      : []),
  ]
  const manualSettlementRows: StepRow[] = [
    ...(wholeBudget.manualFixedUnusedTotal > 0
      ? [
          {
            id: "manual-fixed-returned",
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedReturned"),
            amount: wholeBudget.manualFixedUnusedTotal,
            markerClassName: "bg-fixed",
            amountClassName: semanticTextClass.income,
            variant: "delta" as const,
          },
        ]
      : []),
    ...(wholeBudget.manualFixedOverspendTotal > 0
      ? [
          {
            id: "manual-fixed-overspend",
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedOverspend"),
            amount: -wholeBudget.manualFixedOverspendTotal,
            markerClassName: "bg-fixed",
            amountClassName: semanticTextClass.expense,
            variant: "delta" as const,
          },
        ]
      : []),
  ]
  const stepRows: StepRow[] = [
    {
      id: "base",
      label: t("howMonthLanded.budgetBreakdown.baseLabel"),
      amount: month.monthlyBudget,
      markerClassName: "bg-text-tertiary/75",
      amountClassName: "text-foreground",
      variant: "anchor",
      emphasis: "anchor",
    },
    ...budgetSupportRows,
    ...(hasAdjustedBudget
      ? [
          {
            id: "adjusted",
            label: t("howMonthLanded.budgetBreakdown.adjustedLabel"),
            amount: adjustedBudgetTotal,
            markerClassName: "bg-brand/80",
            amountClassName: "text-foreground",
            variant: "anchor" as const,
            emphasis: "anchor" as const,
          },
        ]
      : []),
    {
      id: "variable-close",
      label: variableOutcome.label,
      amount: variableOutcome.amount,
      markerClassName: "bg-variable",
      amountClassName: variableOutcome.amountClassName,
      variant: "result",
      emphasis: "bridge",
      detail: t("howMonthLanded.budgetBreakdown.variableHint"),
    },
    ...manualSettlementRows,
    {
      id: "final",
      label: t("howMonthLanded.budgetBreakdown.finalLabel"),
      amount: remainder,
      markerClassName: remainder > 0 ? "bg-income" : remainder < 0 ? "bg-expense" : "bg-fixed",
      amountClassName:
        remainder > 0
          ? semanticTextClass.income
          : remainder < 0
            ? semanticTextClass.expense
            : "text-foreground",
      variant: "result",
      emphasis: "final",
    },
  ]

  return (
    <>
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
                    className={cn("text-sm font-semibold tabular-nums whitespace-nowrap", summaryTone.actualValueClass)}
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

          <div className="space-y-2">
            <div className="space-y-1 px-0.5">
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                {t("howMonthLanded.budgetBreakdown.eyebrow")}
              </p>
              <p className="text-sm font-medium text-foreground">
                {t("howMonthLanded.budgetBreakdown.title")}
              </p>
              <p className="text-xs leading-[1.5] text-text-secondary text-pretty">
                {t("howMonthLanded.budgetBreakdown.subtitle", {
                  base: formatAnalyticsCurrency(locale, month.monthlyBudget),
                  final: formatAnalyticsCurrency(locale, remainder),
                })}
              </p>
            </div>

            <div className="rounded-[var(--radius-md)] bg-surface-offset p-3.5 shadow-ring">
              <div className="relative space-y-2">
                <div
                  aria-hidden="true"
                  className="absolute bottom-3 start-[0.6875rem] top-3 w-px bg-border-subtle"
                />

                {stepRows.map((row) => (
                  <StepperRow key={row.id} row={row} locale={locale} />
                ))}
              </div>
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

                {wholeBudget.manualFixedUnusedTotal > 0 || wholeBudget.manualFixedOverspendTotal > 0 ? (
                  <div className="flex items-center gap-2">
                    {wholeBudget.manualFixedUnusedTotal > 0 ? (
                      <div className="rounded-[var(--radius-sm)] bg-card px-2.5 py-1.5 shadow-ring">
                        <p
                          dir="ltr"
                          className={cn("text-sm font-semibold tabular-nums", semanticTextClass.income)}
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
                          className={cn("text-sm font-semibold tabular-nums", semanticTextClass.expense)}
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
        wholeMonthSpent={wholeMonthSpent}
        adjustedBudgetTotal={adjustedBudgetTotal}
        rows={bucketsWithDelta}
      />
    </>
  )
}
