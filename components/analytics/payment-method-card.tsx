"use client"

import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"

import { formatAnalyticsCurrency } from "@/components/analytics/formatters"
import type { LiveMonthAnalysis, PaymentMethodBreakdown } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethodCardProps {
  month: LiveMonthAnalysis
  prevPaymentMethods?: PaymentMethodBreakdown[] | null
}

// ─── Split item config ────────────────────────────────────────────────────────

const SPLIT_ITEMS = [
  {
    key: "fixed" as const,
    chipClass: "bg-fixed-subtle text-fixed",
    labelKey: "methods.fixedLabel",
  },
  {
    key: "variable" as const,
    chipClass: "bg-variable-subtle text-variable",
    labelKey: "methods.variableLabel",
  },
  {
    key: "major" as const,
    chipClass: "bg-major-subtle text-major",
    labelKey: "methods.majorLabel",
  },
] as const

// ─── Delta pill ───────────────────────────────────────────────────────────────

interface DeltaPillProps {
  delta: number
  locale: string
  labelNoChange: string
  labelVsPreviousMonth: string
}

function DeltaPill({ delta, locale, labelNoChange, labelVsPreviousMonth }: DeltaPillProps) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-offset px-2.5 py-0.5 text-xs font-medium text-text-tertiary">
        {labelNoChange}
      </span>
    )
  }

  const isIncrease = delta > 0
  const absAmount = formatAnalyticsCurrency(locale, Math.abs(delta))

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
          isIncrease ? "bg-expense-subtle text-expense" : "bg-income-subtle text-income",
        )}
      >
        <HugeiconsIcon
          icon={isIncrease ? ArrowUp01Icon : ArrowDown01Icon}
          size={11}
          className="shrink-0 rtl:rotate-180"
        />
        <span dir="ltr" className="tabular-nums">
          {absAmount}
        </span>
      </span>
      <span className="text-xs text-text-tertiary">{labelVsPreviousMonth}</span>
    </span>
  )
}

// ─── Budget bar ───────────────────────────────────────────────────────────────

interface BudgetBarProps {
  grandTotal: number
  monthlyBudget: number
  injectionTotal: number
  fixedSpent: number
  variableSpent: number
  majorSpent: number
  locale: string
  t: ReturnType<typeof useTranslations<"Analytics">>
}

