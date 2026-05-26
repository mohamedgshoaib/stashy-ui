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
import type { LiveMonthAnalysis, ManualBucketCalibration } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { semanticSurfaceClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type HowMonthLandedCardProps = {
  month: LiveMonthAnalysis
}

type VerdictTone = "withinPlan" | "adjustedInFlight" | "outranThePlan"

type CalibrationRow = ManualBucketCalibration & {
  delta: number
  absDelta: number
}

type BarGeometry = {
  fillPct: number
  planTickPct: number
  isOver: boolean
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

function Divider() {
  return <div className="h-px bg-border-subtle" />
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
      {children}
    </p>
  )
}

function Bar({
  actual,
  plan,
  fillClassName,
  trackClassName,
  tickWidthClassName,
}: {
  actual: number
  plan: number
  fillClassName: string
  trackClassName: string
  tickWidthClassName: string
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
          "absolute inset-y-0 -translate-x-1/2 rounded-full bg-foreground",
          tickWidthClassName,
        )}
        style={{ insetInlineStart: `${Math.min(100, geometry.planTickPct)}%` }}
      />
    </div>
  )
}

function ManualCalibrationStrip({
  row,
  locale,
  t,
}: {
  row: CalibrationRow
  locale: string
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
          {row.name}
        </p>
        <p
          dir="ltr"
          className={cn(
            "shrink-0 text-[12.5px] font-medium tabular-nums",
            row.delta > 0 ? "text-foreground" : "text-text-tertiary",
          )}
        >
          {row.delta > 0 ? "+" : "−"}
          {formatAnalyticsCurrency(locale, Math.abs(row.delta))}
        </p>
      </div>

      <div dir="ltr" className="h-[5px] rounded-full bg-card/70">
        <Bar
          actual={row.actual}
          plan={row.planned}
          fillClassName={
            getBarGeometry(row.actual, row.planned).isOver ? "bg-foreground" : "bg-text-tertiary/50"
          }
          trackClassName="bg-card/70"
          tickWidthClassName="w-[1.5px]"
        />
      </div>

      <p dir="ltr" className="text-[10.5px] tabular-nums text-text-tertiary">
        {t("howMonthLanded.manualFixed.metaLine", {
          actual: formatAnalyticsCurrency(locale, row.actual),
          plan: formatAnalyticsCurrency(locale, row.planned),
        })}
      </p>
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
      <Card size="sm" className="overflow-hidden border-border/10 bg-card py-0">
        <CardContent className="relative px-[22px] py-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute end-4 top-4 h-[22px] w-[22px] border-e border-t border-border/30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 start-4 h-[22px] w-[22px] border-b border-s border-border/30"
          />

          <div className="space-y-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
              {t("howMonthLanded.teaser.eyebrow", { month: monthShort })}
            </p>

            <div className="space-y-3">
              <p className="max-w-[20ch] text-[19px] font-normal tracking-[-0.01em] text-foreground">
                {t("howMonthLanded.teaser.title")}
              </p>
              <p className="max-w-[28ch] text-[12.5px] leading-[1.55] text-text-secondary">
                {t("howMonthLanded.teaser.body", { month: monthLong })}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="h-px w-2/5"
              style={{
                background: `linear-gradient(${locale.startsWith("ar") ? "to left" : "to right"}, color-mix(in srgb, var(--color-border) 55%, transparent), transparent)`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  const actualVariableTotal = month.totalVariableSpent + month.majorTotal
  const effectivePlan = month.effectiveVariableBudget
  const basePlan = effectivePlan - month.injectionTotal
  const verdict: VerdictTone =
    actualVariableTotal > effectivePlan
      ? "outranThePlan"
      : month.injectionTotal > 0
        ? "adjustedInFlight"
        : "withinPlan"

  const totalDelta = Math.abs(actualVariableTotal - effectivePlan)
  const headlineGeometry = getBarGeometry(actualVariableTotal, effectivePlan)
  const variableGeometry = getBarGeometry(actualVariableTotal, effectivePlan)
  const variableLabelKey = month.injectionCount > 0 ? "planLabelAdjusted" : "planLabelDefault"
  const variableSubKey = actualVariableTotal > effectivePlan ? "subOver" : "subUnder"
  const majorSuffix =
    month.majorTotal > 0
      ? t("howMonthLanded.variable.majorSuffix", {
          amount: formatAnalyticsCurrency(locale, month.majorTotal),
        })
      : null
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

  const supportLine =
    verdict === "withinPlan"
      ? t("howMonthLanded.verdict.supportWithinPlan", {
          totalSpent: formatAnalyticsCurrency(locale, actualVariableTotal),
          plan: formatAnalyticsCurrency(locale, effectivePlan),
          remainder: formatAnalyticsCurrency(locale, effectivePlan - actualVariableTotal),
        })
      : verdict === "adjustedInFlight"
        ? t("howMonthLanded.verdict.supportAdjustedInFlight", {
            totalSpent: formatAnalyticsCurrency(locale, actualVariableTotal),
            planPlusInjection: formatAnalyticsCurrency(locale, effectivePlan),
          })
        : t("howMonthLanded.verdict.supportOutran", {
            totalSpent: formatAnalyticsCurrency(locale, actualVariableTotal),
            plan: formatAnalyticsCurrency(locale, effectivePlan),
            overage: formatAnalyticsCurrency(locale, actualVariableTotal - effectivePlan),
          })

  return (
    <>
      <Card size="sm" className="py-4">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
              {t("howMonthLanded.verdict.eyebrowClosed", { month: monthShort })}
            </p>
            <p className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground">
              {t(`howMonthLanded.verdict.${verdict}`)}
            </p>
            <p className="text-[13.5px] leading-[1.45] text-text-secondary">
              <span dir="ltr" className="tabular-nums">
                {supportLine}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <div dir="ltr" className="h-2.5 rounded-full bg-surface-offset">
              <Bar
                actual={actualVariableTotal}
                plan={effectivePlan}
                fillClassName={headlineGeometry.isOver ? "bg-foreground" : "bg-text-tertiary"}
                trackClassName="bg-surface-offset"
                tickWidthClassName="w-0.5"
              />
            </div>

            <div
              dir="ltr"
              className="flex items-center justify-between gap-3 text-[11px] tabular-nums text-text-tertiary"
            >
              {verdict === "withinPlan" ? (
                <>
                  <span>{t("howMonthLanded.bar.labelStart")}</span>
                  <span>
                    {t("howMonthLanded.bar.labelPlan", {
                      plan: formatAnalyticsCurrency(locale, effectivePlan),
                    })}
                  </span>
                </>
              ) : verdict === "adjustedInFlight" ? (
                <>
                  <span>
                    {t("howMonthLanded.bar.labelPlan", {
                      plan: formatAnalyticsCurrency(locale, basePlan),
                    })}
                  </span>
                  <span>
                    {t("howMonthLanded.bar.labelPlanInj", {
                      planPlusInjection: formatAnalyticsCurrency(locale, effectivePlan),
                    })}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {t("howMonthLanded.bar.labelPlan", {
                      plan: formatAnalyticsCurrency(locale, effectivePlan),
                    })}
                  </span>
                  <span>
                    {t("howMonthLanded.bar.labelSpent", {
                      totalSpent: formatAnalyticsCurrency(locale, actualVariableTotal),
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {month.injectionCount > 0 ? (
            <>
              <Divider />
              <div className="space-y-2.5">
                <SectionEyebrow>{t("howMonthLanded.injections.eyebrow")}</SectionEyebrow>
                <div
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-3 shadow-ring",
                    semanticSurfaceClass.injection,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12.5px] font-medium text-injection">
                      {t("howMonthLanded.injections.label")}
                    </p>
                    <p dir="ltr" className="text-[15px] font-medium tabular-nums text-foreground">
                      {t("howMonthLanded.injections.value", {
                        amount: formatAnalyticsNumber(locale, month.injectionTotal),
                      })}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-[1.4] text-injection/85">
                    {t("howMonthLanded.injections.sub", {
                      count: month.injectionCount,
                      basePlan: formatAnalyticsCurrency(locale, basePlan),
                      adjustedPlan: formatAnalyticsCurrency(locale, effectivePlan),
                    })}
                  </p>
                </div>
              </div>
            </>
          ) : null}

          <Divider />

          <div className="space-y-2.5">
            <SectionEyebrow>{t("howMonthLanded.variable.eyebrow")}</SectionEyebrow>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p dir="ltr" className="text-[15px] font-medium tabular-nums text-foreground">
                  {formatAnalyticsCurrency(locale, actualVariableTotal)}
                </p>
                <p dir="ltr" className="text-[12px] tabular-nums text-text-tertiary">
                  {t(`howMonthLanded.variable.${variableLabelKey}`, {
                    plan: formatAnalyticsCurrency(locale, effectivePlan),
                  })}
                </p>
              </div>

              <div dir="ltr" className="h-[7px] rounded-full bg-surface-offset">
                <Bar
                  actual={actualVariableTotal}
                  plan={effectivePlan}
                  fillClassName={variableGeometry.isOver ? "bg-foreground" : "bg-text-secondary"}
                  trackClassName="bg-surface-offset"
                  tickWidthClassName="w-[1.5px]"
                />
              </div>

              <p className="text-[11.5px] leading-[1.4] text-text-tertiary">
                <span dir="ltr" className="tabular-nums">
                  {t(`howMonthLanded.variable.${variableSubKey}`, {
                    delta: formatAnalyticsCurrency(locale, totalDelta),
                  })}
                </span>
                {majorSuffix ? (
                  <span className="font-medium text-text-secondary">{majorSuffix}</span>
                ) : null}
              </p>
            </div>
          </div>

          {bucketsWithDelta.length > 0 ? (
            <>
              <Divider />
              <div className="space-y-2.5">
                <SectionEyebrow>{t("howMonthLanded.manualFixed.eyebrow")}</SectionEyebrow>
                <div className="space-y-3">
                  {inlineManualRows.map((row) => (
                    <ManualCalibrationStrip key={row.bucketId} row={row} locale={locale} t={t} />
                  ))}
                </div>

                {hiddenManualCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPopupOpen(true)}
                    className="-m-1 flex min-h-12 w-full items-center gap-2 rounded-[calc(var(--radius-sm)+4px)] p-1 text-start transition-[transform,opacity] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                  >
                    <span className="text-sm text-text-tertiary">›</span>
                    <span className="text-[12px] text-text-secondary">
                      {t("howMonthLanded.manualFixed.andNMore", { count: hiddenManualCount })}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      aria-hidden="true"
                      className="ms-auto shrink-0 text-text-tertiary rtl:rotate-180"
                    />
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
        actualVariableTotal={actualVariableTotal}
        effectivePlan={effectivePlan}
        rows={bucketsWithDelta}
      />
    </>
  )
}
