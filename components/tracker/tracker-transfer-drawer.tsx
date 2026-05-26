"use client"

import { ArrowUpRight01Icon, ChartIncreaseIcon, Exchange01Icon, Wallet02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import type { FixedExpenseItem } from "@/components/tracker/types"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { inputFieldClass, surfacePanelClass } from "@/lib/design-system-classes"
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"
import { getDirectionForLocale } from "@/lib/i18n"
import type { Locale } from "@/i18n/routing"
import { getHomeBudgetStrip, getSandboxAnalyticsData } from "@/lib/sandbox-budget"
import { useSandboxStore } from "@/store/sandbox-store"

// ─── Types ────────────────────────────────────────────────────────────────────

type Destination = { id: string; label: string; sublabel?: string }

type TrackerTransferDrawerProps = {
  open: boolean
  sourceItem: FixedExpenseItem | null
  items: FixedExpenseItem[]
  onOpenChange: (open: boolean) => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TrackerTransferDrawer({
  open,
  sourceItem,
  items,
  onOpenChange,
}: TrackerTransferDrawerProps) {
  const t = useTranslations("Tracker.transfer")
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const { monthlyBudgetState, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun } = useSandboxStore()
  const analyticsData = React.useMemo(
    () =>
      getSandboxAnalyticsData({
        monthlyBudgetState,
        budgetInjection,
        analyticsHistoryMode,
        fixedBudgetOverrun,
      }),
    [monthlyBudgetState, budgetInjection, analyticsHistoryMode, fixedBudgetOverrun],
  )
  const budgetStrip = React.useMemo(() => getHomeBudgetStrip(analyticsData.current), [analyticsData])

  const remaining = sourceItem ? Math.max(0, sourceItem.remaining) : 0
  const { daysRemaining } = budgetStrip

  const [amount, setAmount] = React.useState("")
  const [destinationId, setDestinationId] = React.useState("variable")

  React.useEffect(() => {
    if (open && sourceItem) {
      setAmount(remaining > 0 ? String(remaining) : "")
      setDestinationId("variable")
    }
  }, [open, sourceItem, remaining])

  if (!sourceItem) return null

  // All other manual budgets (excluding source)
  const otherBudgets = items.filter(
    (item) => item.type === "manual" && item.id !== sourceItem.id,
  )

  const destinations: Destination[] = [
    {
      id: "variable",
      label: t("destinationVariable"),
      sublabel: t("destinationVariableSub"),
    },
    ...otherBudgets.map((item) => ({
      id: item.id,
      label: item.name,
      sublabel:
        item.remaining > 0
          ? t("destinationBudgetSub", { amount: formatAmount(item.remaining) })
          : t("destinationBudgetFull"),
    })),
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="text-start">
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>
            {t("description", { name: sourceItem.name })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-2">
          {/* Amount */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              {t("amountLabel")}
            </p>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={cn(inputFieldClass, "pe-14")}
              />
              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-tertiary">
                EGP
              </span>
            </div>
            {remaining > 0 && (
              <p className="text-xs text-text-tertiary">
                {t("availableHint", { amount: formatAmount(remaining) })}
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              {t("destinationLabel")}
            </p>
            <div className="flex flex-col gap-1.5">
              {destinations.map((dest) => {
                const isSelected = dest.id === destinationId
                return (
                  <button
                    key={dest.id}
                    type="button"
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-start shadow-ring transition-colors",
                      isSelected
                        ? semanticSurfaceClass.transfer
                        : "bg-surface-offset",
                    )}
                    onClick={() => setDestinationId(dest.id)}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full shadow-ring",
                        isSelected ? "bg-transfer/15" : "bg-card",
                      )}
                    >
                      <HugeiconsIcon
                        icon={dest.id === "variable" ? ArrowUpRight01Icon : Exchange01Icon}
                        size={14}
                        aria-hidden="true"
                        className={isSelected ? semanticTextClass.transfer : "text-text-tertiary"}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? semanticTextClass.transfer : "text-foreground",
                        )}
                      >
                        {dest.label}
                      </p>
                      {dest.sublabel && (
                        <p className="text-xs text-text-tertiary">{dest.sublabel}</p>
                      )}
                    </div>
                    {isSelected && (
                      <span className={cn("text-xs font-semibold", semanticTextClass.transfer)}>
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live impact preview */}
          {Number(amount) > 0 && (
            <ImpactPreview
              amount={Number(amount)}
              destinationId={destinationId}
              destinations={destinations}
              daysRemaining={daysRemaining}
              t={t}
            />
          )}
        </div>

        <DrawerFooter>
          <div className="grid grid-cols-2 gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
                {t("cancel")}
              </Button>
            </DrawerClose>
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-transfer px-4 text-[1.0625rem] font-semibold text-primary-foreground shadow-soft transition-[background-color,transform] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90"
              onClick={() => onOpenChange(false)}
            >
              <HugeiconsIcon icon={Exchange01Icon} size={18} aria-hidden="true" />
              {t("confirm")}
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ─── Impact preview ───────────────────────────────────────────────────────────

function ImpactPreview({
  amount,
  destinationId,
  destinations,
  daysRemaining,
  t,
}: {
  amount: number
  destinationId: string
  destinations: Destination[]
  daysRemaining: number
  t: ReturnType<typeof useTranslations<"Tracker.transfer">>
}) {
  const isVariable = destinationId === "variable"
  const destLabel = destinations.find((d) => d.id === destinationId)?.label ?? ""

  if (isVariable) {
    const rateIncrease = daysRemaining > 0 ? amount / daysRemaining : 0

    return (
      <div className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 shadow-ring",
        semanticSurfaceClass.income,
      )}>
        <HugeiconsIcon
          icon={ChartIncreaseIcon}
          size={15}
          aria-hidden="true"
          className={cn("mt-0.5 shrink-0", semanticTextClass.income)}
        />
        <div className="space-y-0.5">
          <p className={cn("text-xs font-semibold", semanticTextClass.income)}>
            {t("impactVariableRate", {
              rate: formatAmount(rateIncrease),
              days: daysRemaining,
            })}
          </p>
          <p className="text-xs text-text-secondary">
            {t("impactVariablePool", { amount: formatAmount(amount) })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 shadow-ring",
      semanticSurfaceClass.fixed,
    )}>
      <HugeiconsIcon
        icon={Wallet02Icon}
        size={15}
        aria-hidden="true"
        className={cn("mt-0.5 shrink-0", semanticTextClass.fixed)}
      />
      <p className={cn("text-xs font-semibold", semanticTextClass.fixed)}>
        {t("impactBudget", { amount: formatAmount(amount), name: destLabel })}
      </p>
    </div>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(Math.abs(value)))} EGP`
}
