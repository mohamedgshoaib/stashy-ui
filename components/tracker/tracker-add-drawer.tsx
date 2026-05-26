"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BankIcon,
  Calendar03Icon,
  CreditCardIcon,
  Search01Icon,
  Layers01Icon,
  MoneyBag02Icon,
  RepeatIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

import {
  getDefaultTrackerFixedIconKey,
  getTrackerFixedIconOption,
  getTrackerFixedIcon,
  TRACKER_FIXED_ICON_OPTIONS,
} from "@/components/tracker/fixed-icons"
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
import { SegmentedChoice } from "@/components/ui/segmented-choice"
import { dateFieldClass, inputFieldClass } from "@/lib/design-system-classes"
import { semanticSurfaceClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"
import { getDirectionForLocale } from "@/lib/i18n"
import type { Locale } from "@/i18n/routing"

// ─── Types ────────────────────────────────────────────────────────────────────

type AddType = "budget" | "recurring" | "installment"
type PaymentMethodValue = "cash" | "card" | "bank"
type IconPickerView = "form" | "iconPicker"
type IconFilter = "recommended" | "all"
type FixedItemDraft = Pick<
  FixedExpenseItem,
  | "id"
  | "name"
  | "iconKey"
  | "icon"
  | "type"
  | "budget"
  | "paid"
  | "remaining"
  | "progressPct"
  | "progressClass"
  | "status"
  | "paymentStatus"
  | "nextPaymentDate"
  | "installmentsTotal"
  | "installmentsPaid"
  | "installmentsRemaining"
  | "installmentProgressClass"
  | "endDate"
  | "transactions"
>

const typeMap: Record<FixedExpenseItem["type"], AddType> = {
  manual: "budget",
  recurring: "recurring",
  installment: "installment",
}

type TrackerAddDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: FixedExpenseItem | null
  defaultAddType?: AddType
  onSave?: (item: FixedItemDraft) => void
}

function progressClass(pct: number): string {
  const capped = Math.min(Math.round(pct), 100)
  return `basis-[${capped}%]`
}

function installmentProgressClass(paid: number, total: number): string {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0
  return `basis-[${pct}%]`
}

function inferPaymentMethod(item: FixedExpenseItem): PaymentMethodValue {
  if (item.type === "manual") return "cash"
  return item.paymentStatus === "paid" ? "card" : "bank"
}

function toExpenseType(addType: AddType): FixedExpenseItem["type"] {
  if (addType === "budget") return "manual"
  return addType
}

function createDateLabel(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)
}

function createInstallmentEndLabel(dateString: string): string | null {
  if (!dateString) return null

  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date)
}

