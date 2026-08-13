"use client"

import * as React from "react"

import { deriveBucketPaceFlag } from "@/components/analytics/data"
import { FixedDetailSheet } from "@/components/tracker/fixed-detail-sheet"
import { FixedSummaryCard } from "@/components/tracker/fixed-summary-card"
import { BudgetsSection } from "@/components/tracker/sections/budgets-section"
import { InstallmentsSection } from "@/components/tracker/sections/installments-section"
import { SubscriptionsSection } from "@/components/tracker/sections/subscriptions-section"
import { TrackerAddDrawer } from "@/components/tracker/tracker-add-drawer"
import { TrackerTransferDrawer } from "@/components/tracker/tracker-transfer-drawer"
import type {
  FixedExpenseItem,
  FixedTrackerSummary,
  InstallmentOverview,
} from "@/components/tracker/types"
import { getFixedExpenseItems, getSandboxAnalyticsData } from "@/lib/sandbox-budget"
import { useSandboxStore } from "@/store/sandbox-store"

function buildSummary(items: FixedExpenseItem[]): FixedTrackerSummary {
  const totalBudgeted = items.reduce((sum, item) => sum + item.budget, 0)
  const totalPaid = items.reduce((sum, item) => sum + item.paid, 0)
  const totalRemaining = totalBudgeted - totalPaid
  const pct = totalBudgeted > 0 ? (totalPaid / totalBudgeted) * 100 : 0

  return {
    totalBudgeted,
    totalPaid,
    totalRemaining,
    paidProgressClass: `basis-[${Math.min(Math.round(pct), 100)}%]`,
    overallStatus: pct > 100 ? "over_budget" : pct >= 75 ? "warning" : "on_track",
    overBudgetItems: items
      .filter((item) => item.type === "manual" && item.status === "over_budget")
      .map((item) => ({ name: item.name, overageAmount: Math.abs(item.remaining) })),
  }
}

function buildInstallmentOverview(items: FixedExpenseItem[]): InstallmentOverview {
  const installmentItems = items.filter((item) => item.type === "installment")

  return {
    monthlyObligation: installmentItems.reduce((sum, item) => sum + item.budget, 0),
    totalPaidAllTime: installmentItems.reduce(
      (sum, item) => sum + (item.installmentsPaid ?? 0) * item.budget,
      0,
    ),
    totalRemainingAllTime: installmentItems.reduce(
      (sum, item) => sum + (item.installmentsRemaining ?? 0) * item.budget,
      0,
    ),
  }
}

export function TrackerFixedTab() {
  const {
    monthlyBudgetState,
    budgetInjection,
    analyticsHistoryMode,
    fixedBudgetOverrun,
    fixedPaceState,
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
  const [items, setItems] = React.useState<FixedExpenseItem[]>(() =>
    getFixedExpenseItems(analyticsData.current),
  )
  const [selectedItem, setSelectedItem] = React.useState<FixedExpenseItem | null>(null)
  const [editingItem, setEditingItem] = React.useState<FixedExpenseItem | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [transferItem, setTransferItem] = React.useState<FixedExpenseItem | null>(null)
  const [transferOpen, setTransferOpen] = React.useState(false)

  const recurringItems = items.filter((item) => item.type === "recurring")
  const installmentItems = items.filter((item) => item.type === "installment")
  const manualItems = items.filter((item) => item.type === "manual")
  const summary = React.useMemo(() => buildSummary(items), [items])
  const installmentOverview = React.useMemo(() => buildInstallmentOverview(items), [items])
  const fasterManualBucketIds = React.useMemo(() => {
    const manualBudgetById = new Map(manualItems.map((item) => [item.id, item.budget]))
    const paceComparisonMonth = {
      ...analyticsData.current,
      fixedBuckets: analyticsData.current.fixedBuckets.map((bucket) => ({
        ...bucket,
        budget: manualBudgetById.get(bucket.id) ?? bucket.budget,
      })),
    }

    return new Set(
      manualItems
        .filter((item) =>
          deriveBucketPaceFlag(item.id, paceComparisonMonth, analyticsData.snapshots),
        )
        .map((item) => item.id),
    )
  }, [analyticsData, manualItems])

  function handleEdit(item: FixedExpenseItem) {
    setSelectedItem(null)
    setEditingItem(item)
    setEditOpen(true)
  }

  function handleSave(item: FixedExpenseItem) {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id)
      return exists
        ? current.map((entry) => (entry.id === item.id ? item : entry))
        : [item, ...current]
    })

    setSelectedItem((current) => (current?.id === item.id ? item : current))
    setEditingItem(null)
  }

  function handleTransfer(item: FixedExpenseItem) {
    setSelectedItem(null)
    setTransferItem(item)
    setTransferOpen(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <FixedSummaryCard summary={summary} />
      <BudgetsSection
        items={manualItems}
        fasterBucketIds={fasterManualBucketIds}
        onCardTap={setSelectedItem}
      />
      <SubscriptionsSection items={recurringItems} onCardTap={setSelectedItem} />
      <InstallmentsSection
        items={installmentItems}
        overview={installmentOverview}
        onCardTap={setSelectedItem}
      />
      <FixedDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
        onTransfer={handleTransfer}
      />
      <TrackerAddDrawer
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingItem(null)
        }}
        editItem={editingItem}
        onSave={handleSave}
      />
      <TrackerTransferDrawer
        open={transferOpen}
        sourceItem={transferItem}
        items={items}
        onOpenChange={(open) => {
          setTransferOpen(open)
          if (!open) setTransferItem(null)
        }}
      />
    </div>
  )
}
