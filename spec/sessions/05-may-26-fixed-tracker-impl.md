> **LLM Context & Usage Guide**
> This file establishes the chronological daily session tracking format for this project.
>
> - **How to use this directory (`spec/sessions/`)**: Read today's or the most recent day's log when starting a new conversation to quickly ingest the current daily state, established blockers, and past sessions for that day.
> - **How to update**: You must create a single file for each day (e.g., `DD-MMM-YY-topic.md`). Every newly created daily file MUST contain this exact LLM Context block and the `Unified Session Template` at the very top. As the day progresses, update the current active session while work is continuous. Create a new numbered session only when there is a meaningful time gap or restart of work, such as stopping in the morning and continuing 6 hours later.
>
> **Session boundary rule:** A session is a contiguous work block, not a single code edit or request. Do not create a new session for every task, fix, or verification pass. Append new facts to the active session's Completed, Decisions, and Open Blockers sections unless the work has clearly resumed after a substantial break.

## Unified Session Template

When appending to today's daily log, first decide whether the current work belongs to the active session. If it is the same continuous work block, update the existing session in place. If it follows a substantial break or restart, append a new session using this exact structure:

```markdown
# Session [N] — [Brief descriptor]

**Time:** [HH:MM-HH:MM]

---

## Status at Session Start

[One paragraph outlining state at the start of the session: active sprint goals, backend sync state, and any carried regressions or blockers from the prior session.]

---

## Completed This Session

[Bullet list of concrete deliverables shipped, fixed, or closed. Keep adding to this list during the same contiguous work block.]

---

## Decisions Made

[Bullet list of decisions locked this session. Formal decisions must also be logged to the explicit Decision Log (DL-NNN) if an SDR or architectural log exists.]\

---

## Open Blockers

[Numbered list of unresolved blockers with an owner. Strike through + date when resolved. Write "None" if clean.]
```

_(End of Template)_

---

# Session 1 — Fixed Tracker UX Redesign (All 7 Phases)

**Time:** 19:00–19:11

---

## Status at Session Start

Resumed from previous conversation which had completed the plan and pre-read phase. The implementation plan was fully written and approved (with three corrections applied before execution: budget card color spot check, `overallStatus` worst-case escalation logic, and removal of `payNowNoop`/`editNoop` i18n keys). No code had been written yet. Project was clean (`pnpm typecheck` + `pnpm lint` passing on the previous codebase).

---

## Completed This Session

- **Phase 1 — Data Types and Mock Data**
  - Replaced `components/tracker/types.ts` with new three-type model: `FixedExpenseType` (`manual | recurring | installment`), `FixedExpenseStatus` (`on_track | warning | over_budget`), `PaymentStatus` (`paid | unpaid`), `FixedExpenseItem`, `FixedTrackerSummary`, `InstallmentOverview`, `FixedTransaction`
  - Kept `TrackerTab` and `MajorExpense` unchanged
  - Created `data/fixed-tracker-mock.ts` with 10 items: 3 subscriptions, 3 installments, 4 budgets; `overallStatus` computed via worst-case escalation; Coffee is `over_budget` → summary renders red
  - Cleaned `components/tracker/tracker-data.ts`: removed `monthlyPayments` + `budgetBuckets` exports, kept `majorExpenses`
  - Cleaned `components/tracker/tracker-screen.tsx`: removed old fixed state, fixed-tab props, `budgetTransaction`/`monthlyPayment` mutation handlers, and unused `extractAmount`

- **Phase 2 — Summary Card**
  - Created `components/tracker/fixed-summary-card.tsx`
  - Displays total budgeted, paid/remaining stat tiles, progress bar, status badge
  - `statusRole` map: `on_track → income`, `warning → warning`, `over_budget → expense`

- **Phase 3 — Section Components**
  - Created `components/tracker/sections/subscriptions-section.tsx`
  - Created `components/tracker/sections/installments-section.tsx` (with installment mini-overview strip: monthly obligation / total paid all-time / total remaining)
  - Created `components/tracker/sections/budgets-section.tsx`
  - All sections conditionally hidden when `items.length === 0`

