"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import type { BudgetStrip } from "@/components/home/types";

type BudgetStripProps = {
  data: BudgetStrip;
};

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en")} EGP`;
}

export function BudgetStripCard({ data }: BudgetStripProps) {
  const t = useTranslations("Home");
  const {
    fixedTotal,
    fixedRemaining,
    variableTotal,
    variableSpent,
    variableRemaining,
    majorSpent,
    totalRemaining,
    daysRemaining,
  } = data;

  const total = fixedTotal + variableTotal;
  const fixedPct = total > 0 ? (fixedTotal / total) * 100 : 0;
  // Split variable segment: pure variable (excluding major) + major carved out of it.
  // majorSpent is already included in variableSpent, so the total bar fill stays unchanged.
  const varPurePct = total > 0 ? Math.min(((variableSpent - majorSpent) / total) * 100, 100 - fixedPct) : 0;
  const majorPct   = total > 0 ? Math.min((majorSpent / total) * 100, 100 - fixedPct - varPurePct) : 0;

  return (
    <Card size="sm" className="py-3">
      <CardContent className="flex flex-col gap-0 px-4">
      {/* Top row */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <p className="text-xs text-text-secondary">{t("strip.remainingMonth")}</p>
          <p dir="ltr" className="text-sm font-medium text-income">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
        <p className="text-xs text-text-secondary text-end">
          {t("strip.daysRemaining", { count: daysRemaining })}
        </p>
      </div>

      {/* Segmented composition bar */}
      <div
        className="my-3 flex h-2 overflow-hidden rounded-full bg-surface-offset shadow-ring"
        aria-label="Budget composition"
      >
        <div
          className="bg-fixed"
          style={{ width: `${fixedPct}%` }}
        />
        <div
          className="bg-variable"
          style={{ width: `${varPurePct}%` }}
        />
        {majorPct > 0 && (
          <div
            className="bg-major"
            style={{ width: `${majorPct}%` }}
          />
        )}
      </div>

      {/* Bottom row */}
      <div className="flex justify-between gap-2">
        {/* Fixed left */}
        <div>
          <p className="text-xs text-text-secondary">
            {t("strip.fixedLeft")}
          </p>
          <p dir="ltr" className="text-sm font-medium text-fixed">
            {formatCurrency(fixedRemaining)}
          </p>
        </div>

        {/* Variable left */}
        <div className="text-end">
          <p className="text-xs text-text-secondary text-end">
            {t("strip.variableLeft")}
          </p>
          <p dir="ltr" className="text-sm font-medium text-variable text-end">
            {formatCurrency(variableRemaining)}
          </p>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
