# Stashy-UI — Phase 8c: running-hot signal on Home and Fixed

**Repo:** `stashy-ui` only. No `stashy-api`, no `stashy-mobile`.
**Prerequisite:** Phase 8b (`deriveBucketPaceFlag`, `dailyCumulative`, `RHYTHM_STEADY_BAND`) is **merged**.
**Branch:** create `running-hot-signal` from `main`.
**Status:** design locked. Do not redesign. Implement.

---

## 0. How to use this document

Self-contained. Work **phase by phase**, do not batch. Each phase ends with `pnpm typecheck && pnpm lint`, clean of *new* errors.

Standing rules: design-system tokens only, no inline hex; logical direction utilities (`ms-`/`me-`/`ps-`/`pe-`), never physical; amounts render `dir="ltr"`; dynamic widths via inline `style`.

**Known pre-existing failures — not yours, do not chase:** lint errors in `components/settings/settings-screen.tsx`, `components/settings/settings-sections.tsx`, `components/tracker/tracker-transfer-drawer.tsx`; a possible build failure on `/[locale]/tracker` relating to a `useSearchParams()` Suspense boundary.

**If live code contradicts this plan, stop and report.** Do not improvise.

**Phase 1 is the risky one.** It touches a page this work is not otherwise about. Read it fully before starting, and do not proceed past its verification gate on a partial result.

---

## 1. What this builds, and why

Phase 8b built a pace comparator that flags a manual fixed bucket spending ahead of its own history. It is currently **only reachable inside the Analytics overrun disclosure** — which means it can only fire on buckets *already over plan*, at which point the overage on the same row already says so.

**A behavioural warning gated behind the outcome it warns about is redundant by construction.** This phase moves the signal to where it can do work.

### Two surfaces, two jobs

**Home — the alert.** A conditional strip: *"2 budgets running hot"*. Aggregate only, no names, no figures. It exists to make the user aware something needs attention on a surface they open daily.

**Fixed — the detail.** A "Faster than usual" tag on each hot bucket's card. This is what makes the Home strip's handoff meaningful: you tap through and immediately see *which*.

The strip is aggregate precisely **because** the destination names them. Naming one bucket on Home when three are hot would be a claim the strip cannot back up, and duplicating the naming on both surfaces is redundant.

### Why Home at all

A manual bucket running hot is not only a fixed-lane fact. Manual overspend flows into `fixedOverspend`, which reduces `effectiveVariableBudget`, which lowers the daily rate. **A bucket burning ahead of its own pace is a leading indicator that the daily rate is about to drop** — and the daily rate is the number Home exists to own.

That is what earns it a place on a surface that is deliberately sparse: it changes a decision being made now, and it is un-carryable — nobody tracks their own coffee pace against last month in their head.

### Doctrine this must not violate

- **Stashy does not moralize spending. Numbers are facts, not verdicts.** This is a neutral factual signal, not a scolding.
- **Home converts; it does not decompose.** Home gets a count. Names and detail live on Fixed.
- **Semantic tone is for exceeding your own plan, not for comparing periods.** A cross-period pace comparison is *calibration*. It stays neutral. See §4 and §5 — this is the most likely thing to get wrong.

---

## 2. Phase 0 — Orientation and a blocking survey

**Read:** `AGENTS.md`, `spec/index.md`, `spec/DESIGN.md`, `.cursorrules`. Then `components/analytics/data.ts` (especially `deriveBucketPaceFlag`), `components/analytics/types.ts`, `data/fixed-tracker-mock.ts`, `components/tracker/types.ts`, `components/tracker/tracker-fixed-tab.tsx`, `components/tracker/cards/budget-card.tsx`, `components/tracker/tracker-transfer-drawer.tsx`, `lib/sandbox-budget.ts`, `components/home/home-content.tsx`, `components/home/major-expenses-row.tsx`, `components/home/types.ts`, `components/home/home-data.ts`.

**Survey and report before writing any code:**

1. Every field on `FixedExpenseItem`, and for each one, whether an equivalent exists on the analytics `FixedBucketPlan` / `FixedBucketActual`. Name the fields that have **no analytics equivalent** — this list determines the shape of Phase 1.
2. Every consumer of `data/fixed-tracker-mock.ts` and of `tracker-fixed-tab.tsx`'s local `items` state, including the add/edit save path and `tracker-transfer-drawer.tsx`.
3. The current manual buckets on **both** sides, with IDs, names and budgets.
4. Confirm `deriveBucketPaceFlag` is exported and callable from outside `components/analytics/`.

**Verify:** you can state exactly which `FixedExpenseItem` fields analytics cannot supply.

---

## 3. Phase 1 — Unify the manual bucket data

**Goal:** make the analytics month model the single source of truth for *which manual buckets exist and what they cost*, so the Fixed page can call the comparator.

