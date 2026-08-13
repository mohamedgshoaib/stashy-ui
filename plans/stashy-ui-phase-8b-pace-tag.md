# Stashy-UI — Phase 8b: manual fixed bucket pace tag

**Repo:** `stashy-ui` only. No `stashy-api`, no `stashy-mobile`.
**Prerequisite:** the Analytics restructure PR (phases 1–11) is **merged**. This work renders on rows introduced by that pass.
**Status:** design locked. Do not redesign. Implement.
**Branch:** create `fixed-pace-tag` from `main`, never from `analysis_audit`.

---

## 0. How to use this document

Self-contained. Work **phase by phase**, do not batch. Each phase ends with `pnpm typecheck && pnpm lint`, both clean of _new_ errors.

Standing rules: design-system tokens only, no inline hex; logical direction utilities (`ms-`/`me-`/`ps-`/`pe-`), never physical; amounts render `dir="ltr"`; dynamic widths via inline `style`.

At execution start, the first repository change is this plan amendment, committed as `phase 0: plan amendment`.

**Known pre-existing failures — not yours, do not chase:** lint errors in `components/settings/settings-screen.tsx`, `components/settings/settings-sections.tsx`, `components/tracker/tracker-transfer-drawer.tsx`; a possible build failure on `/[locale]/tracker` relating to a `useSearchParams()` Suspense boundary.

**If live code contradicts this plan, stop and report.** Do not improvise.

---

## 1. What this builds, and why it is shaped this way

A small conditional tag — **"Faster than usual"** — on a manual fixed bucket row, shown when that bucket is running meaningfully ahead of **its own** historical pace at the same point in the month.

It appears **only inside the tap-to-expand overrun list** on `FixedAnalysisCard`. Silent otherwise. No numbers.

### Why not a chart

A pace chart was proposed for the fixed lane by analogy with `VariableAnalysisCard`'s rhythm chart, and **rejected**. The shapes are not analogous: variable is **one pool** spent against a daily rate; manual fixed is **N independent envelopes**, several legitimately lumpy. A Gas bucket refilled twice a month is not overspending, but a linear day-of-month comparator would flag it as such.

_An analogy between surfaces must hold at the level of the underlying model, not the visual._

So: each bucket is compared **only against itself**, never against a pool, a peer, or a straight line.

### Why the comparison is normalised against each month's own budget

Budgets change. If a bucket went from 500 to 800 two months ago, averaging raw EGP-per-day mixes two different plans and the result is meaningless. It also mis-reads a bucket whose budget was raised — it would look artificially slow.

So each month's pace is expressed as **a fraction of that month's own budget consumed at that point in the month**, and fractions are what get compared and averaged.

### Why the window switches

Averaging is steadier but needs history the product will not have early. A single prior month is more responsive but noisier. **Two months is not an average** — nearly the noise of one, with the cost of many.

So: last month only until there are **3+ usable prior months**, then the average. **One switchover**, at the point where averaging actually buys stability.

### Product constraints this must not violate

- **Stashy does not moralize spending. Numbers are facts, not verdicts.** This is a neutral factual tag, not a warning. No alarm tone, no icon implying judgement.
- **Aggregate by default; item-level detail only behind explicit disclosure.** The tag lives inside the disclosure. It must never surface on the card's default scan path.
- **Empty-state doctrine:** a quiet line or nothing. When there is no history, the tag is simply absent — no "not enough data" placeholder.

---

## 2. The locked algorithm

For each **manual** bucket currently rendered in the disclosure list:

**Step 1 — this month's pace fraction.**

```
pointInMonth   = daysTracked / daysInMonth
thisMonthPace  = (spentAtToday / budget) / pointInMonth
```

`spentAtToday` is the bucket's cumulative spend at `daysTracked`.

**Step 2 — usable prior months.** A prior month is usable when the bucket **existed in it as a manual bucket with a budget** and its actual has a `dailyCumulative` array. An absent array is an unusable month: exclude it entirely from both the count and the average, do not treat it as zero, and remain silent when no usable month remains.

**Step 3 — the reference.**

- **0 usable prior months** → no tag. Silent. Stop.
- **1–2 usable prior months** → reference = the **most recent** usable month's pace fraction.
- **3+ usable prior months** → reference = the **mean of all usable** months' pace fractions.

Each prior month's fraction uses **that month's own budget and its own `daysInMonth`**, evaluated at the same `pointInMonth` as today.

