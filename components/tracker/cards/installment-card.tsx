import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import { TrackerProgress } from "@/components/tracker/tracker-progress"
import type { FixedExpenseItem } from "@/components/tracker/types"
import { surfacePanelClass } from "@/lib/design-system-classes"
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type InstallmentCardProps = {
  item: FixedExpenseItem
  onTap: (item: FixedExpenseItem) => void
}

export function InstallmentCard({ item, onTap }: InstallmentCardProps) {
  const t = useTranslations("Tracker.fixed")

  const isPaid = item.paymentStatus === "paid"
  const pillClass = isPaid ? semanticSurfaceClass.fixed : semanticSurfaceClass.quiet
  const pillText = isPaid
    ? t("status.paid")
    : t("status.due", { date: item.nextPaymentDate ?? "" })

  return (
    <button
      type="button"
      className={cn(
        surfacePanelClass,
        "bg-card flex w-full flex-col gap-2.5 px-4 py-3 text-start",
      )}
      onClick={() => onTap(item)}
    >
      {/* Top row: name + amount + paid pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-ring-sm",
              semanticTextClass.fixed,
            )}
          >
            <HugeiconsIcon icon={item.icon} size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">{t("types.installment")}</p>
          </div>
        </div>
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
      </div>

      {/* Lifecycle progress bar */}
      {item.installmentsTotal && item.installmentsPaid !== null && (
        <>
          <TrackerProgress
            value={Math.round((item.installmentsPaid / item.installmentsTotal) * 100)}
            tone="fixed"
            showPercent
          />
          <div className="flex items-center justify-between">
            <p className="text-[0.6875rem] text-text-tertiary">
              {t("installmentProgress", {
                paid: item.installmentsPaid,
                total: item.installmentsTotal,
              })}
            </p>
            {item.endDate && (
              <p className="text-[0.6875rem] text-text-tertiary">
                {t("endsDate", { date: item.endDate })}
              </p>
            )}
          </div>
        </>
      )}
    </button>
  )
}

function formatAmount(value: number): string {
  return `${new Intl.NumberFormat("en").format(Math.round(value))} EGP`
}
