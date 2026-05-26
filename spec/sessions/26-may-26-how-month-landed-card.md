> **LLM Context & Usage Guide**
> This file establishes the chronological daily session tracking format for this project.
>
> - **How to use this directory (`spec/sessions/`)**: Read today's or the most recent day's log when starting a new conversation to quickly ingest the current daily state, established blockers, and past sessions for that day.
> - **How to update**: You must create a single file for each day (e.g., `DD-MMM-YY-topic.md`). Every newly created daily file MUST contain this exact LLM Context block and the `Unified Session Template` at the very top. As the day progresses, update the current active session while work is continuous. Create a new numbered session only when there is a meaningful time gap or restart of work, such as stopping in the morning and continuing 6 hours later.
>
> **Session boundary rule:** A session is a contiguous work block, not a single code edit or request. Do not create a new session for every task, fix, or verification step. Append new facts to the active session's Completed, Decisions, and Open Blockers sections unless the work has clearly resumed after a substantial break.

## Unified Session Template

When appending to today's daily log, first decide whether the current work lift belongs to the active session. If it is the same continuous work block, update the existing session in place. If it follows a substantial break or restart, append a new numbered session using this exact structure:

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

[Bullet list of decisions locked this session. Formal decisions must also be logged to the explicit Decision Log (DL-NNN) if an SDR or architectural log exists.]

---

## Open Blockers

