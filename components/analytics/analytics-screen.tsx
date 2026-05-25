"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import { AnalyticsUpgradeGate } from "@/components/analytics/analytics-cards"
import { BudgetCompositionCard } from "@/components/analytics/budget-composition-card"
import { getAnalyticsDataForScenario, getMonthView, getPreviousSnapshot } from "@/components/analytics/data"
import { FixedAnalysisCard } from "@/components/analytics/fixed-analysis-card"
import { MethodObligationCard } from "@/components/analytics/method-obligation-card"
import { formatAnalyticsMonthLabel } from "@/components/analytics/formatters"
import { FlaggedAsMajorCard } from "@/components/analytics/flagged-as-major-card"
import { MonthPickerDrawer } from "@/components/analytics/month-picker-drawer"
import { MonthlyHealthCard } from "@/components/analytics/monthly-health-card"
import { PaymentMethodCard } from "@/components/analytics/payment-method-card"
import { SectionHeader } from "@/components/analytics/section-header"
import { TrendsCard } from "@/components/analytics/trends-card"
import { VariableAnalysisCard } from "@/components/analytics/variable-analysis-card"
import { AppBottomNavigation } from "@/components/app-bottom-navigation"
import { navItems } from "@/components/home/home-data"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useSandboxStore } from "@/store/sandbox-store"

export function AnalyticsScreen() {
  const locale = useLocale() as Locale
  const t = useTranslations("Analytics")
  const direction = getDirectionForLocale(locale)
  const { monthlyBudgetState, plan, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun } = useSandboxStore()
  const baseAnalyticsData = getAnalyticsDataForScenario(monthlyBudgetState)

  // Patch live month based on sandbox settings — closed months are unaffected
  const analyticsData = React.useMemo(() => {
    let data = baseAnalyticsData

    // Patch budget injection
    if (budgetInjection === "with" && data.current.status === "inProgress") {
      data = {
        ...data,
        current: { ...data.current, injectionTotal: 1000, injectionCount: 1 },
      }
    }

    // Patch first-month (no history) mode
    if (analyticsHistoryMode === "firstMonth") {
      data = { ...data, snapshots: [] }
    }

    // Patch with-history mode: give April different manual budgets + remove fb-spotify
    // so both FixedAnalysisCard and MethodObligationCard show meaningful deltas.
    //
    // FixedAnalysisCard: April manual total 360 vs May 440 → +80 EGP "raised" badge + caveat line
    // MethodObligationCard: Spotify absent from April → reason = "newRecurring" → note fires
    //   (committed delta stays +20 EGP from the underlying paymentMethods amounts)
    if (analyticsHistoryMode === "withHistory" && data.snapshots.length > 0) {
      const [latestSnapshot, ...rest] = data.snapshots
      data = {
        ...data,
        snapshots: [
          {
            ...latestSnapshot,
            fixedBuckets: latestSnapshot.fixedBuckets
              .filter((b) => b.id !== "fb-spotify") // make Spotify look new in May
              .map((b) => {
                if (b.id === "fb-coffee") return { ...b, budget: 160 }
                if (b.id === "fb-groceries") return { ...b, budget: 200 }
                return b
              }),
          },
          ...rest,
        ],
      }
    }

    // Patch fixed budget overruns — make manual buckets exceed their budgets
    if (fixedBudgetOverrun === "some" && data.current.status === "inProgress") {
      data = {
        ...data,
        current: {
          ...data.current,
          fixedBucketsActual: data.current.fixedBucketsActual.map((a) => {
            if (a.id === "fb-coffee") return { ...a, spent: 240 } // over 200 budget
            if (a.id === "fb-groceries") return { ...a, spent: 320 } // over 240 budget
            return a
          }),
        },
      }
    }

    return data
  }, [baseAnalyticsData, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun])
  const [selectedMonthId, setSelectedMonthId] = React.useState<string>(analyticsData.current.month)
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false)

  const selectedMonth = React.useMemo(
    () => getMonthView(analyticsData, selectedMonthId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analyticsData, selectedMonthId],
  )

  const previousSnapshot = getPreviousSnapshot(analyticsData, selectedMonthId)
  const prevPaymentMethods = previousSnapshot?.paymentMethods ?? null

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="bg-background px-screen pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[1.5rem] font-semibold leading-[1.2] text-foreground">
              {t("title")}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className="text-sm tabular-nums">
                <span className="font-semibold text-foreground">{selectedMonth.daysTracked}</span>
                <span className="text-text-tertiary">{t("meta.labelTracked")}</span>
              </span>
              <span className="text-border-subtle" aria-hidden="true">·</span>
              <span className="text-sm tabular-nums">
                <span className="font-semibold text-foreground">{selectedMonth.daysRemaining}</span>
                <span className="text-text-tertiary">{t("meta.labelLeft")}</span>
              </span>
              <span className="text-border-subtle" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-offset px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    selectedMonth.status === "inProgress"
                      ? "bg-text-secondary"
                      : "bg-text-tertiary/50",
                  )}
                />
                {selectedMonth.status === "inProgress" ? t("month.inProgress") : t("month.closed")}
              </span>
            </div>          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full bg-card"
            onClick={() => setMonthPickerOpen(true)}
          >
            <HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" aria-hidden="true" />
            {formatAnalyticsMonthLabel(locale, selectedMonth.isoDate)}
          </Button>
        </div>
        <Separator className="mt-4 bg-border-subtle" />
      </header>

      <main className="flex-1 pb-32">
        {plan === "free" ? (
          <div className="px-screen pt-4">
            <AnalyticsUpgradeGate />
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-screen pt-2">
            <SectionHeader
              title={t("section.onPace.title")}
              subtitle={t("section.onPace.subtitle")}
              showDivider={false}
            />
            <MonthlyHealthCard month={selectedMonth} />

            <SectionHeader
              title={t("section.where.title")}
              subtitle={t("section.where.subtitle")}
            />
            <BudgetCompositionCard month={selectedMonth} />
            <PaymentMethodCard month={selectedMonth} prevPaymentMethods={prevPaymentMethods} />
            <FixedAnalysisCard month={selectedMonth} data={analyticsData} />
            <MethodObligationCard month={selectedMonth} data={analyticsData} />
            <VariableAnalysisCard month={selectedMonth} data={analyticsData} />
            <FlaggedAsMajorCard month={selectedMonth} data={analyticsData} />

            <SectionHeader
              title={t("section.improving.title")}
              subtitle={t("section.improving.subtitle")}
            />
            <TrendsCard data={analyticsData} selectedMonth={selectedMonth} />
          </div>
        )}
      </main>

      <MonthPickerDrawer
        direction={direction}
        open={monthPickerOpen}
        selectedMonthId={selectedMonth.month}
        onOpenChange={setMonthPickerOpen}
        onSelectMonth={setSelectedMonthId}
      />

      <AppBottomNavigation activeValue="analytics" items={navItems} />
    </div>
  )
}
