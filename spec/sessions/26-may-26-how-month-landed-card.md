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
- The old Section 3 references were removed repo-wide to satisfy the explicit cleanup verification gate for this work block.

---

## Open Blockers

1. `pnpm lint` still fails on the same pre-existing unrelated issues, unchanged by this session:
   - `components/tracker/tracker-transfer-drawer.tsx` — unused `surfacePanelClass` import
   - `components/settings/settings-sections.tsx` — unused `SubSectionHeader` declaration
2. Manual browser verification in the sandbox UI was not performed in this environment. A visual pass is still recommended for teaser atmosphere, drawer scroll feel, and Arabic bidi rendering.
