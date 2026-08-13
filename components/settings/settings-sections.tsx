"use client"

import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BankIcon,
  BookOpen01Icon,
  Calendar01Icon,
  Calendar03Icon,
  Clock01Icon,
  Coins01Icon,
  CreditCardIcon,
  CrownIcon,
  Delete01Icon,
  Download04Icon,
  Globe02Icon,
  Invoice03Icon,
  LegalDocument01Icon,
  Logout01Icon,
  Mail01Icon,
  MoneyBag02Icon,
  Notification01Icon,
  PolicyIcon,
  SecurityLockIcon,
  StarIcon,
  ThumbsUpIcon,
  UserCircleIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useLocale, useTranslations } from "next-intl"

import { APP_NAME, APP_VERSION, CURRENCY, PLAN } from "@/components/settings/data"
import type {
  BudgetBoost,
  LanguageValue,
  PaymentMethod,
  ProfileState,
} from "@/components/settings/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { statTileClass } from "@/lib/design-system-classes"
import {
  semanticInteractiveTextClass,
  semanticSurfaceClass,
  semanticTextClass,
} from "@/lib/semantic-styles"
import { cn } from "@/lib/utils"

// ─── Profile hero ─────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function ProfileHeroBlock({
  profile,
  plan,
  onEdit,
}: {
  profile: ProfileState
  plan?: "free" | "pro"
  onEdit: () => void
}) {
  const t = useTranslations("Settings")
  const initials = getInitials(profile.username)
  const isPro = (plan ?? PLAN) === "pro"

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-card p-4 shadow-soft">
      {/* Avatar + info — one unified block, no dividers */}
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand shadow-ring">
          <span className="text-sm font-bold tracking-wide text-primary-foreground">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[1.0625rem] font-semibold leading-[1.2] text-foreground">
            {profile.username}
          </p>
          <p className="mt-1 break-all text-xs leading-[1.5] text-text-secondary">
            {profile.email}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {t("profile.memberSince")} · {profile.memberSince}
          </p>
        </div>
      </div>

      {/* Actions row — plan pill + edit button */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {isPro ? (
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-major/20 bg-major-subtle px-3 py-1.5 shadow-ring",
          )}>
            <HugeiconsIcon icon={CrownIcon} size={12} aria-hidden="true" className="text-major" />
            <span className="text-xs font-semibold text-major">{t("profile.proTitle")}</span>
            <span className="text-xs text-major/70">{t("profile.proActive")}</span>
          </span>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 shadow-ring transition-opacity active:opacity-80 hover:opacity-90"
          >
            <HugeiconsIcon icon={CrownIcon} size={12} aria-hidden="true" className="text-primary-foreground" />
            <span className="text-xs font-semibold text-primary-foreground">{t("profile.upgradeCta")}</span>
          </button>
        )}

        <Button type="button" variant="outline" size="xs" onClick={onEdit}>
          {t("profile.edit")}
        </Button>
      </div>
    </div>
  )
}

// ─── Budget section (three separate cards) ───────────────────────────────────

