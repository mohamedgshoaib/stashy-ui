import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  ChartAverageIcon,
  ChartLineData01Icon,
  HelpCircleIcon,
  Invoice03Icon,
  Package01Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import * as React from "react"

import type { AddActionKind, DrawerKind } from "@/components/home/types"
import { LanguageToggle } from "@/components/language-toggle"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "@/i18n/navigation"
import {
  dateFieldClass,
  segmentedWellClass,
  surfacePanelClass,
  textAreaFieldClass,
} from "@/lib/design-system-classes"
import { getFixedExpenseItems, getSandboxAnalyticsData } from "@/lib/sandbox-budget"
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"
import { useSandboxStore } from "@/store/sandbox-store"

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeDrawerProps = {
  kind: DrawerKind | null
  direction: "ltr" | "rtl"
  onPreviewAddAction: (action: AddActionKind, amount: number) => void
  onOpenChange: (open: boolean) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

type HomeBudgetCategory = {
  id: string
  name: string
  remaining: number
  budget: number
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function HomeDrawer({ kind, direction, onPreviewAddAction, onOpenChange }: HomeDrawerProps) {
  const t = useTranslations("Home.drawer")
  const open = kind !== null
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
  const budgetCategories = React.useMemo<HomeBudgetCategory[]>(
    () =>
      getFixedExpenseItems(analyticsData.current)
        .filter((item) => item.type === "manual")
        .map((item) => ({
          id: item.id,
          name: item.name,
          remaining: item.remaining,
          budget: item.budget,
        })),
    [analyticsData],
  )
  const firstBudgetCategoryId = budgetCategories[0]?.id ?? ""

  const [selectedAction, setSelectedAction] = React.useState<AddActionKind>("variable")
  const [amount, setAmount] = React.useState("")
  const [date, setDate] = React.useState(getTodayString)
  const [method, setMethod] = React.useState<"cash" | "card" | "bank">("cash")
  const [note, setNote] = React.useState("")
  const [noteExpanded, setNoteExpanded] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>(firstBudgetCategoryId)
  const [refundTarget, setRefundTarget] = React.useState<string>("variable")
  const [isMajor, setIsMajor] = React.useState(false)

  const resetAddFlow = React.useCallback(() => {
    setSelectedAction("variable")
    setAmount("")
    setDate(getTodayString())
    setNote("")
    setNoteExpanded(false)
    setMethod("cash")
    setSelectedCategory(firstBudgetCategoryId)
    setRefundTarget("variable")
    setIsMajor(false)
  }, [firstBudgetCategoryId])

  React.useEffect(() => {
    if (!open) resetAddFlow()
  }, [open, resetAddFlow])

  const title = kind ? t(`${kind}.title`) : t("add.title")
  const description =
    kind !== "add" ? (kind ? t(`${kind}.description`) : t("add.description")) : null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent dir={direction} className="mx-auto max-w-sm">
        <DrawerHeader className="text-start">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
          {kind === "settings" ? (
            <SettingsControls />
          ) : kind === "add" ? (
            <AddFlow
              amount={amount}
              budgetCategories={budgetCategories}
              date={date}
              isMajor={isMajor}
              method={method}
              note={note}
              noteExpanded={noteExpanded}
              selectedAction={selectedAction}
              selectedCategory={selectedCategory}
              refundTarget={refundTarget}
              onAmountChange={setAmount}
              onDateChange={setDate}
              onIsMajorChange={setIsMajor}
              onMethodChange={setMethod}
              onNoteChange={setNote}
              onNoteExpandedChange={setNoteExpanded}
              onSelectedActionChange={(action) => {
                setSelectedAction(action)
                setAmount("")
                setIsMajor(false)
              }}
              onCategoryChange={setSelectedCategory}
              onRefundTargetChange={setRefundTarget}
              onCloseDrawer={() => onOpenChange(false)}
            />
          ) : kind === "help" ? (
            <HelpContent />
          ) : (
            <DrawerPreview kind={kind} />
          )}
        </div>

        {kind === "add" ? (
          <DrawerFooter>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t("add.cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onPreviewAddAction(selectedAction, Number(amount) || 0)
                  onOpenChange(false)
                }}
              >
                {t("add.save")}
              </Button>
            </div>
          </DrawerFooter>
        ) : (
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
                {t("close")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// ─── Single-screen add flow ───────────────────────────────────────────────────

function AddFlow({
  amount,
  budgetCategories,
  date,
  isMajor,
  method,
  note,
  noteExpanded,
  selectedAction,
  selectedCategory,
  refundTarget,
  onAmountChange,
  onDateChange,
  onIsMajorChange,
  onMethodChange,
  onNoteChange,
  onNoteExpandedChange,
  onSelectedActionChange,
  onCategoryChange,
  onRefundTargetChange,
  onCloseDrawer,
}: {
  amount: string
  budgetCategories: HomeBudgetCategory[]
  date: string
  isMajor: boolean
  method: "cash" | "card" | "bank"
  note: string
  noteExpanded: boolean
  selectedAction: AddActionKind
  selectedCategory: string
  refundTarget: string
  onAmountChange: (v: string) => void
  onDateChange: (v: string) => void
  onIsMajorChange: (v: boolean) => void
  onMethodChange: (v: "cash" | "card" | "bank") => void
  onNoteChange: (v: string) => void
  onNoteExpandedChange: (v: boolean) => void
  onSelectedActionChange: (v: AddActionKind) => void
  onCategoryChange: (v: string) => void
  onRefundTargetChange: (v: string) => void
  onCloseDrawer: () => void
}) {
  const t = useTranslations("Home.drawer.add")
  const router = useRouter()
  const parsedAmount = Number(amount) || 0
  const today = getTodayString()
  const methodOptions = (["cash", "card", "bank"] as const).map((v) => ({
    value: v,
    label: t(`methods.${v}`),
  }))

  const actionTypes: { key: AddActionKind; label: string }[] = [
    { key: "variable", label: t("variable.label") },
    { key: "budget", label: t("budget.label") },
    { key: "refund", label: t("refund.label") },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Type selector */}
      <div className="flex gap-1.5 rounded-full bg-surface-offset p-1">
        {actionTypes.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs font-semibold transition-all duration-150",
              selectedAction === key
                ? "bg-card shadow-ring text-foreground"
                : "text-text-secondary",
            )}
            onClick={() => onSelectedActionChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Type context tile */}
      <TypeContextTile selectedAction={selectedAction} isMajor={isMajor} />

      {/* Variable → budget hint */}
      {selectedAction === "variable" && (
        <button
          type="button"
          className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-fixed/20 bg-fixed-subtle px-3 py-2.5 shadow-ring transition-opacity active:opacity-70 w-full text-start"
          onClick={() => {
            onCloseDrawer()
            router.push("/tracker?add=budget")
          }}
        >
          <p className="flex-1 text-xs leading-[1.4] text-fixed/80 text-pretty">
            {t("variable.budgetHint")}
          </p>
          <span className="shrink-0 text-xs font-semibold text-fixed">
            {t("variable.budgetHintAction")} →
          </span>
        </button>
      )}

      {/* Variable → major toggle — row with sliding switch */}
      {selectedAction === "variable" && (
        <button
          type="button"
          onClick={() => onIsMajorChange(!isMajor)}
          className={cn(
            "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-start shadow-ring transition-colors duration-200",
            isMajor ? semanticSurfaceClass.major : "bg-surface-offset",
          )}
        >
          <HugeiconsIcon
            icon={Package01Icon}
            size={16}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-colors duration-200",
              isMajor ? semanticTextClass.major : "text-text-tertiary",
            )}
          />
          <span
            className={cn(
              "flex-1 text-xs leading-[1.4] text-pretty transition-colors duration-200",
              isMajor ? semanticTextClass.major : "text-text-secondary",
            )}
          >
            {t("variable.majorHint")}
          </span>
          {/* Sliding toggle switch */}
          <div
            className={cn(
              "relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
              isMajor ? "bg-major" : "bg-border",
            )}
            aria-hidden="true"
          >
            <div
              className={cn(
                "absolute ms-0.5 size-4 rounded-full bg-card shadow-ring transition-all duration-200",
                isMajor ? "translate-x-4" : "translate-x-0",
              )}
            />
          </div>
        </button>
      )}

      {/* Budget category scroll */}
      {selectedAction === "budget" && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
          {budgetCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === cat.id
                  ? semanticSurfaceClass.fixed + " shadow-ring"
                  : "bg-surface-offset text-text-secondary",
              )}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Refund target scroll */}
      {selectedAction === "refund" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            {t("refund.targetLabel")}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                refundTarget === "variable"
                  ? semanticSurfaceClass.income + " shadow-ring"
                  : "bg-surface-offset text-text-secondary",
              )}
              onClick={() => onRefundTargetChange("variable")}
            >
              {t("refund.targetVariable")}
            </button>
            {budgetCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  refundTarget === cat.id
                    ? semanticSurfaceClass.fixed + " shadow-ring"
                    : "bg-surface-offset text-text-secondary",
                )}
                onClick={() => onRefundTargetChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount hero input */}
      <div className="flex flex-col items-center gap-1 py-2">
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-center text-[3rem] font-bold leading-none tabular-nums text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-sm font-medium text-text-tertiary">EGP</span>
        <p
          className={cn(
            "text-xs font-medium",
            getImpactColor(selectedAction, parsedAmount, isMajor),
          )}
        >
          {getImpactLine(
            t,
            selectedAction,
            parsedAmount,
            selectedCategory,
            refundTarget,
            isMajor,
            budgetCategories,
          )}
        </p>
      </div>

      {/* Payment method */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
          {t("fields.method")}
        </p>
        <SegmentedChoice
          value={method}
          onValueChange={onMethodChange}
          options={methodOptions}
          className="grid-cols-3"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
          {t("fields.date")}
        </p>
        <div className="relative">
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => onDateChange(e.target.value)}
            className={cn(dateFieldClass, "pe-10")}
          />
          <HugeiconsIcon
            icon={Calendar03Icon}
            aria-hidden="true"
            size={17}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>
      </div>

      {/* Expandable note */}
      {noteExpanded ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            {t("fields.note")}
          </p>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={t(`${selectedAction}.notePlaceholder`)}
            className={textAreaFieldClass}
            rows={2}
          />
        </div>
      ) : (
        <button
          type="button"
          className="self-start text-xs font-medium text-text-tertiary underline-offset-2 hover:text-text-secondary"
          onClick={() => onNoteExpandedChange(true)}
        >
          + {t("fields.addNote")}
        </button>
      )}
    </div>
  )
}

