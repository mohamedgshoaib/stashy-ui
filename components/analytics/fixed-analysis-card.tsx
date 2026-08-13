"use client"

import { ArrowDown01Icon, ArrowRight01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import {
  formatAnalyticsCurrency,
  formatAnalyticsSignedCurrency,
} from "@/components/analytics/formatters"
import type { AnalyticsData, LiveMonthAnalysis, MonthSnapshot } from "@/components/analytics/types"
import { getPreviousSnapshot } from "@/components/analytics/data"
import { Card, CardContent } from "@/components/ui/card"
import { semanticProgressClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

interface FixedAnalysisCardProps {
  month: LiveMonthAnalysis
  data: AnalyticsData
}

type StructureChangeType = "none" | "added" | "removed" | "raised" | "lowered"

function getManualStructureChange(
  current: LiveMonthAnalysis,
  previous: MonthSnapshot | null,
): { type: StructureChangeType; delta: number } {
  if (!previous) return { type: "none", delta: 0 }
  const currentBuckets = current.fixedBuckets.filter((b) => b.type === "manual")
  const previousBuckets = previous.fixedBuckets.filter((b) => b.type === "manual")
  const currentTotal = currentBuckets.reduce((sum, b) => sum + b.budget, 0)
  const previousTotal = previousBuckets.reduce((sum, b) => sum + b.budget, 0)
  const delta = currentTotal - previousTotal
  if (delta === 0) return { type: "none", delta: 0 }
  const previousIds = new Set(previousBuckets.map((b) => b.id))
  const currentIds = new Set(currentBuckets.map((b) => b.id))
  const added = currentBuckets.some((b) => !previousIds.has(b.id))
  const removed = previousBuckets.some((b) => !currentIds.has(b.id))
  if (added) return { type: "added", delta }
  if (removed) return { type: "removed", delta }
  return { type: delta > 0 ? "raised" : "lowered", delta }
}

export function FixedAnalysisCard({ month, data }: FixedAnalysisCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")
  const [transfersOpen, setTransfersOpen] = React.useState(false)

  // ── Section 1: Spending this month ─────────────────────────────────────────
  const manualBuckets = month.fixedBuckets.filter((b) => b.type === "manual")
  const manualTotalPlanned = manualBuckets.reduce((sum, b) => sum + b.budget, 0)
  const manualTotalSpent = manualBuckets.reduce((sum, b) => {
    const actual = month.fixedBucketsActual.find((a) => a.id === b.id)
    return sum + (actual?.spent ?? 0)
  }, 0)
  const manualUsagePct = Math.round((manualTotalSpent / Math.max(1, manualTotalPlanned)) * 100)
  const manualOverCount = manualBuckets.filter((b) => {
    const actual = month.fixedBucketsActual.find((a) => a.id === b.id)
    return (actual?.spent ?? 0) > b.budget
  }).length

  // Usage bar color-toning
  const usageToneClass =
    manualUsagePct > 100
      ? semanticTextClass.expense
      : manualUsagePct >= 85
        ? semanticTextClass.warning
        : semanticTextClass.fixed
  const usageBarClass =
    manualUsagePct > 100
      ? semanticProgressClass.expense
      : manualUsagePct >= 85
        ? semanticProgressClass.warning
        : semanticProgressClass.fixed

  // ── Section 2: vs last month ─────────────────────────────────────────────
  const previousSnapshot = getPreviousSnapshot(data, month.month)
  const previousManualTotal = previousSnapshot
    ? previousSnapshot.fixedBuckets
        .filter((b) => b.type === "manual")
        .reduce((sum, b) => sum + b.budget, 0)
    : null
  const structureChange = getManualStructureChange(month, previousSnapshot)

  // Closed month actual comparison
  const prevManualActual =
    month.status === "closed" && previousSnapshot
      ? previousSnapshot.fixedBuckets
          .filter((b) => b.type === "manual")
          .reduce((sum, b) => {
            const actual = previousSnapshot.fixedBucketsActual.find((a) => a.id === b.id)
            return sum + (actual?.spent ?? 0)
          }, 0)
      : null
  const actualDelta = prevManualActual !== null ? manualTotalSpent - prevManualActual : null

  // Delta badge helper
  const deltaBadgeClass = (delta: number) =>
    delta > 0
      ? "bg-warning-subtle text-warning"
      : delta < 0
        ? "bg-income-subtle text-income"
        : "bg-surface-offset text-text-tertiary"

  // ── Section 3: Envelope transfers ───────────────────────────────────────────
  const manualTransferGroup = (month.fixedTransfers ?? []).find((g) => g.type === "manual")
  const hasTransfers = !!manualTransferGroup && manualTransferGroup.total > 0

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-[1.0625rem] font-medium text-foreground">{t("fixed.title")}</h2>
          <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
            {t("fixed.subtitle")}
          </p>
        </div>

        {/* Section 1 — Two stat tiles + bar + overrun badge */}
        <div className="rounded-[var(--radius-md)] bg-surface-offset p-4">
          {/* Stat tiles side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                {t("fixed.spentSoFar")}
              </p>
              <p dir="ltr" className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatAnalyticsCurrency(locale, manualTotalSpent)}
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                {t("fixed.planned")}
              </p>
              <p dir="ltr" className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatAnalyticsCurrency(locale, manualTotalPlanned)}
              </p>
            </div>
          </div>

          {/* Usage bar + % inline at end */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-card">
              <div
                className={cn("h-full rounded-full", usageBarClass)}
                style={{ width: `${Math.min(manualUsagePct, 100)}%` }}
              />
            </div>
            <p className={cn("shrink-0 text-xs font-medium tabular-nums", usageToneClass)}>
              {manualUsagePct}%
            </p>
          </div>

          {/* Badge — own row, start-aligned */}
          <div className="mt-3 flex justify-start">
            {manualOverCount === 0 ? (
              <span className="inline-flex items-center rounded-full bg-income-subtle px-2.5 py-1 text-xs font-medium text-income">
                {t("fixed.allWithinBudget")}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-expense-subtle px-2.5 py-1 text-xs font-medium text-expense">
                {t("fixed.someOverrunning", {
                  over: manualOverCount,
                  total: manualBuckets.length,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Section 2 — vs last month */}
        {data.snapshots.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t("fixed.noHistory")}</p>
        ) : (
          <div className="rounded-[var(--radius-md)] bg-surface-offset p-4">
            {/* Three-column planned comparison */}
            <div className="flex items-start gap-2">
              {/* This month */}
              <div className="flex-1">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                  {t("fixed.thisMonth")}
                </p>
                <p dir="ltr" className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {formatAnalyticsCurrency(locale, manualTotalPlanned)}
                </p>
              </div>

              {/* Hairline */}
              <div className="mt-1 w-px self-stretch bg-border-subtle" />

              {/* Last month */}
              <div className="flex-1">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                  {t("fixed.lastMonth")}
                </p>
                <p dir="ltr" className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {previousManualTotal !== null
                    ? formatAnalyticsCurrency(locale, previousManualTotal)
                    : "—"}
                </p>
              </div>

              {/* Hairline */}
              <div className="mt-1 w-px self-stretch bg-border-subtle" />

              {/* Change — aligned end */}
              <div className="flex-none text-end">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                  {t("fixed.change")}
                </p>
                <div className="mt-1">
                  {structureChange.type === "none" ? (
                    <span className="inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-medium text-text-tertiary shadow-ring">
                      {t("fixed.noChange")}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        deltaBadgeClass(structureChange.delta),
                      )}
                    >
                      {formatAnalyticsSignedCurrency(locale, structureChange.delta)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Caveat line — only when structure changed */}
            {structureChange.type !== "none" && (
              <p className="mt-3 border-t border-border-subtle pt-3 text-xs leading-[1.5] text-text-secondary">
                {structureChange.type === "added" && t("fixed.caveateAdded")}
                {structureChange.type === "removed" && t("fixed.caveateRemoved")}
                {structureChange.type === "raised" && t("fixed.caveateRaised")}
                {structureChange.type === "lowered" && t("fixed.caveateLowered")}
              </p>
            )}

            {/* Closed month actual comparison */}
            {actualDelta !== null && (
              <div className="mt-3 border-t border-border-subtle pt-3">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-text-tertiary">
                  {t("fixed.actualComparison")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                    {formatAnalyticsCurrency(locale, manualTotalSpent)}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      deltaBadgeClass(actualDelta),
                    )}
                  >
                    {formatAnalyticsSignedCurrency(locale, actualDelta)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3 — Envelope transfers (hidden when none) */}
        {hasTransfers && (
          <div className="rounded-[var(--radius-md)] bg-surface-offset p-4">
            {/* Header row — always visible */}
            <button
              type="button"
              aria-expanded={transfersOpen}
              onClick={() => setTransfersOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 text-start"
            >
              <span className="text-sm font-medium text-foreground">
                {t("fixed.transfers.title")}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-ring">
                  {formatAnalyticsCurrency(locale, manualTransferGroup!.total)}
                </span>
                <HugeiconsIcon
                  icon={transfersOpen ? ArrowUp01Icon : ArrowDown01Icon}
                  size={16}
                  aria-hidden="true"
                  className="text-text-tertiary"
                />
              </span>
            </button>

            {/* Expanded — per-source breakdown */}
            {transfersOpen && (
              <div className="mt-3 flex flex-col gap-3 border-t border-border-subtle pt-3">
                {manualTransferGroup!.sources.map((source) => (
                  <div key={source.bucketId} className="flex items-center justify-between gap-3">
                    {/* FROM → TO flow */}
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-fixed-subtle px-2.5 py-1 text-xs font-medium text-fixed">
                        {source.name}
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={12}
                        aria-hidden="true"
                        className="shrink-0 text-text-tertiary rtl:scale-x-[-1]"
                      />
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          source.target.type === "variable"
                            ? "bg-variable-subtle text-variable"
                            : "bg-fixed-subtle text-fixed",
                        )}
                      >
                        {source.target.type === "variable"
                          ? t("fixed.transfers.toVariable")
                          : t("fixed.transfers.toEnvelope", { name: source.target.name ?? "" })}
                      </span>
                    </div>
                    {/* Amount */}
                    <p dir="ltr" className="shrink-0 text-sm tabular-nums text-foreground">
                      {formatAnalyticsCurrency(locale, source.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
