"use client"

import { FilterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { AppBottomNavigation } from "@/components/app-bottom-navigation"
import {
  defaultHistoryFilterState,
  getActiveHistoryFilterCount,
} from "@/components/history/history-filter-controls"
import { HistoryFilterDrawer } from "@/components/history/history-filter-drawer"
import { HistoryOverviewCard } from "@/components/history/history-overview-card"
import { HistoryRow } from "@/components/history/history-row"
import type { HistoryFilterState, HistoryTransaction } from "@/components/history/types"
import { navItems } from "@/components/home/home-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Locale } from "@/i18n/routing"
import { heroSurfaceClass, statTileClass } from "@/lib/design-system-classes"
import { getDirectionForLocale } from "@/lib/i18n"
import {
  getHistoryPresetRange,
  getHistoryTransactions,
  getSandboxAnalyticsData,
} from "@/lib/sandbox-budget"
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"
import { useSandboxStore } from "@/store/sandbox-store"

export function HistoryScreen() {
  const t = useTranslations("History")
  const tFilter = useTranslations("History.drawer.filter")
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const searchParams = useSearchParams()
  const {
    monthlyBudgetState,
    budgetInjection,
    analyticsHistoryMode,
    fixedBudgetOverrun,
    fixedPaceState,
  } = useSandboxStore()
  const [filterState, setFilterState] = React.useState<HistoryFilterState>(() => {
    const filter = searchParams.get("filter")
    const validTypes = ["all", "variable", "monthly", "budget", "major"] as const
    type ValidType = (typeof validTypes)[number]
    const isValid = (v: string | null): v is ValidType => validTypes.includes(v as ValidType)
    return isValid(filter)
      ? { ...defaultHistoryFilterState, type: filter }
      : defaultHistoryFilterState
  })
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const analyticsData = React.useMemo(
    () =>
      getSandboxAnalyticsData({
        monthlyBudgetState,
        budgetInjection,
        analyticsHistoryMode,
        fixedBudgetOverrun,
        fixedPaceState,
      }),
    [monthlyBudgetState, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun, fixedPaceState],
  )
  const items = React.useMemo(() => getHistoryTransactions(analyticsData.current), [analyticsData])

  const filteredItems = React.useMemo(
    () => filterHistoryTransactions(items, filterState, analyticsData.current),
    [analyticsData, filterState, items],
  )
  const filterCount = React.useMemo(() => getActiveHistoryFilterCount(filterState), [filterState])
  const appliedFilters = React.useMemo(
    () => getAppliedFilters(t, tFilter, filterState),
    [filterState, t, tFilter],
  )
  const overview = React.useMemo(() => getHistoryOverview(filteredItems), [filteredItems])

  return (
    <div className="min-h-svh bg-background">
      <div className="flex min-h-svh flex-col">
        <header className="bg-background px-screen pt-5">
          <h1 className="text-[1.5rem] font-semibold leading-[1.2] text-foreground">
            {t("title")}
          </h1>
          <Separator className="mt-4 bg-border-subtle" />
        </header>

        <div className="sticky top-0 z-10 bg-background px-screen pb-3 pt-4">
          <HistoryOverviewCard
            spent={overview.spent}
            received={overview.received}
            count={overview.count}
          />
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              className={cn(
                "h-10 min-h-10 shrink-0 rounded-full px-3",
                filterCount > 0 && "border-brand text-brand",
              )}
              onClick={() => setDrawerOpen(true)}
            >
              <HugeiconsIcon
                icon={FilterIcon}
                data-icon="inline-start"
                aria-hidden="true"
                className="size-4"
              />
              {filterCount > 0 ? t("filterActive", { count: filterCount }) : t("filter")}
            </Button>

            <Separator orientation="vertical" className="h-6 bg-border-subtle shrink-0" />

            <div className="flex items-center gap-2">
              {[
                { id: "variable", label: t("budgetTypes.variable") },
                { id: "monthly", label: t("budgetTypes.fixed") },
                { id: "major", label: t("budgetTypes.major") },
              ].map((qf) => {
                const isActive = filterState.type === qf.id
                return (
                  <Button
                    key={qf.id}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="xs"
                    className="h-10 min-h-10 shrink-0 rounded-full px-4 text-[0.8125rem] font-medium"
                    onClick={() => {
                      setFilterState((prev) => ({
                        ...prev,
                        type: isActive ? "all" : (qf.id as any),
                      }))
                    }}
                  >
                    {qf.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <main className="flex-1 px-screen pb-32 pt-4">
          <div className="flex flex-col gap-6">
            {filterCount > 0 ? (
              <Card size="sm" className="py-3 shadow-ring">
                <CardContent className="flex flex-col gap-3 px-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {t("resultsSummary", { count: filteredItems.length })}
                    </p>
                    <button
                      type="button"
                      className="text-sm font-medium text-brand"
                      onClick={() => setDrawerOpen(true)}
                    >
                      {t("adjustFilters")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {appliedFilters.map((label) => (
                      <span
                        key={label}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.6875rem] font-medium shadow-ring",
                          semanticSurfaceClass.quiet,
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {filteredItems.length > 0 ? (
              groupTransactionsByDate(filteredItems, locale).map((group, index, array) => (
                <React.Fragment key={group.dateISO}>
                  {group.transactions.length >= 2 ? (
                    <div className={cn("overflow-hidden", heroSurfaceClass)}>
                      <div className="flex items-center justify-between px-4 pb-2 pt-3">
                        <h2 className="text-[0.625rem] font-bold tracking-[0.05em] text-text-secondary uppercase">
                          {group.dateLabel}
                        </h2>
                        <div className="flex items-center gap-1.5 text-[0.625rem] font-bold tracking-[0.05em] text-text-tertiary uppercase">
                          <span>{t("dailyTotal")}</span>
                          <span
                            className={cn(
                              "tabular-nums",
                              group.totalNumeric >= 0
                                ? semanticTextClass.income
                                : semanticTextClass.expense,
                            )}
                          >
                            {group.totalAmount}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 p-1.5 pt-0">
                        {group.transactions.map((transaction) => (
                          <HistoryRow key={transaction.id} transaction={transaction} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    group.transactions.map((transaction) => (
                      <HistoryRow
                        key={transaction.id}
                        transaction={transaction}
                        isStandalone
                        showDate
                      />
                    ))
                  )}
                  {index < array.length - 1 && <Separator className="mt-2 opacity-50" />}
                </React.Fragment>
              ))
            ) : (
              <Card size="sm" className="py-6">
                <CardContent
                  className={cn(
                    "flex flex-col items-center gap-3 px-4 text-center",
                    heroSurfaceClass,
                  )}
                >
                  <div className="grid w-full max-w-[14rem] grid-cols-3 gap-2" aria-hidden="true">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className={cn("flex flex-col gap-2 text-start", statTileClass)}
                      >
                        <div className="h-2 w-7 rounded-full bg-text-tertiary/20" />
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            item === 0 && "w-10 bg-brand/45",
                            item === 1 && "w-12 bg-injection/40",
                            item === 2 && "w-8 bg-warning/45",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-base font-semibold text-foreground">{t("emptyTitle")}</p>
                  <p className="max-w-[26ch] text-sm leading-[1.6] text-text-secondary text-pretty">
                    {t("emptyDescription")}
                  </p>
                </CardContent>
              </Card>
            )}

            {filteredItems.length > 0 ? (
              <Button type="button" variant="secondary" size="sm" className="mt-2">
                {t("loadMore")}
              </Button>
            ) : null}
          </div>
        </main>

        <AppBottomNavigation activeValue="history" items={navItems} />
      </div>

      <HistoryFilterDrawer
        open={drawerOpen}
        direction={direction}
        filterState={filterState}
        onApplyFilters={(filters) => {
          setFilterState(filters)
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDrawerOpen(false)
          }
        }}
      />
    </div>
  )
}

function filterHistoryTransactions(
  items: HistoryTransaction[],
  filters: HistoryFilterState,
  month: Parameters<typeof getHistoryPresetRange>[0],
) {
  const { direction, from, method, preset, to, type } = filters
  const resolvedRange =
    from || to ? { from: from || null, to: to || null } : getHistoryPresetRange(month, preset)

  return items.filter((item) => {
    if (item.isTransfer && type !== "all") {
      return false
    }

    if (type !== "all" && item.typeCategory !== type) {
      return false
    }

    if (direction !== "all" && item.direction !== direction) {
      return false
    }

    if (method !== "all" && item.methodTone !== method) {
      return false
    }

    if (!resolvedRange) {
      return true
    }

    return isWithinRange(item.dateISO, resolvedRange.from, resolvedRange.to)
  })
}

function isWithinRange(dateISO: string, from: string | null, to: string | null) {
  if (from && dateISO < from) {
    return false
  }

  if (to && dateISO > to) {
    return false
  }

  return true
}

function getAppliedFilters(
  t: ReturnType<typeof useTranslations<"History">>,
  tFilter: ReturnType<typeof useTranslations<"History.drawer.filter">>,
  filters: HistoryFilterState,
) {
  const labels: string[] = []

  if (filters.type !== "all") {
    labels.push(tFilter(`typeOptions.${filters.type}`))
  }

  if (filters.direction !== "all") {
    labels.push(tFilter(`directionOptions.${filters.direction}`))
  }

  if (filters.method !== "all") {
    labels.push(tFilter(`methodOptions.${filters.method}`))
  }

  if (filters.from || filters.to) {
    labels.push(
      filters.from && filters.to
        ? t("rangeBetween", { from: filters.from, to: filters.to })
        : filters.from
          ? t("rangeFrom", { from: filters.from })
          : t("rangeTo", { to: filters.to }),
    )
  } else if (filters.preset !== "thisMonth") {
    labels.push(tFilter(`dateOptions.${filters.preset}`))
  }

  return labels
}

function getHistoryOverview(items: HistoryTransaction[]) {
  const spent = items
    .filter(
      (item) =>
        !item.isTransfer &&
        item.direction === "expense" &&
        (item.typeCategory === "variable" || item.typeCategory === "major"),
    )
    .reduce((sum, item) => sum + getNumericAmount(item), 0)

  const received = items
    .filter(
      (item) =>
        !item.isTransfer &&
        item.direction === "received" &&
        (item.typeCategory === "variable" || item.budgetTypeKey === "injection"),
    )
    .reduce((sum, item) => sum + getNumericAmount(item), 0)

  return {
    spent: formatAmount(spent),
    received: formatAmount(received),
    count: items.length,
  }
}

function groupTransactionsByDate(items: HistoryTransaction[], locale: string) {
  const groups: Record<
    string,
    {
      dateISO: string
      dateLabel: string
      transactions: HistoryTransaction[]
      totalNumeric: number
    }
  > = {}

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })

  items.forEach((item) => {
    if (!groups[item.dateISO]) {
      const date = new Date(item.dateISO)
      groups[item.dateISO] = {
        dateISO: item.dateISO,
        dateLabel: isNaN(date.getTime()) ? item.date : dateFormatter.format(date),
        transactions: [],
        totalNumeric: 0,
      }
    }

    groups[item.dateISO].transactions.push(item)

    // Calculate daily total: expenses are negative, received/transfers are positive
    const numeric = getNumericAmount(item)
    if (item.direction === "expense") {
      groups[item.dateISO].totalNumeric -= numeric
    } else {
      groups[item.dateISO].totalNumeric += numeric
    }
  })

  return Object.values(groups)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .map((group) => ({
      ...group,
      totalAmount: formatAmount(group.totalNumeric, true),
    }))
}

function parseAmount(value: string) {
  const numeric = Number(value.replaceAll(/[^\d.-]/g, ""))
  return Math.abs(numeric)
}

function getNumericAmount(item: HistoryTransaction) {
  return item.amountValue ?? parseAmount(item.amount)
}

function formatAmount(value: number, showSign = false) {
  const formatted = new Intl.NumberFormat("en").format(Math.round(Math.abs(value)))
  const currency = "EGP"

  if (!showSign) return `${formatted} ${currency}`

  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${formatted} ${currency}`
}
