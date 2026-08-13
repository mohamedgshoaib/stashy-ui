import { Wallet02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import { BudgetCard } from "@/components/tracker/cards/budget-card"
import type { FixedExpenseItem } from "@/components/tracker/types"
import { semanticTextClass } from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

type BudgetsSectionProps = {
  items: FixedExpenseItem[]
  fasterBucketIds: ReadonlySet<string>
  onCardTap: (item: FixedExpenseItem) => void
}

export function BudgetsSection({ items, fasterBucketIds, onCardTap }: BudgetsSectionProps) {
  const t = useTranslations("Tracker.fixed")

  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className={cn("flex items-center gap-2", semanticTextClass.fixed)}>
          <HugeiconsIcon icon={Wallet02Icon} size={18} aria-hidden="true" />
          <span className="text-[1.0625rem] font-semibold">{t("sections.budgets")}</span>
        </div>
        <span className="text-xs font-medium tabular-nums text-text-tertiary">{items.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <BudgetCard
            key={item.id}
            item={item}
            fasterThanUsual={fasterBucketIds.has(item.id)}
            onTap={onCardTap}
          />
        ))}
      </div>
    </section>
  )
}
