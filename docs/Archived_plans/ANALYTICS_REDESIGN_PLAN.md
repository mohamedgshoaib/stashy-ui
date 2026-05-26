# Analytics Page Redesign — Implementation Plan

## Mandatory Pre-Task Sequence

Before writing a single line of code, read these files in order:

1. `AGENTS.md`
2. `spec/index.md`
3. `spec/DESIGN.md`
4. `spec/controlled-design-system.md`
5. `spec/brand-color-audit.md`
6. `spec/skills.md`
7. The most recent file inside `spec/sessions/`

Do not skip any of these. The design token names, semantic color roles, and architecture rules in those files govern every implementation decision in this plan.

---

## Context

This plan replaces the current Analytics screen with a redesigned version organized around three user jobs and nine locked questions. The redesign is visual-first: every section must be understandable by seeing it, not by reading it. Charts, bars, and grids are the primary communication layer; text narrates what you already see.

**Current files that will be modified:**

- `components/analytics/types.ts`
- `components/analytics/data.ts`
- `components/analytics/analytics-cards.tsx`
- `components/analytics/analytics-screen.tsx`
- `components/analytics/formatters.ts`
- `messages/en.json`
- `messages/ar.json`

**New files that will be created:**

- `components/analytics/section-label.tsx`
- `components/analytics/rollover-card.tsx`
- `components/analytics/budget-composition-card.tsx`
- `components/analytics/spending-rhythm-card.tsx`
- `components/analytics/payment-method-card.tsx`
- `components/analytics/how-month-landed-card.tsx`

**Files that are NOT touched:**

- `app/[locale]/analytics/page.tsx` — locale route wrapper, unchanged
- `components/analytics/month-picker-drawer.tsx` — unchanged
- Everything outside the `components/analytics/` directory

---

## Final Page Structure

The redesigned screen is a single vertical scroll divided into three labeled sections. No tabs.

```
[Header — month trigger button, unchanged]

── SECTION 1: Monthly health ──────────────────────

  RolloverCard        Q2 hero EGP rollover + Q1 day dot grid
  ProjectionCard      Q7 projection (updated with confidence framing)

── SECTION 2: Where your money went ──────────────

  BudgetCompositionCard    Q3 segmented bar + Q4 fixed % annotation
  SpendingRhythmCard       Q5 weekly BarChart + daily rate reference line
  PaymentMethodCard        Q6 horizontal BarChart + filter chips

── SECTION 3: historical closed-month comparison ──────────────────

  Section 3 trend card          Q8 savings rate sparkline + Q9 delta annotation

[AnalyticsUpgradeGate — unchanged, shown when plan = "free"]
```

---

## Phase 1 — Extend Types and Mock Data

### 1.1 `components/analytics/types.ts`

Replace the entire file with the following. Key changes:
- `budgetUsedPct` and `monthProgressPct` change from literal union types to `number` (removing the lookup table constraint so inline styles can be used for dynamic widths)
- New fields added for all new visualizations

```ts
export type AnalyticsMonth = {
  id: string
  isoDate: string
  daysTracked: number
  daysRemaining: number
  daysInMonth: number           // NEW — total calendar days; drives dot grid
  status: "closed" | "inProgress"

  // Q1 — Days within rate (dot grid drives from overspentDaysMtd + daysTracked)
  overspentDaysMtd: number

  // Q2 — Rollover cushion (hero)
  rolloverEgp: number           // NEW — positive = ahead, negative = deficit

  // Pacing (supports Q2 context)
  pacingDeltaPct: number
  budgetUsedPct: number         // CHANGED — was literal union, now number
  monthProgressPct: number      // CHANGED — was literal union, now number

  // Q3 + Q4 — Budget composition
  budgetComposition: {          // NEW
    fixedEgp: number
    majorEgp: number
    variableEgp: number
    totalBudget: number
  }

  // Q5 — Spending rhythm
  weeklySpend: number[]         // NEW — [week1, week2, week3, week4, week5?]
  weeklyBudgetTarget: number    // NEW — daily rate * 7; reference line value

  // Q6 — Payment method breakdown
  paymentMethods: PaymentMethodBreakdown[]  // NEW

  // Q7 — Projection
  projectionConfidenceDay: number  // NEW — current day of month (1–31)
  avgDailySpend: number
  projectedEndSpend: number
  projectedSavings: number
  projectedSavingsRate: number

  // Internal fields (used for ShapingCard replacement and comparisons)
  effectiveBudget: number
  totalVariableSpent: number
  incomeReceived: number
  fixedOverspend: number
  majorPurchasesTotal: number
  fixedTotalBudget: number
  fixedTotalSpent: number
  fixedManualOverBudgetCount: number
  fixedAutoPaidCount: number
  fixedAutoTotalCount: number
  majorPurchaseCount: number

  // Q8 + Q9 — Progress over time
  savingsRate: number
  baseDailyRate: number
  largePurchasesPct: number
  baseRateChangeReason: string  // NEW — explanation for Q9 delta
}

export type PaymentMethodBreakdown = {   // NEW
  id: string
  name: string
  variable: number
  fixed: number
  major: number
  total: number
}

export type ComparisonTone = "positive" | "negative" | "neutral"

export type PaymentMethodFilter = "all" | "variable" | "fixed" | "major"  // NEW
```