// ─── Type context tile ────────────────────────────────────────────────────────

function TypeContextTile({
  selectedAction,
  isMajor,
}: {
  selectedAction: AddActionKind
  isMajor: boolean
}) {
  const t = useTranslations("Home.drawer.add")

  const config = isMajor
    ? {
        icon: Package01Icon,
        surface: semanticSurfaceClass.major,
        text: semanticTextClass.major,
        message: t("variable.majorDescription"),
      }
    : selectedAction === "variable"
      ? {
          icon: Invoice03Icon,
          surface: semanticSurfaceClass.variable,
          text: semanticTextClass.variable,
          message: t("variable.description"),
        }
      : selectedAction === "budget"
        ? {
            icon: Wallet02Icon,
            surface: semanticSurfaceClass.fixed,
            text: semanticTextClass.fixed,
            message: t("budget.description"),
          }
        : {
            icon: ArrowDown01Icon,
            surface: semanticSurfaceClass.income,
            text: semanticTextClass.income,
            message: t("refund.description"),
          }

  return (
    <div
      key={isMajor ? "major" : selectedAction}
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 shadow-ring",
        config.surface,
      )}
    >
      <HugeiconsIcon
        icon={config.icon}
        size={14}
        aria-hidden="true"
        className={cn("mt-[0.1rem] shrink-0", config.text)}
      />
      <p className={cn("text-xs leading-[1.55]", config.text)}>{config.message}</p>
    </div>
  )
}