- **Phase 4 — Individual Cards**
  - Created `components/tracker/cards/subscription-card.tsx`: two states only — `paid` (fixed/teal) and `unpaid` (quiet/neutral "Due [date]"). No overdue state by design.
  - Created `components/tracker/cards/installment-card.tsx`: name, monthly amount, paid/upcoming pill, lifecycle progress bar (X of Y months, `tone="fixed"`)
  - Created `components/tracker/cards/budget-card.tsx`: name, spent/budget, progress bar (green/amber/red by status), remaining/over annotation

- **Phase 5 — Detail Sheet**
  - Created `components/tracker/fixed-detail-sheet.tsx`
  - Adapts content by type: recurring shows next payment date; installment shows lifecycle bar; manual shows spend progress
  - All types show transaction list with date, description, auto-pay badge, and direction coloring
  - Non-manual types show "Pay Now" button (console.log no-op); all types show "Edit" button (console.log no-op)

- **Phase 6 — Wire Up Fixed Tab**
  - Rewrote `components/tracker/tracker-fixed-tab.tsx` with real component imports and single `selectedItem` state for drawer
  - Updated all three section components to import and render real cards

- **Phase 7 — i18n Keys**
  - Added `Tracker.fixed` namespace to `messages/en.json`
  - Added `Tracker.fixed` namespace to `messages/ar.json` with full Arabic translations

- All 7 phases passed `pnpm typecheck` + `pnpm lint` clean after each phase

---

## Decisions Made

- **No overdue state for subscriptions.** Stashy's catch-up mechanism auto-inserts the payment transaction when the billing date passes. By the time the user views the Fixed tab, a subscription is either `paid` or has a future due date. `SubscriptionCard` has exactly two render branches.
- **`overallStatus` uses worst-case escalation:** `over_budget` > `warning` > `on_track`. The summary card color reflects the worst item in the whole fixed budget, not an average.
- **`payNow` and `edit` i18n keys used for mock buttons** — no separate `payNowNoop`/`editNoop` keys. Mock and real labels are identical.
- **`tracker-fixed-tab.tsx` is now self-contained.** It reads directly from `data/fixed-tracker-mock.ts` and manages its own drawer state. The parent `tracker-screen.tsx` no longer manages any fixed-tab state.
- **Budget color spot check (corrected):** Groceries = 82.5% → amber; Gas = 40% → green; Coffee = 124% → red; Eating Out = 0% → green.

---

## Open Blockers

1. ~~**`fixed-summary-card.tsx` status badge label hack**~~ — Resolved in Session 2. Proper `summary.statusLabel.*` i18n keys added.
2. None.

---

# Session 2 — Post-Implementation Refinements

**Time:** 19:14–19:44

---

## Status at Session Start

All 7 phases of the Fixed Tracker UX redesign were complete and clean. The page was first tested visually, which revealed several UX and correctness issues that needed fixing before the session closed.

---

## Completed This Session

- **Tracker screen simplified to fixed-only**
  - Removed `TrackerMajorTab`, `TrackerTabBar`, `TrackerDrawer`, `TrackerFab`, and `TrackerOverview` from `tracker-screen.tsx`
  - Removed tab routing from `app/[locale]/tracker/page.tsx`
  - `TrackerTab` type removed from `types.ts`; legacy files that still reference it patched with local type aliases so TSC stays clean
  - The `FixedSummaryCard` inside `TrackerFixedTab` is now the sole overview on the page

- **Section order and naming**
  - Reordered sections: **Budgets → Recurring → Installments** (budgets promoted to top as primary user concern)
  - "Subscriptions" section renamed to **"Recurring"** (EN) / **"متكررة"** (AR) in section headers and type badges — the concept covers any repeated monthly payment, not just subscriptions
  - Type badge for recurring items updated to "Recurring" / "متكررة"

- **Installment overview card upgraded**
  - Wrapped the mini-overview 3-tile strip in `heroSurfaceClass` card (matching `FixedSummaryCard` structure)
  - Added overall lifecycle progress bar (total paid all-time / total committed, `tone="fixed"`)
  - Stat tile labels shortened (EN: "Monthly / Paid / Remaining"; AR: "شهرياً / مدفوع / متبقي") to prevent 3-column overflow
  - Value text reduced from `text-sm` to `text-xs` + `truncate` to handle large EGP amounts

