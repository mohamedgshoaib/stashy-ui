import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { CheckmarkCircle02Icon, Delete01Icon } from "@hugeicons/core-free-icons";

import type {
  HistoryTransaction,
  HistoryTransactionType,
} from "@/components/history/types";
import { semanticSurfaceClass, semanticTextClass } from "@/lib/semantic-styles";
import { getDirectionForLocale } from "@/lib/i18n";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type HistoryRowProps = {
  transaction: HistoryTransaction;
  showDate?: boolean;
  isStandalone?: boolean;
  onClick?: (transaction: HistoryTransaction) => void;
  onDelete?: (transaction: HistoryTransaction) => void;
};

type TypeTone =
  | "variable"
  | "fixed"
  | "major"
  | "transfer"
  | "income"
  | "injection";

const typeSemanticMap: Record<HistoryTransactionType, TypeTone> = {
  variable: "variable",
  monthly: "fixed",
  budget: "fixed",
  major: "major",
  transfer: "transfer",
};

export function HistoryRow({
  transaction,
  showDate = false,
  isStandalone = false,
  onClick,
  onDelete,
}: HistoryRowProps) {
  const t = useTranslations("History");
  const locale = useLocale() as Locale;
  const direction = getDirectionForLocale(locale);
  const typeTone = getSurfaceTone(transaction);
  const amountTone = getAmountTone(transaction);

  const [offset, setOffset] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const isSwiping = React.useRef(false);
  const MAX_SWIPE = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    if (Math.abs(diff) > 5) {
      isSwiping.current = true;
    }

    let target = offset + diff;
    if (direction === "ltr") {
      target = Math.max(-MAX_SWIPE, Math.min(0, target));
    } else {
      target = Math.max(0, Math.min(MAX_SWIPE, target));
    }

    setOffset(target);
    touchStartX.current = currentX;
  };

  const handleTouchEnd = () => {
    if (direction === "ltr") {
      if (offset < -MAX_SWIPE / 2) setOffset(-MAX_SWIPE);
      else setOffset(0);
    } else {
      if (offset > MAX_SWIPE / 2) setOffset(MAX_SWIPE);
      else setOffset(0);
    }
    touchStartX.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSwiping.current || Math.abs(offset) > 0) {
      if (Math.abs(offset) > 0) {
        setOffset(0);
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(transaction);
  };

  const description = transaction.descriptionKey
    ? t(`transactions.${transaction.descriptionKey}`)
    : transaction.descriptionLabel;

  const fixedTypeLabel = transaction.fixedTypeKey
    ? t(`fixedTypes.${transaction.fixedTypeKey}`)
    : transaction.fixedTypeLabel;

  // Variable transactions are one-time logs without specific budget categories
  const isVariable = transaction.typeCategory === "variable";

  // Deduplicate description and fixedTypeLabel, but only for non-variable entries
  const showFixedLabel =
    !isVariable &&
    fixedTypeLabel &&
    description &&
    fixedTypeLabel.toLowerCase().trim() !== description.toLowerCase().trim();

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
    [locale],
  );

  const displayDate = React.useMemo(() => {
    const d = new Date(transaction.dateISO);
    return isNaN(d.getTime()) ? transaction.date : dateFormatter.format(d);
  }, [transaction.dateISO, transaction.date, dateFormatter]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background delete action */}
      <div 
        className={cn(
          "absolute inset-y-0 flex items-center bg-danger",
          isStandalone ? "rounded-[var(--radius-lg)]" : "rounded-xl",
          direction === "ltr" ? "right-0 justify-end pe-6 w-1/2" : "left-0 justify-start ps-6 w-1/2"
        )}
      >
        <button
          type="button"
          className="text-white outline-none transition-transform active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            setOffset(0);
            onDelete?.(transaction);
          }}
          aria-label={t("actions.delete", { fallback: "Delete" })}
        >
          <HugeiconsIcon icon={Delete01Icon} size={24} />
        </button>
      </div>

      {/* Main Row */}
      <button
        type="button"
        className={cn(
          "relative flex w-full appearance-none items-start gap-3 text-start outline-none active:scale-[0.98]",
          isStandalone
            ? "rounded-[var(--radius-lg)] p-4 shadow-soft ring-1 ring-border-subtle/50"
            : "rounded-md p-3",
          semanticSurfaceClass[typeTone],
        )}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: touchStartX.current === null ? "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-ring-sm",
          semanticTextClass[typeTone],
        )}
      >
        <HugeiconsIcon
          icon={transaction.icon}
          size={20}
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              dir="ltr"
              className={cn(
                "min-w-0 break-words font-bold leading-tight tabular-nums",
                isStandalone ? "text-[1.125rem]" : "text-base",
                amountTone,
              )}
            >
              {transaction.amount}
            </p>
            {description ? (
              <p className="mt-0.5 truncate text-[0.8125rem] font-semibold text-text-secondary">
                {description}
              </p>
            ) : null}
            {transaction.note ? (
              <p className="mt-1 text-[0.75rem] leading-normal text-text-tertiary/80 text-pretty">
                {transaction.note}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {showDate && (
              <span className="mb-0.5 text-[0.625rem] font-bold text-text-tertiary uppercase tracking-wider">
                {displayDate}
              </span>
            )}
            {transaction.isAutoPay && (
              <div className="flex items-center gap-1 text-[0.625rem] font-bold text-fixed uppercase tracking-wider">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                {t("labels.autoPay")}
              </div>
            )}
            {showFixedLabel && (
              <span className="text-[0.625rem] font-bold text-text-tertiary uppercase tracking-wider">
                {fixedTypeLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
    </div>
  );
}

function getSurfaceTone(transaction: HistoryTransaction): TypeTone {
  if (transaction.budgetTypeKey === "injection") {
    return "injection";
  }

  if (transaction.direction === "received") {
    return "income";
  }

  return typeSemanticMap[transaction.typeCategory];
}

function getAmountTone(transaction: HistoryTransaction) {
  if (transaction.budgetTypeKey === "injection") {
    return "text-foreground";
  }

  if (transaction.direction === "received") {
    return semanticTextClass.income;
  }

  if (transaction.direction === "expense") {
    return semanticTextClass.expense;
  }

  return "text-foreground";
}
