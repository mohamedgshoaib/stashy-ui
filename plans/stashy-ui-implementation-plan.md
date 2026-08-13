# Stashy-UI — Analytics restructure & page naming: Implementation Plan

**Repo:** `stashy-ui` (Next 16 / React 19 / Tailwind 4 / next-intl mobile sandbox)
**Canonical path:** `plans/stashy-ui-implementation-plan.md`
**Working branch:** `analysis_audit` (commit here; the PR opens from this branch)
**Status:** Planning complete. All decisions below are **locked** — do not redesign, re-litigate, or "improve" them.
**Scope:** `stashy-ui` only. No `stashy-api` changes. No `stashy-mobile` changes.

---

## 0. How to use this document

This plan is **self-contained**. Everything needed is here — do not go looking for a Notion page, and do not treat any external note as authoritative.

**Work phase by phase.** Each phase is independently completable and independently verifiable. Do not start a phase before the previous one passes its verification gate. Do not batch phases together to "save time" — the phase boundaries exist so a failure is attributable.

Each phase states:

- **Goal** — what the phase achieves
- **Why** — the reasoning, so you can resolve ambiguity correctly rather than guessing
- **Files** — what you will touch
- **Changes** — what to do
- **Do NOT** — the specific wrong turns available in this phase
- **Verify** — the gate

**Standing rules for every phase:**

- Run `pnpm typecheck && pnpm lint` at the end of each phase. Both must be clean _of new errors_.
- Do not introduce inline hex colours. Design-system tokens only.
- Do not use physical directional Tailwind utilities (`ml-`, `mr-`, `pl-`, `pr-`). Use logical ones (`ms-`, `me-`, `ps-`, `pe-`).
- All financial amounts render with `dir="ltr"`.
- Dynamic percentage widths use inline `style={{ width: ... }}`, never Tailwind arbitrary values (JIT-safety).
- Arabic wording that is not layout-affecting is a translation-pass decision at implementation time, not a planning blocker. Author it in the existing `messages/ar.json` register and list every authored Arabic string in the PR body for review. Layout-affecting Arabic explicitly locked in this plan remains locked.
- If reality contradicts this plan, **stop and report**. Do not improvise a fix. The plan was written against live code but code may have moved.

### Known pre-existing failures — do not chase these

These exist before you start and are **out of scope**. Do not fix them, do not let them block a phase gate:

- `pnpm lint` errors in `components/settings/settings-screen.tsx`, `components/settings/settings-sections.tsx`, `components/tracker/tracker-transfer-drawer.tsx` (unused declarations/imports).
- A possible `pnpm build` failure on `/[locale]/tracker` relating to a `useSearchParams()` Suspense boundary.

If you see a lint or build error, first confirm whether it is in this list. Only errors in files **you touched** are yours.

---

## 1. Context you need before touching anything

### What Stashy is

A daily-rate budgeting product for the Egyptian market, EN/AR with RTL. The user sets a monthly budget representing what they intend to spend. **The single overriding goal is not to exceed it.**

Four principles govern every judgement call in this plan:

1. **Exact and under are both success. Over is the one outcome the product exists to prevent.** Never treat underspending as virtue or saving as a goal.
2. **The daily rate is the primary signal.** EGP-denominated language throughout. Percentages are not first-class.
3. **Stashy does not moralize spending. Numbers are facts, not verdicts.**
4. **Every element earns its place by answering a question the user actually cares about.**

### The surfaces