### 1.2 `components/analytics/data.ts`

Replace the entire file. All three months must receive realistic mock data for every new field. Remove `FILL_WIDTH_CLASS` and `TICK_POSITION_CLASS` entirely — all width calculations will now use inline `style={{ width: `${value}%` }}`.

```ts
import type { AnalyticsMonth } from "@/components/analytics/types"

export const ANALYTICS_PLAN: "free" | "pro" = "pro"

export const analyticsMonths: AnalyticsMonth[] = [
  {
    id: "2026-02",
    isoDate: "2026-02-01",
    daysTracked: 28,
    daysRemaining: 0,
    daysInMonth: 28,
    status: "closed",
    overspentDaysMtd: 6,
    rolloverEgp: -380,
    pacingDeltaPct: 4,
    budgetUsedPct: 100,
    monthProgressPct: 100,
    budgetComposition: {
      fixedEgp: 1780,
      majorEgp: 2400,
      variableEgp: 1820,
      totalBudget: 6000,
    },
    weeklySpend: [520, 610, 480, 590, 440],
    weeklyBudgetTarget: 1120,
    paymentMethods: [
      { id: "pm1", name: "Cash",         variable: 820,  fixed: 0,    major: 600,  total: 1420 },
      { id: "pm2", name: "Instapay",     variable: 540,  fixed: 700,  major: 1200, total: 2440 },
      { id: "pm3", name: "Vodafone Cash",variable: 320,  fixed: 980,  major: 600,  total: 1900 },
      { id: "pm4", name: "Bank Card",    variable: 140,  fixed: 100,  major: 0,    total: 240  },
    ],
    projectionConfidenceDay: 28,
    avgDailySpend: 189,
    projectedEndSpend: 5320,
    projectedSavings: 680,
    projectedSavingsRate: 11,
    effectiveBudget: 6000,
    totalVariableSpent: 1820,
    incomeReceived: 0,
    fixedOverspend: 140,
    majorPurchasesTotal: 2400,
    fixedTotalBudget: 1640,
    fixedTotalSpent: 1780,
    fixedManualOverBudgetCount: 2,
    fixedAutoPaidCount: 2,
    fixedAutoTotalCount: 2,
    majorPurchaseCount: 3,
    savingsRate: 11,
    baseDailyRate: 278,
    largePurchasesPct: 17,
    baseRateChangeReason: "Fixed expenses unchanged from January",
  },
  {
    id: "2026-03",
    isoDate: "2026-03-01",
    daysTracked: 31,
    daysRemaining: 0,
    daysInMonth: 31,
    status: "closed",
    overspentDaysMtd: 2,
    rolloverEgp: 340,
    pacingDeltaPct: -5,
    budgetUsedPct: 94,
    monthProgressPct: 100,
    budgetComposition: {
      fixedEgp: 1540,
      majorEgp: 720,
      variableEgp: 3300,
      totalBudget: 6000,
    },
    weeklySpend: [480, 390, 420, 360, 210],
    weeklyBudgetTarget: 1050,
    paymentMethods: [
      { id: "pm1", name: "Cash",         variable: 980,  fixed: 0,    major: 0,   total: 980  },
      { id: "pm2", name: "Instapay",     variable: 620,  fixed: 540,  major: 720, total: 1880 },
      { id: "pm3", name: "Vodafone Cash",variable: 480,  fixed: 900,  major: 0,   total: 1380 },
      { id: "pm4", name: "Bank Card",    variable: 220,  fixed: 100,  major: 0,   total: 320  },
    ],
    projectionConfidenceDay: 31,
    avgDailySpend: 173,
    projectedEndSpend: 5360,
    projectedSavings: 940,
    projectedSavingsRate: 18,
    effectiveBudget: 6000,
    totalVariableSpent: 3300,
    incomeReceived: 200,
    fixedOverspend: 0,
    majorPurchasesTotal: 720,
    fixedTotalBudget: 1640,
    fixedTotalSpent: 1540,
    fixedManualOverBudgetCount: 0,
    fixedAutoPaidCount: 2,
    fixedAutoTotalCount: 2,
    majorPurchaseCount: 2,
    savingsRate: 18,
    baseDailyRate: 278,
    largePurchasesPct: 12,
    baseRateChangeReason: "Fixed expenses stayed the same as February",
  },
  {
    id: "2026-04",
    isoDate: "2026-04-01",
    daysTracked: 25,
    daysRemaining: 5,
    daysInMonth: 30,
    status: "inProgress",
    overspentDaysMtd: 3,
    rolloverEgp: 560,
    pacingDeltaPct: -12,
    budgetUsedPct: 36,
    monthProgressPct: 81,
    budgetComposition: {
      fixedEgp: 1900,
      majorEgp: 2400,
      variableEgp: 700,
      totalBudget: 6000,
    },
    weeklySpend: [410, 350, 290, 180],
    weeklyBudgetTarget: 1050,
    paymentMethods: [
      { id: "pm1", name: "Cash",         variable: 280,  fixed: 0,    major: 0,    total: 280  },
      { id: "pm2", name: "Instapay",     variable: 220,  fixed: 900,  major: 2400, total: 3520 },
      { id: "pm3", name: "Vodafone Cash",variable: 140,  fixed: 900,  major: 0,    total: 1040 },
      { id: "pm4", name: "Bank Card",    variable: 60,   fixed: 100,  major: 0,    total: 160  },
    ],
    projectionConfidenceDay: 25,
    avgDailySpend: 160,
    projectedEndSpend: 4960,
    projectedSavings: 1040,
    projectedSavingsRate: 17,
    effectiveBudget: 6000,
    totalVariableSpent: 700,
    incomeReceived: 300,
    fixedOverspend: 260,
    majorPurchasesTotal: 2400,
    fixedTotalBudget: 1640,
    fixedTotalSpent: 1900,
    fixedManualOverBudgetCount: 1,
    fixedAutoPaidCount: 2,
    fixedAutoTotalCount: 2,
    majorPurchaseCount: 2,
    savingsRate: 24,
    baseDailyRate: 278,
    largePurchasesPct: 8,
    baseRateChangeReason: "One manual fixed expense went over budget this month",
  },
]
```

