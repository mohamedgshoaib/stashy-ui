"use client"

import { useLocale, useTranslations } from "next-intl"

import { getPreviousSnapshot } from "@/components/analytics/data"
import {
  formatAnalyticsCurrency,
  formatAnalyticsSignedCurrency,
} from "@/components/analytics/formatters"
import type { AnalyticsData, LiveMonthAnalysis, MonthSnapshot } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MethodObligationCardProps {
  month: LiveMonthAnalysis
  data: AnalyticsData
}

type CommittedChangeReason = "none" | "newRecurring" | "installmentEnded" | "changed"

function getCommittedChangeReason(
  current: LiveMonthAnalysis,
  previous: MonthSnapshot | null,
  totalCommitted: number,
  previousCommitted: number | null,
): CommittedChangeReason {
  if (!previous || totalCommitted === previousCommitted) return "none"
  const currentAutoIds = new Set(
    current.fixedBuckets.filter((b) => b.type !== "manual").map((b) => b.id),
  )
  const previousAutoIds = new Set(
    previous.fixedBuckets.filter((b) => b.type !== "manual").map((b) => b.id),
  )
  const hasNew = current.fixedBuckets.some((b) => b.type !== "manual" && !previousAutoIds.has(b.id))
  const hasEnded = previous.fixedBuckets.some(
    (b) => b.type !== "manual" && !currentAutoIds.has(b.id),
  )
  if (hasNew) return "newRecurring"
  if (hasEnded) return "installmentEnded"
  return "changed"
}

export function MethodObligationCard({ month, data }: MethodObligationCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")

  const previousSnapshot = getPreviousSnapshot(data, month.month)

  // Total committed this month
  const totalCommitted = month.paymentMethods.reduce(
    (sum, m) => sum + (m.fixedByType?.recurring ?? 0) + (m.fixedByType?.installment ?? 0),
    0,
  )

  // Total committed last month
  const previousCommitted = previousSnapshot
    ? previousSnapshot.paymentMethods.reduce(
        (sum, m) => sum + (m.fixedByType?.recurring ?? 0) + (m.fixedByType?.installment ?? 0),
        0,
      )
    : null

  const committedDelta = previousCommitted !== null ? totalCommitted - previousCommitted : null

  const reason = getCommittedChangeReason(
    month,
    previousSnapshot,
    totalCommitted,
    previousCommitted,
  )

  // Per-method rows — hide methods with zero committed
  const methodRows = month.paymentMethods
    .map((m) => ({
      ...m,
      committed: (m.fixedByType?.recurring ?? 0) + (m.fixedByType?.installment ?? 0),
    }))
    .filter((m) => m.committed > 0)
    .map((m) => ({
      ...m,
      pct: Math.round((m.committed / Math.max(1, totalCommitted)) * 100),
    }))

  // Delta badge styling
  const deltaBadgeClass =
    committedDelta === null || committedDelta === 0
      ? "bg-surface-offset text-text-tertiary"
      : committedDelta > 0
        ? "bg-warning-subtle text-warning"
        : "bg-income-subtle text-income"

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-[1.0625rem] font-medium text-foreground">{t("obligation.title")}</h2>
          <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
            {t("obligation.subtitle")}
          </p>
        </div>

        {/* Total committed block */}
        <div className="rounded-[var(--radius-md)] bg-surface-offset p-4">
          {/* Hero */}
          <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-fixed">
            {t("obligation.totalCommitted")}
          </p>
          <p
            dir="ltr"
            className="mt-1.5 text-[2rem] font-medium tracking-[-0.03em] leading-none tabular-nums text-foreground"
          >
            {formatAnalyticsCurrency(locale, totalCommitted)}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {t("obligation.recurringAndInstallment")}
          </p>

          {/* vs. last month comparison row — only when previous month exists */}
          {previousCommitted !== null && (
            <>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
                <div>
                  <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                    {t("obligation.lastMonth")}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-0.5 text-sm font-semibold tabular-nums text-foreground"
                  >
                    {formatAnalyticsCurrency(locale, previousCommitted)}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    deltaBadgeClass,
                  )}
                >
                  {committedDelta === 0
                    ? t("obligation.sameAsLastMonth")
                    : formatAnalyticsSignedCurrency(locale, committedDelta!)}
                </span>
              </div>

              {/* Reason line — shown whenever delta is non-zero */}
              {committedDelta !== 0 && (
                <p className="mt-2 text-xs text-text-tertiary">
                  {reason === "newRecurring" && t("obligation.newRecurringAdded")}
                  {reason === "installmentEnded" && t("obligation.installmentEnded")}
                  {reason === "changed" && t("obligation.vsLastMonth")}
                </p>
              )}
            </>
          )}
        </div>

        {/* Eyebrow for method rows — only when there are rows */}
        {methodRows.length > 0 && (
          <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
            {t("obligation.byMethod")}
          </p>
        )}

        {/* Method rows */}
        {methodRows.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t("obligation.noCommitted")}</p>
        ) : (
          <div className="-mt-2 flex flex-col gap-1.5">
            {methodRows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-card px-3 py-3 shadow-ring"
              >
                {/* Start: name + amount below */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{row.name}</p>
                  <p dir="ltr" className="mt-0.5 text-xs tabular-nums text-text-secondary">
                    {formatAnalyticsCurrency(locale, row.committed)}
                  </p>
                </div>

                {/* End: percentage pill */}
                <span className="shrink-0 rounded-full bg-fixed-subtle px-2.5 py-1 text-xs font-semibold text-fixed">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
