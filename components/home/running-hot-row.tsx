"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"

import type { RunningHotCount } from "@/components/home/types"
import { Link } from "@/i18n/navigation"

type RunningHotRowProps = {
  count: RunningHotCount
}

export function RunningHotRow({ count }: RunningHotRowProps) {
  const t = useTranslations("Home.runningHot")

  if (count === null) return null

  return (
    <Link
      href="/tracker"
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface-offset px-3 py-2.5 text-start transition-opacity active:opacity-70"
    >
      <span className="min-w-0 text-sm font-medium text-text-secondary">
        {t("rowLabel", { count })}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
        {t("viewAction")}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          aria-hidden="true"
          className="rtl:rotate-180"
        />
      </span>
    </Link>
  )
}