// ─── Impact helpers ───────────────────────────────────────────────────────────

function getImpactLine(
  t: ReturnType<typeof useTranslations<"Home.drawer.add">>,
  action: AddActionKind,
  amount: number,
  categoryId: string,
  refundTarget: string,
  isMajor: boolean,
  budgetCategories: HomeBudgetCategory[],
): string {
  if (amount === 0) return t("impactEmpty")

  if (action === "variable") {
    if (isMajor) return t("variable.majorImpact", { amount: formatAmount(amount) })
    return amount > 615.38 ? t("variable.impactOver") : t("variable.impactTrack")
  }

  if (action === "refund") {
    if (refundTarget === "variable") {
      return t("refund.impactVariable", { amount: formatAmount(amount) })
    }
    const cat = budgetCategories.find((c) => c.id === refundTarget)
    return cat
      ? t("refund.impactBudget", { name: cat.name, amount: formatAmount(amount) })
      : t("refund.impactVariable", { amount: formatAmount(amount) })
  }

  if (action === "budget") {
    const cat = budgetCategories.find((c) => c.id === categoryId)
    if (!cat) return t("budget.impactNoCategory")
    const afterSpend = cat.remaining - amount
    return afterSpend >= 0
      ? t("budget.impactRemaining", { name: cat.name, amount: formatAmount(afterSpend) })
      : t("budget.impactOver", { name: cat.name, amount: formatAmount(Math.abs(afterSpend)) })
  }

  return ""
}