| Surface                           | Role                                                                       |
| --------------------------------- | -------------------------------------------------------------------------- |
| **Home**                          | The glance. Converts everything into one actionable number (today's rate). |
| **Tracker → being renamed Fixed** | Per-item current-month detail for the fixed lane.                          |
| **History**                       | The complete transaction record. Read-only, non-interpretive.              |
| **Analytics**                     | The sit-down. Decomposes the month. The interpretive layer. Pro-gated.     |

### What this work does, in one paragraph

Analytics is being restructured from **three peer sections** into a **two-slot skeleton**: a _hook_ that swaps its question depending on whether the month is in progress or closed, and a _detail_ slot that is identical in both views. Two card branches that only existed to fill the old structure are deleted. The six detail cards are reordered by descending behavioural leverage. Alongside this, section copy, card headers, a chart legend, one badge interaction, and the Tracker page name are all corrected.

---

## 2. Phase 0 — Orientation

**Goal:** Load repo conventions before writing code.

**Changes:**

1. Read `AGENTS.md`, `spec/index.md`, `spec/DESIGN.md`, and `.cursorrules`. These govern component patterns, tokens, and RTL rules and **override any styling guess** you would otherwise make.
2. Read `spec/controlled-design-system.md` and `spec/brand-color-audit.md` if present — Phase 4 depends on colour-token semantics.
3. Confirm the worktree is clean and you are on the correct working branch: `analysis_audit`.
4. Read the current `components/analytics/analytics-screen.tsx` in full. It is the spine of Phases 1–5.

**Verify:** You can state, without looking again, the current Section 2 card order and which `SectionHeader` carries `showDivider={false}`.

---

## 3. Phase 1 — The two-slot page skeleton

**Goal:** Replace three unconditional sections with two status-dependent slots, and apply the locked card order.

### Why

The old structure was three peer sections, which forced every section to render _something_ in every month state — producing a retrofitted closed-month card branch and a mid-month ghost teaser, both deleted in Phases 2–3.

The new skeleton has one crucial property: **nothing physically reorders under the month picker.** Slot 1 changes its title _and_ its contents together, so it reads as a different question being asked. Slot 2 is byte-identical in both views. Six near-identical cards silently resequencing mid-page would read as broken and destroy scroll memory — which is why a per-status card order was **considered and rejected**.

### Files

- `components/analytics/analytics-screen.tsx`

### Changes

Replace the three-section block inside the non-free-plan branch with two slots:

**Slot 1 — the hook.** Branch on `selectedMonth.status`:

- `inProgress` → `SectionHeader` with `section.onPace.*` + `<MonthlyHealthCard month={selectedMonth} />`
- `closed` → `SectionHeader` with `section.landed.*` + `<HowMonthLandedCard month={selectedMonth} />` then `<BudgetPathCard month={selectedMonth} />`

**Slot 2 — the detail.** No branch. `SectionHeader` with `section.where.*`, then the six cards in this **locked order (A1)**:

1. `BudgetCompositionCard`
2. `VariableAnalysisCard`
3. `FlaggedAsMajorCard`
4. `FixedAnalysisCard`
5. `PaymentMethodCard`
6. `MethodObligationCard`

Preserve every existing prop on every card exactly as it is today (`month`, `data`, `prevPaymentMethods`). This phase moves components; it does not change their inputs.

**Divider handling:** the slot-1 header is always the first element on the page, so it keeps `showDivider={false}`. The slot-2 header uses the default (`true`). `SectionHeader` needs **no new prop**.

**Keep** `BudgetPathCard`'s internal `null` return for in-progress months as a defensive guard, even though it can no longer be reached.

### The order's rationale (so you can defend it, not change it)

Descending behavioural leverage: _frame → what you can act on daily → the flag on that lane → bounded envelopes → reconciliation → what was never a decision._ It continues the in-progress hook's variable-lane thread instead of changing subject; it puts what the user can still change nearest the top; it seats Major beside Variable where it belongs; and it makes the two per-method cards adjacent for the first time.

**Accepted cost, taken knowingly:** at month-end reconciliation, the payment-method answer is five cards down.

### Do NOT

- Do NOT add a third `SectionHeader`, a sub-label, or any grouping element between cards 4 and 5. This was considered at length and rejected: it would invent a page-level component that does not exist, and **a weak break is the worst kind — strong enough to interrupt the descent, too weak to organise it.**
- Do NOT branch Slot 2 on month status in any way.
- Do NOT move `BudgetPathCard` away from `HowMonthLandedCard`. They must stay adjacent — the ledger's final row _is_ the verdict number, and separating them would show the same figure at the top and bottom of a long page.
- Do NOT change the header block, month picker, upgrade gate, or bottom navigation.

### Verify

`pnpm typecheck && pnpm lint`. Then confirm by reading: exactly two `SectionHeader` calls render in either month state.

---

## 4. Phase 2 — Retire `MonthlyHealthCard`'s closed-month branch

**Goal:** Delete the closed-month path from a card that now only ever renders in progress.

### Why

The card's question is "Are you on pace?" — which has **no meaning once a month is closed**. Its closed branch also restated the variable-lane number that `BudgetPathCard`'s variable-close bridge row already carries in context.

Two pieces of evidence that it was a retrofit rather than a design: the closed branch **hides the card's own central bar** (it has no closed-month meaning), and it still renders `Month progress %`, which is always 100% on a closed month. _A surface that hides its own primary element in a state is a retrofit._

### Files

- `components/analytics/monthly-health-card.tsx`

### Changes

Remove the closed-month path entirely:

- `isClosed` and `closedVerdict` locals, and the `closedBadgeTone` / `closedHeroTone` lookup maps.
- The closed branches in `badgeConfig`, `heroSign`, `heroColorClass`, `heroLabel`, `projectionNode`, and `barFillClass` — each collapses to its in-progress form keyed on `month.monthlyState` (`onTrack` / `atRisk` / `over`).
- The `!isClosed` condition on the progress bar render. The bar's remaining condition is `state !== "over"`.
- The `!isClosed` condition on the inject button. Its remaining condition is `state === "over"`.
- Any now-unused imports (`ClosedMonthVerdict` type, icons only used by the closed branch).

### Do NOT

- Do NOT remove `closedMonthVerdict` from `components/analytics/types.ts` or from the derivation in `components/analytics/data.ts`. **It is still consumed elsewhere.** Only this card's _use_ of it goes.
- Do NOT delete the `monthlyHealth.closed.*` i18n keys in this phase. They are handled under grep discipline in Phase 10.

### Verify

`pnpm typecheck && pnpm lint`. Confirm the file contains no reference to `status === "closed"` or `closedMonthVerdict`.

---

## 5. Phase 3 — Retire `HowMonthLandedCard`'s in-progress teaser

**Goal:** Delete the mid-month teaser branch from a card that now only ever renders on closed months.

### Why

The teaser's justification was _"anticipation is the surface's job."_ **That reasoning was circular** — the surface existed mid-month only so the section had something to render, so its job was invented by the problem it was solving. With the section absent from the in-progress page entirely, the job is gone.

This deletion also removes the **only sanctioned exception** to the empty-state doctrine, which now reads without qualification: a single quiet line, or hide the component entirely — never placeholder shapes.

### Files

- `components/analytics/how-month-landed-card.tsx`

### Changes

- Delete the entire `inProgress` early-return branch: the pulsing badge, the holding title and body, and the ghost pill/bar shapes.
- The component now assumes a closed month and proceeds directly to the verdict surface.
- Remove any locals and imports used only by the teaser (e.g. a `monthLong` label computed only for the teaser body — check before removing; `monthShort` may still be needed by the closed badge).

### Do NOT

- Do NOT delete the `howMonthLanded.teaser.*` i18n keys here. Phase 10.
- Do NOT alter the closed verdict surface in this phase. Its colour change is Phase 4.

### Verify

`pnpm typecheck && pnpm lint`.

---

## 6. Phase 4 — Whole-budget verdict colour → two-tone

**Goal:** Collapse a three-tone verdict to two tones.

### Why

Two independent arguments.

**Philosophy.** Exact and under are both success; over is the one outcome the product prevents. Three colours assert three outcomes where the product recognises two. The obvious objection — that exact and under are genuinely different _facts_ — fails, because that difference is already carried twice on this card: verbally by the headline (`verdictWhole.*`) and numerically by the delta at `1.375rem`. **A third encoding adds no information, only valence.**

**A colour collision, and the stronger argument.** `exactBudget` was painted with the **`fixed` token (Teal Ledger)** — a _structural category_ colour borrowed for a _verdict_. Teal means "the Fixed lane" everywhere else on the page. Two-tone dissolves this for free.

### Files

- `components/analytics/how-month-landed-card.tsx`

### Changes

Collapse `getSummaryTone(verdict)` to two branches:

- `overBudget` → expense family: `semanticTextClass.expense`, `semanticProgressClass.expense`, tick `bg-expense/70`, actual value `text-expense`.
- **everything else** (`underBudget` and `exactBudget`) → income family: `semanticTextClass.income`, `semanticProgressClass.income`, tick `bg-income/70`, actual value `text-foreground`.

The `fixed` token drops out of verdict use entirely in this file.

### Do NOT

- Do NOT touch `getManualRowTone` in `how-month-landed-popup.tsx`. It applies expense tone to over-plan manual buckets and looks like a doctrine violation. **It is not.** The governing rule is: _expense tone is allowed when something exceeds its own plan (a genuine overrun); it is not allowed when comparing one period to another (calibration)._ An over-plan bucket is an overrun. **Change no code there.**
- Do NOT remove the `exactBudget` verdict from `WholeBudgetVerdict` or from the data layer. Only its _colour_ changes; its headline and delta stay distinct.

### Verify

`pnpm typecheck && pnpm lint`. Carry **verify-on-render item VR-4** to Phase 11.

---

## 7. Phase 5 — Section titles and subtitles

**Goal:** Apply the locked EN strings and matching AR.

### Why

The old copy was written for three peer sections and read as _areas of a report_. The new skeleton is **one question, then one descent**.

Two rules drive the strings:

**The hook asks a question in both views.** Previously the slot changed _voice_, not just tense — "Are you on pace?" is interrogative and addressed to _you_; "How the month landed" was declarative and about _the month_. Grammatically that read as two different surfaces, defeating the point of a single slot. The **subject shift (`you` → `the month`) is kept deliberately**: mid-month the thing in question is your behaviour, still yours to change; once closed it is the month, settled. Keeping _the month_ as subject on the closed view also keeps blame off it.

**The detail slot goes tense-neutral without a status branch.** Branching would violate Phase 1's identical-slot lock, so the fix had to be one title correct in both. Habitual present ("goes") is genuinely tense-neutral in EN, unlike "is going".

### Files

- `messages/en.json`
- `messages/ar.json`

### Changes — EN (locked, use verbatim)

| Key                                 | Locked value                                                              |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `Analytics.section.onPace.title`    | `Are you on pace?` — **unchanged**                                        |
| `Analytics.section.onPace.subtitle` | `Where you stand right now and where you'll likely land.` — **unchanged** |
| `Analytics.section.landed.title`    | `How did the month land?`                                                 |
| `Analytics.section.landed.subtitle` | `The final result, and how the month got there.`                          |
| `Analytics.section.where.title`     | `Where the budget goes`                                                   |
| `Analytics.section.where.subtitle`  | `How this month's spending splits across plan and reality.`               |

`landed.subtitle` was not merely stale — the old value ("A look back at how each month ended") **described retired behaviour**, dating from when this was a permanent history-browsing section. It now describes exactly one month, and must name both cards in the slot the way `onPace.subtitle` names both halves of its card: _"the final result"_ (`HowMonthLandedCard`) _"and how the month got there"_ (`BudgetPathCard`). It also lacked the terminal period its two peers have.

### Changes — AR

- `Analytics.section.landed.title`: currently `كيف انتهى الشهر`. **This is punctuation only** — `كيف` is already an interrogative particle, so it becomes `كيف انتهى الشهر؟`. No rewording.
- `Analytics.section.landed.subtitle` and `Analytics.section.where.title` / `where.subtitle`: produce accurate Arabic matching the new EN meaning. Follow the existing Arabic register in the file.
- **Known drift to resolve while you are here:** EN `where.title` says "the budget" while AR says `ميزانيتك` (_your_ budget). Drop the second-person possessive and use the definite form in Arabic. Both hook strings stay second person in both locales. **The EN strings above are locked; adjust AR.**

### Do NOT

- Do NOT "fix" the apparent repetition between `onPace.subtitle` ("where you'll likely **land**") and `landed.title` ("How did the month **land**?"). **This is deliberate** — the same verb, a mid-month promise delivered on close. Protect it.
- Do NOT rename the `section.landed.*` or `section.where.*` key paths. They stay; only values change.
- Do NOT delete `section.landed.*` in Phase 10. It is live and retitled, not orphaned.

### Verify

`pnpm typecheck && pnpm lint`. Render both locales and confirm no missing-key warnings.

---

## 8. Phase 6 — Section 2 card header canonicalisation

**Goal:** One header pattern across all six detail cards.

### Why

Header drift was narrower than it looked — all six titles were already `text-[1.0625rem]`, and four of six headers were already identical. The drift was concentrated in **two** cards.

The payoff is structural, not cosmetic: **the header-end slot ends with exactly one occupant on the entire page — the total budget on `BudgetCompositionCard`.** That states the card's frame role more strongly than any styling treatment could, and it is free.

### Files

- `components/analytics/budget-composition-card.tsx`
- `components/analytics/payment-method-card.tsx`
- `components/analytics/fixed-analysis-card.tsx`
- `components/analytics/method-obligation-card.tsx`
- `messages/en.json`, `messages/ar.json`

### The canonical header (locked)

A `space-y-1` stack:

- title — `text-[1.0625rem] font-medium text-foreground`
- subtitle — `text-sm leading-[1.5] text-text-secondary text-pretty`

### Changes

**`VariableAnalysisCard` and `FlaggedAsMajorCard`** — already canonical. Touch nothing.

**`FixedAnalysisCard` and `MethodObligationCard`** — add `text-pretty` to the subtitle. Nothing else.

**`BudgetCompositionCard`:**

- title `font-semibold` → `font-medium`
- subtitle: drop `text-xs`, `text-text-tertiary`, `max-w-[24ch]` → canonical classes
- **end slot unchanged**: the total budget stays at `text-[1.125rem] font-semibold` with its `composition.totalBudgetLabel` caption beneath, in its `shrink-0 text-end` block

Both title and subtitle deviations were inherited from an older pass, not from the card's frame role. **The frame role belongs to the number, not the heading.**

**`PaymentMethodCard`:**

- move the subtitle out of the header-end slot into the canonical stacked position under the title
- header row alignment `items-baseline` → `items-start`
- **the end slot empties**
- rewrite `Analytics.methods.subtitle`. Locked EN: **`Total on each payment method, and what made it up.`** Author the Arabic equivalent in the existing register and list it in the PR body. It is currently the fragment **"by method"**, which only read as a subtitle because of where it sat. The replacement is a full clause naming the card's job: how much total was spent on each payment method this month, and how that total splits across fixed / variable / major.

### Do NOT

- Do NOT use a chip for the total. No chips exist anywhere in Section 2, and a chip would shrink a total just locked as prominent.
- Do NOT delete `methods.subtitle`. It is **rewritten, not removed** — do not include it in Phase 10's orphan sweep.
- Do NOT put anything else in any card's header-end slot.

### Verify

`pnpm typecheck && pnpm lint`. Carry **VR-3** to Phase 11.

---

## 9. Phase 7 — `VariableAnalysisCard` even-pace legend gains its value

**Goal:** Anchor the even-pace reference line to a concrete number.

### Why

The chart draws an even-pace reference line — the trajectory of a perfect daily-rate spender — but never says what that pace _is_ in EGP. The fix must not create a second rate concept competing with Home's Today's Rate.

**The legend, not a caption.** The existing legend entry gains the number because: it invents no component and no layout; it is quiet by construction at `text-[10.5px]`, which is exactly the "must not compete with Home's Today's Rate" constraint; and it labels the line **at the point of reference**. A standalone caption beneath the chart would be a second EGP/day figure with its own visual weight — precisely the problem this resolution exists to avoid.

### Files

- `components/analytics/variable-analysis-card.tsx`
- `messages/en.json`, `messages/ar.json`

### Changes

- `Analytics.variable.legend.evenPace`: `"Even pace"` → `"Even pace · {amount}/day"`. Author the Arabic equivalent in the existing register and list it in the PR body.
- Value = `month.effectiveVariableBudget / month.daysInMonth` — **the slope of the line the chart already draws.** Deriving it from the same source means the caption and the line cannot desync, including after a mid-month injection changes the effective budget.
- **Round to whole EGP. No decimals, no tilde.** Home's Today's Rate shows decimals (e.g. `615.38`); keeping this figure whole is a cheap signal that these are different objects — one a live recalculated rate, the other a static month-long reference.
- Keep the existing legend styling and position. The swatch, the `text-[10.5px]`, the flex row: unchanged.

### Do NOT

- Do NOT introduce a "Base Rate" label or any new rate concept.
- Do NOT recompute the slope independently of the chart's `evenPace` series.
- Do NOT add a caption element beneath the chart.

### Verify

`pnpm typecheck && pnpm lint`. Toggle the sandbox injection state and confirm the legend figure moves with the line.

---

## 10. Phase 8 — `FixedAnalysisCard` overrun badge → tap-to-expand

**Goal:** Let the aggregate overrun badge disclose which buckets are overrunning.

### Why — and note this reopens a lock

⚠️ A locked decision said _"No bucket-level lists — aggregate signals only"_ and _"this card never lists individual bucket names."_

**The reopening is justified, narrowly.** The lock protected the card's **scan path** from becoming a list. Progressive disclosure behind a tap leaves the default state aggregate and unchanged. **The lock's intent survives; only its wording was wrong.** The governing rule is now: _aggregate by default; bucket names only behind explicit disclosure._

### Files

- `components/analytics/fixed-analysis-card.tsx`
- `messages/en.json`, `messages/ar.json`

### Changes

- The overrun badge becomes a **button only when `manualOverCount > 0`**. The income-tone "All within budget" state stays a static span — there is nothing to disclose.
- **Inline expand, not a drawer.** This card already contains an inline collapsible (the "Envelope transfers" block reading `month.fixedTransfers`). **Reuse that pattern.** A drawer would invent an interaction this card does not have.
- Collapsed by default. Chevron affordance on the badge, rotating on expand. Minimum **48×48** Stashy touch target per `spec/DESIGN.md`; match the existing `min-h-12` pattern rather than the generic 44px accessibility floor.
- Rows: **overrunning buckets only**, sorted by overage descending. Each row shows bucket name + over-by amount.
- **Amounts neutral-toned.** These are magnitude, not pace, and not a verdict. Do not apply expense tone to the row amounts.
- Add these locked key paths under `Analytics.fixed.*`, with Arabic equivalents authored in the existing register and listed in the PR body:
  - `overrunDisclosureShow` = `Show overrunning budgets`
  - `overrunDisclosureHide` = `Hide overrunning budgets`
  - `overrunRowOver` = `{amount} over`
- The show/hide strings are the accessible label on the badge button, paired with `aria-expanded`. The badge's visible text remains `fixed.someOverrunning`, unchanged.

### Do NOT

- Do NOT make the "All within budget" state tappable.
- Do NOT add pace, trend, or "spending faster than usual" tagging. That is designed but **explicitly parked** — see §14.
- Do NOT list non-overrunning buckets.
- Do NOT convert this to a drawer/sheet.

### Verify

`pnpm typecheck && pnpm lint`. Exercise both states via the sandbox `fixedBudgetOverrun` toggle. Confirm RTL: chevron direction and row alignment.

---

## 11. Phase 9 — Page naming: Tracker → Fixed / الثابت

**Goal:** Rename the fixed-lane page in user-facing copy.

### Why

The positioning argument (Stashy is budget _management_, not tracking) is real but soft. **The decisive argument is accuracy:** `tracker-screen.tsx` has been **fixed-only** since May — one `TrackerFixedTab` (Budgets → Recurring → Installments) plus the add FAB; Major and History tabs were removed. "Tracker" points a user expecting all their transactions at the wrong surface — that is the History page.

_Commitments_, _Budgets_, and _Plan_ were each considered and rejected. **Plan** in particular reads easier on day one but hides the model forever — and fixed/variable is the one distinction the user must learn for the daily rate to make sense. A nav item called "Fixed" teaches that vocabulary on every glance.

**On the Arabic:** use `الثابت` (definite), **not** bare `ثابت`. The product's Arabic has already established `الثابت` as a **lane noun** rather than an adjective, in `budgetPath.rows.manualFixedOverspend`, `budgetPath.rows.manualFixedReturned`, `Home.drawer.settings.fixedOverrunLabel`, and `budgetPath.manualFixed.title`. The definite article is load-bearing: bare `ثابت` is what the _segment_ labels use (`Home.budget.fixed`, `History.budgetTypes.fixed`) and reads as a dangling adjective in a dock.

### Files

- `messages/en.json`, `messages/ar.json`

### Changes

| Key                            | EN                                                                                                  | AR                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Home.nav.tracker`             | `Fixed`                                                                                             | `الثابت`                                                                           |
| `Tracker.title`                | `Fixed`                                                                                             | `الثابت`                                                                           |
| `Home.navPlaceholders.tracker` | `Fixed budgets, recurring payments, and installments open here without leaving the mobile sandbox.` | Author an accurate equivalent in the existing register and list it in the PR body. |

**Also in this phase — a pre-existing AR inconsistency, now in scope because nav labels are being touched:** `Home.nav.analytics` is `التحليل` (singular) while `Analytics.title` is `التحليلات` (plural). Dock and page header disagree. **Fix: make the nav match the page title.** Verify both current values before editing.

### Do NOT

- Do NOT rename the `Tracker` i18n namespace. It is dev-facing; renaming is optional cleanup and **not** part of this copy change.
- Do NOT rename the `/[locale]/tracker` route. **Explicitly out of scope.**
- Do NOT rename component files or the `TrackerScreen` component.
- Do NOT rename Analytics to anything. "Insights" was considered and **rejected** — it overpromises interpretation the page deliberately withholds, and does not differentiate.

### Verify

`pnpm typecheck && pnpm lint`. **No dock-fit risk exists** — both labels get shorter (`المتابعة` 8 → `الثابت` 6; "Tracker" 7 → "Fixed" 5) — so no render check is needed for fit.

---

## 12. Phase 10 — i18n orphan sweep and dead-code removal

**Goal:** Remove keys and code orphaned by this work.

### Why this is a phase and not a footnote

**A definitive orphan check is a repo-wide grep.** Planning could not prove any key is unreferenced. Everything below is a **candidate requiring verification**, not a confirmed-dead key. This phase exists because only you can run the grep.

### Method — apply to every candidate

For each key, grep the **entire repo** for the key path, the leaf name, and any dynamic-construction pattern (e.g. ``t(`monthlyHealth.closed.badge.${verdict}`)``). **Template-literal key construction is the main way a key looks dead and is not.** Only delete when all three forms have zero matches **outside `messages/en.json` and `messages/ar.json`**; the candidate's own definitions in those two files do not count as live usage.

### Candidates — delete from **both** `en.json` and `ar.json` if grep confirms

| Candidate                                                                                              | Note                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `Analytics.pacing.*` (`contextSentence`, `aheadLabel`, `behindLabel`, `barLabel`, `injectionFootnote`) | Safest of the set — `PacingCard` no longer exists at all                                                                     |
| `Analytics.monthlyHealth.closed.badge.*`, `.heroLabel.*`, `.context.*`                                 | Orphaned by Phase 2                                                                                                          |
| `Analytics.howMonthLanded.teaser.*`                                                                    | Orphaned by Phase 3                                                                                                          |
| `Home.budget.*` (`title`, `total`, `variable`, `fixed`, `variableCaption`, `fixedCaption`)             | Orphaned by the earlier `BudgetOverviewCard` deletion — **verify carefully**, several leaf names are generic and may collide |

### Do **NOT** delete

- `Analytics.section.landed.*` — **live, retitled in Phase 5**
- `Analytics.methods.subtitle` — **rewritten in Phase 6, not removed**
- Anything in `Analytics.verdictWhole.*` or `summaryWhole.*` — Phase 4 changed colour, not copy

### Dead code

In the same pass, remove code orphaned by Phases 2–3: unused imports, unused type imports, unused helper functions and lookup maps. Same grep discipline — confirm zero references before deleting.

### Verify

`pnpm typecheck && pnpm lint && pnpm build`. Render both locales in every sandbox state and confirm zero missing-key warnings. **Report the grep results for each candidate**, including any you did not delete and why.

---

## 13. Phase 11 — Verify-on-render pass

**Goal:** Observe the five things that were decided on reasoning rather than seen, without changing the locked design.

Mockups were skipped by agreement wherever a change invented no new component or layout. **This phase is the substitute. VR-1 through VR-5 are observation-only. Execute no fallback.** Record objective findings such as measurements, element counts, and scroll depth, then carry all five into the PR body as unchecked review items. Any concern found here requires a new design decision; it does not authorize an implementation change in this pass.

### VR-1 — Closed-month hook weight

**Check:** Render a closed month. Record the hook's element count, measured height, and scroll depth before the first breakdown card. Do not move `BudgetPathCard`: its adjacency with `HowMonthLandedCard` is locked by Phase 1, and moving it after Section 2 would reproduce the rejected top-and-bottom geometry.

### VR-2 — The card 4 → card 5 transition

**Check:** `FixedAnalysisCard` → `PaymentMethodCard`. Record the gap, surrounding card heights, and visible element counts across the transition. Note that `FixedAnalysisCard` carries an undocumented third block — a collapsible "Envelope transfers" section reading `month.fixedTransfers` — which adds real height to card 4. Do not introduce a sub-label.

### VR-3 — `BudgetCompositionCard` header dominance

**Check:** with the title at `font-medium`, record the computed title and total font sizes/weights and their positions. Do not change either value in this phase.

### VR-4 — Exact-budget verdict tone

**Check:** no committed exact-budget scenario exists: available closed-month remainders are 180, 620, and 540, and the sandbox has no exact-budget control. Make a throwaway local edit forcing one closed month's remainder to zero, observe the exact-budget rendering, then revert the edit so nothing from the scenario is committed. If forcing the state is not trivial, record VR-4 as blocked because the mock data has no exact-budget scenario. Do not change the locked two-tone verdict treatment.

### VR-5 — Arabic and RTL sweep

**Check, across every touched surface:** the new section strings do not wrap awkwardly or clip; the Phase 8 expansion rows and chevron mirror correctly; the Phase 7 legend renders its amount LTR inside RTL text without bidi damage; the renamed dock labels sit correctly.

**Reporting:** record specifics. Do not silently reword Arabic during verification; wording changes belong to the implementation translation pass and must be listed in the PR body.

### Final gate

`pnpm typecheck && pnpm lint && pnpm build`, plus targeted `pnpm exec oxfmt --check` on every touched file.

**Then walk every sandbox state** via the Home settings drawer: `monthlyBudgetState` (onTrack / atRisk / over), `plan` (free / paid), `budgetInjection`, `analyticsHistoryMode` (with-history / first-month), `fixedBudgetOverrun`, both locales, in-progress **and** closed months, including a month with `majorCount === 0` (the 5-card collapsed variant — confirm Variable → Fixed still reads as a clean descent).

---

## 14. Explicitly out of scope

Do not implement, do not "while I'm here" these.

| Item                                                              | Status                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`FixedAnalysisCard` "spending faster than usual" pace tag**     | **Designed, parked.** Needs a per-bucket daily cumulative array on live months _and_ snapshots — a mock data-model change. Everything in this plan is resequencing, copy, and styling against existing data; this would be the only structural data addition. **Parked unless Husseini says otherwise.** |
| **History default-view scope** (excludes fixed spending)          | A **`stashy-api` doc change**, not a mock fix. `docs/Stashy_logics/Stashy_Documentation.md` §15 documents the default as "Variable + Major"; that rule has been decided wrong. The doc is edited first; the mock follows. **Not in this repo, not in this plan.**                                        |
| **`/[locale]/tracker` route rename**                              | Out of scope.                                                                                                                                                                                                                                                                                            |
| **`Tracker` i18n namespace rename**                               | Optional dev-facing cleanup. Out of scope.                                                                                                                                                                                                                                                               |
| **Free vs Pro gating boundary**                                   | Undecided. Do not change what is gated.                                                                                                                                                                                                                                                                  |
| **Analytics gate copy** (`upgrade.title` / `upgrade.description`) | Noted as the right home for aspirational framing. **Not actioned here.**                                                                                                                                                                                                                                 |
| **`getManualRowTone` in `how-month-landed-popup.tsx`**            | Looks like a colour-doctrine violation. **It is not.** Change no code.                                                                                                                                                                                                                                   |
| **Any `stashy-api` or `stashy-mobile` change**                    | Out of scope.                                                                                                                                                                                                                                                                                            |

---

## 15. Reporting back

When all phases pass, report:

1. **Per phase:** what changed, and anything that did not match this plan.
2. **Phase 10:** grep results per candidate — deleted, or kept and why.
3. **Phase 11:** the outcome of each of VR-1 … VR-5, and whether any fallback triggered.
4. **PR body:** list every Arabic string authored during implementation and carry VR-1 … VR-5 as unchecked review items. No VR fallback may be applied.
5. **Anything you were tempted to fix and did not** — this is often the most useful line in the report.
6. Confirmation that no `stashy-api` or `stashy-mobile` file was touched.

**If any phase reveals that this plan is wrong about live code, stop at that phase and report before continuing.**
