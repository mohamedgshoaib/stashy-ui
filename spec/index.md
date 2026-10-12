# Stashy UI — Project Spec & Mission Control

> **LLM Context & Usage Guide**
> This `index.md` file is the ultimate root of context for the `stashy-ui` repository. It grounds the LLM agent in the overarching project mission, the product mechanics, and the repository's purpose as a rapid UI/UX design environment.
>
> - **Read this first** when entering a completely new context to understand _what_ Stashy is and _why_ things are being built the way they are.
> - Consult the **Spec Directory Map** at the bottom to navigate constraints (`DESIGN.md`), daily logs (`sessions/`), and capabilities (`skills.md`).

## The `stashy-ui` Repository Mission

**This repository acts as "Figma with code."**
Stashy is fundamentally a native mobile application. Because rapid visual iteration is sometimes faster directly in code, this web environment was created to strictly build, visualize, and interact with UI/UX concepts via live components. A developer will pass visual references or ideas, and you will mock them up here using active libraries before they are ported to the mobile app.

**Critical Execution Constraint:**
Because Stashy targets mobile displays, the web UI canvas **must simulate a mobile interface**. The primary application shell/container width must be constrained to typical mobile or tablet bounds (e.g., `max-w-sm` [384px] or `max-w-md` [448px] in Tailwind). Desktop-spanning UI layouts are strictly invalid unless explicitly requested by the developer.

---

## What Is Stashy?

Stashy is a **native mobile budget management app** built for individuals who want granular, real-time control over their monthly spending. It was originally prototyped as a Next.js + Supabase MVP and is now in V2 as a full-stack mobile product (FastAPI + PostgreSQL + Firebase Auth + React Native).

### Core Purpose

Most budgeting apps tell you how much you've spent. Stashy tells you **how much you can spend today** — and what happens tomorrow if you don't. The entire product is built around a single, central mechanism:

> **The Daily Rate System** — a dynamic, self-correcting daily spending limit that adapts in real time as you spend, receive income, or log major purchases.

This means the app doesn't just track; it **projects consequences forward**, showing the user exactly how today's overspending reduces tomorrow's rate.

### Bilingual Architecture (English & Arabic)

Stashy is actively bilingual and natively supports full RTL (Right-to-Left) rendering for the core MENA market. Rather than maintaining separate layouts, the UI dictates a **strict logical-only CSS architecture**. All layout code must use logical properties (e.g., `ms-*`, `text-start`, `end-0`) exclusively instead of physical ones (e.g., `ml-*`, `text-left`, `right-0`). This allows the framework to seamlessly mirror the interface when rendering Arabic locales (`dir="rtl"`).

### Who It's For

Stashy targets **individuals managing a monthly budget in a variable-income or variable-spending context** (e.g., Egypt / EGP pricing). The ideal user:

- Has a known monthly budget but irregular daily spending patterns
- Wants to track fixed commitments (rent, subscriptions) separately from variable day-to-day spending
- Needs to absorb unexpected large expenses (a laptop, medical bill) without their budget falling apart

### What Makes It Different

| Feature                | Common Budgeting Apps    | Stashy                                                                           |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| **Core output**        | "You've spent X"         | "You can spend Y today"                                                          |
| **Income handling**    | Adds to a static pool    | Dynamically redistributes across remaining days                                  |
| **Large purchases**    | Lumped into categories   | `Major` type — instantly drops daily rate, acknowledged upfront                  |
| **Fixed expenses**     | Simple category tracking | Dual-mode: auto-pay subscriptions + manual buckets, with auto-catch-up if missed |
| **Overspend feedback** | End-of-month summary     | Real-time "Tomorrow's Rate Impact" card appears the moment you overspend         |
| **Emergency state**    | Silent over-budget       | Dedicated emergency mode with "Budget Injection" action                          |

### The Signature Mechanism: Dual Rate Model

Stashy maintains two parallel rates at all times:

- **Base Rate** — immutable, plan-based: `Base Variable Budget ÷ Days in Month`. This is your stable monthly target.
- **Today's Rate** — live, reality-based: `(Effective Variable Budget − Yesterday's Spending) ÷ Days Remaining`. This is your actual, current allowance.

The gap between these two numbers is Stashy's core insight — telling the user whether they are ahead of plan or falling behind, in one glance, every day.

---

## Spec Directory Map

To efficiently parse and manage constraints within this repository, LLM agents should utilize the following local architecture:

- **`DESIGN.md`**: The singular source of truth for the mutual design system connecting this web playground sandbox to the actual mobile codebase. **Enforce all colors, typography, borders, and spacings referenced here to maintain 1:1 cross-platform symmetry.**
- **`controlled-design-system.md`**: The governance layer for Stashy's single-identity visual system. Read this before changing tokens, semantic roles, or shared visual primitives.
- **`brand-color-audit.md`**: The semantic accent map for product meaning. Use it to assign or audit colors for transaction types, states, warnings, charts, badges, and system feedback.
- **`mobile-direction-research.md`**: The external mobile-direction synthesis. Read this when shaping hierarchy, layouts, observability, and visual tone from current platform and money-app patterns without copying them literally.
- **`skills.md`**: The strict reference and routing guide for `.agents/skills/`. Use this to understand which Agentic behaviors (e.g. `shadcn`, `emil-design-eng`, `make-interfaces-feel-better`) to invoke when writing code.
- **`sessions/`**: The chronological collection of daily session progress. When kicking off, review the latest daily `.md` file to inherit state. When wrapping up, log your progress according to the established Unified Session Template inside the active day's file.