function getImpactColor(action: AddActionKind, amount: number, isMajor: boolean): string {
  if (amount === 0) return "text-text-tertiary"
  if (action === "variable") {
    if (isMajor) return semanticTextClass.major
    return amount > 615.38 ? semanticTextClass.expense : semanticTextClass.income
  }
  if (action === "refund") return semanticTextClass.income
  return "text-text-secondary"
}

function formatAmount(value: number) {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}

// ─── Help content ─────────────────────────────────────────────────────────────

function HelpContent() {
  const t = useTranslations("Home.drawer.help")
  const { monthlyBudgetState, dailyRateState } = useSandboxStore()
  const isOverspent = monthlyBudgetState !== "over" && dailyRateState === "overRate"

  return (
    <div className="grid gap-3">
      <div className={surfacePanelClass}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full bg-card shadow-ring",
              semanticTextClass.brand,
            )}
          >
            <HugeiconsIcon icon={ChartAverageIcon} aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{t("todayRate.title")}</p>
            <p className="mt-1 text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("todayRate.description")}
            </p>
          </div>
        </div>
      </div>

      <div className={surfacePanelClass}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full bg-card shadow-ring",
              semanticTextClass.income,
            )}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{t("remaining.title")}</p>
            <p className="mt-1 text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("remaining.description")}
            </p>
          </div>
        </div>
      </div>

      <div className={surfacePanelClass}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full bg-card shadow-ring",
              semanticTextClass.warning,
            )}
          >
            <HugeiconsIcon icon={Invoice03Icon} aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{t("major.title")}</p>
            <p className="mt-1 text-sm leading-[1.5] text-text-secondary text-pretty">
              {t("major.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-3 shadow-ring">
        <p className="text-sm font-semibold text-foreground">{t("tomorrow.title")}</p>
        <p className="mt-1 text-sm leading-[1.5] text-text-secondary text-pretty">
          {isOverspent ? t("tomorrow.overspent") : t("tomorrow.onTrack")}
        </p>
      </div>
    </div>
  )
}

// ─── Settings controls (sandbox only) ────────────────────────────────────────