When the equivalent point lands at a fractional array index, use **linear interpolation between adjacent days**:

```
value = arr[floor(i)] + (arr[ceil(i)] - arr[floor(i)]) * fraction(i)
```

Clamp both adjacent indices to the array bounds. Do not round the index.

**Step 4 — flag.**

```
thisMonthPace > reference * (1 + BAND)
```

`BAND` is the existing **±15% "steady" band already used by `deriveRhythmCharacter`**. It is currently inline at `components/analytics/data.ts:28` and in the equivalent `1.15` comparisons at `:31-32`. Extract it to a named export and have both `deriveRhythmCharacter` and the bucket comparator consume it. **Do not change its value, hardcode `0.15` at the new call site, or introduce a second threshold number.**

**Guards.** Any month with `budget <= 0` or `daysInMonth <= 0` is excluded from the calculation. This is a divide-by-zero guard, not a product state — a manual bucket cannot exist without a budget, so this should be unreachable.

**Closed months:** use `daysInMonth` as the evaluation point rather than `daysTracked`, so a closed month compares whole-month to whole-month.

---

## 3. Phase 0 — Orientation and a blocking check

**Read:** `AGENTS.md`, `spec/index.md`, `spec/DESIGN.md`, `.cursorrules`. Then `components/analytics/types.ts`, `components/analytics/data.ts`, `components/analytics/fixed-analysis-card.tsx`, `lib/sandbox-budget.ts`, `store/sandbox-store.ts`.

**Confirm the prerequisite:** the tap-to-expand overrun disclosure exists on `FixedAnalysisCard` and renders per-bucket rows. **If it does not, stop** — this plan has nothing to attach to.

**Blocking check — report before proceeding:** count the month snapshots available in the sandbox. **The 3+ average branch needs at least three prior months to be renderable.** If fewer exist, say so explicitly and state how many. Do not invent snapshots to solve it; that is a decision for Husseini, not an implementation detail.

**Verify:** you can state the current `FixedBucketActual` shape, where `deriveRhythmCharacter`'s band constant lives, and how many snapshots exist.

---

## 4. Phase 1 — Data shape and mock arrays

**Goal:** give every manual bucket a per-day cumulative series.

### Files

`components/analytics/types.ts`, `components/analytics/data.ts`

### Changes

Add to `FixedBucketActual`:

```ts
dailyCumulative?: number[]
```

Keep the existing shared type. Do not introduce a discriminated union.

Follow the existing `dailyVariableCumulative` precedent on `LiveMonthAnalysis` / `MonthSnapshot` for shape and conventions.

**Invariants — these must hold everywhere:**

- Monotonically non-decreasing.
- Length = `daysTracked` on live months, `daysInMonth` on snapshots.
- **Last value === that bucket's `spent`.** The array and the scalar must agree.

Populate across **all** live scenarios and **all** snapshots, for **manual buckets only**. Leave the optional field absent on recurring and installment buckets — they are committed obligations with no behavioural pace.

### Shape the data deliberately

The mock exists to make states visible. Author arrays so these are all reachable and visually distinct:

1. A manual bucket **clearly faster** than its own history — tag fires.
2. A manual bucket **steady** within the band — no tag, despite being overrunning.
3. A manual bucket with **no prior month** — cold start, silent.
4. If 3+ snapshots exist: a bucket where the **average** branch produces a different answer than last-month-only would. This is what proves the switchover works.

Also give at least one bucket a **budget change across months**, so the per-month normalisation is exercised rather than assumed.

The bucket roles are locked:

- `fb-coffee`: the only bucket whose profile is switched by `fixedPaceState`.
- `fb-groceries`: a fixed steady profile, unaffected by the pace toggle.
- `fb-transport`: cold-start profile with zero usable prior months.

Add `fb-transport` to the live month only with these fixture values:

| Field               | Value                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `id`                | `fb-transport`                                                                                          |
| name                | `Transport`                                                                                             |
| `iconKey`           | `groceries` — closest available existing key; do not add a new key, and note the substitution in the PR |
| budget              | `400`                                                                                                   |
| normal-state spend  | `310`                                                                                                   |
| overrun-state spend | `470`                                                                                                   |

Do not add `fb-transport` to April, March, or February. Its absence from all three snapshots is the cold-start proof. Add its 400 to the live month's `fixedTotalBudget` and raise the live month's `monthlyBudget` by the same 400, leaving the variable lane unchanged. Do not reallocate budget from Coffee or Groceries. Re-verify that `onTrack`, `atRisk`, and `over` still produce their intended states and that no closed-month verdict flips. If any does, stop and report rather than tuning data to compensate.

