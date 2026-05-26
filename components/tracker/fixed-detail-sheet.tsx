"use client"

import { Exchange01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import * as React from "react"

import { TrackerProgress } from "@/components/tracker/tracker-progress"
import type { FixedExpenseItem, FixedExpenseStatus } from "@/components/tracker/types"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { elevatedPanelClass } from "@/lib/design-system-classes"
import { type Locale } from "@/i18n/routing"
import { getDirectionForLocale } from "@/lib/i18n"
import {
  semanticSurfaceClass,
  semanticTextClass,
} from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type FixedDetailSheetProps = {
  item: FixedExpenseItem | null
  onClose: () => void
  onEdit: (item: FixedExpenseItem) => void
  onTransfer: (item: FixedExpenseItem) => void
}

const statusBudgetTone: Record<FixedExpenseStatus, "income" | "warning" | "expense"> = {
  on_track: "income",
  warning: "warning",
  over_budget: "expense",
}

export function FixedDetailSheet({ item, onClose, onEdit, onTransfer }: FixedDetailSheetProps) {
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const t = useTranslations("Tracker.fixed")

  return (
    <Drawer open={item !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        {item && <SheetBody item={item} t={t} direction={direction} onEdit={onEdit} onTransfer={onTransfer} />}
      </DrawerContent>
    </Drawer>
  )
}

// ─── Inner body (only rendered when item is non-null) ─────────────────────────

type SheetBodyProps = {
  item: FixedExpenseItem
  t: ReturnType<typeof useTranslations<"Tracker.fixed">>
  direction: "ltr" | "rtl"
  onEdit: (item: FixedExpenseItem) => void
  onTransfer: (item: FixedExpenseItem) => void
}

function SheetBody({ item, t, direction: _direction, onEdit, onTransfer }: SheetBodyProps) {
  const typeBadgeClass =
    item.type === "manual"
      ? semanticSurfaceClass.brand
      : semanticSurfaceClass.fixed

  return (
    <>
      <DrawerHeader className="gap-2 px-5 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-ring-sm",
                semanticTextClass.fixed,
              )}
            >
              <HugeiconsIcon icon={item.icon} size={20} aria-hidden="true" />
            </span>
            <DrawerTitle className="truncate text-base font-semibold text-foreground">
              {item.name}
            </DrawerTitle>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
              typeBadgeClass,
            )}
          >
            {t(`types.${item.type}`)}
          </span>
        </div>
        <DrawerDescription className="sr-only">
          {item.name} {t(`types.${item.type}`)}
        </DrawerDescription>

        {/* Monthly amount */}
        <p
          dir="ltr"
          className="text-[1.25rem] font-semibold tabular-nums text-foreground"
        >
          {formatAmount(item.budget)}
        </p>
      </DrawerHeader>

      {/* Type-specific body */}
      <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-2">
        {item.type === "recurring" && (
          <RecurringBody item={item} t={t} />
        )}
        {item.type === "installment" && (
          <InstallmentBody item={item} t={t} />
        )}
        {item.type === "manual" && (
          <ManualBody item={item} t={t} />
        )}

        {/* Transaction list */}
        {item.transactions.length > 0 && (
          <TransactionList item={item} t={t} />
        )}
      </div>

      <DrawerFooter className="px-5 pb-6 pt-3">
        <div className="flex gap-2">
          {item.type !== "manual" && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => console.log("Pay Now — mock, no-op")}
            >
              {t("payNow")}
            </Button>
          )}
          {item.type === "manual" && (
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-transfer/25 bg-transfer-subtle px-3 py-2.5 text-sm font-semibold text-transfer shadow-ring transition-opacity active:opacity-70 hover:opacity-80"
              onClick={() => onTransfer(item)}
            >
              <HugeiconsIcon icon={Exchange01Icon} size={15} aria-hidden="true" />
              {t("transfer")}
            </button>
          )}
          <Button
            variant="outline"
            onClick={() => onEdit(item)}
          >
            {t("edit")}
          </Button>
        </div>
      </DrawerFooter>
    </>
  )
}

// ─── Type-specific sections ────────────────────────────────────────────────────

function RecurringBody({
  item,
  t,
}: {
  item: FixedExpenseItem
  t: ReturnType<typeof useTranslations<"Tracker.fixed">>
}) {
  if (!item.nextPaymentDate) return null

  return (
    <div className={cn(elevatedPanelClass, "px-4 py-3")}>
      <p className="text-xs text-text-tertiary">
        {t("status.due", { date: item.nextPaymentDate })}
      </p>
    </div>
  )
}

function InstallmentBody({
  item,
  t,
}: {
  item: FixedExpenseItem
  t: ReturnType<typeof useTranslations<"Tracker.fixed">>
}) {
  if (item.installmentsPaid === null || !item.installmentsTotal) return null

  return (
    <div className={cn(elevatedPanelClass, "flex flex-col gap-2.5 px-4 py-3")}>
      <TrackerProgress
        value={Math.round((item.installmentsPaid / item.installmentsTotal) * 100)}
        tone="fixed"
        showPercent
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          {t("installmentProgress", {
            paid: item.installmentsPaid,
            total: item.installmentsTotal,
          })}
        </p>
        {item.endDate && (
          <p className="text-xs text-text-tertiary">
            {t("endsDate", { date: item.endDate })}
          </p>
        )}
      </div>
    </div>
  )
}

function ManualBody({
  item,
  t,
}: {
  item: FixedExpenseItem
  t: ReturnType<typeof useTranslations<"Tracker.fixed">>
}) {
  const tone = statusBudgetTone[item.status]
  const overClass = semanticTextClass[tone]
  const isOver = item.status === "over_budget"
  const overAmount = Math.abs(item.remaining)

  return (
    <div className={cn(elevatedPanelClass, "flex flex-col gap-2.5 px-4 py-3")}>
      <div className="flex items-center justify-between">
        <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
          {formatAmount(item.paid)} <span className="font-normal text-text-tertiary">/ {formatAmount(item.budget)}</span>
        </p>
      </div>
      <TrackerProgress value={Math.min(item.progressPct, 100)} tone={tone} showPercent />
      <p className={cn("text-xs font-medium", overClass)}>
        {isOver
          ? t("over", { amount: formatAmount(overAmount) })
          : t("remaining", { amount: formatAmount(item.remaining) })}
      </p>
    </div>
  )
}

// ─── Shared transaction list ───────────────────────────────────────────────────

function TransactionList({
  item,
  t,
}: {
  item: FixedExpenseItem
  t: ReturnType<typeof useTranslations<"Tracker.fixed">>
}) {
  return (
    <div className="flex flex-col gap-2">
      {item.transactions.map((txn) => (
        <div
          key={txn.id}
          className={cn(
            elevatedPanelClass,
            "flex items-center justify-between gap-3 px-4 py-3",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">
              {txn.description ?? item.name}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-xs text-text-tertiary">{txn.date}</p>
              {txn.isAutoPayment && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[0.5625rem] font-semibold",
                    semanticSurfaceClass.fixed,
                  )}
                >
                  {t("autoPayBadge")}
                </span>
              )}
            </div>
          </div>
          <p
            dir="ltr"
            className={cn(
              "shrink-0 text-sm font-semibold tabular-nums",
              txn.direction === "expense"
                ? semanticTextClass.expense
                : semanticTextClass.income,
            )}
          >
            {txn.direction === "expense" ? "−" : "+"}{formatAmount(txn.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}