- **Progress bar system fixed (root cause: Tailwind JIT)**
  - All dynamic `basis-[N%]` class strings were never scanned by Tailwind — only Coffee (100%) appeared because `basis-[100%]` is a standard utility
  - `TrackerProgress` now accepts a numeric `value` (0–100) prop and uses `style={{ flexBasis: \`${value}%\` }}` instead of Tailwind arbitrary classes
  - All 7 active call sites updated to pass numeric `value` prop
  - Track background changed from `bg-surface-offset` → `bg-border-subtle` for visible empty state at 0%
  - 0% progress bars (e.g., Eating Out) now show a clear gray track

- **Percentage labels on all progress bars**
  - Added `showPercent` boolean prop to `TrackerProgress`
  - When enabled: renders a small `N%` label to the right of the bar
  - Raw value used for display (Coffee shows "124%" while bar fills to 100%)
  - Enabled on all 6 progress bar instances: summary card, all budget cards, installment cards, installment overview, detail sheet bars

- **Summary card badge bug fixed**
  - The badge was rendering the word "due" by reusing `t("status.due", { date: "" })` — a payment-due string intended for subscription pills
  - Added proper `summary.statusLabel.{on_track|warning|over_budget}` i18n keys in both locales
  - Badge now shows: "On Track" / "Warning" / "Over Budget" in EN; "في المسار" / "تحذير" / "تجاوز الميزانية" in AR

- **`overallStatus` logic corrected + collapsible callout added**
  - Previous logic: worst-case item escalation → Coffee's blown envelope made the whole summary card red ("Over Budget")
  - New logic: `overallStatus` reflects `totalPaid / totalBudgeted` ratio only (on_track < 75%, warning 75–100%, over_budget > 100%); with mock data ≈ 68% → green "On Track"
  - Added `overBudgetItems: { name, overageAmount }[]` field to `FixedTrackerSummary` type
  - Mock populates this from manual items with `status === "over_budget"` (currently just Coffee & Cafes, 120 EGP over)
  - `FixedSummaryCard` now renders a **collapsible amber callout** when `overBudgetItems.length > 0`:
    - Header always visible: "1 budget envelope is over ▾" — amber surface, tappable
    - Expanded: explains by name + overage amount that the excess settles from variable budget, total fixed commitment is still within budget
    - Single vs. multi-item body copy handled separately
    - Collapsed by default; `useState` local to the card
  - i18n keys added: `overBudgetCallout.title`, `body`, `bodyMulti`, `dismiss` in EN + AR

- **History overview card redesigned to match tracker**
  - Matches `FixedSummaryCard` structure: `heroSurfaceClass` root, large hero spent amount, 2-col stat tiles (Spent | Received).
  - Count badge replaced with quiet text in the header to reduce visual clutter.
  - Semantic colors applied: Spent in expense red, Received in income green.

- **Quick filters added to history screen**
  - Added horizontal scrollable row of quick filters (Variable, Fixed, Major) next to the main filter button.
  - Active quick filter highlighted using the brand variant.
  - Added `no-scrollbar` utility to `globals.css` for a cleaner mobile look.

- All changes passed `pnpm typecheck` + `pnpm lint` clean.

---

## Decisions Made

- **`overallStatus` is a total-ratio signal, not an item-level alarm.** Individual envelopes can be over without the overall fixed budget being over. These are two separate signals with different UX treatments.
- **Section order: Budgets first.** Budget envelopes require active user attention (they spend throughout the month). Recurring payments are set-and-forget. Installments are passive.
- **"Recurring" over "Subscriptions".** The recurring section covers any repeated monthly payment (rent, gym, phone bill, etc.), not just subscription services.
- **Progress bars use inline `style` not Tailwind arbitrary classes.** Any dynamic percentage that isn't a compile-time constant must use `style={{ flexBasis: ... }}`. The `TrackerProgress` `value` prop enforces this pattern going forward.
- **Collapsible callout uses amber (warning) not red (expense).** An over-budget envelope is a soft signal — the total budget is fine, just one envelope leaked. Red would mislead the user into thinking something is seriously wrong.
- **History Overview matches Tracker Summary for visual rhythm.** The app now feels like a single cohesive system where "Overview" always means a hero surface with semantic stat tiles.
- **Quick Filters provide high-frequency access.** Filtering by major categories (Variable/Fixed/Major) is the most common history action; exposing them as one-tap buttons improves mobile efficiency.