function SettingsControls() {
  const t = useTranslations("Home.drawer")
  const {
    monthlyBudgetState,
    dailyRateState,
    introCardVisible,
    majorScenario,
    plan,
    budgetInjection,
    analyticsHistoryMode,
    fixedBudgetOverrun,
    fixedPaceState,
    setMonthlyBudgetState,
    setDailyRateState,
    setIntroCardVisible,
    setMajorScenario,
    setPlan,
    setBudgetInjection,
    setAnalyticsHistoryMode,
    setFixedBudgetOverrun,
    setFixedPaceState,
  } = useSandboxStore()

  const rateDisabled = monthlyBudgetState === "over"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <LanguageToggle />
      </div>
      <div className={cn("flex flex-col gap-2 text-start", surfacePanelClass)}>
        <p className="text-sm font-semibold text-foreground">Monthly budget</p>
        <Tabs
          value={monthlyBudgetState}
          onValueChange={(v) => setMonthlyBudgetState(v as "onTrack" | "atRisk" | "over")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-3")}>
            <TabsTrigger value="onTrack" className="rounded-xs text-xs">
              On track
            </TabsTrigger>
            <TabsTrigger value="atRisk" className="rounded-xs text-xs">
              At risk
            </TabsTrigger>
            <TabsTrigger value="over" className="rounded-xs text-xs">
              Over
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            rateDisabled ? "text-text-tertiary" : "text-foreground",
          )}
        >
          {"Today's rate"}
        </p>
        <Tabs
          value={dailyRateState}
          onValueChange={(v) => setDailyRateState(v as "underRate" | "overRate")}
          className={cn("gap-3", rateDisabled && "pointer-events-none opacity-40")}
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="underRate" className="rounded-xs text-xs">
              Under rate
            </TabsTrigger>
            <TabsTrigger value="overRate" className="rounded-xs text-xs">
              Over rate
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.planLabel")}</p>
        <Tabs value={plan} onValueChange={(v) => setPlan(v as "free" | "pro")} className="gap-3">
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="free" className="rounded-xs text-xs">
              {t("settings.planFree")}
            </TabsTrigger>
            <TabsTrigger value="pro" className="rounded-xs text-xs">
              {t("settings.planPro")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.introLabel")}</p>
        <Tabs
          value={introCardVisible ? "visible" : "hidden"}
          onValueChange={(v) => setIntroCardVisible(v === "visible")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="visible" className="rounded-xs text-xs">
              {t("settings.show")}
            </TabsTrigger>
            <TabsTrigger value="hidden" className="rounded-xs text-xs">
              {t("settings.hide")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs leading-[1.5] text-text-secondary text-pretty">
          {t("settings.introHint")}
        </p>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.majorLabel")}</p>
        <Tabs
          value={majorScenario}
          onValueChange={(v) => setMajorScenario(v as "active" | "none")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="active" className="rounded-xs text-xs">
              {t("settings.show")}
            </TabsTrigger>
            <TabsTrigger value="none" className="rounded-xs text-xs">
              {t("settings.hide")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.injectionLabel")}</p>
        <Tabs
          value={budgetInjection}
          onValueChange={(v) => setBudgetInjection(v as "with" | "without")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="with" className="rounded-xs text-xs">
              {t("settings.injectionWith")}
            </TabsTrigger>
            <TabsTrigger value="without" className="rounded-xs text-xs">
              {t("settings.injectionWithout")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.historyLabel")}</p>
        <Tabs
          value={analyticsHistoryMode}
          onValueChange={(v) => setAnalyticsHistoryMode(v as "withHistory" | "firstMonth")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="withHistory" className="rounded-xs text-xs">
              {t("settings.historyWith")}
            </TabsTrigger>
            <TabsTrigger value="firstMonth" className="rounded-xs text-xs">
              {t("settings.historyFirstMonth")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">
          {t("settings.fixedOverrunLabel")}
        </p>
        <Tabs
          value={fixedBudgetOverrun}
          onValueChange={(v) => setFixedBudgetOverrun(v as "none" | "some")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="none" className="rounded-xs text-xs">
              {t("settings.fixedOverrunNone")}
            </TabsTrigger>
            <TabsTrigger value="some" className="rounded-xs text-xs">
              {t("settings.fixedOverrunSome")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 h-px bg-border-subtle" />
        <p className="mt-1 text-sm font-semibold text-foreground">{t("settings.fixedPaceLabel")}</p>
        <Tabs
          value={fixedPaceState}
          onValueChange={(v) => setFixedPaceState(v as "steady" | "faster")}
          className="gap-3"
        >
          <TabsList className={cn(segmentedWellClass, "grid-cols-2")}>
            <TabsTrigger value="steady" className="rounded-xs text-xs">
              {t("settings.fixedPaceSteady")}
            </TabsTrigger>
            <TabsTrigger value="faster" className="rounded-xs text-xs">
              {t("settings.fixedPaceFaster")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Drawer preview (non-add kinds) ──────────────────────────────────────────

function DrawerPreview({ kind }: { kind: DrawerKind | null }) {
  const t = useTranslations("Home.drawer")

  if (kind === "filter") return <FilterTabs />

  return (
    <div className={cn("flex items-center gap-3 text-start", surfacePanelClass)}>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full bg-card shadow-ring",
          semanticTextClass.brand,
        )}
      >
        <HugeiconsIcon icon={getDrawerPreviewIcon(kind)} size={22} aria-hidden="true" />
      </span>
      <p className="text-sm leading-[1.5] text-text-secondary">{t("preview")}</p>
    </div>
  )
}

function FilterTabs() {
  const t = useTranslations("Home.drawer")
  return (
    <Tabs defaultValue="all" className="gap-3">
      <TabsList className="grid h-11 w-full grid-cols-3 rounded-sm bg-surface-offset p-1">
        <TabsTrigger value="all" className="rounded-xs text-xs">
          {t("filter.all")}
        </TabsTrigger>
        <TabsTrigger value="spent" className="rounded-xs text-xs">
          {t("filter.spent")}
        </TabsTrigger>
        <TabsTrigger value="received" className="rounded-xs text-xs">
          {t("filter.received")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function getDrawerPreviewIcon(kind: DrawerKind | null): IconSvgElement {
  if (kind === "add") return Add01Icon
  if (kind === "help") return HelpCircleIcon
  if (kind === "fixed") return Wallet02Icon
  return ChartLineData01Icon
}