### ⚠️ The desync trap — handle this explicitly

`lib/sandbox-budget.ts` mutates `spent` on specific buckets for calibration scenarios (e.g. it overrides `fb-coffee` and `fb-groceries`). **Those mutations will break the `last value === spent` invariant.**

When a scenario mutation changes a bucket's `spent`, **rescale that bucket's `dailyCumulative` proportionally** so the invariant holds. Do this in the same place the existing recomputation happens — `lib/sandbox-budget.ts` already recomputes `manualBucketCalibration` and `wholeBudgetCloseout` after mutations precisely so toggles cannot desync data. Extend that pattern; do not add a parallel one.

**Verify:** `pnpm typecheck && pnpm lint`. Then assert the invariant across every scenario and snapshot and report any violation.

---

## 5. Phase 2 — The comparator

**Goal:** implement §2 as a pure, testable function.

### Files

`components/analytics/data.ts`

### Changes

Export something along the lines of:

```ts
deriveBucketPaceFlag(bucketId, month, snapshots): boolean
```

Exact naming is yours; match the file's existing conventions. It must be **pure** — no rendering concerns, no locale, no formatting.

Implement §2 exactly: pace fractions normalised per month, usable-prior-month filtering, the 1–2 vs 3+ window switch, the shared band constant.

**Do NOT:**

- Hardcode `0.15`. Reuse `deriveRhythmCharacter`'s band.
- Return a magnitude, percentage, or direction. **Boolean only** — "faster than usual" or nothing. There is no "slower than usual" tag; underspending is not a signal this product surfaces.
- Apply it to recurring or installment buckets.

**Verify:** `pnpm typecheck && pnpm lint`. Report which buckets the comparator flags and which branch (last-month vs average) each took for exactly these four runs:

1. `monthlyBudgetState: onTrack`, `analyticsHistoryMode: withHistory`
2. `monthlyBudgetState: atRisk`, `analyticsHistoryMode: withHistory`
3. `monthlyBudgetState: over`, `analyticsHistoryMode: withHistory`
4. `analyticsHistoryMode: firstMonth`, confirming the zero-snapshot path is silent

Do not enumerate other axis combinations. `budgetInjection` and `fixedBudgetOverrun` do not feed the comparator; if either changes its output, report that as a finding.

---

## 6. Phase 3 — i18n

### Files

`messages/en.json`, `messages/ar.json`

**Locked EN**, under the existing `Analytics.fixed.*` namespace:

| Key                   | Value               |
| --------------------- | ------------------- |
| `fixed.paceTagFaster` | `Faster than usual` |

Three words, factual, no numbers, no comparison target named. It sits on a row that already shows the bucket name and overage.

**Arabic:** author it yourself, matching the existing register in `ar.json`, and **list the string you wrote in the PR body** for review. Arabic wording is a translation pass at implementation; only layout-affecting Arabic is a planning decision. Keep it short — it must fit on a row alongside a name and an amount in both locales.

**Verify:** `pnpm typecheck && pnpm lint`, no missing-key warnings in either locale.

---

## 7. Phase 4 — Render the tag

**Goal:** show the tag on flagged rows inside the disclosure.

### Files

`components/analytics/fixed-analysis-card.tsx`

### Changes

Inside the tap-to-expand overrun list, on each row where the comparator returns true, render a small tag.

- **Neutral tone.** `text-text-tertiary` / `bg-surface-offset`, matching the quietest existing chip treatment on the page. **Not** expense, not warning.
- **Text only.** No icon, no arrow, no percentage.
- Must not disturb the row's existing layout: bucket name, overage amount, and the row's own alignment all stay as they are. The tag is additive.
- Group the tag with the bucket name on its start side, before the end-aligned overage amount: `[name] [tag] … [amount]`. The tag qualifies the bucket, not the amount.
- Prefer one line. If name plus tag cannot fit at mobile width, wrap the tag to a second line under the name. Never truncate the bucket name and never shrink the amount. Record the rendered result in VR-A.
- RTL-safe: logical spacing utilities only.

### Do NOT