Run `pnpm typecheck` and `pnpm lint` before proceeding to Phase 2.

---

## Phase 2 — SectionLabel Primitive

Create `components/analytics/section-label.tsx`.

This is a simple section header that appears between groups of cards. It does not use a `<Card>` wrapper — it renders inline as part of the scroll.

```tsx
// components/analytics/section-label.tsx
"use client"

interface SectionLabelProps {
  label: string
}

export function SectionLabel({ label }: SectionLabelProps) {
  return (
    <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
      {label}
    </p>
  )
}
```

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 3 — RolloverCard (Q2 hero + Q1 dot grid)

Create `components/analytics/rollover-card.tsx`.

This card replaces `PacingCard` as the first thing the user sees. It answers two questions together:
- **Q2 (hero):** "How much cushion or deficit have I built up, in EGP?" — the rollover amount in EGP is the primary number
- **Q1 (support):** "How many days did I stay within my daily rate?" — shown as a dot grid below

### Visual spec

**Hero area (Q2):**
- Large EGP number: `rolloverEgp` formatted with sign and currency. Positive = green (`semanticTextClass.income`), negative = red (`semanticTextClass.expense`)
- Label next to/below the number: "ahead this month" (positive) or "deficit so far" (negative)
- One-sentence context: "You've spent X% of your budget with Y% of the month elapsed."
- Directional fill bar below the context sentence:
  - Track: full-width `bg-surface-offset` pill, height `h-3`
  - Fill: shows `budgetUsedPct` width via `style={{ width: `${month.budgetUsedPct}%` }}`
  - Tick marker: shows `monthProgressPct` position via `style={{ insetInlineStart: `${month.monthProgressPct}%` }}`
  - Fill color: `semanticProgressClass.fixed` when under pace (δ < 0), `semanticProgressClass.expense` when over pace (δ > 0)
  - Tick is a vertical line `w-0.5 h-[calc(100%+4px)] -translate-x-1/2 bg-text-tertiary/75 rounded-full`