[Numbered list of unresolved blockers with an owner. Strike through + date when resolved. Write "None" if clean.]
```

_(End of Template)_

---

# Session 1 — HowMonthLandedCard Section 3 refactor

**Time:** Continuous build block

---

## Status at Session Start

Analytics Section 3 was still mounted as the old `TrendsCard`, framing the screen around savings-rate percentages and delta color logic that no longer matched Stashy's product doctrine. The goal for this work block was to replace that model with the new closed-month `HowMonthLandedCard`, add the manual fixed calibration drawer, rename the section, update the analytics mock data to support all verdict branches, and fully remove the old Section 3 references.

---

## Completed This Session

- Added `ManualBucketCalibration` to `components/analytics/types.ts` and added `manualBucketCalibration` to both analytics month shapes.
- Reworked `components/analytics/data.ts` so manual fixed calibration is derived through shared helpers instead of hand-maintained per scenario.
- Updated analytics mock data to cover all required closed-month verdicts:
  - one closed month within plan with no injections
  - one closed month adjusted in flight with injections
  - one closed month outrunning the plan
- Added manual-fixed visibility coverage in the mocks:
  - one closed month with zero manual-bucket deltas so the section hides
  - one closed month with enough delta rows for the overflow drawer path
- Updated `lib/sandbox-budget.ts` to recompute `manualBucketCalibration` after scenario mutations so the top-level field cannot go stale.
- Added `components/analytics/how-month-landed-card.tsx` with:
  - in-progress teaser state
  - closed verdict state
  - neutral headline bar
  - injections tile
  - variable section
  - manual fixed inline strips and overflow affordance
- Added `components/analytics/how-month-landed-popup.tsx` as a bottom drawer for the full manual fixed calibration list.
- Added `formatAnalyticsNumber(...)` to `components/analytics/formatters.ts` for bidi-safe numeric rendering in summary copy.
- Updated `components/analytics/analytics-screen.tsx` to:
  - mount `HowMonthLandedCard`
  - rename Section 3 to `section.landed.*`
  - remove the old `TrendsCard` path
- Replaced `Analytics.section.improving.*` and `Analytics.trends.*` with the new `Analytics.howMonthLanded.*` and `Analytics.section.landed.*` keys in both `messages/en.json` and `messages/ar.json`.
- Deleted obsolete files:
  - `components/analytics/trends-card.tsx`
  - `components/analytics/close-month-action.tsx`
- Removed remaining repo-wide references to the retired Section 3 card strings so the required cleanup grep returns zero matches.
- Reworked `components/analytics/how-month-landed-card.tsx` to match the current analytics card language instead of the earlier bespoke report treatment:
  - restored standard title/subtitle hierarchy
  - replaced decorative teaser framing with a normal nested preview panel
  - converted the closed-state into a calm summary surface plus nested stat tiles
  - rebuilt manual fixed rows as proper analytics tiles
  - aligned the overflow affordance with existing expandable analytics rows
- Reworked `components/analytics/how-month-landed-popup.tsx` to use a visible drawer title/subtitle and calmer stacked tiles instead of the previous sentence-style header.
- Updated `messages/en.json` and `messages/ar.json` with the shorter labels and support copy needed for the redesign hierarchy.
- Applied a second-pass refinement to Section 3 focused on the remaining weak spots:
  - tightened hierarchy and spacing so the summary reads as one coherent story instead of stacked modules
  - merged the summary metrics into the main summary surface instead of keeping a separate stat-tile row
  - made the primary bar feel more attached and intentional through proportion and placement
  - softened the teaser state with a more deliberate preview rhythm and calmer atmosphere
  - made manual fixed bars and the drawer body feel less diagnostic and more product-grade
  - refined the drawer header spacing and body cadence so the sheet feels more composed
- Revisited the card again to remove summary duplication and restore app-consistent bar semantics:
  - removed the redundant verdict support sentence that was repeating nearby visible numbers
  - remapped the primary comparison bar to governed semantic progress classes instead of neutral ad hoc fills
  - made the over-plan state visually stronger through expense-family progress treatment and delta tinting
  - kept adjusted-in-flight distinct through injection-family delta support while preserving variable structural identity in the main bar
  - converted the secondary variable section from a repeated plan comparison into a true variable-vs-major composition breakdown
  - aligned manual fixed rows and drawer bars with calmer fixed/expense semantic progress logic
  - simplified translations by removing no-longer-used support sentence keys and adding breakdown labels
- Fixed analytics math drift by introducing a shared month-truth derivation path in `components/analytics/data.ts`:
  - derived `fixedTotalSpent` from `fixedBucketsActual` instead of trusting stale hand-authored totals
  - derived `fixedOverspend` from actual fixed spend versus fixed plan
  - derived `effectiveVariableBudget` from base variable budget plus adjustments minus fixed overspend and major expenses
  - recomputed `monthlyState`, `budgetUsedPct`, `rolloverEgp`, projections, and related analytics fields from the same source-of-truth math
  - normalized both live months and historical snapshots through the same derivation path before cards read them
- Finished the shared closed-month verdict rollout in the analytics data layer:
  - added `ClosedMonthVerdict` and `closedMonthVerdict` to the analytics month types
  - derived closed-month final outcomes in `components/analytics/data.ts` instead of letting Section 3 infer them locally
  - updated `components/analytics/how-month-landed-card.tsx` and `components/analytics/how-month-landed-popup.tsx` to consume the shared verdict
  - updated `components/analytics/monthly-health-card.tsx` so closed months use final-result wording and tone instead of predictive pace messaging
  - added placeholder `closedMonthVerdict` fields to the raw mock objects so the normalized derivation path remains type-safe before overwrite
- Clarified closed-month cap math in the analytics UI:
  - exposed `baseVariableBudget` and `adjustedVariableBudget` from the shared analytics derivation so cards can explain cap changes without rebuilding local math
  - aligned `HowMonthLandedCard` and `HowMonthLandedPopup` to compare `totalVariableSpent` against the final variable cap instead of mixing regular variable plus major against a cap already reduced by major
  - added a new cap-breakdown block in `HowMonthLandedCard` that explicitly shows how injections, received-variable money, fixed overspend, and major expenses move the cap from base to final
  - added explicit copy that fixed overspend is carried from fixed into the variable cap so the user can understand why the final cap may shrink even when the closed-month card no longer shows spare room
  - kept `MonthlyHealthCard` as the final-outcome card while moving the "why the cap changed" explanation into Section 3
- Reframed the closed-month analytics split after clarifying product intent:
  - `MonthlyHealthCard` remains Point A and stays variable-only
  - `HowMonthLandedCard` is now Point B and uses a new shared whole-budget closeout model
  - whole-budget closeout now counts unused **manual fixed only** back into the final month result, while recurring/installment fixed does not return automatically
  - added shared `wholeBudgetCloseout` derivation in `components/analytics/data.ts` with adjusted whole-month budget, whole-month spend, remainder, manual-fixed unused total, manual-fixed overspend total, and whole-budget verdict
  - updated `HowMonthLandedCard` and `HowMonthLandedPopup` to use the whole-budget closeout as their primary comparison instead of `effectiveVariableBudget`
  - rewrote Section 3 copy from variable-cap framing to whole-month budget framing in both English and Arabic
  - preserved the manual fixed detail section, but reframed it as part of the final month settlement story instead of only cap spillover diagnostics
- Corrected the first Point B whole-budget formula after validating closed-month mismatches:
  - the initial whole-budget formula was incorrectly crediting fixed underspend through `fixedTotalSpent` and then adding manual-fixed unused on top, which caused drift and over-credit
  - rewrote Point B derivation so the settled remainder now equals Point A plus only the allowed unused manual fixed return
  - restored manual fixed overspend into the budget-path explanation as month pressure without double-counting it in the arithmetic
  - fixed closed-month Point A derivation to use exact actual end-of-month spend instead of rounded projection math, which removed the remaining April/February mismatch
  - validated the normalized month relationships directly from shared derived data:
    - April: Point A `180`, manual fixed unused `0`, Point B `180`
    - March: Point A `540`, manual fixed unused `80`, Point B `620`
    - February: Point A `540`, manual fixed unused `0`, Point B `540`
- Refocused `HowMonthLandedCard` around closeout meaning instead of composition reporting:
  - removed the `Where it went` spend-composition section because it was repeating information already covered by earlier analytics cards and payment-method reporting
  - removed the separate injections tile because its information already belongs in the budget path
  - strengthened the budget path to be the card's single explanation surface by keeping injections, received-variable money, manual fixed returned, manual fixed overspend pressure, and adding the explicit variable close result from Card 1
  - updated the budget-path copy so users can see how the first card's variable leftover/overrun connects into the final whole-month landed result
- Reworked `HowMonthLandedCard` again from a UI/UX perspective after the logic was finalized:
  - audited the card as a hierarchy problem rather than a math problem and identified the main issues as too many competing nested panels, receipt-style breakdown rows, and overexposed manual-fixed detail in the default state
  - redesigned the card around one dominant result module, one visual budget stepper, and one collapsed manual-fixed settlement handoff to the drawer
  - replaced the receipt-like budget breakdown rows with a compact stepper flow so the user can scan the path from base budget to final close without reading a dense stack of dividers
  - collapsed manual-fixed detail on the card into a compact summary with net impact plus affected-bucket count, leaving bucket-level detail to the drawer
  - shortened English and Arabic copy across the card so labels support the visual structure instead of carrying the experience through paragraphs
  - fixed the manual-fixed drawer rows to use localized `metaLine` copy instead of a hardcoded English `of` string so Arabic detail view remains product-grade
- Applied a follow-up refinement pass from design review feedback:
  - softened the top-module side stats panel so it no longer competes with the verdict and main result amount
  - elevated both `Monthly Budget` and `Adjusted Budget` into stronger anchor milestones inside the budget path instead of leaving only the adjusted budget visually emphasized
  - corrected the on-card manual-fixed summary model so it no longer nets returned manual fixed against manual fixed overspend
  - rewrote the summary to show returned amount and overspend pressure as separate facts, which matches Stashy's product logic that manual overspend already reduces the variable side rather than canceling returned leftover in one synthetic remainder
- Updated `lib/sandbox-budget.ts` helper math so fixed remaining cannot inflate totals and the home strip follows the same cap assumptions.
- Verification results:
  - `pnpm typecheck` passed
  - `pnpm build` passed
  - `pnpm exec oxfmt --check ...` passed for the touched analytics/i18n files
  - second-pass `pnpm exec oxfmt --check components/analytics/how-month-landed-card.tsx components/analytics/how-month-landed-popup.tsx messages/en.json messages/ar.json` passed after formatting
  - latest second-pass verification: `pnpm typecheck` passed, `pnpm build` passed, touched-file `oxfmt --check` passed
  - latest revisit verification: `pnpm typecheck` passed, `pnpm build` passed, touched-file `oxfmt --check` passed
  - latest truth-source verification: `pnpm typecheck` passed, `pnpm build` passed, math-related `oxfmt --check` passed
  - latest closed-month truth verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest cap-clarity verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest Point A / Point B verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest Point B correction verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest Section 3 refocus verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest UI/UX redesign verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - latest feedback-fix verification: `pnpm typecheck` passed, `pnpm build` passed, required touched-file `oxfmt --check` passed; `pnpm lint` still fails only on the same two unrelated pre-existing issues
  - required grep for `TrendsCard`, `trends-card`, `Analytics.trends`, `Analytics.section.improving`, `close-month-action`, and `CloseMonthAction` returned zero matches

---

## Decisions Made

- `manualBucketCalibration` remains a typed top-level analytics field, but its values are derived in the data layer rather than hand-authored into each mock object.
- `lib/sandbox-budget.ts` recomputes calibration after sandbox mutations so scenario toggles cannot desync manual bucket plan/actual rows.
- The teaser title uses the existing sans stack rather than introducing a serif token that does not exist in this repo.
- The teaser fallback was kept restrained and token-driven rather than made more decorative to compensate for the missing serif voice.
- All bar geometry in the new card and popup follows one shared helper pattern: capped fill width plus plan tick percentage based on `actual` vs `plan`.
- Verdict states stay fully neutral; only the injections tile uses the injection semantic family.
- The redesign pass intentionally moved Section 3 back into the same title, subtitle, nested-surface, and expandable-row language already used by the surrounding analytics cards instead of pursuing a custom standalone visual treatment.
- The drawer now exposes a visible title and support line so the detail layer feels like a normal Stashy analytics sheet rather than hidden accessibility-only copy with one long sentence.
- The second-pass polish removed the separate summary stat-tile row and absorbed the key figures into the primary summary surface so the card has one dominant read path before the support layers.
- The teaser and drawer were refined through rhythm and restraint rather than extra decoration, keeping the screen aligned with Stashy's warm ledger tone.
- The latest revisit removed explanatory prose that did not add unique information and shifted the card back toward "headline + semantic bar + numbers" instead of "headline + repeated sentence + repeated numbers."
- Main comparison bars now follow Stashy's semantic system more closely: variable structure for the base comparison, expense for genuine overrun, injection only where intervention meaning is actually present, and fixed/expense cues for manual fixed calibration rows.
- Analytics cards should no longer trust hand-authored month status fields when raw spending fields can derive them. The data layer now normalizes those values so Section 3 can act as a source of truth without diverging from the earlier cards.
- Fixed spend left does count against the effective cap path now through derived `fixedOverspend`; the month truth is recomputed from actual fixed bucket totals before analytics views are built.
- Closed-month verdict truth now lives in `components/analytics/data.ts`, and both Section 3 plus `MonthlyHealthCard` consume that shared outcome instead of each deriving their own result language.
- `MonthlyHealthCard` should remain the top-line answer card for the month close, while `HowMonthLandedCard` should explain how the final cap was formed and explicitly call out fixed overspend carry when it reduced that cap.
- Closed-month Section 3 should not compare major-inclusive spend against a cap already reduced by major; majors stay visible as cap reducers, not as double-counted actuals in the primary comparison.
- Final product split for closed months is now explicit: Card 1 answers the variable-lane outcome, while Section 3 answers the whole-month outcome. They are allowed to show different numbers because they are now intentionally solving different user questions.
- In whole-month closeout, unused manual fixed improves the month result without requiring an explicit transfer, but recurring/installment fixed leftover does not auto-return to the month result.
- Point B arithmetic must be anchored to Point A plus allowed manual-fixed return, not to raw fixed actuals alone; otherwise the whole-month card drifts in months where no manual-fixed leftover exists.
- Closed months should never use rounded projection math for their final Point A remainder; exact actuals are required once the month is closed.
- Section 3 should stay tightly focused on "what was left or over" and "why," not re-explain where spending went. Spend composition belongs to earlier analytics sections; the budget path is now the single explanatory spine for closeout logic.
- Once the logic became stable, the remaining quality problem in Section 3 was hierarchy, not content. The card now works better when it behaves like one closeout story with a visual path and a collapsed detail handoff, rather than three mini analytics modules stacked together.
- The manual-fixed summary must never imply a netted fixed result. Returned unused manual fixed and manual fixed overspend pressure are separate facts in Stashy and need to stay separate in UI summary language.
- The old Section 3 references were removed repo-wide to satisfy the explicit cleanup verification gate for this work block.

---

## Open Blockers

1. `pnpm lint` still fails on the same pre-existing unrelated issues, unchanged by this session:
   - `components/tracker/tracker-transfer-drawer.tsx` — unused `surfacePanelClass` import
   - `components/settings/settings-sections.tsx` — unused `SubSectionHeader` declaration
2. Manual browser verification in the sandbox UI was not performed in this environment. A visual pass is still recommended for teaser atmosphere, drawer scroll feel, and Arabic bidi rendering.

---

# Session 2 — HowMonthLandedCard UI/UX audit and structural fix

**Time:** Continuous with session 1 (same day, user-initiated review after visual inspection)

---

## Status at Session Start

Session 1 shipped the card's logic and hierarchy redesign, but a visual audit of the rendered output revealed five concrete layout problems in the closed-month mode.

---

## Completed This Session

- Audited five structural UI/UX issues identified from a screenshot review:
  1. Two-column flex layout in the summary surface causing collision between verdict text and the side stats mini-panel on narrow mobile widths
  2. The big result amount (`+620 EGP`) floating unanchored inside the left flex column instead of reading as the bar's outcome
  3. Stepper dot/line misalignment: connector line at `start-[0.5rem]` (8px) clipped the left edge of dots positioned at `start-2` (also 8px) with `size-3`/`size-2.5` widths — line was not centered on the dots
  4. Budget path section header (`BUDGET PATH` eyebrow + title + subtitle) visually disconnected from the stepper card below it due to equal spacing above and below
  5. Manual fixed settlement button: title/description fought horizontally with the chip pills, causing 3-line title wrapping on narrow screens
- Implemented all five fixes in `components/analytics/how-month-landed-card.tsx`:
  - Replaced the two-column `flex flex-wrap items-start justify-between` layout with a single-column `space-y-4` stack: badge → verdict headline → stat rows (spent/budget) → bar → result caption
  - Moved the big result amount from the left column to the bar caption row, sized at `text-[1.375rem]` with `items-baseline` alignment against the verdict label
  - Fixed stepper alignment: dots moved from `start-2` → `start-[0.3125rem]`, connector line moved from `start-[0.5rem]` → `start-[0.6875rem]` (now centered on both dot sizes)
  - Tightened budget path header-to-card gap from `space-y-3` → `space-y-2`, added `px-0.5` optical indent to the header block
  - Restructured manual fixed settlement button: title + chevron on top row (full-width minus icon), description on second line, chips row below as flex — removes all wrapping
- Removed the floating side stats mini-panel (`min-w-[8.5rem] bg-surface-2/80`) entirely; its content now lives as clean full-width stat rows inside the main surface
- Removed the orphaned `MONTH RESULT` eyebrow label (no longer needed; result amount is self-evident as the bar caption)
- Verified: `get_errors` returned no TypeScript errors on the touched file

---

## Decisions Made

- The result amount belongs below the bar, not mid-column. The bar establishes the comparison context; the amount is its resolution.
- The side stats panel was removed rather than repositioned — it duplicated information that reads more clearly as inline rows with the verdict headline above them.
- Stepper alignment uses `start-[0.3125rem]` / `start-[0.6875rem]` because those values center the `size-3` (12px) anchor dots and `size-2.5` (10px) delta dots on the same 1px line (centers at 11px and 10px respectively — close enough visually).
- The budget path section header uses `px-0.5` to visually inset it as a label for the card below, not a standalone section element.
- Chip pills in the manual fixed button now live on a separate row below title+desc, not horizontally beside them. This preserves the two separate-fact display of returned vs. pressure without layout collapse.

---

## Open Blockers

1. Pre-existing `pnpm lint` failures unchanged (same two unrelated files).
2. Visual review pending in sandbox browser after user reviews this session's changes.

---

# Session 3 — Card split: summary card + budget path card; ledger stepper redesign

**Time:** Continuation of same day

---

## Status at Session Start

Session 2 fixed the five UI/UX layout bugs. The user then identified that the card was still visually noisy, especially the budget path stepper, and requested: (1) split the single card into two separate cards, and (2) redesign the budget path to be cleaner and less visually cluttered.

---

## Completed This Session

- Created `components/analytics/budget-path-card.tsx` — new standalone card for the budget path:
  - Returns `null` for in-progress months (no closed path to show)
  - Redesigned stepper: **no dots, no vertical connector line, no nested `bg-card` row backgrounds**
  - Container uses `divide-y divide-border-subtle overflow-hidden rounded-[var(--radius-md)]` for natural group separation
  - Three groups: (1) base budget anchor + injection/received deltas + adjusted anchor if changed, (2) variable close bridge + manual fixed returned/overspend deltas, (3) final result row
  - `StepRow` emphasis types: `anchor` (full-width, `font-medium`), `delta` (indented `ps-3.5`, `text-xs`), `bridge` (full-width, normal weight, with `text-[11px]` hint below), `final` (full-width, `font-medium`, `text-[1.0625rem]` amount)
  - Manual fixed settlement button and `HowMonthLandedPopup` drawer trigger moved here from `HowMonthLandedCard`
  - All amount `<p>` elements use `whitespace-nowrap` to prevent EGP currency wrapping
- Stripped `components/analytics/how-month-landed-card.tsx` to summary surface only:
  - Removed imports: `ArrowRight01Icon`, `HugeiconsIcon`, `React`, `HowMonthLandedPopup`
  - Removed types: `StepRow`
  - Removed functions: `StepperRow`
  - Removed closed-state variables: `bucketsWithDelta`, `hasAdjustedBudget`, `variableOutcome`, `budgetSupportRows`, `manualSettlementRows`, `stepRows`
  - Removed JSX: budget path section, manual fixed button, `<HowMonthLandedPopup>`, `<>` fragment wrapper
  - Now returns just the verdict card: badge → verdict headline → stat rows → progress bar → result amount
- Updated `components/analytics/analytics-screen.tsx`:
  - Added `import { BudgetPathCard } from "@/components/analytics/budget-path-card"`
  - Renders `<BudgetPathCard month={selectedMonth} />` immediately after `<HowMonthLandedCard month={selectedMonth} />`
- Verified: `get_errors` returned no TypeScript errors on all three touched files

---

## Decisions Made

- Two cards (summary + budget path) rather than three. The summary card answers "what happened?" The budget path card answers "how did we get there?" Two questions, two cards — no further split needed.
- The budget path stepper drops all decorative chrome (dots, lines, row backgrounds) in favor of typography hierarchy and `divide-y` group separation. Decoration was the noise source; the content was already clear.
- Delta rows use `ps-3.5` indentation as the only sub-item indicator. No visual markers needed when emphasis type already differentiates anchor vs. delta via text size and weight.
- `bridge` rows (variable close) use normal text weight but a colored amount. The hint text in `text-[11px] text-text-tertiary` provides the bridge-to-Card-1 context without a separate label row.
- `BudgetPathCard` returns `null` for in-progress months. There is no teaser for the path — the summary card already has the in-progress teaser.
- All popup/drawer logic (manual fixed settlement, `HowMonthLandedPopup`) stays with the budget path card because that card owns the detailed explanation layer.

---

## Open Blockers

1. Pre-existing `pnpm lint` failures unchanged (same two unrelated files).
2. Visual review pending in sandbox browser — user to confirm card split rendering and budget path ledger style.
