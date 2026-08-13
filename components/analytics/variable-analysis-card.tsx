"use client"

import { useLocale, useTranslations } from "next-intl"
import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { deriveRhythmCharacter, getPreviousSnapshot } from "@/components/analytics/data"
import {
  formatAnalyticsCurrency,
  formatAnalyticsSignedCurrency,
} from "@/components/analytics/formatters"
import type { AnalyticsData, LiveMonthAnalysis } from "@/components/analytics/types"
import { Card, CardContent } from "@/components/ui/card"
import { statTileClass } from "@/lib/design-system-classes"
import { cn } from "@/lib/utils"

type VariableAnalysisCardProps = {
  month: LiveMonthAnalysis
  data: AnalyticsData
}

type RhythmPoint = {
  day: number
  thisMonth: number | null
  evenPace: number | null
  lastMonth: number | null
}

function AxisTick({
  x = 0,
  y = 0,
  payload,
  highlightDay,
}: {
  x?: number | string
  y?: number | string
  payload?: { value?: number }
  highlightDay: number
}) {
  const value = payload?.value ?? 0
  const xPosition = typeof x === "number" ? x : Number(x)
  const yPosition = typeof y === "number" ? y : Number(y)

  return (
    <text
      x={xPosition}
      y={yPosition + 12}
      textAnchor="middle"
      fontSize={9.5}
      fontWeight={value === highlightDay ? 600 : 400}
      fill="var(--color-text-tertiary)"
    >
      {value}
    </text>
  )
}