**Dot grid (Q1):**
- Section label within the card: "Days within daily rate" (small, muted, uppercase)
- A `flex flex-wrap gap-1` grid of `daysInMonth` dots
- Each dot: `size-2.5 rounded-full`
- Dot states:
  - `daysTracked` dots rendered total (future days = empty/outline)
  - Of those `daysTracked` dots: the last `overspentDaysMtd` dots are colored with `bg-danger/60` (overspent days — they fall at the end of the tracked window in this mock)
  - The remaining tracked dots are `bg-income/70` (within rate)
  - Untracked future dots (daysInMonth - daysTracked): `bg-surface-offset border border-border`
- Below the grid: muted text `"{overspentDaysMtd} of {daysTracked} days overspent"` — omit entirely if `overspentDaysMtd === 0`

**Implementation notes:**
- All width and position values must use `style={{ width: `${n}%` }}` or `style={{ insetInlineStart: `${n}%` }}` — do NOT use Tailwind dynamic class generation with arbitrary values
- The `insetInlineStart` CSS property is RTL-safe and maps to `right` in RTL contexts. Use it for the tick marker position
- Import `semanticProgressClass`, `semanticTextClass` from `@/lib/semantic-styles`
- Use `useTranslations("Analytics")` for all copy
- Accept `{ month: AnalyticsMonth }` as the only prop

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 4 — Update ProjectionCard (Q7)

**Edit** the existing `ProjectionCard` inside `components/analytics/analytics-cards.tsx`.

Add confidence framing based on `month.projectionConfidenceDay`. The card layout stays the same; only the supporting narrative changes.

Confidence logic:
```ts
function getProjectionConfidence(day: number): "early" | "sweet" | "late" {
  if (day <= 5) return "early"
  if (day >= 25) return "late"
  return "sweet"
}
```

Narrative variants (add to `messages/en.json` under `Analytics.projection`):
- `confidence.early` → `"Too early to call — only {day} days of data so far"`
- `confidence.sweet` → `"Based on {day} days of spending"`  
- `confidence.late` → `"Near certain — {day} of {total} days elapsed"`

Visual treatment:
- `"early"` confidence: render the three stat columns in `text-text-tertiary` (muted, not bold). Add a small amber badge: "Low confidence"
- `"sweet"` confidence: render as normal (current style)
- `"late"` confidence: render as normal with a small green/income badge: "High confidence"

The existing dual-stat layout and savings-rate pill below remain unchanged. Only the narrative sentence and the confidence badge are added.

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 5 — BudgetCompositionCard (Q3 + Q4)

Create `components/analytics/budget-composition-card.tsx`.

This card answers: "Where did my total budget go?" and embeds Q4 ("What % is committed before the month starts?") as a callout annotation.

### Visual spec

**Segmented bar (Q3):**
- A single horizontal pill divided into 3 colored segments side by side: Fixed | Major | Variable
- Container: `flex h-5 w-full overflow-hidden rounded-full`
- Segments use `style={{ width: `${pct}%` }}` — widths computed from `budgetComposition`
- Segment colors (use CSS variables from the design system):
  - Fixed: `bg-[var(--color-fixed-identity-bg)]` — the teal/sage fixed identity color
  - Major: `bg-[var(--color-major-identity-bg)]` — the amber/warm major identity color
  - Variable: `bg-[var(--color-variable-identity-bg)]` — the neutral variable identity color
  - If no color variables are defined for these exact tokens, use `bg-teal-200`, `bg-amber-200`, and `bg-stone-200` as fallbacks and note in a comment that these should be replaced with the correct design-system tokens once verified
- Do not add rounded corners to individual segments; the container's `rounded-full` handles the outer radius

**Legend row below the bar:**
- Three items side by side: a small colored square + label + EGP amount
- Label: "Fixed", "Major", "Variable"
- Amount: formatted via `formatAnalyticsCurrency`

**Q4 annotation:**
- Below the legend, a small muted callout block (use `heroSurfaceClass` or a simple `bg-surface-offset rounded-xl px-3 py-2`)
- Text: `"{fixedPct}% of your budget is committed before the month starts"` where `fixedPct = Math.round((budgetComposition.fixedEgp / budgetComposition.totalBudget) * 100)`
- This should feel like an insight annotation, not a heading. Keep the text small (`text-sm`) and muted (`text-text-secondary`)

