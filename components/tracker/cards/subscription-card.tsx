import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import type { FixedExpenseItem } from "@/components/tracker/types"
import { surfacePanelClass } from "@/lib/design-system-classes"
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type SubscriptionCardProps = {
  item: FixedExpenseItem
  onTap: (item: FixedExpenseItem) => void
}

export function SubscriptionCard({ item, onTap }: SubscriptionCardProps) {
  const t = useTranslations("Tracker.fixed")

  const isPaid = item.paymentStatus === "paid"

  const pillClass = isPaid
    ? semanticSurfaceClass.fixed   // Teal Ledger "Paid ✓"
    : semanticSurfaceClass.quiet   // Neutral "Due [date]" — always upcoming

  const pillText = isPaid
    ? t("status.paid")
    : t("status.due", { date: item.nextPaymentDate ?? "" })

  return (
    <button
      type="button"
      className={cn(
        surfacePanelClass,
        "bg-card flex w-full items-center justify-between gap-3 px-4 py-3 text-start",
      )}
      onClick={() => onTap(item)}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-ring-sm",
          semanticTextClass.fixed,
        )}
      >
        <HugeiconsIcon icon={item.icon} size={20} aria-hidden="true" />
      </span>

      {/* Name + type label */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">
          {t("types.recurring")}
        </p>
      </div>

      {/* Right side: amount + status pill */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p
          dir="ltr"
          className="text-sm font-semibold tabular-nums text-foreground"
        >
          {formatAmount(item.budget)}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold",
            pillClass,
          )}
        >
          {isPaid ? `${pillText} ✓` : pillText}
        </span>
      </div>
    </button>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}
