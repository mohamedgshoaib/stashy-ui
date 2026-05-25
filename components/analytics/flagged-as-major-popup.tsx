"use client"

import { useLocale, useTranslations } from "next-intl"

import {
  formatAnalyticsCurrency,
  formatAnalyticsDayLong,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import type { MajorTransaction } from "@/components/analytics/types"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"

type FlaggedAsMajorPopupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthIsoDate: string
  total: number
  count: number
  transactions: MajorTransaction[]
}

export function FlaggedAsMajorPopup({
  open,
  onOpenChange,
  monthIsoDate,
  total,
  count,
  transactions,
}: FlaggedAsMajorPopupProps) {
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const t = useTranslations("Analytics")

  const monthLabel = formatAnalyticsMonthShort(locale, monthIsoDate)
  const totalLabel = formatAnalyticsCurrency(locale, total)
  const countLabel = t("flaggedAsMajor.itemsCount", { count })
  const popupSummaryLabel = t("flaggedAsMajor.popupSummary", {
    month: monthLabel,
    total: totalLabel,
    count: countLabel,
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="gap-2 px-5 pb-3 pt-5 text-start">
          <DrawerTitle className="sr-only">{t("flaggedAsMajor.title")}</DrawerTitle>
          <DrawerDescription className="sr-only">{popupSummaryLabel}</DrawerDescription>
          <p className="text-sm text-text-secondary" aria-label={popupSummaryLabel}>
            <span>{monthLabel}</span>
            <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
              ·
            </span>
            <span dir="ltr" className="tabular-nums text-foreground">
              {totalLabel}
            </span>
            <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
              ·
            </span>
            <span>{countLabel}</span>
          </p>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
          <div className="flex max-h-[65svh] flex-col gap-2 overflow-y-auto overscroll-contain">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex min-h-14 items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-surface-offset px-4 py-3 shadow-ring"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatAnalyticsDayLong(locale, transaction.date)}
                    <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
                      ·
                    </span>
                    {transaction.paymentMethodName}
                  </p>
                </div>
                <p
                  dir="ltr"
                  className="shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-foreground"
                >
                  {formatAnalyticsCurrency(locale, transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