**Implementation notes:**
- Accept `{ month: AnalyticsMonth }` as the only prop
- Compute segment percentages from `budgetComposition`; do not hardcode
- All percentages use `Math.round()` before display
- RTL: the flex row reads right-to-left in Arabic; segment order stays Fixed | Major | Variable (leftmost in LTR, rightmost in RTL)

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 6 — SpendingRhythmCard (Q5)

Create `components/analytics/spending-rhythm-card.tsx`.

This card answers: "What was my spending rhythm this month?" using a Recharts `BarChart`.

### Visual spec

- Card title: "Spending Rhythm" with a small subtitle: "Variable spending per week vs. your daily rate target"
- Chart:
  - Component: `<BarChart>` from `recharts`
  - Data: `month.weeklySpend` mapped to `[{ week: "Wk 1", spend: 410 }, ...]`
  - Bar: `<Bar dataKey="spend" fill="var(--color-clay)" radius={[4, 4, 0, 0]} />`
  - Reference line: `<ReferenceLine y={month.weeklyBudgetTarget} stroke="var(--color-text-tertiary)" strokeDasharray="4 3" label={{ value: "Target", position: "insideTopRight", fill: "var(--color-text-tertiary)", fontSize: 10 }} />`
  - X-axis: `<XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />`
  - Y-axis: hidden (`hide={true}`)
  - Tooltip: `<Tooltip formatter={(v) => [`${v} EGP`, "Spent"]} contentStyle={{ ... }}` — style the tooltip to use `var(--color-card)` background and `var(--color-border)` border
  - `<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />`
  - Chart height: `180`
  - Chart container: `<ResponsiveContainer width="100%" height={180}>`
- Below the chart: a muted sentence with the pattern interpretation. Examples:
  - If week 1 is highest: "You tend to spend most heavily at the start of the month."
  - If the last tracked week is highest: "Spending picked up toward the end of the month."
  - If all weeks are within 20% of target: "Your spending was consistent this month."
  - Implement this as a `getSpendingRhythmInsight(weeklySpend, weeklyBudgetTarget)` function — derive it from the data, do not hardcode

**Implementation notes:**
- Import Recharts components from `"recharts"` (already installed)
- The chart renders `month.weeklySpend.length` bars — handle 4 or 5 weeks
- Week labels: "Wk 1", "Wk 2", ... up to length of array
- RTL: `<BarChart>` reversal of axis direction is handled by Recharts' `layout` prop and the chart wrapper; do not try to manually flip for RTL in this pass. Add a `// TODO: RTL axis reversal` comment for future
- Color tokens: use `var(--color-clay)` for bars (the primary brand Clay color), `var(--color-border-subtle)` for grid lines

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 7 — PaymentMethodCard (Q6)

Create `components/analytics/payment-method-card.tsx`.

This card answers: "How much did I spend per payment method, broken down by type?" It has local filter chip state.

### Visual spec

**Filter chips:**
- Four chips: "All", "Variable", "Fixed", "Major"
- Rendered as `<button>` pills above the chart
- Active chip: `bg-brand-subtle text-brand border-brand/30 border` (or use the existing shared chip style from the design system)
- Inactive chip: `bg-surface-offset text-text-secondary`
- State: `const [filter, setFilter] = React.useState<PaymentMethodFilter>("all")`

**Chart:**
- Component: Recharts `<BarChart layout="vertical">` (horizontal bars, one per method)
- Data: `month.paymentMethods` filtered/mapped by active filter:
  - `"all"` → `dataKey="total"`
  - `"variable"` → `dataKey="variable"`
  - `"fixed"` → `dataKey="fixed"`
  - `"major"` → `dataKey="major"`
- Y-axis: method names — `<YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />`
- X-axis: hidden (`hide={true}`)
- Bar: `<Bar dataKey={activeDataKey} fill="var(--color-clay)" radius={[0, 4, 4, 0]} label={{ position: "right", formatter: (v) => v > 0 ? `${v} EGP` : "", fill: "var(--color-text-tertiary)", fontSize: 11 }} />`
- `<CartesianGrid horizontal={false} stroke="var(--color-border-subtle)" />`
- Chart height: `month.paymentMethods.length * 52` (52px per method row)
- `<ResponsiveContainer width="100%" height={...}>`
- Hide bars for methods where the active filter value is 0 (the bar renders as zero-width naturally, but the label formatter should return `""` for zero values)

