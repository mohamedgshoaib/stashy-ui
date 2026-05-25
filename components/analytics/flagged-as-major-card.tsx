"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import { getPreviousSnapshot } from "@/components/analytics/data"
import { FlaggedAsMajorPopup } from "@/components/analytics/flagged-as-major-popup"
import {
  formatAnalyticsCurrency,
  formatAnalyticsDayLong,
  formatAnalyticsMonthShort,
} from "@/components/analytics/formatters"
import type { AnalyticsData, LiveMonthAnalysis, MajorTransaction } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"

type FlaggedAsMajorCardProps = {
  month: LiveMonthAnalysis
  data: AnalyticsData
}

function ComparisonCell({
  label,
  total,
  count,
}: {
  label: string
  total: number
  count: number
}) {
  const locale = useLocale()
  const t = useTranslations("Analytics")

  return (
    <div className="flex-1 space-y-1">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
        {label}
      </p>
      <p dir="ltr" className="text-[15px] font-semibold tabular-nums text-foreground">
        {formatAnalyticsCurrency(locale, total)}
      </p>
      <p className="text-xs text-text-secondary">{t("flaggedAsMajor.itemsCount", { count })}</p>
    </div>
  )
}

export function FlaggedAsMajorCard({ month, data }: FlaggedAsMajorCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")
  const [open, setOpen] = React.useState(false)

  if (month.majorCount === 0 || month.majorTransactions.length === 0) {
    return null
  }

  const [firstMajor, ...otherMajors] = month.majorTransactions
  const largestMajor = otherMajors.reduce<MajorTransaction>(
    (max, transaction) => (transaction.amount > max.amount ? transaction : max),
    firstMajor,
  )
  const remainingCount = Math.max(0, month.majorCount - 1)
  const previousSnapshot = month.status === "closed" ? getPreviousSnapshot(data, month.month) : null
  const sortedTransactions = [...month.majorTransactions].sort((a, b) => b.amount - a.amount)

  return (
    <>
      <Card size="sm" className="py-4">
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="space-y-1">
            <h2 className="text-[1.0625rem] font-medium text-foreground">
              {t("flaggedAsMajor.title")}
            </h2>
            <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("flaggedAsMajor.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p
                dir="ltr"
                className="text-[1.5rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-major"
              >
                {formatAnalyticsCurrency(locale, month.majorTotal)}
              </p>
              <p className="mt-1.5 text-xs text-text-secondary">
                {t("flaggedAsMajor.itemsCount", { count: month.majorCount })}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("flaggedAsMajor.popupSummary", {
                month: formatAnalyticsMonthShort(locale, month.isoDate),
                total: formatAnalyticsCurrency(locale, month.majorTotal),
                count: t("flaggedAsMajor.itemsCount", { count: month.majorCount }),
              })}
              className="-m-1 flex min-h-12 w-full flex-col rounded-[calc(var(--radius-sm)+4px)] p-1 text-start transition-[transform,opacity] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <div className="flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-major/20 bg-surface-offset px-3 py-3 shadow-ring">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {largestMajor.description}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {formatAnalyticsDayLong(locale, largestMajor.date)}
                  </p>
                </div>
                <p
                  dir="ltr"
                  className="shrink-0 text-sm font-semibold tabular-nums text-major"
                >
                  {formatAnalyticsCurrency(locale, largestMajor.amount)}
                </p>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-major rtl:rotate-180"
                />
              </div>

              {remainingCount > 0 ? (
                <p className="px-3 pt-2 text-xs text-text-tertiary">
                  {t("flaggedAsMajor.andNMore", { count: remainingCount })}
                </p>
              ) : null}
            </button>
          </div>

          {month.status === "closed" ? <div className="h-px bg-border-subtle" /> : null}

          {month.status === "closed" ? (
            previousSnapshot ? (
              <div className="space-y-2">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-major">
                  {t("flaggedAsMajor.comparisonHeader")}
                </p>
                <div className="rounded-[var(--radius-sm)] bg-surface-offset p-3 shadow-ring">
                  <div className="flex items-stretch gap-3">
                    <ComparisonCell
                      label={formatAnalyticsMonthShort(locale, month.isoDate)}
                      total={month.majorTotal}
                      count={month.majorCount}
                    />
                    <div className="w-px self-stretch bg-border-subtle" />
                    <ComparisonCell
                      label={formatAnalyticsMonthShort(locale, previousSnapshot.isoDate)}
                      total={previousSnapshot.majorTotal}
                      count={previousSnapshot.majorCount}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-[1.45] text-text-tertiary">
                {t("flaggedAsMajor.noPriorMonth")}
              </p>
            )
          ) : null}
        </CardContent>
      </Card>

      <FlaggedAsMajorPopup
        open={open}
        onOpenChange={setOpen}
        monthIsoDate={month.isoDate}
        total={month.majorTotal}
        count={month.majorCount}
        transactions={sortedTransactions}
      />
    </>
  )
}