---

## Open Blockers

1. None.

---

# Session 3 — Home Page Restructure (spec-home-restructure.md)

**Time:** 23:48–00:05

---

## Status at Session Start

Starting fresh from `spec-home-restructure.md`, a comprehensive locked-decision restructure plan authored in the planning session. All 6 phases defined, project was clean at start of session.

---

## Completed This Session

- **Phase 1 — Types and Data**
  - Updated `components/home/types.ts`: added `"emergency"` to `DailyScenario`; added `BudgetStrip`, `MajorExpensesRow`, `PaymentUrgency` types; restructured `DailyRate` to use raw numeric fields (`remainingAmount`, `allowanceAmount`, `spentAmount`, `tomorrowAmount`, `overByAmount`), removed `fill`/`spentFill`; added `"history"` to `DrawerKind`
  - Updated `components/home/home-data.ts`: replaced `fixedPayments` with `upcomingPayments` (3 items with urgency field + Spotify), added `mockBudgetStrip`, `mockMajorExpensesRow`, exported `UpcomingPayment` type
  - Updated `messages/en.json` and `messages/ar.json`: added `Home.strip`, `Home.payments`, `Home.major.rowLabel/ofVariableRow/viewAction`, all new `Home.daily` keys (remainingLabel, overByLabel, overBySubtext, injectAction, allowanceLabel, spentLabel, tomorrowLabel, tomorrowDropLabel, statusEmergency), `Home.fixedPayments.spotify`, `emergencyPreview` in settings drawer; removed "12 Days Left" from both header.date strings

- **Phase 2 — New Components**
  - Created `components/home/budget-strip.tsx` (`BudgetStripCard`): teal/amber segmented bar with proportional `style` widths (JIT-safe), three-item row with fixed left / variable left / days remaining
  - Created `components/home/major-expenses-row.tsx` (`MajorExpensesRowCard`): amber strip using `bg-warning-subtle border-warning`, null-guarded, RTL-safe with `ms-` spacing
  - Rebuilt `components/home/daily-rate-card.tsx` (`DailyRateCard`): three state components (`OnTrackState`, `OverspentState`, `EmergencyState`), state derived from `overByAmount`/`tomorrowAmount`, progress bars use inline `style={{ width: N% }}`, inject button wired to `onInject` with `// TODO: wire to dedicated inject drawer` comment
  - Created `components/home/upcoming-payments.tsx` (`UpcomingPayments`): compact card with header row, three payment rows with urgency colors (danger/warning-hover/muted), logical `text-end` alignment, all amounts `dir="ltr"`

- **Phase 3 — home-screen.tsx**
  - Added emergency case to `getDailyRate`, updated track/overspent to use new numeric fields
  - Emergency forces `majorScenario` to `"active"` at render time
  - Updated home-drawer.tsx settings tab: 2-column → 3-column grid, added Emergency tab wired to `setDailyScenario("emergency")`

- **Phase 4 — home-content.tsx**
  - Rebuilt: new render order — IntroCard → BudgetStrip → DailyRateCard → MajorExpensesRow (conditional) → UpcomingPayments
  - Deleted: `BudgetOverviewSection`, `FixedPaymentsSection`, old imports (`BudgetOverviewCard`, `PaymentRow`, `fixedPayments`, `SectionHeader`)

- **Phase 5 — home-header.tsx**
  - Already handled in Phase 1 i18n update — both locale `header.date` values no longer include "12 Days Left"

- **Phase 6 — Cleanup**
  - Deleted `components/home/budget-overview-card.tsx` (grep confirmed zero external consumers)
  - Deleted `components/home/payment-row.tsx` (grep confirmed zero external consumers)
  - Final scan: no inline hex, no banned physical classes, all amounts have `dir="ltr"`
  - `pnpm typecheck && pnpm lint && pnpm build` all pass clean (Exit code: 0)

---

## Decisions Made

