"use client"

import { useLocale, useTranslations } from "next-intl"

import {
  formatAnalyticsCurrency,
  formatAnalyticsNumber,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import type { ManualBucketCalibration } from "@/components/analytics/types"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type CalibrationRow = ManualBucketCalibration & {
  delta: number
  absDelta: number
}

type BarGeometry = {
  fillPct: number
  planTickPct: number
  isOver: boolean
}

type VerdictTone = "withinPlan" | "adjustedInFlight" | "outranThePlan"

type HowMonthLandedPopupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthIsoDate: string
  verdict: VerdictTone
  actualVariableTotal: number
  effectivePlan: number
  rows: CalibrationRow[]
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

function CalibrationStrip({ row, locale }: { row: CalibrationRow; locale: string }) {
  const geometry = getBarGeometry(row.actual, row.planned)

  return (
    <div className="rounded-[var(--radius-sm)] bg-surface-offset px-4 py-3 shadow-ring">
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

      <div dir="ltr" className="mt-2 h-[5px] rounded-full bg-card/70">
        <div className="relative h-full w-full rounded-full">
          <div
            className={cn(
              "absolute inset-y-0 start-0 rounded-full",
              geometry.isOver ? "bg-foreground" : "bg-text-tertiary/50",
            )}
            style={{ width: `${Math.min(100, geometry.fillPct)}%` }}
          />
          <div
            className="absolute inset-y-0 w-[1.5px] -translate-x-1/2 rounded-full bg-foreground"
            style={{ insetInlineStart: `${Math.min(100, geometry.planTickPct)}%` }}
          />
        </div>
      </div>

      <p dir="ltr" className="mt-2 text-[10.5px] tabular-nums text-text-tertiary">
        {formatAnalyticsCurrency(locale, row.actual)} of{" "}
        {formatAnalyticsCurrency(locale, row.planned)}
      </p>
    </div>
  )
}

export function HowMonthLandedPopup({
  open,
  onOpenChange,
  monthIsoDate,
  verdict,
  actualVariableTotal,
  effectivePlan,
  rows,
}: HowMonthLandedPopupProps) {
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const t = useTranslations("Analytics")

  const monthLabel = formatAnalyticsMonthShort(locale, monthIsoDate)
  const verdictLabel = t(`howMonthLanded.verdict.${verdict}`).replace(/\.$/, "")
  const delta = Math.abs(actualVariableTotal - effectivePlan)
  const deltaNumber = formatAnalyticsNumber(locale, delta)
  const deltaLabel = formatAnalyticsCurrency(locale, delta)
  const summaryLabel =
    actualVariableTotal < effectivePlan
      ? t("howMonthLanded.popup.summaryUnder", { amount: deltaLabel })
      : actualVariableTotal > effectivePlan
        ? t("howMonthLanded.popup.summaryOver", { amount: deltaLabel })
        : t("howMonthLanded.popup.summaryExact")
  const popupLabel = t("howMonthLanded.popup.header", {
    month: monthLabel,
    verdict: verdictLabel,
    summary: summaryLabel,
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="gap-2 px-5 pb-3 pt-5 text-start">
          <DrawerTitle className="sr-only">{t("section.landed.title")}</DrawerTitle>
          <DrawerDescription className="sr-only">{popupLabel}</DrawerDescription>
          <p className="text-sm text-text-secondary" aria-label={popupLabel}>
            <span>{monthLabel}</span>
            <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
              ·
            </span>
            <span>{verdictLabel}</span>
            <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
              ·
            </span>
            {actualVariableTotal === effectivePlan ? (
              <span>{summaryLabel}</span>
            ) : actualVariableTotal < effectivePlan ? (
              <>
                <span dir="ltr" className="tabular-nums text-foreground">
                  {deltaNumber} EGP
                </span>
                <span>{locale.startsWith("ar") ? " تحت الخطة" : " under plan"}</span>
              </>
            ) : (
              <>
                <span dir="ltr" className="tabular-nums text-foreground">
                  {deltaNumber} EGP
                </span>
                <span>{locale.startsWith("ar") ? " فوق الخطة" : " over plan"}</span>
              </>
            )}
          </p>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
          <div className="flex max-h-[65svh] flex-col gap-2 overflow-y-auto overscroll-contain">
            {rows.map((row) => (
              <CalibrationStrip key={row.bucketId} row={row} locale={locale} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
