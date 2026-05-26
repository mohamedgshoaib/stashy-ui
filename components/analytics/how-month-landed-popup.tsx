"use client"

import { useLocale, useTranslations } from "next-intl"

import {
  formatAnalyticsCurrency,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import type { ManualBucketCalibration, WholeBudgetVerdict } from "@/components/analytics/types"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"
import { semanticProgressClass, semanticTextClass } from "@/lib/semantic-styles"
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

type HowMonthLandedPopupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthIsoDate: string
  verdict: WholeBudgetVerdict
  wholeMonthSpent: number
  adjustedBudgetTotal: number
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

function CalibrationTile({ row, locale }: { row: CalibrationRow; locale: string }) {
  const geometry = getBarGeometry(row.actual, row.planned)
  const tone = getManualRowTone(row)

  return (
    <div className="space-y-2 rounded-[var(--radius-sm)] bg-surface-offset px-3 py-3 shadow-ring">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
          <p dir="ltr" className="mt-1 text-[11px] tabular-nums text-text-secondary">
            {formatAnalyticsCurrency(locale, row.actual)} of{" "}
            {formatAnalyticsCurrency(locale, row.planned)}
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
        <div className="relative h-full w-full rounded-full">
          <div
            className={cn("absolute inset-y-0 start-0 rounded-full", tone.progressClass)}
            style={{ width: `${Math.min(100, geometry.fillPct)}%` }}
          />
          <div
            className={cn(
              "absolute inset-y-0 w-[1.5px] -translate-x-1/2 rounded-full bg-text-tertiary/70",
              tone.tickClassName,
            )}
            style={{ insetInlineStart: `${Math.min(100, geometry.planTickPct)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function HowMonthLandedPopup({
  open,
  onOpenChange,
  monthIsoDate,
  verdict,
  wholeMonthSpent,
  adjustedBudgetTotal,
  rows,
}: HowMonthLandedPopupProps) {
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const t = useTranslations("Analytics")

  const monthLabel = formatAnalyticsMonthShort(locale, monthIsoDate)
  const delta = Math.abs(wholeMonthSpent - adjustedBudgetTotal)
  const verdictLabel = t(`howMonthLanded.verdictWhole.${verdict}`).replace(/\.$/, "")
  const summaryLabel =
    wholeMonthSpent < adjustedBudgetTotal
      ? t("howMonthLanded.popup.summaryUnder", { amount: formatAnalyticsCurrency(locale, delta) })
      : wholeMonthSpent > adjustedBudgetTotal
        ? t("howMonthLanded.popup.summaryOver", { amount: formatAnalyticsCurrency(locale, delta) })
        : t("howMonthLanded.popup.summaryExact")

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="gap-2.5 px-5 pb-3 pt-5 text-start">
          <DrawerTitle>{t("howMonthLanded.popup.title")}</DrawerTitle>
          <DrawerDescription className="max-w-[32ch] text-pretty">
            {t("howMonthLanded.popup.subtitle", {
              month: monthLabel,
              verdict: verdictLabel,
              summary: summaryLabel,
            })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
          <div className="flex max-h-[65svh] flex-col gap-3 overflow-y-auto overscroll-contain pt-1">
            {rows.map((row) => (
              <CalibrationTile key={row.bucketId} row={row} locale={locale} />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