### Why this is necessary

The two datasets were built independently and disagree: Fixed has *Coffee & Cafes* at 500, analytics has `fb-coffee` at 200. `deriveBucketPaceFlag` is keyed to analytics bucket IDs, so today the Fixed page has no way to ask the question at all.

The real API will have one source of truth for buckets. **Two divergent mock datasets are a fiction the mock is telling that the product will not tell** — unifying makes the sandbox more faithful, not less.

### This is a partial unification, deliberately

**Do not attempt a full replacement.** Analytics does not carry everything Fixed renders — transaction lists, due dates, installment lifecycle fields, per-item status. Forcing those into the analytics model would bloat it to serve one page.

**The split:**

- **Analytics owns the shared facts** — bucket existence, `id`, `name`, `budget`, `type`, `iconKey`, and `spent`. Fixed derives these.
- **Fixed keeps its own presentation-only fields** — transactions, due dates, installment lifecycle, derived status — keyed by the **same IDs**.

Manual buckets are what matter here. Recurring and installment may keep their existing Fixed-side definitions if analytics cannot supply them; report if so.

### Changes

- Add a derivation (natural home: `lib/sandbox-budget.ts`, alongside `getHomeBudgetStrip`) that builds `FixedExpenseItem[]` from the analytics month, merging the Fixed-only fields.
- `tracker-fixed-tab.tsx` seeds its local `items` state from that derivation instead of importing the mock directly.
- **Preserve the local add/edit behaviour.** The tab currently owns state so saves apply immediately and the summary recomputes. That must still work.
- `tracker-transfer-drawer.tsx` reads destination budgets from the live items list — confirm it still resolves after the change.
- Bucket names and budgets on the Fixed page will change to the analytics values. **That is the point.** Do not preserve the old numbers.

### Do NOT

- Do NOT move transactions, due dates, or installment lifecycle data into the analytics model.
- Do NOT delete `data/fixed-tracker-mock.ts` if it still supplies the Fixed-only fields. Reduce it to what analytics cannot provide.
- Do NOT change any analytics-side numbers to make the Fixed page look better. Analytics is upstream.

### Verify

`pnpm typecheck && pnpm lint`. Then walk the **whole Fixed page** in both locales: budgets, recurring, installments, the summary card, the detail sheet, the add/edit drawer, and the transfer drawer. **Report anything that changed visually**, expected or not. Also confirm Analytics is unaffected — it is upstream and must not move.

---

## 4. Phase 2 — "Faster than usual" tag on the Fixed page

**Goal:** show which buckets are hot, on the surface the Home strip sends you to.

### Files
`components/tracker/cards/budget-card.tsx`, `components/tracker/tracker-fixed-tab.tsx`

### Changes

- For each manual bucket, call `deriveBucketPaceFlag(bucketId, month, snapshots)` and pass the boolean to `BudgetCard`.
- When true, render a small tag reading `Analytics.fixed.paceTagFaster` — **reuse the existing key.** Same string on both surfaces; this is one concept.
- Place it with the bucket **name**, not with the amount or the percentage. The tag qualifies the bucket, not the money.
- **Neutral tone.** Quietest available treatment — `text-text-tertiary` on `bg-surface-offset` or equivalent.

### Do NOT

- Do NOT use warning or expense tone. This card **already** colours its progress bar by budget status (green / amber / red). A second coloured signal beside it would read as a compounding alarm, and worse, would assert a verdict on a **cross-period comparison** — which the colour doctrine forbids. Neutral is the whole point.
- Do NOT show a figure, percentage, or direction.
- Do NOT add a new i18n key when `Analytics.fixed.paceTagFaster` exists.
- Do NOT tag recurring or installment cards. Committed obligations have no behavioural pace.

### Verify

`pnpm typecheck && pnpm lint`. Confirm the tag appears on hot buckets **regardless of whether they are over budget** — that is the entire reason this phase exists. Confirm row layout survives in Arabic.

---

## 5. Phase 3 — The Home strip

**Goal:** a conditional aggregate alert on Home.

### Files
`components/home/types.ts`, `components/home/home-data.ts` (or `lib/sandbox-budget.ts`), `components/home/running-hot-row.tsx` (new), `components/home/home-content.tsx`, `components/home/home-screen.tsx`, `messages/en.json`, `messages/ar.json`

### Data

Add a derivation returning the **count of manual buckets currently flagged**, or `null` when zero. Model it on `getHomeMajorExpensesRow`, which already returns `null` to hide its row.

### Component

Model on `MajorExpensesRowCard` — a lean conditional strip, **not a card**. Null-guard, return `null` immediately when there is nothing to show.

Content: the count phrase on the start side, a `View →` affordance on the end side. Minimum 48×48 tap target per `spec/DESIGN.md`.