function BudgetBar({
  grandTotal,
  monthlyBudget,
  injectionTotal,
  fixedSpent,
  variableSpent,
  majorSpent,
  locale,
  t,
}: BudgetBarProps) {
  const hasInjection = injectionTotal > 0
  const totalCapacity = monthlyBudget + injectionTotal
  const variableSpendExcludingMajor = Math.max(0, variableSpent - majorSpent)

  // Compute each segment as a share of total capacity, sequentially capped so
  // they never collectively exceed 100 %.
  const fixedPct = totalCapacity > 0 ? Math.min((fixedSpent / totalCapacity) * 100, 100) : 0
  const variablePct =
    totalCapacity > 0
      ? Math.min((variableSpendExcludingMajor / totalCapacity) * 100, 100 - fixedPct)
      : 0
  const majorPct =
    totalCapacity > 0
      ? Math.min((majorSpent / totalCapacity) * 100, 100 - fixedPct - variablePct)
      : 0
  const injectionPct = hasInjection
    ? Math.min((injectionTotal / totalCapacity) * 100, 100 - fixedPct - variablePct - majorPct)
    : 0

  const displayPct = monthlyBudget > 0 ? Math.round((grandTotal / monthlyBudget) * 100) : 0
  const formattedBudget = new Intl.NumberFormat(locale).format(monthlyBudget)

  return (
    <div className="flex flex-col gap-2">
      {/* Segmented bar: fixed | variable | major | injection (optional) | empty track */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-offset shadow-ring">
        <div className="h-full bg-fixed" style={{ width: `${fixedPct}%` }} />
        <div className="h-full bg-variable" style={{ width: `${variablePct}%` }} />
        {majorPct > 0 && <div className="h-full bg-major" style={{ width: `${majorPct}%` }} />}
        {hasInjection && (
          <div className="h-full bg-injection opacity-60" style={{ width: `${injectionPct}%` }} />
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-tertiary">
          {t(hasInjection ? "methods.budgetUsedPctOriginal" : "methods.budgetUsedPct", {
            pct: displayPct,
          })}
        </span>
        <span dir="ltr" className="shrink-0 text-xs tabular-nums text-text-tertiary">
          {t("methods.budgetTotal", { budget: formattedBudget })}
        </span>
      </div>

      {/* Spending type legend */}
      <div className="flex flex-wrap gap-2">
        {fixedSpent > 0 && (
          <span className="inline-flex items-center rounded-full bg-fixed-subtle px-2.5 py-0.5 text-xs font-medium text-fixed">
            <span dir="ltr" className="tabular-nums">
              {formatAnalyticsCurrency(locale, fixedSpent)}
            </span>
          </span>
        )}
        {variableSpendExcludingMajor > 0 && (
          <span className="inline-flex items-center rounded-full bg-variable-subtle px-2.5 py-0.5 text-xs font-medium text-variable">
            <span dir="ltr" className="tabular-nums">
              {formatAnalyticsCurrency(locale, variableSpendExcludingMajor)}
            </span>
          </span>
        )}
        {majorSpent > 0 && (
          <span className="inline-flex items-center rounded-full bg-major-subtle px-2.5 py-0.5 text-xs font-medium text-major">
            <span dir="ltr" className="tabular-nums">
              {formatAnalyticsCurrency(locale, majorSpent)}
            </span>
          </span>
        )}
      </div>

      {/* Injection note */}
      {hasInjection && (
        <div className="flex items-center gap-1.5">
          <span className="size-[7px] shrink-0 rounded-full bg-injection" />
          <span className="text-xs font-medium text-injection">
            {t("methods.injectionNote", {
              amount: new Intl.NumberFormat(locale).format(injectionTotal),
            })}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Method row ───────────────────────────────────────────────────────────────

interface MethodRowProps {
  method: PaymentMethodBreakdown
  prevMethod: PaymentMethodBreakdown | null
  monthStatus: LiveMonthAnalysis["status"]
  grandTotal: number
  locale: string
  t: ReturnType<typeof useTranslations<"Analytics">>
}

function MethodRow({ method, prevMethod, monthStatus, grandTotal, locale, t }: MethodRowProps) {
  const delta = prevMethod !== null ? method.total - prevMethod.total : null
  const showDelta = monthStatus === "closed" && delta !== null
  const pct = grandTotal > 0 ? Math.round((method.total / grandTotal) * 100) : 0

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-3">
      <div className="flex flex-col gap-2">
        {/* Layer 1 — Method name + total + % share */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.9375rem] font-medium text-foreground">{method.name}</span>
          <span className="flex shrink-0 items-baseline gap-1.5">
            <span dir="ltr" className="text-[1.0625rem] font-semibold tabular-nums text-foreground">
              {formatAnalyticsCurrency(locale, method.total)}
            </span>
            <span className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full bg-card px-2 py-0.5 text-xs tabular-nums text-text-tertiary shadow-ring">
              {pct}%
            </span>
          </span>
        </div>

        {/* Layer 2 — Identity chips (only non-zero) */}
        <div className="flex flex-wrap gap-1.5">
          {SPLIT_ITEMS.map(({ key, chipClass }) => {
            const amount = method[key]
            if (amount <= 0) return null
            return (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  chipClass,
                )}
              >
                <span dir="ltr" className="tabular-nums">
                  {formatAnalyticsCurrency(locale, amount)}
                </span>
              </span>
            )
          })}
        </div>

        {/* Layer 3 — Delta pill (closed months only, when prev data exists) */}
        {showDelta && (
          <div className="flex items-center">
            <DeltaPill
              delta={delta}
              locale={locale}
              labelNoChange={t("methods.deltaNoChange")}
              labelVsPreviousMonth={t("methods.deltaVsPreviousMonth")}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function PaymentMethodCard({ month, prevPaymentMethods }: PaymentMethodCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")

  const activeMethods = month.paymentMethods.filter((m) => m.total > 0)
  const grandTotal =
    activeMethods.reduce((sum, m) => sum + m.total, 0) - month.variableReceivedTotal
  const isInProgress = month.status === "inProgress"
  const formattedHeroNumber = new Intl.NumberFormat(locale).format(grandTotal)

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          {/* Row 1: title + subtitle */}
          <div className="space-y-1">
            <h2 className="text-[1.0625rem] font-medium text-foreground">{t("methods.title")}</h2>
            <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("methods.subtitle")}
            </p>
          </div>

          {/* Row 2: hero number */}
          <div className="flex items-baseline gap-1.5">
            <span
              dir="ltr"
              className="text-[2rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground"
            >
              {formattedHeroNumber}
            </span>
            <span className="text-[0.9375rem] font-medium text-text-tertiary">
              {t("methods.egpSpent")}
            </span>
          </div>

          {/* Row 3+: budget bar (in-progress) or spend-type chips (closed) */}
          {isInProgress ? (
            <BudgetBar
              grandTotal={grandTotal}
              monthlyBudget={month.monthlyBudget}
              injectionTotal={month.injectionTotal}
              fixedSpent={month.wholeBudgetCloseout.fixedSpentTotal}
              variableSpent={month.wholeBudgetCloseout.variableSpentTotal}
              majorSpent={month.wholeBudgetCloseout.majorSpentTotal}
              locale={locale}
              t={t}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {month.wholeBudgetCloseout.fixedSpentTotal > 0 && (
                <span className="inline-flex items-center rounded-full bg-fixed-subtle px-2.5 py-0.5 text-xs font-medium text-fixed">
                  <span dir="ltr" className="tabular-nums">
                    {formatAnalyticsCurrency(locale, month.wholeBudgetCloseout.fixedSpentTotal)}
                  </span>
                </span>
              )}
              {month.wholeBudgetCloseout.variableSpentTotal > 0 && (
                <span className="inline-flex items-center rounded-full bg-variable-subtle px-2.5 py-0.5 text-xs font-medium text-variable">
                  <span dir="ltr" className="tabular-nums">
                    {formatAnalyticsCurrency(locale, month.wholeBudgetCloseout.variableSpentTotal)}
                  </span>
                </span>
              )}
              {month.wholeBudgetCloseout.majorSpentTotal > 0 && (
                <span className="inline-flex items-center rounded-full bg-major-subtle px-2.5 py-0.5 text-xs font-medium text-major">
                  <span dir="ltr" className="tabular-nums">
                    {formatAnalyticsCurrency(locale, month.wholeBudgetCloseout.majorSpentTotal)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="-mx-4 border-t border-border" />

        {/* Method tiles */}
        <div className="flex flex-col gap-1.5">
          {activeMethods.map((method) => {
            const prevMethod = prevPaymentMethods?.find((m) => m.id === method.id) ?? null
            return (
              <MethodRow
                key={method.id}
                method={method}
                prevMethod={prevMethod}
                monthStatus={month.status}
                grandTotal={grandTotal}
                locale={locale}
                t={t}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