export function BudgetSection({
  monthlyBudget,
  boosts,
  methods,
  deleteCandidateId,
  onChangeBudget,
  onAddBoost,
  onAddMethod,
  onEditMethod,
  onDeleteTap,
  onConfirmDelete,
  onCancelDelete,
  onSetDefault,
}: {
  monthlyBudget: number
  boosts: BudgetBoost[]
  methods: PaymentMethod[]
  deleteCandidateId: string | null
  onChangeBudget: () => void
  onAddBoost: () => void
  onAddMethod: () => void
  onEditMethod: (id: string) => void
  onDeleteTap: (id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
  onSetDefault: (id: string) => void
}) {
  const locale = useLocale()
  const t = useTranslations("Settings")

  return (
    <section className="flex flex-col gap-2">
      <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {t("sections.budget")}
      </p>

      {/* Currency — informational, future-configurable */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface-2 shadow-soft">
        <SettingsRow
          icon={Coins01Icon}
          label={t("currency.label")}
          value={t("currency.value")}
        />
      </div>

      {/* Monthly Budget — lone row */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface-2 shadow-soft">
        <SettingsRow
          icon={Calendar03Icon}
          label={t("budget.title")}
          value={`${formatCurrency(locale, monthlyBudget)} ${CURRENCY}`}
          onTap={onChangeBudget}
        />
      </div>

      {/* Budget Boosts */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface-2 shadow-soft">
        <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
          <RowIconWell icon={MoneyBag02Icon} />
          <span className="flex-1 text-sm font-medium text-foreground">{t("boosts.title")}</span>
          {boosts.length > 0 && (
            <span className="rounded-full bg-surface-offset px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary shadow-ring">
              {boosts.length}
            </span>
          )}
          <button
            type="button"
            className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", semanticInteractiveTextClass.brand)}
            onClick={onAddBoost}
          >
            {t("boosts.add")}
          </button>
        </div>
        {boosts.length > 0 && (
          <>
            <RowDivider />
            <div className="flex flex-col gap-1.5 p-3">
              {boosts.map((boost) => (
                <div key={boost.id} className={statTileClass}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{boost.label}</p>
                    <p dir="ltr" className="text-sm font-semibold tabular-nums text-foreground">
                      +{formatCurrency(locale, boost.amount)} {CURRENCY}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-text-tertiary">{t("boosts.thisMonth")}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Payment Methods */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface-2 shadow-soft">
        <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
          <RowIconWell icon={CreditCardIcon} />
          <span className="flex-1 text-sm font-medium text-foreground">{t("methods.title")}</span>
          {methods.length > 0 && (
            <span className="rounded-full bg-surface-offset px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary shadow-ring">
              {methods.length}
            </span>
          )}
          <button
            type="button"
            className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", semanticInteractiveTextClass.brand)}
            onClick={onAddMethod}
          >
            {t("methods.add")}
          </button>
        </div>
        <RowDivider />
        <div className="flex flex-col gap-1.5 p-3">
          {methods.map((method) =>
            deleteCandidateId === method.id ? (
              <div
                key={method.id}
                className={cn("rounded-[var(--radius-sm)] p-3 shadow-ring", semanticSurfaceClass.expense)}
              >
                <p className={cn("text-sm font-semibold", semanticTextClass.expense)}>
                  {t("methods.confirmDelete", { name: method.name })}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="destructive" size="xs" onClick={() => onConfirmDelete(method.id)}>
                    {t("methods.confirm")}
                  </Button>
                  <Button type="button" variant="ghost" size="xs" onClick={onCancelDelete}>
                    {t("drawer.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div key={method.id} className={cn(statTileClass, "flex items-center gap-3")}>
                <MethodIcon icon={method.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{method.name}</p>
                    {method.isDefault && (
                      <Badge variant="brand" className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium">
                        {t("methods.default")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-surface-offset"
                    onClick={() => onSetDefault(method.id)}
                    aria-label="Set as default"
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={16}
                      aria-hidden="true"
                      className={cn(method.isDefault ? "fill-current text-brand" : "text-text-tertiary")}
                    />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-surface-offset",
                      semanticTextClass.brand,
                    )}
                    onClick={() => onEditMethod(method.id)}
                    aria-label="Edit method"
                  >
                    <HugeiconsIcon icon={UserCircleIcon} size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-surface-offset",
                      semanticTextClass.expense,
                    )}
                    onClick={() => onDeleteTap(method.id)}
                    aria-label="Delete method"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Preferences group ────────────────────────────────────────────────────────

export function PreferencesGroupCard({
  language,
  onToggleLanguage,
}: {
  language: LanguageValue
  onToggleLanguage: () => void
}) {
  const t = useTranslations("Settings")
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <SettingsGroup label={t("sections.preferences")}>
      {/* Language */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={Globe02Icon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("appearance.language")}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-surface-offset px-3 py-1.5 text-sm font-medium text-foreground shadow-ring"
          onClick={onToggleLanguage}
        >
          <span>{language}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} aria-hidden="true" className="text-text-tertiary" />
        </button>
      </div>

      <RowDivider />

      {/* Timezone */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={Clock01Icon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("appearance.timezone")}
        </span>
        <span className="max-w-[14ch] truncate text-end text-xs font-medium text-text-secondary">
          {timezone}
        </span>
      </div>

      <RowDivider />

      {/* Start of month */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={Calendar01Icon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("preferences.startOfMonth")}
        </span>
        <span className="text-xs font-medium text-text-secondary">
          {t("preferences.startOfMonthValue")}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" className="text-text-tertiary" />
      </div>

      <RowDivider />

      {/* Security */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={SecurityLockIcon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("preferences.security")}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" className="text-text-tertiary" />
      </div>

      <RowDivider />

      {/* Notifications */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={Notification01Icon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("appearance.notifications")}
        </span>
        <span className="text-xs font-medium text-text-tertiary">
          {t("appearance.notificationsValue")}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" className="text-text-tertiary" />
      </div>

      <RowDivider />

      {/* Monthly Reports */}
      <div className="flex min-h-[3.25rem] items-center gap-3 bg-card px-4 py-3">
        <RowIconWell icon={Invoice03Icon} />
        <span className="flex-1 text-sm font-medium text-foreground">
          {t("appearance.monthlyReports")}
        </span>
        <span className="text-xs font-medium text-text-tertiary">
          {t("appearance.monthlyReportsValue")}
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" className="text-text-tertiary" />
      </div>
    </SettingsGroup>
  )
}

// ─── Support group ────────────────────────────────────────────────────────────

export function SupportGroupCard() {
  const t = useTranslations("Settings")

  return (
    <SettingsGroup label={t("sections.support")}>
      <SettingsRow icon={BookOpen01Icon} label={t("guide.title")} />
      <RowDivider />
      <SettingsRow icon={Mail01Icon} label={t("support.contactTitle")} />
      <RowDivider />
      <SettingsRow icon={PolicyIcon} label={t("support.privacyPolicy")} />
      <RowDivider />
      <SettingsRow icon={LegalDocument01Icon} label={t("support.terms")} />
      <RowDivider />
      <SettingsRow icon={ThumbsUpIcon} label={t("support.rate")} />
    </SettingsGroup>
  )
}

export function DataSection() {
  const t = useTranslations("Settings")

  return (
    <SettingsGroup label={t("sections.data")}>
      <SettingsRow icon={Download04Icon} label={t("data.export")} />
    </SettingsGroup>
  )
}

export function DangerSection() {
  const t = useTranslations("Settings")

  return (
    <SettingsGroup label={t("danger.sectionLabel")}>
      <div className="bg-card px-4 py-4">
        <p className="text-sm leading-[1.5] text-text-secondary text-pretty">
          {t("danger.deleteDescription")}
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="mt-3 w-full"
        >
          <HugeiconsIcon icon={UserRemove01Icon} data-icon="inline-start" aria-hidden="true" />
          {t("danger.deleteTitle")}
        </Button>
      </div>
    </SettingsGroup>
  )
}

// ─── About block ──────────────────────────────────────────────────────────────

export function AboutBlock() {
  const t = useTranslations("Settings")
  return (
    <div className="px-1 py-1 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-tertiary">
        {t("about.pwa", { app: APP_NAME })} · {t("about.version", { version: APP_VERSION })}
      </p>
      <p className="mt-2 text-sm leading-[1.6] text-text-secondary text-pretty">
        {t("about.description")}
      </p>
    </div>
  )
}

// ─── Logout button ────────────────────────────────────────────────────────────

export function LogoutButton() {
  const t = useTranslations("Settings")
  return (
    <Button type="button" variant="destructive" className="w-full">
      <HugeiconsIcon icon={Logout01Icon} data-icon="inline-start" aria-hidden="true" />
      {t("appearance.logout")}
    </Button>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SettingsGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface-2 shadow-soft">
        {children}
      </div>
    </section>
  )
}

function SettingsRow({
  icon,
  label,
  value,
  onTap,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  value?: string
  onTap?: () => void
}) {
  const inner = (
    <div className="flex min-h-[3.25rem] items-center gap-3 px-4 py-3">
      <RowIconWell icon={icon} />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value && (
        <span dir="ltr" className="text-sm tabular-nums text-text-secondary">
          {value}
        </span>
      )}
      <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" className="text-text-tertiary" />
    </div>
  )

  if (onTap) {
    return (
      <button type="button" className="w-full bg-card text-start transition-colors active:bg-surface-offset" onClick={onTap}>
        {inner}
      </button>
    )
  }

  return <div className="bg-card">{inner}</div>
}

function RowIconWell({
  icon,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
}) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-offset text-text-secondary shadow-ring">
      <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />
    </span>
  )
}

function RowDivider() {
  return <div className="h-px bg-border-subtle" />
}

function MethodIcon({ icon }: { icon: PaymentMethod["icon"] }) {
  const glyphIcon = icon === "cash" ? MoneyBag02Icon : icon === "card" ? CreditCardIcon : BankIcon
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-text-secondary shadow-ring">
      <HugeiconsIcon icon={glyphIcon} size={17} aria-hidden="true" />
    </span>
  )
}

function formatCurrency(locale: string, value: number) {
  return `${new Intl.NumberFormat(locale).format(value)}`
}