**Locked EN copy:**

| Key | Value |
|---|---|
| `Home.runningHot.rowLabel` | `{count, plural, one {1 budget} other {# budgets}} running hot` |
| `Home.runningHot.viewAction` | `View` |

Arabic: author it, match the existing register, list it in the PR. Keep it short — it shares a row with the action.

**Tone — locked: quiet/neutral, NOT amber.** Use a neutral surface (`bg-surface-offset` + `border-border` or equivalent), **not** `bg-warning-subtle`.

Two reasons, and this was decided against an amber mockup:
1. `MajorExpensesRowCard` directly below is already amber. Two amber strips stacked under the daily rate card read as compounding alarm.
2. It is doctrinally correct — cross-period comparison is calibration, and calibration does not get semantic tone. This keeps Home consistent with the neutral tag on Fixed and in Analytics.

### Placement

In `home-content.tsx`: **after `DailyRateCard`, before `MajorExpensesRowCard`.**

Below the rate card because the signal is *about* the rate — a leading indicator it will drop. It cannot sit above the number it qualifies.

### Navigation

`View` navigates to the Fixed page. **Plain locale-aware navigation — no deep link, no query param, no scroll target.** The Phase 2 tags are what make the arrival useful. A `?bucket=` deep link was considered and deferred; do not build it.

### Do NOT

- Do NOT name any bucket on Home. Aggregate at every count, including one.
- Do NOT show an amount, percentage, or bucket count breakdown.
- Do NOT render it as a `Card`. It is a strip, matching the major row's visual register.
- Do NOT place it above `DailyRateCard`.

### Verify

`pnpm typecheck && pnpm lint`.

---

## 6. Phase 4 — Sandbox and state coverage

`fixedPaceState` already exists from Phase 8b. Confirm it drives the Home strip and the Fixed tag as well as the Analytics tag — one axis, three surfaces.

If the strip cannot reach a count of 2+ with current data, shape a second manual bucket's `dailyCumulative` so it can. Preserve the Phase 8b invariants: monotonically non-decreasing, correct length, **last value === `spent`**, and rescaled if `lib/sandbox-budget.ts` mutates `spent`.

**Verify:** counts of 0, 1 and 2+ are all reachable from the Home settings drawer without editing code.

---

## 7. Phase 5 — Verify on render

`pnpm typecheck && pnpm lint && pnpm build`, plus targeted `pnpm exec oxfmt --check` on touched files.

Then record **objective observations only. Apply no fallbacks** — carry all of these into the PR as unchecked items.

- **VR-A — Two strips stacked.** With the running-hot strip and the major row both visible, does the neutral/amber distinction hold, or do they read as one block? Record both treatments and the visual weight of each.
- **VR-B — Home length.** Measure the added scroll depth. Home is deliberately sparse; record how much the strip costs at count 1 and 2+.
- **VR-C — Arabic row fit.** The count phrase plus `View →` on one row at mobile width, both locales. Record whether it wraps.
- **VR-D — The handoff.** Tap `View` at count 2+, land on Fixed, and confirm both hot buckets are findable by their tags without scrolling past the whole page. **This is what the aggregate strip depends on.** If they are hard to find, say so — that is the evidence for revisiting the deep link.
- **VR-E — Phase 1 regression sweep.** Everything on Fixed still renders correctly after the data unification: summary card totals, all three sections, detail sheet, add/edit drawer, transfer drawer. **This is the highest-risk item in the whole pass.**
- **VR-F — Tag independence.** Confirm at least one bucket shows the tag while **under** its budget. If none does, the feature has not achieved its purpose.

---

## 8. Out of scope

| Item | Status |
|---|---|
| `?bucket=<id>` deep link to a specific bucket | Deferred. Revisit if VR-D shows the handoff is weak. |
| Naming buckets on Home | Rejected — the destination names them. |
| Moving transactions / due dates / installment lifecycle into the analytics model | Rejected — bloats an upstream model to serve one page. |
| Any tone other than neutral on either new surface | Rejected — see §4 and §5. |
| A "slower than usual" or positive signal | Rejected. Underspending is incidental upside, not a signal. |
| Any `stashy-api` change | Out of scope. The server-side query for per-bucket daily series is real future work but not this pass. |

---

## 9. Reporting back

1. Per phase: what changed, and anything that did not match this plan.
2. Phase 0's field survey — which `FixedExpenseItem` fields analytics could not supply.
3. Everything that changed visually on the Fixed page from Phase 1.
4. The Arabic strings you authored.
5. VR-A … VR-F observations.
6. Anything you were tempted to fix and did not.
7. Confirmation that no `stashy-api` or `stashy-mobile` file was touched.

Then push `running-hot-signal` and open a PR into `main` with the above in its body.
