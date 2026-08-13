"use client"

import {
  Add01Icon,
  Alert01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import type { LiveMonthAnalysis } from "@/components/analytics/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  semanticProgressClass,
  semanticSurfaceClass,
  semanticTextClass,
} from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

export function MonthlyHealthCard({ month }: { month: LiveMonthAnalysis }) {
  const t = useTranslations("Analytics")
  const state = month.monthlyState

  // ─── Badge config ─────────────────────────────────────────────────────────────
  const badgeConfig = {
    onTrack: {
      surfaceClass: semanticSurfaceClass.income,
      icon: CheckmarkCircle02Icon,
      label: t("monthlyHealth.badgeOnTrack"),
    },
    atRisk: {
      surfaceClass: semanticSurfaceClass.warning,
      icon: Alert01Icon,
      label: t("monthlyHealth.badgeAtRisk"),
    },
    over: {
      surfaceClass: semanticSurfaceClass.expense,
      icon: AlertCircleIcon,
      label: t("monthlyHealth.badgeOver"),
    },
  }[state]

  // ─── Hero number ──────────────────────────────────────────────────────────────
  const rolloverAbs = Math.abs(month.rolloverEgp)
  const heroSign = state === "onTrack" ? "+" : "−"
  const heroColorClass =
    state === "onTrack" ? semanticTextClass.income : semanticTextClass.expense
  const heroLabel = {
    onTrack: t("monthlyHealth.heroLabelAhead"),
    atRisk: t("monthlyHealth.heroLabelBehind"),
    over: t("monthlyHealth.heroLabelOver"),
  }[state]

  // ─── Projection / context sentence ────────────────────────────────────────────
  const projectionNode = {
    onTrack: (
      <p className="text-sm leading-[1.55] text-text-secondary text-pretty">
        {t("monthlyHealth.projectionOnTrack")}
      </p>
    ),
    atRisk: (
      <p className="text-sm leading-[1.55] text-text-secondary text-pretty">
        {t("monthlyHealth.projectionAtRisk", {
          amount: Math.abs(month.projectedSavings).toLocaleString(),
        })}
      </p>
    ),
    over: (
      <p className="text-sm leading-[1.55] text-text-secondary text-pretty">
        {t("monthlyHealth.contextOver")}
      </p>
    ),
  }[state]

  // ─── Bar fill color ───────────────────────────────────────────────────────────
  const barFillClass =
    state === "onTrack" ? semanticProgressClass.income : semanticProgressClass.warning

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        {/* State badge */}
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            badgeConfig.surfaceClass,
          )}
        >
          <HugeiconsIcon icon={badgeConfig.icon} size={13} aria-hidden="true" />
          {badgeConfig.label}
        </span>

        {/* Hero number + label */}
        <div className="flex items-end gap-2">
          <p
            dir="ltr"
            className={cn(
              "text-[2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums",
              heroColorClass,
            )}
          >
            {heroSign}
            {rolloverAbs.toLocaleString()} EGP
          </p>
          <p className="pb-0.5 text-sm text-text-secondary">{heroLabel}</p>
        </div>

        {/* Projection / context sentence */}
        {projectionNode}

        <Separator className="bg-border-subtle" />

        {/* Stats row */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs uppercase tracking-[0.08em] text-text-tertiary">
              {t("monthlyHealth.statBudgetUsed")}
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {month.budgetUsedPct}%
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs uppercase tracking-[0.08em] text-text-tertiary">
              {t("monthlyHealth.statMonthProgress")}
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {month.monthProgressPct}%
            </p>
          </div>
        </div>

        {/* Progress bar — hidden for hard-over states */}
        {state !== "over" ? (
          <div className="relative pb-5">
            <div
              className="relative h-1.5 overflow-visible rounded-full bg-surface-offset"
              role="img"
              aria-label={t("monthlyHealth.statBudgetUsed")}
            >
              {/* Budget used fill */}
              <div
                className={cn("absolute inset-y-0 start-0 rounded-full", barFillClass)}
                style={{ width: `${Math.min(100, month.budgetUsedPct)}%` }}
              />

              {/* Month progress tick */}
              <div
                className="absolute top-1/2 w-0.5 -translate-y-1/2 rounded-full bg-text-tertiary/60"
                style={{
                  height: "14px",
                  insetInlineStart: `${Math.min(100, month.monthProgressPct)}%`,
                }}
              />
            </div>

            {/* Tick label */}
            <div
              className="absolute top-4 text-[0.625rem] text-text-tertiary"
              style={{
                insetInlineStart: `${Math.min(100, month.monthProgressPct)}%`,
                transform: "translateX(-50%)",
              }}
            >
              {t("monthlyHealth.barTickLabel")}
            </div>
          </div>
        ) : null}

        {/* Inject button — over state only */}
        {state === "over" ? (
          <Button
            type="button"
            className="w-full bg-injection-subtle text-injection hover:bg-injection-subtle/80"
            variant="ghost"
            onClick={() => console.log("inject")}
          >
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" aria-hidden="true" />
            {t("monthlyHealth.injectButton")}
          </Button>
        ) : null}

        {/* Days line */}
        <p className="text-xs text-text-tertiary">
          {t("monthlyHealth.daysLine", {
            tracked: month.daysTracked,
            remaining: month.daysRemaining,
          })}
        </p>
      </CardContent>
    </Card>
  )
}
