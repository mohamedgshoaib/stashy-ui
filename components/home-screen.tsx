"use client"

import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import { AppBottomNavigation } from "@/components/app-bottom-navigation"
import { FloatingAddButton } from "@/components/home/floating-add-button"
import { HomeContent, SecondaryTabPanels } from "@/components/home/home-content"
import { navItems } from "@/components/home/home-data"
import { HomeDrawer } from "@/components/home/home-drawer"
import { HomeHeader } from "@/components/home/home-header"
import type { DrawerKind } from "@/components/home/types"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"
import {
  getHomeBudgetStrip,
  getHomeDailyRate,
  getHomeMajorExpensesRow,
  getHomeUpcomingPayments,
  getSandboxAnalyticsData,
} from "@/lib/sandbox-budget"
import { useSandboxStore } from "@/store/sandbox-store"

export function HomeScreen() {
  const t = useTranslations("Home")
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const [drawer, setDrawer] = React.useState<DrawerKind | null>(null)
  const [activeNav, setActiveNav] = React.useState("home")

  const {
    monthlyBudgetState,
    dailyRateState,
    majorScenario,
    introCardVisible,
    budgetInjection,
    analyticsHistoryMode,
    fixedBudgetOverrun,
    fixedPaceState,
    setIntroCardVisible,
  } = useSandboxStore()

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
  const currentMonth = analyticsData.current
  const budgetStrip = React.useMemo(() => getHomeBudgetStrip(currentMonth), [currentMonth])
  const upcomingPayments = React.useMemo(
    () => getHomeUpcomingPayments(currentMonth),
    [currentMonth],
  )
  const dailyRate = React.useMemo(
    () => getHomeDailyRate(currentMonth, dailyRateState, t),
    [currentMonth, dailyRateState, t],
  )
  const majorExpensesRow = React.useMemo(
    () =>
      getHomeMajorExpensesRow(
        currentMonth,
        monthlyBudgetState === "over" ? "active" : majorScenario,
      ),
    [currentMonth, majorScenario, monthlyBudgetState],
  )

  return (
    <Tabs value={activeNav} onValueChange={setActiveNav} className="min-h-svh gap-0 bg-background">
      <div className="flex min-h-svh flex-col">
        <HomeHeader onOpenDrawer={setDrawer} />
        <TabsContent value="home" className="flex-1">
          <HomeContent
            dailyRate={dailyRate}
            budgetStrip={budgetStrip}
            majorExpensesRow={majorExpensesRow}
            upcomingPayments={upcomingPayments}
            introCardVisible={introCardVisible}
            majorScenario={monthlyBudgetState === "over" ? "active" : majorScenario}
            onDismissIntroCard={() => setIntroCardVisible(false)}
            onOpenDrawer={setDrawer}
          />
        </TabsContent>
        <SecondaryTabPanels />
        <FloatingAddButton onClick={() => setDrawer("add")} />
        <AppBottomNavigation activeValue={activeNav} items={navItems} onSelect={setActiveNav} />
      </div>

      <HomeDrawer
        kind={drawer}
        direction={direction}
        onPreviewAddAction={() => {
          // Drawer-local preview only — does not write to sandbox store
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDrawer(null)
          }
        }}
      />
    </Tabs>
  )
}