- **`DrawerKind` extended with `"history"`** — needed for `MajorExpensesRowCard.onView`. The major row navigating to history is a sensible wiring even for the mock; a console.log fallback used until the tab nav is directly callable.
- **`bg-income` for on-track progress fill** — plan said "bg-brand or bg-success"; `bg-success` maps to `bg-fixed` (teal), which could confuse the fixed budget identity. `bg-income` (meadow green) reads as "healthy/positive" which is semantically correct for "still within allowance."
- **Empty urgency row uses `&nbsp;`** — when `urgency === "soon"` the urgency label row shows a non-breaking space to preserve layout height and prevent row height jitter between payment items.
- **Emergency injectAction uses `variant="destructive"`** — the Button primitive maps this to `--color-danger` (Brick red), matching the emergency visual register.

---

## Open Blockers

1. **History tab navigation from MajorExpensesRowCard** — `onView` currently fires a `console.log`. When history becomes a routable tab, wire to `setActiveNav("history")` with pre-applied major filter state. No DrawerKind needed — it's a tab change.

---

# Session 2

## Work Accomplished
- **Swipe-to-Delete functionality in `HistoryRow`**: Implemented a native React touch handler wrapper around the row, allowing the user to swipe to reveal a delete button behind the row.
- **Directional Localization**: Wired `getDirectionForLocale()` to the swipe thresholds, ensuring swipe-left applies to LTR (English) and swipe-right applies to RTL (Arabic) interfaces naturally.
- **Click Preservation**: Replaced the `div` wrapper with a `button` for valid accessibility parsing, wired `onClick` appropriately, and used an `isSwiping` ref lock so that swiping the row does not inadvertently trigger the click-to-edit drawer.
- **Strict Adherence to Linting**: Updated row elements to `<button type="button">` to fix `oxlint` accessibility complaints regarding static element interactions.
- **BudgetStripCard Redesign**: Updated `BudgetStrip` type and `mockBudgetStrip` to track paid/spent vs remaining for both fixed and variable budgets.
- **Four-Segment Progress Bar**: Rebuilt the budget strip progress bar to feature 4 segments (`fixedPaid`, `fixedRemaining`, `variableSpent`, `variableRemaining`) using existing design tokens (`bg-fixed`, `bg-fixed-subtle`, `bg-warning`, `bg-warning-subtle`).
- **Budget Strip Layout Adjustments**: Added a new top row for "Remaining this month" and "Days remaining" and simplified the bottom row to only show Fixed and Variable remaining.
- **Semantic Typography**: Mapped the budget textual monetary values to their matching structural color tokens (`text-fixed` for Fixed left, `text-variable` for Variable left, and `text-income` for overall budget left) to reinforce visual categorization.
- **Card Wrapper Update**: Replaced the tinted `div` wrapper with the Stashy `Card` primitive to give `BudgetStripCard` the standard white (`bg-surface`) background, border, and shadow to match the `DailyRateCard`.
- `pnpm typecheck && pnpm lint` all pass clean.

## Decisions Made
- **Native Implementation vs External Library**: Built a custom translation utility on `touchMove`/`touchEnd` without introducing external gesture libraries (like `framer-motion`) to stay lean, using CSS `transition-transform` mapped directly to native touch delta metrics. 

## Open Blockers
- None related to this specific row functionality.

---

# Session 3 — Analytics Screen Redesign (ANALYTICS_REDESIGN_PLAN.md)

**Time:** (current session)

---

## Status at Session Start

Starting from the approved `ANALYTICS_REDESIGN_PLAN.md`. The previous analytics screen had 4 cards (PacingCard, ProjectionCard, ShapingCard, MonthComparisonCard). Project was clean at session start. All spec files were read before any code was written.

---

## Completed This Session

- **Phase 1 — Types + Data**
  - Replaced `components/analytics/types.ts`: added `daysInMonth`, `rolloverEgp`, `budgetComposition`, `weeklySpend`, `weeklyBudgetTarget`, `paymentMethods`, `projectionConfidenceDay`, `baseRateChangeReason`; changed `budgetUsedPct`/`monthProgressPct` from literal unions to `number`; added `PaymentMethodBreakdown` and `PaymentMethodFilter` types
  - Replaced `components/analytics/data.ts`: removed `FILL_WIDTH_CLASS`/`TICK_POSITION_CLASS`, added full mock data for all three months with all new fields
  - Patched `analytics-cards.tsx`: updated `ProgressTrack` to accept `fillStyle`/`tickStyle` as `React.CSSProperties` props (inline style) instead of class-based lookup tables; updated `PacingCard` to use inline styles

