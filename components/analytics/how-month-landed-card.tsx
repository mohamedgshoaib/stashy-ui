"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import {
  formatAnalyticsCurrency,
  formatAnalyticsMonthLabel,
  formatAnalyticsMonthShort,
  formatAnalyticsNumber,
} from "@/components/analytics/formatters"
import { HowMonthLandedPopup } from "@/components/analytics/how-month-landed-popup"
import type {
  LiveMonthAnalysis,
  ManualBucketCalibration,
  WholeBudgetVerdict,
} from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import {
  semanticProgressClass,
  semanticSurfaceClass,
  semanticTextClass,
} from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type HowMonthLandedCardProps = {
  month: LiveMonthAnalysis
}

type CalibrationRow = ManualBucketCalibration & {
  delta: number
  absDelta: number
}

type BarGeometry = {
  fillPct: number
  planTickPct: number
  isOver: boolean
}

type BudgetChangeRow = {
  label: string
  amount: number
  toneClassName: string
  detail?: string
}

function getBarGeometry(actual: number, plan: number): BarGeometry {
  if (actual <= 0 || plan <= 0) {
    return {
      fillPct: 0,
      planTickPct: 100,
      isOver: false,
    }
  }

  if (actual <= plan) {
    return {
      fillPct: (actual / plan) * 100,
      planTickPct: 100,
      isOver: false,
    }
  }

  return {
    fillPct: 100,
    planTickPct: (plan / actual) * 100,
    isOver: true,
  }
}

function getSummaryTone(verdict: WholeBudgetVerdict) {
  if (verdict === "underBudget") {
    return {
      deltaSurfaceClass: semanticSurfaceClass.income,
      deltaTextClass: semanticTextClass.income,
      progressClass: semanticProgressClass.income,
      tickClassName: "bg-income/70",
      actualValueClass: "text-foreground",
    }
  }

  if (verdict === "overBudget") {
    return {
      deltaSurfaceClass: semanticSurfaceClass.expense,
      deltaTextClass: semanticTextClass.expense,
      progressClass: semanticProgressClass.expense,
      tickClassName: "bg-expense/70",
      actualValueClass: "text-expense",
    }
  }

  return {
    deltaSurfaceClass: semanticSurfaceClass.fixed,
    deltaTextClass: semanticTextClass.fixed,
    progressClass: semanticProgressClass.fixed,
    tickClassName: "bg-fixed/65",
    actualValueClass: "text-foreground",
  }
}

function getManualRowTone(row: CalibrationRow) {
  if (row.delta > 0) {
    return {
      deltaTextClass: semanticTextClass.expense,
      progressClass: semanticProgressClass.expense,
      tickClassName: "bg-expense/70",
    }
  }

  return {
    deltaTextClass: semanticTextClass.fixed,
    progressClass: semanticProgressClass.fixed,
    tickClassName: "bg-fixed/65",
  }
}