- Do NOT show the tag outside the disclosure — not on the badge, not on the card's default surface, not in the header. The scan path stays aggregate.
- Do NOT apply expense or warning tone. **The doctrine rule: expense tone is allowed when something exceeds its own plan; it is not allowed when comparing one period to another.** This tag is a cross-period comparison — a calibration signal, not an overrun. It stays neutral.
- Do NOT add a tooltip, popup, explanation line, or number.
- Do NOT change the sort order of the rows. They stay sorted by overage descending.

**Verify:** `pnpm typecheck && pnpm lint`.

---

## 8. Phase 5 — Sandbox control

**Goal:** make both states reachable without editing code.

### Files

`store/sandbox-store.ts`, `components/home/home-drawer.tsx`

Add a `fixedPaceState` axis with values `"steady" | "faster"` and default `"steady"`. Follow the existing axis pattern (`fixedBudgetOverrun` is the closest analogue) — same shape, same drawer treatment.

The toggle targets `fb-coffee` only. In `steady`, Coffee uses its steady profile and the tag is off. In `faster`, Coffee uses its faster-than-history profile. Groceries and Transport retain their fixed profiles in both states.

The toggle must compose with `fixedBudgetOverrun`, since **the tag can only ever be seen on an overrunning bucket** — the disclosure that hosts it only opens when `manualOverCount > 0`.

**Verify:** `pnpm typecheck && pnpm lint`. Confirm both states are reachable from the drawer with no code edit.

---

## 9. Phase 6 — Verify on render

Run `pnpm typecheck && pnpm lint && pnpm build`, plus targeted `pnpm exec oxfmt --check` on touched files.

Then walk the states and record **objective observations only**:

- **VR-A — Row fit, both locales.** Bucket name + overage + tag on one row at mobile width. Confirm no wrap, no truncation of the bucket name, no clipping. Arabic is the tighter case. **Record the longest bucket name that still fits.**
- **VR-B — Tone.** Confirm the tag reads as neutral information beside an overage amount, not as a second warning.
- **VR-C — Silence.** Cold-start bucket shows nothing at all — no tag, no placeholder, no gap.
- **VR-D — Branch switch.** If 3+ snapshots exist, confirm the average branch produces the flag set reported in Phase 2. If fewer exist, record as **blocked — insufficient snapshots**.
- **VR-E — Invariant under mutation.** Toggle every sandbox axis and confirm `dailyCumulative`'s last value still equals `spent` for every manual bucket in every combination. **This is the one that will break if Phase 1's rescaling was missed.**

**Apply no fallbacks.** Carry all five into the PR body as unchecked items with your observations. Design decisions arising from them are Husseini's.

`fb-transport` appears in the disclosure only when `fixedBudgetOverrun` is `some`, because its normal spend is under plan. Its invisibility in the normal state is expected, not a failure.

---

## 10. Phase 7 — Publish the pull request

Only after every prior phase passes:

1. Push `fixed-pace-tag`.
2. Open a PR into `main` with `gh pr create`.
3. Include in the PR body:
   - a per-phase summary;
   - the snapshot count and whether the average branch is renderable;
   - Phase 2's four per-scenario flag results and the branch each took;
   - every Arabic string authored in this pass, including the pace tag and Transport name;
   - the `groceries` icon-key substitution for Transport;
   - VR-A through VR-E as an unchecked checklist with objective observations.

---

## 11. Out of scope

| Item                                                                 | Status                                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A "slower than usual" / positive tag                                 | Rejected. Underspending is incidental upside, not a signal the product surfaces.                                     |
| Showing the pace figure, percentage, or direction                    | Rejected. Tag only.                                                                                                  |
| Multi-month **pattern** detection ("over plan three months running") | Separate parked item. Needs history depth the product will not have early.                                           |
| Applying pace logic to recurring or installment                      | Rejected. Committed obligations have no behavioural pace.                                                            |
| Any chart on `FixedAnalysisCard`                                     | Rejected — see §1.                                                                                                   |
| Changing `deriveRhythmCharacter`'s band value                        | Out of scope. Reuse it; do not retune it.                                                                            |
| Any `stashy-api` change                                              | Out of scope. `transactions.date` is already day-granularity, so the real side needs a query later, not a migration. |

---

## 12. Reporting back

1. Per phase: what changed, and anything that did not match this plan.
2. Phase 0's snapshot count, and whether the average branch is renderable.
3. Phase 2's per-scenario flag results and which branch each took.
4. The Arabic string you authored.
5. VR-A … VR-E observations.
6. Anything you were tempted to fix and did not.
7. Confirmation that no `stashy-api` or `stashy-mobile` file was touched.
