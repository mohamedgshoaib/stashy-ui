"use client"

import { useTranslations } from "next-intl"

import { BudgetStripCard } from "@/components/home/budget-strip"
import { DailyRateCard } from "@/components/home/daily-rate-card"
import { navItems } from "@/components/home/home-data"
import type { UpcomingPayment } from "@/components/home/home-data"
import { MajorExpensesRowCard } from "@/components/home/major-expenses-row"
import { PlaceholderPanel } from "@/components/home/placeholder-panel"
import { RunningHotRow } from "@/components/home/running-hot-row"
import type {
  BudgetStrip,
  DailyRate,
  DrawerKind,
  MajorExpensesRow,
  RunningHotCount,
} from "@/components/home/types"
import { UpcomingPayments } from "@/components/home/upcoming-payments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"

type HomeContentProps = {
  dailyRate: DailyRate
  budgetStrip: BudgetStrip
  majorExpensesRow: MajorExpensesRow
  runningHotCount: RunningHotCount
  upcomingPayments: UpcomingPayment[]
  introCardVisible: boolean
  majorScenario: "active" | "none"
  onDismissIntroCard: () => void
  onOpenDrawer: (kind: DrawerKind) => void
}

export function HomeContent({
  dailyRate,
  budgetStrip,
  majorExpensesRow,
  runningHotCount,
  upcomingPayments,
  introCardVisible,
  majorScenario,
  onDismissIntroCard,
  onOpenDrawer,
}: HomeContentProps) {
  const t = useTranslations("Home")

  return (
    <main className="flex flex-col gap-section px-screen pb-28 pt-5">
      <h1 className="sr-only">{t("nav.home")}</h1>

      {/* Intro card — unchanged, still conditionally rendered */}
      {introCardVisible ? (
        <IntroCard onDismiss={onDismissIntroCard} onOpenDrawer={onOpenDrawer} />
      ) : null}

      {/* Budget strip — always visible */}
      <BudgetStripCard data={budgetStrip} />

      {/* Daily rate hero card */}
      <DailyRateCard rate={dailyRate} onInject={() => onOpenDrawer("add")} />

      {/* Running-hot row — conditional */}
      <RunningHotRow count={runningHotCount} />

      {/* Major expenses row — conditional */}
      {majorScenario === "active" ? <MajorExpensesRowCard data={majorExpensesRow} /> : null}

      {/* Upcoming payments */}
      <UpcomingPayments payments={upcomingPayments} onViewAll={() => onOpenDrawer("fixed")} />
    </main>
  )
}

export function SecondaryTabPanels() {
  const t = useTranslations("Home")

  return (
    <>
      {navItems.slice(1).map((item) => (
        <TabsContent key={item.value} value={item.value} className="flex-1 px-screen pb-28 pt-5">
          <PlaceholderPanel
            title={t(item.labelKey)}
            description={t(`navPlaceholders.${item.value}`)}
            icon={item.icon}
          />
        </TabsContent>
      ))}
    </>
  )
}

function IntroCard({
  onDismiss,
  onOpenDrawer,
}: {
  onDismiss: () => void
  onOpenDrawer: (kind: DrawerKind) => void
}) {
  const t = useTranslations("Home")

  return (
    <Card size="sm" className="border-brand/25 bg-card py-4 shadow-card">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {t("intro.eyebrow")}
            </p>
            <h2 className="max-w-[14ch] text-[1.75rem] font-semibold leading-[1.05] text-foreground text-balance">
              {t("intro.title")}
            </h2>
            <p className="max-w-[28ch] text-sm leading-[1.6] text-text-secondary text-pretty">
              {t("intro.description")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-full text-text-secondary transition-colors hover:text-brand"
            onClick={onDismiss}
          >
            <span className="sr-only">{t("intro.dismiss")}</span>
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" className="w-full" onClick={() => onOpenDrawer("add")}>
            {t("intro.logAction")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenDrawer("help")}
          >
            {t("intro.learnAction")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
