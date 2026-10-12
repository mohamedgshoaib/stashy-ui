const semanticRoles = {
  brand: {
    surface: "bg-brand-subtle text-brand",
    text: "text-brand",
    progress: "bg-brand",
    token: "var(--color-brand)",
  },
  variable: {
    surface: "bg-variable-subtle text-variable",
    text: "text-variable",
    progress: "bg-variable",
    token: "var(--color-variable)",
  },
  fixed: {
    surface: "bg-fixed-subtle text-fixed",
    text: "text-fixed",
    progress: "bg-fixed",
    token: "var(--color-fixed)",
  },
  major: {
    surface: "bg-major-subtle text-major",
    text: "text-major",
    progress: "bg-major",
    token: "var(--color-major)",
  },
  income: {
    surface: "bg-income-subtle text-income",
    text: "text-income",
    progress: "bg-income",
    token: "var(--color-income)",
  },
  injection: {
    surface: "bg-injection-subtle text-injection",
    text: "text-injection",
    progress: "bg-injection",
    token: "var(--color-injection)",
  },
  expense: {
    surface: "bg-expense-subtle text-expense",
    text: "text-expense",
    progress: "bg-expense",
    token: "var(--color-expense)",
  },
  warning: {
    surface: "bg-warning-subtle text-warning",
    text: "text-warning",
    progress: "bg-warning",
    token: "var(--color-warning)",
  },
  transfer: {
    surface: "bg-transfer-subtle text-transfer",
    text: "text-transfer",
    progress: "bg-transfer",
    token: "var(--color-transfer)",
  },
  quiet: {
    surface: "bg-surface-offset text-text-secondary",
    text: "text-text-secondary",
    progress: "bg-text-secondary",
    token: "var(--color-surface-offset)",
  },
} as const

export const semanticSurfaceClass = {
  brand: semanticRoles.brand.surface,
  variable: semanticRoles.variable.surface,
  fixed: semanticRoles.fixed.surface,
  major: semanticRoles.major.surface,
  income: semanticRoles.income.surface,
  injection: semanticRoles.injection.surface,
  expense: semanticRoles.expense.surface,
  warning: semanticRoles.warning.surface,
  transfer: semanticRoles.transfer.surface,
  quiet: semanticRoles.quiet.surface,
} as const

export const semanticTextClass = {
  brand: semanticRoles.brand.text,
  variable: semanticRoles.variable.text,
  fixed: semanticRoles.fixed.text,
  major: semanticRoles.major.text,
  income: semanticRoles.income.text,
  injection: semanticRoles.injection.text,
  expense: semanticRoles.expense.text,
  warning: semanticRoles.warning.text,
  transfer: semanticRoles.transfer.text,
  quiet: semanticRoles.quiet.text,
} as const

export const semanticInteractiveTextClass = {
  brand: "text-brand transition-colors hover:text-brand-hover",
  expense: "text-expense transition-colors hover:text-expense-hover",
} as const

export const semanticProgressClass = {
  brand: semanticRoles.brand.progress,
  variable: semanticRoles.variable.progress,
  fixed: semanticRoles.fixed.progress,
  major: semanticRoles.major.progress,
  income: semanticRoles.income.progress,
  injection: semanticRoles.injection.progress,
  expense: semanticRoles.expense.progress,
  warning: semanticRoles.warning.progress,
  transfer: semanticRoles.transfer.progress,
  quiet: semanticRoles.quiet.progress,
} as const