function Divider() {
  return <div className="h-px bg-border-subtle" />
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

function ManualCalibrationTile({
  row,
  locale,
  t,
}: {
  row: CalibrationRow
  locale: string
  t: ReturnType<typeof useTranslations>
}) {
  const tone = getManualRowTone(row)

  return (
    <div className="space-y-2 rounded-[var(--radius-sm)] bg-surface-offset px-3 py-3 shadow-ring">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
          <p dir="ltr" className="mt-1 text-[11px] tabular-nums text-text-secondary">
            {t("howMonthLanded.manualFixed.metaLine", {
              actual: formatAnalyticsCurrency(locale, row.actual),
              plan: formatAnalyticsCurrency(locale, row.planned),
            })}
          </p>
        </div>
        <p
          dir="ltr"
          className={cn("shrink-0 pt-0.5 text-xs font-medium tabular-nums", tone.deltaTextClass)}
        >
          {row.delta > 0 ? "+" : "−"}
          {formatAnalyticsCurrency(locale, Math.abs(row.delta))}
        </p>
      </div>

      <div dir="ltr" className="h-1.5 rounded-full bg-surface-2">
        <Bar
          actual={row.actual}
          plan={row.planned}
          fillClassName={tone.progressClass}
          trackClassName="bg-surface-2"
          tickClassName={tone.tickClassName}
        />
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

  const totalDelta = Math.abs(wholeBudget.remainder)
  const summaryTone = getSummaryTone(verdict)
  const bucketsWithDelta = month.manualBucketCalibration
    .filter((bucket) => bucket.actual !== bucket.planned)
    .map((bucket) => ({
      ...bucket,
      delta: bucket.actual - bucket.planned,
      absDelta: Math.abs(bucket.actual - bucket.planned),
    }))
    .sort((a, b) => b.absDelta - a.absDelta)
  const inlineManualRows = bucketsWithDelta.slice(0, 3)
  const hiddenManualCount = Math.max(0, bucketsWithDelta.length - inlineManualRows.length)
  const totalSpentForBreakdown = wholeMonthSpent
  const fixedPct =
    totalSpentForBreakdown > 0 ? (wholeBudget.fixedSpentTotal / totalSpentForBreakdown) * 100 : 0
  const variablePct =
    totalSpentForBreakdown > 0 ? (wholeBudget.variableSpentTotal / totalSpentForBreakdown) * 100 : 0
  const majorPct =
    totalSpentForBreakdown > 0 ? (wholeBudget.majorSpentTotal / totalSpentForBreakdown) * 100 : 0
  const showSpendBreakdown = wholeMonthSpent > 0
  const showBudgetBreakdown =
    month.injectionTotal > 0 ||
    month.variableReceivedTotal > 0 ||
    wholeBudget.manualFixedUnusedTotal > 0 ||
    wholeBudget.manualFixedOverspendTotal > 0
  const budgetChangeRows: BudgetChangeRow[] = [
    ...(month.injectionTotal > 0
      ? [
          {
            label: t("howMonthLanded.budgetBreakdown.rows.injection"),
            amount: month.injectionTotal,
            toneClassName: semanticTextClass.injection,
          },
        ]
      : []),
    ...(month.variableReceivedTotal > 0
      ? [
          {
            label: t("howMonthLanded.budgetBreakdown.rows.received"),
            amount: month.variableReceivedTotal,
            toneClassName: semanticTextClass.income,
          },
        ]
      : []),
    ...(wholeBudget.manualFixedUnusedTotal > 0
      ? [
          {
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedReturned"),
            amount: wholeBudget.manualFixedUnusedTotal,
            toneClassName: semanticTextClass.fixed,
            detail: t("howMonthLanded.budgetBreakdown.rows.manualFixedReturnedDetail", {
              amount: formatAnalyticsCurrency(locale, wholeBudget.manualFixedUnusedTotal),
            }),
          },
        ]
      : []),
    ...(wholeBudget.manualFixedOverspendTotal > 0
      ? [
          {
            label: t("howMonthLanded.budgetBreakdown.rows.manualFixedOverspend"),
            amount: -wholeBudget.manualFixedOverspendTotal,
            toneClassName: semanticTextClass.expense,
            detail: t("howMonthLanded.budgetBreakdown.rows.manualFixedOverspendDetail", {
              amount: formatAnalyticsCurrency(locale, wholeBudget.manualFixedOverspendTotal),
            }),
          },
        ]
      : []),
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-text-secondary shadow-ring">
                    {t("howMonthLanded.verdict.badge", { month: monthShort })}
                  </span>
                  <p className="max-w-[14ch] text-[1.625rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
                    {t(`howMonthLanded.verdictWhole.${verdict}`)}
                  </p>
                </div>

                <div
                  className={cn(
                    "min-w-[7.5rem] rounded-[var(--radius-sm)] px-3 py-2.5 shadow-ring",
                    summaryTone.deltaSurfaceClass,
                  )}
                >
                  <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-current/75">
                    {t("howMonthLanded.summary.deltaLabel")}
                  </p>
                  <p
                    dir="ltr"
                    className={cn(
                      "mt-1 text-base font-semibold tabular-nums",
                      summaryTone.deltaTextClass,
                    )}
                  >
                    {formatAnalyticsCurrency(locale, totalDelta)}
                  </p>
                  <p className="mt-1 text-[11px] leading-[1.4] text-current/80 text-pretty">
                    {t(`howMonthLanded.summaryWhole.${verdict}`)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div dir="ltr" className="h-2.5 rounded-full bg-card shadow-ring">
                  <Bar
                    actual={wholeMonthSpent}
                    plan={adjustedBudgetTotal}
                    fillClassName={summaryTone.progressClass}
                    trackClassName="bg-card"
                    tickClassName={summaryTone.tickClassName}
                  />
                </div>

                <div className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-card px-3 py-2.5 shadow-ring">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                      {t("howMonthLanded.summaryWhole.spentLabel")}
                    </p>
                    <p
                      dir="ltr"
                      className={cn(
                        "mt-1 text-[1.0625rem] font-semibold tabular-nums",
                        summaryTone.actualValueClass,
                      )}
                    >
                      {formatAnalyticsCurrency(locale, wholeMonthSpent)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1 text-end">
                    <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                      {t("howMonthLanded.summaryWhole.budgetLabel")}
                    </p>
                    <p
                      dir="ltr"
                      className="mt-1 text-[1.0625rem] font-semibold tabular-nums text-foreground"
                    >
                      {formatAnalyticsCurrency(locale, adjustedBudgetTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showBudgetBreakdown ? (
            <div className="rounded-[var(--radius-md)] bg-surface-offset p-4 shadow-ring">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                    {t("howMonthLanded.budgetBreakdown.eyebrow")}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {t("howMonthLanded.budgetBreakdown.title")}
                  </p>
                  <p className="text-xs leading-[1.5] text-text-secondary text-pretty">
                    {t("howMonthLanded.budgetBreakdown.subtitle", {
                      base: formatAnalyticsCurrency(locale, month.monthlyBudget),
                      final: formatAnalyticsCurrency(locale, adjustedBudgetTotal),
                    })}
                  </p>
                </div>

                <div className="space-y-2 rounded-[var(--radius-sm)] bg-card p-3 shadow-ring">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("howMonthLanded.budgetBreakdown.baseLabel")}
                    </p>
                    <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                      {formatAnalyticsCurrency(locale, month.monthlyBudget)}
                    </p>
                  </div>

                  {budgetChangeRows.map((row) => (
                    <div key={row.label} className="space-y-1.5 border-t border-border-subtle pt-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 text-xs text-text-secondary">{row.label}</p>
                        <p
                          dir="ltr"
                          className={cn(
                            "shrink-0 text-xs font-semibold tabular-nums",
                            row.toneClassName,
                          )}
                        >
                          {row.amount >= 0 ? "+" : "−"}
                          {formatAnalyticsCurrency(locale, Math.abs(row.amount))}
                        </p>
                      </div>
                      {row.detail ? (
                        <p className="text-xs leading-[1.5] text-text-secondary text-pretty">
                          {row.detail}
                        </p>
                      ) : null}
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("howMonthLanded.budgetBreakdown.finalLabel")}
                    </p>
                    <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                      {formatAnalyticsCurrency(locale, adjustedBudgetTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {showSpendBreakdown ? (
            <div className="rounded-[var(--radius-md)] bg-surface-offset p-4 shadow-ring">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                    {t("howMonthLanded.spendBreakdown.eyebrow")}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {t("howMonthLanded.spendBreakdown.title")}
                  </p>
                </div>

                <div
                  dir="ltr"
                  className="flex h-2 overflow-hidden rounded-full bg-surface-2 shadow-ring"
                >
                  <div className="h-full bg-fixed" style={{ width: `${fixedPct}%` }} />
                  <div className="h-full bg-variable" style={{ width: `${variablePct}%` }} />
                  {wholeBudget.majorSpentTotal > 0 ? (
                    <div className="h-full bg-major" style={{ width: `${majorPct}%` }} />
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-fixed-subtle px-2.5 py-1 text-xs font-medium text-fixed">
                    <span>{t("howMonthLanded.spendBreakdown.fixedLabel")}</span>
                    <span dir="ltr" className="tabular-nums">
                      {formatAnalyticsCurrency(locale, wholeBudget.fixedSpentTotal)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-variable-subtle px-2.5 py-1 text-xs font-medium text-variable">
                    <span>{t("howMonthLanded.spendBreakdown.variableLabel")}</span>
                    <span dir="ltr" className="tabular-nums">
                      {formatAnalyticsCurrency(locale, wholeBudget.variableSpentTotal)}
                    </span>
                  </span>
                  {wholeBudget.majorSpentTotal > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-major-subtle px-2.5 py-1 text-xs font-medium text-major">
                      <span>{t("howMonthLanded.spendBreakdown.majorLabel")}</span>
                      <span dir="ltr" className="tabular-nums">
                        {formatAnalyticsCurrency(locale, wholeBudget.majorSpentTotal)}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {month.injectionCount > 0 ? (
            <div
              className={cn(
                "rounded-[var(--radius-md)] p-4 shadow-ring",
                semanticSurfaceClass.injection,
              )}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-injection/80">
                      {t("howMonthLanded.injections.eyebrow")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-injection">
                      {t("howMonthLanded.injections.label")}
                    </p>
                  </div>
                  <p
                    dir="ltr"
                    className="shrink-0 text-sm font-semibold tabular-nums text-foreground"
                  >
                    {t("howMonthLanded.injections.value", {
                      amount: formatAnalyticsNumber(locale, month.injectionTotal),
                    })}
                  </p>
                </div>
                <p className="max-w-[31ch] text-xs leading-[1.5] text-injection/85 text-pretty">
                  {t("howMonthLanded.injections.sub", {
                    count: month.injectionCount,
                    basePlan: formatAnalyticsCurrency(locale, month.monthlyBudget),
                    adjustedPlan: formatAnalyticsCurrency(locale, adjustedBudgetTotal),
                  })}
                </p>
              </div>
            </div>
          ) : null}

          {bucketsWithDelta.length > 0 ? (
            <>
              <Divider />
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <p className="text-[1.0625rem] font-medium text-foreground">
                    {t("howMonthLanded.manualFixed.title")}
                  </p>
                  <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
                    {t("howMonthLanded.manualFixed.subtitle")}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {inlineManualRows.map((row) => (
                    <ManualCalibrationTile key={row.bucketId} row={row} locale={locale} t={t} />
                  ))}
                </div>

                {hiddenManualCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPopupOpen(true)}
                    className="-m-1 flex min-h-12 w-full items-center gap-3 rounded-[calc(var(--radius-sm)+4px)] p-1 text-start transition-[transform,opacity] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                  >
                    <div className="flex min-h-14 w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-surface-offset px-4 py-3 shadow-ring">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {t("howMonthLanded.manualFixed.viewAllTitle")}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {t("howMonthLanded.manualFixed.andNMore", { count: hiddenManualCount })}
                        </p>
                      </div>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-text-tertiary rtl:rotate-180"
                      />
                    </div>
                  </button>
                ) : null}
              </div>
            </>
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
