# Analytics Restructure Implementation Progress

## Phase 1 — Two-slot page skeleton

- Status: complete
- Changed `AnalyticsScreen` to render a status-dependent hook followed by one status-independent detail slot.
- Locked detail order: Budget Composition → Variable → Major → Fixed → Payment Method → Method Obligation.
- Preserved the first hook header's `showDivider={false}` and all existing card props.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 1 errors: none.

## Phase 2 — Retire MonthlyHealthCard closed-month branch

- Status: complete
- Removed the closed-month verdict maps, branches, and type dependency from `MonthlyHealthCard`.
- Collapsed badge, hero, projection, progress, and injection behavior to the in-progress `monthlyState` paths.
- Preserved `closedMonthVerdict` in the shared type and data layers.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 2 errors: none.

## Phase 3 — Retire HowMonthLandedCard teaser

- Status: complete
- Deleted the in-progress teaser early return, including its pulse badge and placeholder geometry.
- Left the closed-month verdict surface unchanged for the dedicated Phase 4 color update.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 3 errors: none.

## Phase 4 — Whole-budget verdict two-tone semantics

- Status: complete
- Collapsed `getSummaryTone` to expense for `overBudget` and income for both successful verdicts.
- Removed the Fixed structural token from whole-budget verdict presentation.
- Left manual-bucket row tone logic untouched.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 4 errors: none.
- Phase 11 carry: VR-4 remains observation-only; no fallback is authorized.

## Phase 5 — Section titles and subtitles

- Status: complete
- Applied the locked English hook/detail section strings.
- Authored Arabic strings for PR review:
  - `Analytics.section.where.title`: `أين تذهب الميزانية`
  - `Analytics.section.where.subtitle`: `كيف يتوزع إنفاق هذا الشهر بين الخطة والواقع.`
  - `Analytics.section.landed.title`: `كيف انتهى الشهر؟`
  - `Analytics.section.landed.subtitle`: `النتيجة النهائية، وكيف وصل إليها الشهر.`
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 5 errors: none.

## Phase 6 — Detail-card header canonicalization

- Status: complete
- Canonicalized the Budget Composition title/subtitle typography while preserving its total-budget end slot.
- Added `text-pretty` to Fixed Analysis and Method Obligation subtitles.
- Moved the Payment Method subtitle into the canonical stack and emptied its header-end slot.
- Applied locked EN `Analytics.methods.subtitle`: `Total on each payment method, and what made it up.`
- Authored Arabic string for PR review:
  - `Analytics.methods.subtitle`: `إجمالي الإنفاق بكل وسيلة دفع، وممَّ تكوّن.`
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 6 errors: none.
- Phase 11 carry: VR-3 remains observation-only; no fallback is authorized.

## Phase 7 — Even-pace legend value

- Status: complete
- Derived one shared `evenPacePerDay` slope for both the chart series and legend value.
- Added the rounded whole-EGP daily value to the existing legend entry and kept the legend layout/styling unchanged.
- Rendered the legend entry with `dir="ltr"` to protect the financial amount in RTL.
- Authored Arabic string for PR review:
  - `Analytics.variable.legend.evenPace`: `إيقاع متساوٍ · {amount}/يوم`
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 7 errors: none.
- Phase 11 carry: verify legend bidi and injection-linked slope rendering under VR-5; no fallback is authorized.

## Phase 8 — Fixed overrun disclosure

- Status: complete
- Converted the overrun badge to a button only when manual overruns exist; the all-within-budget badge remains static.
- Added a collapsed inline disclosure with overrunning buckets only, sorted by overage descending.
- Kept row amounts neutral and bidi-safe, added `aria-expanded`/`aria-controls`, and used the locked 48px `min-h-12` touch target.
- Authored Arabic strings for PR review:
  - `Analytics.fixed.overrunDisclosureShow`: `عرض الميزانيات المتجاوزة`
  - `Analytics.fixed.overrunDisclosureHide`: `إخفاء الميزانيات المتجاوزة`
  - `Analytics.fixed.overrunRowOver`: `{amount} فوق الحد`
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 8 errors: none.
- Phase 11 carry: exercise both overrun states and RTL disclosure behavior under VR-5; no fallback is authorized.

## Phase 9 — Tracker user-facing rename

- Status: complete
- Renamed the English dock and page title from Tracker to Fixed.
- Applied the locked English Fixed-page placeholder and aligned the Arabic Analytics dock label with the page title.
- Arabic strings written/touched for PR review:
  - `Home.nav.tracker`: `الثابت`
  - `Tracker.title`: `الثابت`
  - `Home.navPlaceholders.tracker`: `تفتح هنا الميزانيات الثابتة والمدفوعات المتكررة والأقساط دون مغادرة مساحة الهاتف.`
  - `Home.nav.analytics`: `التحليلات`
- Kept the `Tracker` namespace, component names, and `/[locale]/tracker` route unchanged.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- New Phase 9 errors: none.
- Phase 11 carry: verify Arabic and English dock placement under VR-5; no fallback is authorized.