function RhythmTooltip({
  active,
  payload,
  label,
  locale,
  thisMonthLabel,
  lastMonthLabel,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number | null }>
  label?: number
  locale: string
  thisMonthLabel: string
  lastMonthLabel: string
}) {
  if (!active || !payload?.length) return null

  const rows = payload.filter(
    (item) => item.dataKey !== "evenPace" && typeof item.value === "number",
  )

  if (rows.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-2 shadow-soft">
      <p className="text-[11px] font-medium text-text-tertiary">Day {label}</p>
      <div className="mt-1 flex flex-col gap-1">
        {rows.map((item) => {
          const seriesLabel = item.dataKey === "lastMonth" ? lastMonthLabel : thisMonthLabel

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-text-secondary">{seriesLabel}</span>
              <span dir="ltr" className="text-[11px] font-medium tabular-nums text-foreground">
                {formatAnalyticsCurrency(locale, Number(item.value))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatSignedAmount(locale: string, value: number) {
  const amount = new Intl.NumberFormat(locale).format(Math.round(Math.abs(value)))
  return `${value > 0 ? "+" : ""}${amount}`
}

export function VariableAnalysisCard({ month, data }: VariableAnalysisCardProps) {
  const locale = useLocale()
  const t = useTranslations("Analytics")
  const priorSnapshot = month.status === "closed" ? getPreviousSnapshot(data, month.month) : null
  const showOverlay = month.status === "closed" && priorSnapshot !== null
  const evenPacePerDay = month.effectiveVariableBudget / month.daysInMonth

  const chartData = React.useMemo<RhythmPoint[]>(() => {
    const totalDays = Math.max(month.daysInMonth, priorSnapshot?.daysInMonth ?? 0)

    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1
      const thisMonthValue = month.dailyVariableCumulative[index] ?? null
      const lastMonthValue = showOverlay
        ? (priorSnapshot?.dailyVariableCumulative[index] ?? null)
        : null
      const evenPaceValue = day <= month.daysInMonth ? evenPacePerDay * day : null

      return {
        day,
        thisMonth: thisMonthValue,
        evenPace: evenPaceValue,
        lastMonth: lastMonthValue,
      }
    })
  }, [evenPacePerDay, month.dailyVariableCumulative, month.daysInMonth, priorSnapshot, showOverlay])

  const highlightedTickDay = month.status === "closed" ? month.daysInMonth : month.daysTracked
  const xTicks = [1, 8, 15, 22, highlightedTickDay].filter(
    (value, index, values) => value <= highlightedTickDay && values.indexOf(value) === index,
  )

  const actualAt = month.dailyVariableCumulative[month.dailyVariableCumulative.length - 1] ?? 0
  const referenceDay = month.status === "closed" ? month.daysInMonth : month.daysTracked
  const evenPaceAt = evenPacePerDay * referenceDay
  const paceDelta = actualAt - evenPaceAt
  const isExactlyOnPace = Math.abs(paceDelta) < evenPaceAt * 0.02
  const paceToneClass = isExactlyOnPace
    ? "text-foreground"
    : paceDelta > 0
      ? "text-warning"
      : "text-income"

  const thisRhythm = deriveRhythmCharacter(month.dailyVariableCumulative)
  const lastRhythm = priorSnapshot
    ? deriveRhythmCharacter(priorSnapshot.dailyVariableCumulative)
    : null

  const totalDelta = priorSnapshot ? month.totalVariableSpent - priorSnapshot.totalVariableSpent : 0
  const relativeTotalDelta = priorSnapshot
    ? Math.abs(totalDelta) / Math.max(1, priorSnapshot.totalVariableSpent)
    : 0
  const budgetDelta = priorSnapshot
    ? month.effectiveVariableBudget - priorSnapshot.effectiveVariableBudgetFinal
    : 0
  const relativeBudgetDelta = priorSnapshot
    ? Math.abs(budgetDelta) / Math.max(1, priorSnapshot.effectiveVariableBudgetFinal)
    : 0

  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="space-y-1">
          <h2 className="text-[1.0625rem] font-medium text-foreground">{t("variable.title")}</h2>
          <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
            {t("variable.subtitle")}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 pb-1.5 text-[10.5px] text-text-secondary">
            <span dir="ltr" className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="block h-0.5 w-3.5 rounded-full"
                style={{ backgroundColor: "var(--color-variable)" }}
              />
              {t("variable.legend.thisMonth")}
            </span>
            {showOverlay ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="block h-0.5 w-3.5 rounded-full"
                  style={{ backgroundColor: "var(--color-variable)", opacity: 0.32 }}
                />
                {t("variable.legend.lastMonth")}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="block w-3.5 border-t"
                style={{
                  borderColor: "var(--color-text-tertiary)",
                  borderStyle: "dashed",
                  borderTopWidth: 1.5,
                }}
              />
              {t("variable.legend.evenPace", {
                amount: formatAnalyticsCurrency(locale, Math.round(evenPacePerDay)),
              })}
            </span>
          </div>

          <div dir="ltr">
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  vertical={false}
                  horizontalPoints={[42, 84, 126]}
                  stroke="var(--color-border-subtle)"
                />
                <XAxis
                  dataKey="day"
                  ticks={xTicks}
                  axisLine={false}
                  tickLine={false}
                  tick={(props) => <AxisTick {...props} highlightDay={highlightedTickDay} />}
                />
                <YAxis hide />
                <Tooltip
                  content={
                    <RhythmTooltip
                      locale={locale}
                      thisMonthLabel={t("variable.legend.thisMonth")}
                      lastMonthLabel={t("variable.legend.lastMonth")}
                    />
                  }
                />
                {showOverlay ? (
                  <Line
                    type="linear"
                    dataKey="lastMonth"
                    stroke="var(--color-variable)"
                    strokeWidth={2.2}
                    strokeOpacity={0.32}
                    dot={false}
                    strokeLinecap="round"
                    isAnimationActive={false}
                  />
                ) : null}
                <Line
                  type="linear"
                  dataKey="evenPace"
                  stroke="var(--color-text-tertiary)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  strokeOpacity={0.75}
                  dot={false}
                  connectNulls={false}
                  strokeLinecap="round"
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="thisMonth"
                  stroke="var(--color-variable)"
                  strokeWidth={2.5}
                  dot={
                    month.status === "inProgress"
                      ? ({
                          cx = 0,
                          cy = 0,
                          payload,
                        }: {
                          cx?: number
                          cy?: number
                          payload?: RhythmPoint
                        }) =>
                          payload?.day === month.daysTracked && payload.thisMonth !== null ? (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4.5}
                              fill="var(--color-surface)"
                              stroke="var(--color-variable)"
                              strokeWidth={2}
                            />
                          ) : null
                      : false
                  }
                  activeDot={{ r: 4.5, fill: "var(--color-variable)" }}
                  connectNulls={false}
                  strokeLinecap="round"
                  isAnimationActive={false}
                />
                {month.status === "inProgress" ? (
                  <ReferenceLine
                    x={month.daysTracked}
                    stroke="var(--color-text-tertiary)"
                    strokeDasharray="2 2"
                    strokeOpacity={0.35}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={statTileClass}>
            <p className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
              {t("variable.pace.label")}
            </p>
            {isExactlyOnPace ? (
              <p className="text-base font-semibold text-foreground">
                {t("variable.pace.exactly")}
              </p>
            ) : (
              <p dir="ltr" className={cn("text-base font-semibold tabular-nums", paceToneClass)}>
                <span>{formatSignedAmount(locale, paceDelta)}</span>
                <span className="ms-1 text-[11px] font-medium text-text-tertiary">
                  {paceDelta > 0 ? t("variable.pace.overSuffix") : t("variable.pace.underSuffix")}
                </span>
              </p>
            )}
          </div>

          <div className={statTileClass}>
            <p className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
              {t("variable.rhythm.label")}
            </p>
            <p className="text-base font-semibold text-foreground">
              {t(`variable.rhythm.${thisRhythm}`)}
            </p>
          </div>
        </div>

        <div className="h-px bg-border-subtle" />

        {month.status === "inProgress" ? (
          <p className="text-sm leading-[1.45] text-text-tertiary">
            {t("variable.compare.inProgressEmpty")}
          </p>
        ) : priorSnapshot === null ? (
          <p className="text-sm leading-[1.45] text-text-tertiary">
            {t("variable.compare.noPriorEmpty")}
          </p>
        ) : (
          <div className="rounded-md bg-surface-offset p-3 shadow-ring">
            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
                  {t("variable.compare.thisMonthLabel")}
                </p>
                <p
                  dir="ltr"
                  className="mt-1 text-[15px] font-semibold tabular-nums text-foreground"
                >
                  {formatAnalyticsCurrency(locale, month.totalVariableSpent)}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
                  {t("variable.compare.lastMonthLabel")}
                </p>
                <p
                  dir="ltr"
                  className="mt-1 text-[15px] font-medium tabular-nums text-text-secondary"
                >
                  {formatAnalyticsCurrency(locale, priorSnapshot.totalVariableSpent)}
                </p>
              </div>

              <div className="text-end">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    relativeTotalDelta <= 0.02
                      ? "bg-surface text-text-secondary shadow-ring"
                      : totalDelta > 0
                        ? "bg-warning-subtle text-warning"
                        : "bg-income-subtle text-income",
                  )}
                >
                  {relativeTotalDelta <= 0.02
                    ? t("variable.compare.deltaSame")
                    : formatAnalyticsSignedCurrency(locale, totalDelta)}
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-border-subtle pt-2.5">
              <p className="text-xs text-text-secondary">{t("variable.compare.rhythmLabel")}</p>
              <p className="text-[13px] font-medium text-foreground">
                {lastRhythm === thisRhythm ? (
                  t("variable.compare.rhythmSame")
                ) : (
                  <>
                    {t(`variable.rhythm.${lastRhythm ?? "steady"}`)}
                    <span className="mx-1 text-text-tertiary">→</span>
                    {t(`variable.rhythm.${thisRhythm}`)}
                  </>
                )}
              </p>
            </div>

            {relativeBudgetDelta > 0.05 ? (
              <p className="mt-2 border-t border-border-subtle pt-2 text-[11px] italic leading-[1.4] text-text-tertiary">
                {t("variable.compare.budgetCaveat", {
                  delta: formatAnalyticsSignedCurrency(locale, budgetDelta),
                })}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