- **Phase 2 — SectionLabel primitive**
  - Created `components/analytics/section-label.tsx`: simple `<p>` with uppercase tracking style

- **Phase 3 — RolloverCard**
  - Created `components/analytics/rollover-card.tsx`
  - Hero area (Q2): large EGP rollover amount with income/expense tone, label, context sentence, directional fill bar with RTL-safe `insetInlineStart` tick
  - Dot grid (Q1): `daysInMonth` dots in income/danger/surface-offset states; caption only when `overspentDaysMtd > 0`

- **Phase 4 — ProjectionCard confidence framing**
  - Added `getProjectionConfidence(day)` helper
  - `"early"` (≤5 days): stat grid muted + amber "Low confidence" badge
  - `"late"` (≥25 days): income "High confidence" badge
  - `"sweet"` (6–24 days): no badge, normal style
  - Also added all Phase 10 i18n keys here to keep builds clean ahead of the new card phases

- **Phase 5 — BudgetCompositionCard**
  - Created `components/analytics/budget-composition-card.tsx`
  - Segmented bar (Fixed | Major | Variable) using `bg-fixed-subtle`/`bg-major-subtle`/`bg-variable-subtle` (closest available tokens; TODO comment added for future `-identity-bg` tokens)
  - Legend row with colored squares + amounts; Q4 annotation callout

- **Phase 6 — SpendingRhythmCard**
  - Created `components/analytics/spending-rhythm-card.tsx`
  - Recharts `BarChart` with clay bars, dashed reference line, `getSpendingRhythmInsight()` function for pattern detection

- **Phase 7 — PaymentMethodCard**
  - Created `components/analytics/payment-method-card.tsx`
  - Four filter chips (All/Variable/Fixed/Major) with `min-h-12` touch targets; Recharts horizontal `BarChart` with `activeDataKey` driven by filter state

- **Phase 8 — closed-month trend card**
  - Created the then-current Section 3 trend card component
  - Recharts `LineChart` sparkline with custom `dot` prop to highlight selected month; Q9 delta annotation with signed savings rate change + `baseRateChangeReason`; no-previous-month CTA

- **Phase 9 — Rewire analytics-screen.tsx**
  - Replaced 4-card layout with 3-section layout: Monthly health / Where your money went / Are you improving
  - Removed `PacingCard`, `ShapingCard`, `MonthComparisonCard` imports; added all 6 new card imports

- **Phase 10 — Messages (done in Phase 4)**
  - Added `section`, `rollover`, `projection.confidence`, `composition`, `rhythm`, `methods`, `trends` keys to both `messages/en.json` and `messages/ar.json` with full Arabic translations

- **Phase 11 — Final cleanup**
  - Deleted `PacingCard`, `ShapingCard`, `MonthComparisonCard` from `analytics-cards.tsx`
  - Deleted private helpers: `InsightRow`, `ComparisonRow`, `SummaryItem`, `getPacingNarrative`, `getComparisonVerdict`
  - Removed all dead imports: icon imports, `Separator`, `ComparisonTone`, `semanticProgressClass`, `semanticSurfaceClass`, etc.
  - `pnpm typecheck` + `pnpm lint` + `pnpm build` + `pnpm exec oxfmt --check` all pass clean

---

## Decisions Made

- **`ProgressTrack` now uses inline style props** (`fillStyle`, `tickStyle`) instead of Tailwind arbitrary-value lookup tables. This makes it JIT-safe and RTL-safe.
- **Segment colors use `bg-*-subtle` tokens.** The plan referenced `--color-fixed-identity-bg` etc. which don't exist. Using `bg-fixed-subtle`/`bg-major-subtle`/`bg-variable-subtle` as the closest available design-system tokens; TODO comment left in `BudgetCompositionCard`.
- **All i18n keys added in Phase 4** to keep all 6 new card files typechecking cleanly from their creation phase onward.
- **Recharts v3 dot type fix:** `cx`/`cy` are `number | undefined` in v3; used default values `cx = 0, cy = 0` in the dot render function.
- **Recharts label formatter type fix:** `Bar` label `formatter` accepts `unknown`; used `Number(v)` cast instead of typed `number` parameter.

---

## Open Blockers

1. None.