**Below the chart:**
- A small muted note: "Fixed includes recurring and installment payments with pre-set methods. Manual fixed may span multiple methods."

**Implementation notes:**
- Import `PaymentMethodFilter` from `@/components/analytics/types`
- The `activeDataKey` variable is derived from the filter state:  
  `const activeDataKey = filter === "all" ? "total" : filter`
- RTL: the horizontal bar extends from start to end. In RTL, Recharts horizontal bars extend right-to-left naturally if the Y-axis is on the right. For this pass, add `// TODO: RTL bar direction` comment. Do not try to flip manually.
- The filter chips row uses `flex gap-2 flex-wrap` — wraps safely on narrow screens

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 8 — historical Section 3 trend card (Q8 + Q9)

Create the then-current Section 3 trend card component.

This card answers two related questions as a single unit:
- **Q8:** "Am I getting better over time?" — shown as a Recharts `LineChart` sparkline of `savingsRate` across all available months
- **Q9:** "Why is this month different from last month?" — shown as a delta annotation below the sparkline

This card replaced `MonthComparisonCard`. It accepted the full list of months plus the currently selected month.

### Visual spec

**Sparkline (Q8):**
- Component: `<LineChart>`
- Data: all `analyticsMonths` (all 3 months), mapped to `[{ month: "Feb", rate: 11 }, ...]`
- The currently selected month's dot is visually emphasized (larger dot radius, brand color)
- Line: `<Line type="monotone" dataKey="rate" stroke="var(--color-clay)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-clay)" }} activeDot={{ r: 5 }} />`
- X-axis: month short labels — `<XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />`
- Y-axis: hidden
- `<CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />`
- Tooltip: show `"{rate}% savings rate"` on hover
- Chart height: `120`
- Above the chart: large current savings rate `"24%"` with a label "Savings Rate"

**Delta annotation (Q9):**
- Only shown when a previous month exists in the data
- Layout: a muted row below the chart with three items:
  - Savings rate delta: `+6%` (green) or `-3%` (red)
  - A short explanation: `month.baseRateChangeReason`
  - If `baseDailyRate` changed: show old → new with delta
- This is a text row, not a chart element

**No-previous-month state:**
- When the selected month is the earliest in the array, there is no previous month to compare against
- Show: "Close [month name] to unlock your first comparison." with a `<Button>` for "Close [month]"
- This replaces the old `MonthComparisonCard` no-data state exactly

**Props:**
```ts
interface Section3TrendCardProps {
  months: AnalyticsMonth[]        // full array — for sparkline data
  selectedMonth: AnalyticsMonth   // currently viewed month
  previousMonth: AnalyticsMonth | null
}
```

**Implementation notes:**
- Month short labels for X-axis: `new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(m.isoDate + "T00:00:00"))`
- Use `useLocale()` for locale-aware month labels
- The sparkline shows all available months regardless of which month is selected — the selected month's dot is just highlighted
- Import `analyticsMonths` constant is not needed inside this component — receive the `months` prop from the screen

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 9 — Rewire analytics-screen.tsx

Edit `components/analytics/analytics-screen.tsx`.

### Changes

1. **Remove imports** for `PacingCard`, `ShapingCard`, `MonthComparisonCard` from `analytics-cards.tsx`
2. **Add imports** for:
   - `SectionLabel` from `@/components/analytics/section-label`
   - `RolloverCard` from `@/components/analytics/rollover-card`
   - `BudgetCompositionCard` from `@/components/analytics/budget-composition-card`
   - `SpendingRhythmCard` from `@/components/analytics/spending-rhythm-card`
   - `PaymentMethodCard` from `@/components/analytics/payment-method-card`
   - the Section 3 trend card component
   - Keep `ProjectionCard` and `AnalyticsUpgradeGate` from `analytics-cards.tsx`
   - Keep `analyticsMonths` and `ANALYTICS_PLAN` from `@/components/analytics/data`

3. **Replace the main content block** (the `<div className="flex flex-col gap-3">` inside `<main>`) with:

