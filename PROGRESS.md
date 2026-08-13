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

## Phase 10 — i18n orphan sweep and dead-code removal

- Status: complete
- Deleted from both locale files after full-path, leaf-name, dynamic-template, and runtime-source searches:
  - `Analytics.pacing.*`: zero application-code matches. Archived documentation contains historical leaf-name text only; no runtime translation usage.
  - `Analytics.monthlyHealth.closed.badge.*`, `.heroLabel.*`, `.context.*`: zero application-code matches after Phase 2.
  - `Analytics.howMonthLanded.teaser.*`: zero application-code matches after Phase 3.
  - `Home.budget.*`: zero `Home` namespace application-code matches. `components/settings/settings-sections.tsx` contains `t("budget.title")` under the separate `Settings` namespace, so it is a leaf-name collision rather than a live `Home.budget` use.
- Confirmed no additional Phase 2–3 helper/import cleanup remained after the earlier phase-local removals.
- Gate: `pnpm typecheck` passed.
- Gate: `pnpm lint` reported only the two plan-listed pre-existing errors:
  - `components/tracker/tracker-transfer-drawer.tsx`: unused `surfacePanelClass` import.
  - `components/settings/settings-sections.tsx`: unused `SubSectionHeader` declaration.
- Gate: initial sandboxed `pnpm build` could not fetch configured Google fonts; rerunning with approved network access passed, including all EN/AR static routes.
- New Phase 10 errors: none.

## Phase 11 — Observation-only render verification

- Status: complete; no VR fallback was applied.
- Render environment: headless Chrome at a 390×844 mobile viewport against the local Next.js app.
- VR-1 — closed hook measurements:
  - 2 adjacent hook cards, 833px total from first-card top to second-card bottom (0.99 viewport heights).
  - 62 visible descendant elements and 1 button before the detail-section header.
  - Whole closed page: 8 cards and 4,272px document height in EN.
- VR-2 — Fixed → Payment transition:
  - Fixed card: 581px, 48 visible descendants.
  - Payment Method card: 658px, 93 visible descendants.
  - Inter-card gap: 12px; no sub-label or fallback added.
- VR-3 — Budget Composition header:
  - Title computes to 17px / weight 500.
  - Total computes to 18px / weight 600.
  - Both begin at the same measured vertical position; no size fallback added.
- VR-4 — exact-budget throwaway scenario:
  - Temporarily changed April variable spend so derived remainder became zero.
  - Rendered `Landed right on budget.` with `0 EGP`, `text-income`, `bg-income`, and computed fill `rgb(95, 143, 89)`.
  - Reverted the temporary data edit; `components/analytics/data.ts` has no diff.
- VR-5 — Arabic and RTL:
  - EN and AR closed/in-progress pages rendered without missing-key output or visible horizontal clipping at 390px.
  - The overflow probe found only zero-width internal Recharts containers, not clipped content.
  - Fixed overrun disclosure measured 48px tall in both locales; `aria-expanded` toggled false→true, accessible labels switched correctly, the chevron computed to `rotate: 180deg`, and financial row amounts remained `dir="ltr"`.
  - Arabic dock label `الثابت` rendered at 25px wide within its nav item.
  - Arabic even-pace text rendered as `إيقاع متساوٍ · 112 EGP/يوم`, but the amount-bearing legend element had no `dir` attribute; the Phase 7 `dir="ltr"` landed on the adjacent current-month legend item. Recorded for review; no observation-phase fix applied.
- Additional final-state observations:
  - No-major February collapsed to 7 total cards, omitted `FlaggedAsMajorCard`, and kept a 12px Variable → Fixed gap.
  - At-risk rendered an `At risk` hook and a 95 EGP/day legend.
  - The sandbox `over` state rendered 6 cards and retained an `At risk` hook from the current mock derivation.
  - Free rendered the upgrade gate with 0 analytics cards; Pro restored 7 cards.
  - Injection changed the legend from 112 to 144 EGP/day; disabling it restored 112.
  - First-month/with-history and fixed-overrun none/some controls each became active and rendered; the fixed-overrun state showed `2 of 2 budgets overrunning`.
- Final gate: `pnpm typecheck` passed.
- Final gate: `pnpm lint` reported only the same two plan-listed pre-existing errors; no new lint errors.
- Final gate: `pnpm build` passed with all EN/AR static routes.
- Final gate: targeted `pnpm exec oxfmt --check` passed for all files touched across Phases 0–11 after formatting the previously nonconforming touched files.