function buildFixedItemDraft({
  addType,
  amount,
  editItem,
  endDate,
  iconKey,
  name,
  startDate,
  totalInstallments,
}: {
  addType: AddType
  amount: string
  editItem?: FixedExpenseItem | null
  endDate: string
  iconKey: FixedExpenseItem["iconKey"]
  name: string
  startDate: string
  totalInstallments: string
}): FixedItemDraft {
  const type = toExpenseType(addType)
  const budget = Math.max(0, Number(amount) || 0)
  const isInstallment = type === "installment"
  const isRecurring = type === "recurring"
  const installmentsTotal = isInstallment ? Math.max(1, Number(totalInstallments) || 1) : null
  const installmentsPaid = editItem?.type === "installment"
    ? editItem.installmentsPaid
    : isInstallment
      ? 0
      : null
  const installmentsRemaining =
    installmentsTotal !== null && installmentsPaid !== null
      ? Math.max(0, installmentsTotal - installmentsPaid)
      : null

  return {
    id: editItem?.id ?? `draft-${type}-${Date.now()}`,
    name: name.trim(),
    iconKey,
    icon: getTrackerFixedIcon(iconKey),
    type,
    budget,
    paid: editItem?.paid ?? 0,
    remaining: Math.max(0, budget - (editItem?.paid ?? 0)),
    progressPct: budget > 0 ? ((editItem?.paid ?? 0) / budget) * 100 : 0,
    progressClass: progressClass(budget > 0 ? ((editItem?.paid ?? 0) / budget) * 100 : 0),
    status: editItem?.status ?? "on_track",
    paymentStatus: type === "manual" ? "unpaid" : editItem?.paymentStatus ?? "unpaid",
    nextPaymentDate: isRecurring ? createDateLabel(startDate) : editItem?.nextPaymentDate ?? null,
    installmentsTotal,
    installmentsPaid,
    installmentsRemaining,
    installmentProgressClass:
      installmentsTotal !== null && installmentsPaid !== null
        ? installmentProgressClass(installmentsPaid, installmentsTotal)
        : null,
    endDate: isInstallment ? createInstallmentEndLabel(endDate) : null,
    transactions: editItem?.transactions ?? [],
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setMonth(d.getMonth() + months)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function monthsBetween(startStr: string, endStr: string): number {
  const start = new Date(`${startStr}T00:00:00`)
  const end = new Date(`${endStr}T00:00:00`)
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()),
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TrackerAddDrawer({
  open,
  onOpenChange,
  editItem,
  defaultAddType = "budget",
  onSave,
}: TrackerAddDrawerProps) {
  const t = useTranslations("Tracker.add")
  const locale = useLocale() as Locale
  const direction = getDirectionForLocale(locale)
  const isEdit = editItem != null

  const [addType, setAddType] = React.useState<AddType>(defaultAddType)
  const [name, setName] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [iconKey, setIconKey] = React.useState<FixedExpenseItem["iconKey"]>(
    getDefaultTrackerFixedIconKey("manual"),
  )
  const [view, setView] = React.useState<IconPickerView>("form")
  const [iconFilter, setIconFilter] = React.useState<IconFilter>("recommended")
  const [iconSearch, setIconSearch] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodValue>("cash")
  const [startDate, setStartDate] = React.useState(getTodayString)
  const [endDate, setEndDate] = React.useState("")
  const [totalInstallments, setTotalInstallments] = React.useState("")
  const [lastInstField, setLastInstField] = React.useState<"endDate" | "count">("endDate")

  const reset = React.useCallback(() => {
    setAddType(defaultAddType)
    setName("")
    setAmount("")
    setIconKey(getDefaultTrackerFixedIconKey(toExpenseType(defaultAddType)))
    setView("form")
    setIconFilter("recommended")
    setIconSearch("")
    setPaymentMethod("cash")
    setStartDate(getTodayString())
    setEndDate("")
    setTotalInstallments("")
    setLastInstField("endDate")
  }, [defaultAddType])

  // Pre-fill when opening in edit mode, reset when closing
  React.useEffect(() => {
    if (open && editItem) {
      setAddType(typeMap[editItem.type])
      setName(editItem.name)
      setAmount(String(editItem.budget))
      setIconKey(editItem.iconKey)
      setPaymentMethod(inferPaymentMethod(editItem))
      if (editItem.type === "installment") {
        const count = editItem.installmentsTotal ?? 0
        setTotalInstallments(count > 0 ? String(count) : "")
      }
    } else if (open && !editItem) {
      setAddType(defaultAddType)
      setIconKey(getDefaultTrackerFixedIconKey(toExpenseType(defaultAddType)))
    } else if (!open) {
      reset()
    }
  }, [open, editItem, defaultAddType, reset])

  React.useEffect(() => {
    if (editItem || !open) return
    setIconKey(getDefaultTrackerFixedIconKey(toExpenseType(addType)))
  }, [addType, editItem, open])

  React.useEffect(() => {
    if (!open) return
    setIconFilter("recommended")
    setIconSearch("")
  }, [addType, open])

  function handleTotalInstallmentsChange(value: string) {
    setTotalInstallments(value)
    setLastInstField("count")
    const n = parseInt(value)
    if (!isNaN(n) && n > 0 && startDate) {
      setEndDate(addMonths(startDate, n))
    }
  }

  function handleEndDateChange(value: string) {
    setEndDate(value)
    setLastInstField("endDate")
    if (startDate && value) {
      const months = monthsBetween(startDate, value)
      if (months > 0) setTotalInstallments(String(months))
    }
  }

  function handleStartDateChange(value: string) {
    setStartDate(value)
    if (lastInstField === "count") {
      const n = parseInt(totalInstallments)
      if (!isNaN(n) && n > 0) setEndDate(addMonths(value, n))
    } else if (endDate) {
      const months = monthsBetween(value, endDate)
      if (months > 0) setTotalInstallments(String(months))
    }
  }

  const typeConfig: { key: AddType; icon: typeof Wallet02Icon }[] = [
    { key: "budget", icon: Wallet02Icon },
    { key: "recurring", icon: RepeatIcon },
    { key: "installment", icon: Layers01Icon },
  ]

  const methodOptions: { value: PaymentMethodValue; label: string; icon: React.ReactNode }[] = [
    { value: "cash", label: t("fields.methods.cash"), icon: <HugeiconsIcon icon={MoneyBag02Icon} size={16} aria-hidden="true" /> },
    { value: "card", label: t("fields.methods.card"), icon: <HugeiconsIcon icon={CreditCardIcon} size={16} aria-hidden="true" /> },
    { value: "bank", label: t("fields.methods.bank"), icon: <HugeiconsIcon icon={BankIcon} size={16} aria-hidden="true" /> },
  ]

  const syncReady = addType === "installment" && totalInstallments !== "" && endDate !== ""
  const needsPaymentMethod = addType === "recurring" || addType === "installment"
  const selectedIcon = getTrackerFixedIcon(iconKey)
  const selectedIconOption = getTrackerFixedIconOption(iconKey)
  const expenseType = toExpenseType(addType)
  const iconOptions = React.useMemo(() => {
    const query = iconSearch.trim().toLowerCase()
    const baseOptions =
      iconFilter === "recommended"
        ? TRACKER_FIXED_ICON_OPTIONS.filter((option) => option.recommendedFor.includes(expenseType))
        : TRACKER_FIXED_ICON_OPTIONS

    return baseOptions.filter((option) => {
      if (!query) return true

      const haystack = [option.labelKey, ...option.keywords].join(" ").toLowerCase()
      return haystack.includes(query)
    })
  }, [expenseType, iconFilter, iconSearch])

  const disclosureIcon = direction === "rtl" ? ArrowLeft01Icon : ArrowRight01Icon

  const handleSave = () => {
    onSave?.(
      buildFixedItemDraft({
        addType,
        amount,
        editItem,
        endDate,
        iconKey,
        name,
        startDate,
        totalInstallments,
      }),
    )
    onOpenChange(false)
  }

  const handleIconSelect = (nextIconKey: FixedExpenseItem["iconKey"]) => {
    setIconKey(nextIconKey)
    setView("form")
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="text-start">
          <div className="flex items-center gap-3">
            {view === "iconPicker" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="shrink-0"
                onClick={() => setView("form")}
                aria-label={t("fields.backToForm")}
              >
                <HugeiconsIcon icon={direction === "rtl" ? ArrowRight01Icon : ArrowLeft01Icon} size={16} aria-hidden="true" />
              </Button>
            ) : null}
            <div className="min-w-0 text-start">
              <DrawerTitle>{view === "iconPicker" ? t("fields.chooseIcon") : isEdit ? t("editTitle") : t("title")}</DrawerTitle>
              {view !== "iconPicker" ? <DrawerDescription>{t(`description.${addType}`)}</DrawerDescription> : null}
            </div>
          </div>
        </DrawerHeader>

        {view === "iconPicker" ? (
          <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-hidden px-4 pb-2">
            <div className="relative shrink-0">
              <input
                type="search"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder={t("fields.searchIcons")}
                className={cn(inputFieldClass, "pe-10")}
              />
              <HugeiconsIcon
                icon={Search01Icon}
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {([
                { key: "recommended", label: t("fields.recommendedIcons") },
                { key: "all", label: t("fields.allIcons") },
              ] as const).map((filter) => {
                const isActive = iconFilter === filter.key
                return (
                  <Button
                    key={filter.key}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="xs"
                    className="h-10 min-h-10 shrink-0 rounded-full px-4 text-[0.8125rem] font-medium"
                    onClick={() => setIconFilter(filter.key)}
                  >
                    {filter.label}
                  </Button>
                )
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">
              {iconOptions.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const isSelected = option.key === iconKey

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={cn(
                          "flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-2 text-center shadow-ring transition-colors active:scale-[0.96]",
                          isSelected ? semanticSurfaceClass.fixed : "bg-surface-offset text-text-secondary",
                        )}
                        onClick={() => handleIconSelect(option.key)}
                      >
                        <HugeiconsIcon
                          icon={option.icon}
                          size={18}
                          aria-hidden="true"
                          className={isSelected ? "text-fixed" : "text-text-secondary"}
                        />
                        <span className="text-[0.625rem] font-semibold leading-tight">
                          {t(`fields.iconOptions.${option.labelKey}`)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-32 items-center justify-center rounded-[var(--radius-sm)] bg-surface-offset px-4 text-center text-sm text-text-secondary shadow-ring">
                  {t("fields.noIconsFound")}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-2">
          {/* Type selector — read-only in edit mode */}
          <div className="flex gap-1.5 rounded-full bg-surface-offset p-1">
            {typeConfig.map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                disabled={isEdit}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-all duration-150",
                  addType === key
                    ? "bg-card shadow-ring text-foreground"
                    : "text-text-secondary",
                  isEdit && addType !== key && "opacity-40",
                )}
                onClick={() => !isEdit && setAddType(key)}
              >
                <HugeiconsIcon icon={icon} size={12} aria-hidden="true" />
                {t(`types.${key}`)}
              </button>
            ))}
          </div>

          {/* Name */}
          <FormField label={t("fields.name")}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(`fields.namePlaceholder.${addType}`)}
              className={inputFieldClass}
            />
          </FormField>

          <FormField label={t("fields.icon")}>
            <button
              type="button"
              className="flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-sm)] bg-surface-offset px-3 py-2.5 text-start shadow-ring transition-colors active:scale-[0.96]"
              onClick={() => setView("iconPicker")}
            >
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full bg-card shadow-ring-sm", semanticSurfaceClass.fixed)}>
                <HugeiconsIcon icon={selectedIcon} size={20} aria-hidden="true" className="text-fixed" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {t(`fields.iconOptions.${selectedIconOption.labelKey}`)}
                </p>
                <p className="text-xs text-text-tertiary">{t("fields.tapToChange")}</p>
              </div>
              <HugeiconsIcon icon={disclosureIcon} size={16} aria-hidden="true" className="shrink-0 text-text-secondary" />
            </button>
          </FormField>

          {/* Amount */}
          <FormField
            label={addType === "budget" ? t("fields.monthlyBudget") : t("fields.monthlyAmount")}
          >
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
          </FormField>

          {/* Payment method — Recurring and Installment only */}
          {needsPaymentMethod && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                {t("fields.paymentMethod")}
              </p>
              <SegmentedChoice
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethodValue)}
                options={methodOptions}
                className="grid-cols-3"
              />
            </div>
          )}

          {/* Recurring: start date */}
          {addType === "recurring" && (
            <FormField
              label={t("fields.startDate")}
              hint={t("fields.recurringStartHint")}
            >
              <DateInput value={startDate} onChange={setStartDate} />
            </FormField>
          )}

          {/* Installment: start date + bidirectional end date / count */}
          {addType === "installment" && (
            <>
              <FormField label={t("fields.startDate")}>
                <DateInput value={startDate} onChange={handleStartDateChange} />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label={t("fields.totalInstallments")}
                  hint={t("fields.totalInstallmentsHint")}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={totalInstallments}
                    onChange={(e) => handleTotalInstallmentsChange(e.target.value)}
                    placeholder="12"
                    className={inputFieldClass}
                  />
                </FormField>

                <FormField label={t("fields.endDate")} hint={t("fields.endDateHint")}>
                  <DateInput
                    value={endDate}
                    min={startDate}
                    onChange={handleEndDateChange}
                  />
                </FormField>
              </div>

              {syncReady && (
                <div className={cn("rounded-[var(--radius-sm)] px-3 py-2.5 shadow-ring", semanticSurfaceClass.fixed)}>
                  <p className="text-xs leading-[1.5]">
                    {t("fields.installmentSyncHint", { count: totalInstallments, endDate })}
                  </p>
                </div>
              )}
            </>
          )}
          </div>
        )}

        <DrawerFooter>
          <div className="grid grid-cols-2 gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
                {t("cancel")}
              </Button>
            </DrawerClose>
            {view === "iconPicker" ? (
              <Button type="button" variant="default" onClick={() => setView("form")}>
                {t("fields.done")}
              </Button>
            ) : (
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-fixed px-4 text-[1.0625rem] font-semibold text-primary-foreground shadow-soft transition-[background-color,transform] duration-200 ease-[var(--ease-stashy)] active:scale-[0.96] hover:opacity-90"
                onClick={handleSave}
              >
                {isEdit ? t("saveEdit") : t("save")}
              </button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ─── Shared form primitives ───────────────────────────────────────────────────

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </span>
      {hint && (
        <span className="block text-xs leading-[1.5] text-text-secondary">{hint}</span>
      )}
      {children}
    </label>
  )
}

function DateInput({ value, min, onChange }: { value: string; min?: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className={cn(dateFieldClass, "pe-10")}
      />
      <HugeiconsIcon
        icon={Calendar03Icon}
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-secondary"
      />
    </div>
  )
}