```tsx
<div className="flex flex-col gap-3">
  <SectionLabel label={t("section.monthlyHealth")} />
  <RolloverCard month={selectedMonth} />
  <ProjectionCard month={selectedMonth} />

  <SectionLabel label={t("section.whereMoneyWent")} />
  <BudgetCompositionCard month={selectedMonth} />
  <SpendingRhythmCard month={selectedMonth} />
  <PaymentMethodCard month={selectedMonth} />

  <SectionLabel label={t("section historical comparison")} />
  <Section3TrendCard
    months={analyticsMonths}
    selectedMonth={selectedMonth}
    previousMonth={previousMonth}
  />
</div>
```

4. The `AnalyticsUpgradeGate` block and the `MonthPickerDrawer` stay unchanged.
5. The `previousMonth` derivation logic in `React.useMemo` stays unchanged.

Run `pnpm typecheck` and `pnpm lint`.

---

## Phase 10 — Messages

Update `messages/en.json` and `messages/ar.json`.

### New keys to add under the `Analytics` namespace

Add all keys below to `en.json`. For `ar.json`, provide accurate Arabic translations for each key. Do not use placeholder strings in the Arabic file.

```json
{
  "Analytics": {
    "section": {
      "monthlyHealth": "Monthly health",
      "whereMoneyWent": "Where your money went",
      "improving": "Are you improving"
    },
    "rollover": {
      "aheadLabel": "ahead this month",
      "deficitLabel": "deficit so far",
      "contextSentence": "You've spent {budgetUsed}% of your budget with {monthProgress}% of the month elapsed.",
      "dotGridLabel": "Days within daily rate",
      "overspentDays": "{overspent} of {tracked} days overspent",
      "title": "Monthly cushion"
    },
    "projection": {
      "confidence": {
        "early": "Too early to call — only {day} days of data so far",
        "sweet": "Based on {day} days of spending",
        "late": "Near certain — {day} of {total} days elapsed"
      },
      "lowConfidenceBadge": "Low confidence",
      "highConfidenceBadge": "High confidence"
    },
    "composition": {
      "title": "Budget breakdown",
      "subtitle": "Where your monthly budget was allocated",
      "fixedLabel": "Fixed",
      "majorLabel": "Major",
      "variableLabel": "Variable",
      "committedAnnotation": "{pct}% of your budget is committed before the month starts"
    },
    "rhythm": {
      "title": "Spending rhythm",
      "subtitle": "Variable spend per week vs. your daily rate target",
      "weekLabel": "Wk {n}",
      "targetLabel": "Target",
      "insightHeavyStart": "You tend to spend most heavily at the start of the month.",
      "insightHeavyEnd": "Spending picked up toward the end of the month.",
      "insightConsistent": "Your spending was consistent this month."
    },
    "methods": {
      "title": "Payment methods",
      "subtitle": "Where money moved, by method and type",
      "filterAll": "All",
      "filterVariable": "Variable",
      "filterFixed": "Fixed",
      "filterMajor": "Major",
      "fixedNote": "Fixed includes recurring and installment payments. Manual fixed may span multiple methods."
    },
    "trends": {
      "title": "Savings rate trend",
      "savingsRateLabel": "Savings Rate",
      "deltaPositive": "+{delta}% vs last month",
      "deltaNegative": "{delta}% vs last month",
      "deltaNeutral": "Same as last month",
      "closeMonthPrompt": "Close {month} to unlock your first comparison.",
      "closeMonthCta": "Close {month}"
    }
  }
}
```

For the Arabic file, translate all values accurately. Key Arabic terms for reference:
- Monthly health → الصحة المالية للشهر
- Where your money went → أين ذهبت أموالك
- Are you improving → هل تتحسن؟
- ahead this month → متقدم هذا الشهر
- deficit so far → عجز حتى الآن
- Savings Rate → معدل التوفير
- Budget breakdown → توزيع الميزانية
- Fixed → ثابت
- Major → رئيسي
- Variable → متغير

Run `pnpm typecheck` and `pnpm lint` and then run:

```bash
pnpm exec oxfmt --check \
  components/analytics/rollover-card.tsx \
  components/analytics/budget-composition-card.tsx \
  components/analytics/spending-rhythm-card.tsx \
  components/analytics/payment-method-card.tsx \
  components/analytics/section-3-trend-card.tsx \
  components/analytics/section-label.tsx \
  components/analytics/analytics-cards.tsx \
  components/analytics/analytics-screen.tsx \
  components/analytics/data.ts \
  components/analytics/types.ts \
  messages/en.json \
  messages/ar.json
```

If format check fails, run `pnpm format` on the listed files and re-check.

---

## Phase 11 — Final Cleanup

### 11.1 Remove dead card exports

Open `components/analytics/analytics-cards.tsx`. The following exports are no longer used by `analytics-screen.tsx` after the rewire:
- `PacingCard`
- `ShapingCard`
- `MonthComparisonCard`

**Do not delete these yet.** First run `pnpm typecheck` and `pnpm lint` to confirm they are truly unused (no other file imports them). If they are unused and typecheck is clean, delete the three function definitions and all their private helper functions (`getPacingNarrative`, `InsightRow`, `ComparisonRow`, `getComparisonVerdict`).

Keep in `analytics-cards.tsx`:
- `ProjectionCard`
- `AnalyticsUpgradeGate`
- All shared sub-components (`MutedPill`, `SectionHeader`, `HeroStat`, `CompactStat`, `SummaryItem`, `ProgressTrack`)

### 11.2 Remove FILL_WIDTH_CLASS and TICK_POSITION_CLASS

These constants are now dead. Confirm they are no longer imported anywhere, then delete from `data.ts`.

### 11.3 Full verification

```bash
pnpm typecheck
pnpm lint
pnpm build
```

All three must pass with zero errors and zero warnings. Do not proceed past this phase if any of them fail.

---

## Design Constraints — Non-Negotiable

These rules apply to every line written in this plan:

1. **Design tokens only.** Every color must reference a CSS variable from `spec/DESIGN.md`. No raw hex values. No improvised Tailwind color classes. If a token doesn't exist for what you need, use the closest semantic equivalent and add a comment.

2. **Inline style for dynamic widths.** Never use Tailwind's `w-[n%]` syntax with dynamically computed values. Use `style={{ width: `${n}%` }}` for all percentage-based fills and positions.

3. **`insetInlineStart` for RTL-safe positioning.** All absolute-positioned elements that express a horizontal offset must use `style={{ insetInlineStart: `${n}%` }}` instead of `left: n%`. This is a CSS logical property and is automatically RTL-correct.

4. **Numbers always `dir="ltr"`.** Any rendered numeric value (EGP amounts, percentages, deltas) must be wrapped in `dir="ltr"` to prevent Arabic bidirectional reordering from breaking number formatting.

5. **Every rendered value traces to a named constant.** No inline literals in JSX. All numbers come from the mock data fields or a named derived constant in the component.

6. **Recharts colors via CSS variables.** Chart fills and strokes must use `"var(--color-clay)"` and other CSS variable strings — not Tailwind class names, which have no effect inside SVG elements.

7. **Touch targets ≥ 48px.** Filter chip buttons, interactive rows, and CTAs must have a minimum height of `48px` or use `min-h-12` (48pt = 48px in this system).

8. **Single identity.** Do not introduce dark-mode variants, conditional palette branches, or any reference to a "dark" or "light" theme. This system has one palette.

9. **No API calls.** All data is mock constants. No `fetch`, no `useQuery`, no server actions.

10. **Preserve the month-picker and header.** The `MonthPickerDrawer`, the header month button, and the `AnalyticsUpgradeGate` are not touched by this plan. Do not modify them.

---

## Verification Checklist

Before declaring the implementation complete, confirm all of the following:

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings and zero errors
- [ ] `pnpm build` completes successfully
- [ ] `pnpm exec oxfmt --check` passes for all touched files
- [ ] All three months (Feb, Mar, Apr) render correctly when selected from the month picker
- [ ] Filter chips in PaymentMethodCard change the chart data correctly for all four filter states
- [ ] RolloverCard dot grid shows correct dot counts and states for each month
- [ ] SpendingRhythmCard reference line renders for all months
- [ ] Historical Section 3 sparkline shows all available months' savings rates
- [ ] Historical Section 3 card shows Close Month CTA when no previous month exists
- [ ] ProjectionCard shows correct confidence framing for each mock month (Feb = late, Mar = late, Apr = sweet)
- [ ] No raw hex values or hardcoded color strings anywhere in new files
- [ ] No dynamic Tailwind width classes (`w-[36%]` style) anywhere in new files
- [ ] All numeric JSX renders are wrapped in `dir="ltr"`
- [ ] Arabic messages are complete and do not contain English placeholder strings
- [ ] Section labels appear between card groups in the correct order
- [ ] The upgrade gate still replaces the entire content area when `ANALYTICS_PLAN = "free"`
