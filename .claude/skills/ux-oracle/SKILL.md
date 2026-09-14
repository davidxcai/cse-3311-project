---
name: ux-oracle
description: "Use before implementing or redesigning ANY feature UI in this app — new features, forms/flows, navigation changes, or migrating existing screens to ReUI. Consult first so shape and interaction choices follow this project's established patterns instead of defaulting to generic AI-generated layouts (page-per-step wizards, text-only status, badge/input walls)."
metadata:
  type: project-design-doc
  status: "living — v0.1, sparse by design"
---

# UX Oracle — cse-3311-project

This is David's standing design reference. It exists so design/UX decisions don't have to be re-explained every session, and so no session invents a pattern this doc already settled. It's meant to stay short — add a section only after a real decision gets made, not speculatively.

## How to use this

1. Before writing UI code, state the shape decision in one line ("N dependent steps → contained stepper with visual progress") using the heuristics below.
2. Optimize for what the user is actually trying to accomplish, not for literally satisfying the ticket text. If the "correct" implementation of a request would produce a bad experience, say so and propose the better one — don't build the literal ask silently.
3. If a situation isn't covered below, don't default to the generic/common pattern. Propose 2-3 options grounded in these principles and ask. Once David decides, add it here as a new heuristic so it's settled for next time.
4. Reference precedent exists now (see below) — check it before inventing a pattern from scratch.

## Core stance

- **User-first, not requirement-first.** A feature request describes an outcome, not a layout. Design the layout from how a person would actually think through the task.
- **The heading is the explanation.** Do not add justification/reasoning copy under a prompt ("we ask this so that…", "this helps us…"). State the question or the label and trust it to be self-evident. Only add supporting copy when the ask is genuinely non-obvious — that's the exception, not the default. This is the single biggest complaint driving this doc's existence: reading micro-reasoning for every field is exhausting, and the target user has no patience for it. Cut justification copy aggressively.
- **Icon over word when the icon reads faster.** Not "avoid icons" — the opposite. A picture reads faster than a word for things people pattern-match instantly (day-of-week, category, status/state). Reach for a compact icon/glyph/badge first for that kind of label; fall back to a real word only when there's no fast, unambiguous icon for it.
- **Real components over hand-rolled markup.** Go through the ReUI MCP workflow (search → get_component for the real API → get_examples → install via shadcn CLI → adapt with real data → validate_usage) instead of hand-rolling Tailwind. Don't restyle a component ReUI already provides a variant for.
- **Visual over textual for state.** Progress, status, and selection should read at a glance (progress bar, dots, checkmarks, badges, color) — text supplements, it doesn't carry the signal alone.
- **Contain flows.** A multi-step task should live in one surface (panel/modal) unless there's a real reason to leave it.
- **Use the viewport, don't cram.** Compose across the full width available — side panels, multi-column layouts, generous margins — rather than squeezing everything into a narrow centered band that splits the difference between mobile and desktop. Generous negative space reduces visual fatigue; it isn't wasted space. This doesn't mean stretching individual inputs or text edge-to-edge — a comfortable, constrained content column inside a spacious layout is still correct (see Reference precedents).

## Visual design tokens

Palette given by David 2026-09-14, implemented in `src/styles/index.css` as CSS custom properties (Tailwind v4 `@theme inline`, shadcn/ReUI-compatible token names):

| Name given | Hex | Token |
|---|---|---|
| background | `#F8F8F8` | `--background` (also `--muted`, same tone) |
| section 1 | `#FEFEFE` | `--card` |
| section 2 | `#FFFFFF` | `--popover` |
| text main | `#464646` | `--foreground` |
| text subtle | `#B4B4B4` | `--muted-foreground` |
| selected | `#D9D9D9` | `--selected`, aliased to `--accent` so stock shadcn/ReUI hover/selected states pick it up automatically |
| primary | `#728774` | `--primary` |

Judgment calls made that weren't specified, flagged so they're easy to correct rather than silently assumed settled:
- `--card` vs `--popover` mapping (section 1 = card, section 2 = popover) is inferred from elevation (card sits on background, popover/modal sits on top of that) — not given explicitly.
- `--primary-foreground` set to `#FFFFFF` (text on top of primary-colored fills) — not given.
- `--border` and `--destructive` left at their prior placeholder values — not given, and `ux-oracle`'s Open list already tracks error-state as undecided.
- `--input` (form input borders) aliased to `--border`, `--ring` (focus ring) aliased to `--primary` — added 2026-09-14 when installing real shadcn `Input`/`Label` components, which reference these tokens; they didn't exist before and inputs would have rendered with an undefined/broken border and focus ring without them.
- **Dark mode was removed**, not just left unstyled — the prior scaffold had a full dark palette (unrelated green), and keeping it would mean the app silently reverts to a mismatched theme for any OS in dark mode. No dark palette has been specified; add one back deliberately if/when needed rather than reintroducing the old placeholder.

**Logo:** `public/thyme-saver-logo.svg` (icon mark only, no wordmark baked in — it's already colored `#728774`, matching primary, so use it as-is rather than recoloring). Set as the site favicon. Used in `AppShell` and `LoginRoute` headers as `<img>` + a `font-logo` wordmark span. **Logo font:** Beiruti (variable, weights 400–800), loaded via Google Fonts in `index.html`. Wired as `--logo-font` in `:root` and re-exposed as `--font-logo` under `@theme inline` (Tailwind v4's font-family theme key is `--font-*`, not `--font-family-*` — got this wrong once already, verify with computed-style if a font ever looks like it silently isn't applying) — generates the `font-logo` Tailwind utility. Scoped to the logo/wordmark only — do not apply it as the body/UI font.

## Decision heuristics

### Shape of a flow: stepper vs. single page vs. modal

Ask, in order:
- **Are the choices sequential/dependent** (later steps depend on earlier answers, or there's a natural narrative order)? → Contained stepper, one panel, real visual progress indicator (dots/bar/checkmarks) — never "Step X of Y" text alone.
- **Are the options independent of each other** (order doesn't matter, e.g. a settings panel)? → Single page/panel with grouped sections. A stepper here just adds clicks for no reason.
- **Would a user want to bookmark, resume, or navigate to this directly**, independent of any flow? → A real route is justified.
- **Is this a quick, in-context action launched from another page**, with no standalone reason to exist? → Modal or inline panel, not a new route.

Don't default to "stepper" as a habit — the shape follows the number and dependency of decisions the user is making, not precedent from the last feature. (Precedent for reference, not a rule to copy blindly: AutoPlanPanel's pantry → days → source → review is a dependent, ordered flow, so it's a contained stepper with a real progress component, not page-per-step and not one giant form.)

### Navigation & containment

Don't route a user away mid-flow for something that could be shown inline. If a step needs data that lives on another page (e.g. pantry contents inside a meal-planning flow), pull the minimal inline UI into the flow rather than linking out and hoping they come back.

There's a broader, deferred IA simplification on the table (Dashboard + Recipes as the only two top-level areas — see project memory `ia_consolidation_plan`). Don't start restructuring routes unprompted, but when navigation work does come up, this is the direction to propose toward.

### App-level navigation chrome

This is a website/desktop app, not a mobile app — use a traditional top-mounted nav bar, not a mobile-style bottom tab bar, even if a mobile reference uses one.

Top-level nav is exactly two items: **Meal Plan** and **Recipes** (confirmed 2026-09-14, supersedes the earlier "Dashboard" naming in project memory `ia_consolidation_plan` — "Meal Plan" is clearer and less technical for this app specifically). Meal Plan absorbs what would otherwise be separate Pantry/Grocery/Plan pages; Recipes absorbs My Recipes, Discover, and user-uploaded recipes. Settings is NOT a nav item — it lives behind a small icon (gear), opened as an overlay with its own internal sub-nav, same as the Mealime reference.

Don't put a flow-starting CTA (like "start a new meal plan") in the nav bar itself — put it contextually where its result will appear, e.g. inside the Meal Plan section's empty state when no plan exists yet (this app already has an `EmptyState` component for exactly this).

## Reference precedents

Validated references get logged here with what was actually confirmed, not just what was observed — so a later session can trust a takeaway instead of re-deriving it from screenshots.

**Mealime** (meal-planning mobile app, screenshots reviewed 2026-09-14) — a direct competitor to this app's core feature, so the overlap is structural, not just stylistic. Confirmed takeaways:
- No justification copy under any prompt, ever — heading/label alone carries the ask. Directly informed the "heading is the explanation" stance above.
- Selection state is always a fill color or checkmark overlay on the thing itself — never a text label change ("(Selected)").
- Low density even on its most content-heavy screens (2-across photo grid, plain two-column rows for lists) — restraint held even where there's a lot to show.
- In-object tabs (e.g. a recipe's Cookware/Ingredients/Instructions) switch views without navigating anywhere — reinforces the containment stance above.
- Running progress in a multi-select flow shown as actual thumbnails of what's picked so far, not a counter.
- Gap Mealime doesn't solve, that this app should: nothing indicates which day of the week a planned meal is for. See Auto Plan notes below — don't copy this gap.
- Account creation is the LAST step of onboarding, not the first, and asks for almost nothing — email only. This app's auth is email/password (no OAuth), so ours needs one more field for password, otherwise same placement and minimalism.
- Desktop uses the full viewport through composition — a decorative image panel beside onboarding content, a persistent summary rail beside the recipe browser, side-by-side columns on recipe detail — not by stretching form inputs or text to fill the width. Confirmed 2026-09-14 from desktop screenshots.
- Settings screens reuse the EXACT SAME selection components as onboarding (same diet radio-list, same allergy chip grid), just recomposed into one scrollable page with small-caps section labels and thin dividers between rows — no per-section cards/boxes. This is the reference pattern for dense settings that doesn't feel overwhelming.
- One nuance in that reuse: a fixed-catalog multi-select (diet, allergies) stays a toggle chip grid in both onboarding and settings, but a personal free-form list (disliked ingredients) becomes tag-with-remove plus an explicit "Add" trigger once you're managing it in settings, rather than the onboarding toggle grid. Match the interaction to whether the list is fixed or user-managed.
- Checking a grocery item strikes through both name and quantity in addition to filling the checkbox — a cheap, combined text+visual confirmation worth reusing.
- What did NOT carry over: its bottom tab bar and full-screen-push-per-question navigation are mobile chrome, superseded by the top-mounted nav decision above.

## Feature notes

Decisions specific to one feature that aren't generalizable heuristics, but are settled and shouldn't be re-litigated.

**Auto Plan** — this is the flagship feature and the app's core value proposition: the app decides for you. Keep that emphasis in any UI for it.
- v1 is auto-only (generate/re-roll, no manual recipe picking) — deliberate, not an oversight.
- Manual pick-your-own is planned as a later addition (omitting it entirely risks alienating users who want control), but it must stay secondary — auto-generate stays the default, primary path and the more prominent CTA whenever both exist. Don't build the manual path until asked.
- Gap to fix: the plan/review views don't currently indicate which day of the week each meal is for. Add a compact day indicator — an abbreviated badge (`MON`, `TUE`, …) — overlaid on/near the recipe image rather than a separate row or column, to keep it space-efficient. Applies to `AutoPlanPanel`'s review step and the meal-plan list view.

## Open — not yet decided

These come up eventually; don't invent an answer, ask when they do:
- Empty-state pattern (illustration vs. text vs. CTA-only)
- Error-state / inline validation pattern
- Table vs. card density for list views
- Loading-state pattern (skeleton vs. spinner vs. optimistic)
- Manual pick-your-own UI for Auto Plan (deferred — see Feature notes above)

## Change log

- 2026-09-14 — created, from the AutoPlanPanel stepper discussion (text-only "Step X of 4" → visual progress; pantry `<Link>` out mid-flow flagged as the wrong pattern).
- 2026-09-14 — added copy-minimalism and icon-over-word stances, top nav decision, Mealime reference precedent, Auto Plan feature notes (auto-only v1 with manual planned as secondary, day-of-week badge gap).
- 2026-09-14 — added desktop composition findings from second Mealime reference set: viewport-usage-via-composition principle, confirmed nav is Meal Plan + Recipes (renamed from Dashboard) with contextual (not nav-bar) CTA placement, settings-reuses-onboarding-components pattern, chip-toggle-vs-tag-manage nuance, grocery strikethrough affordance, account-creation-last ordering.
- 2026-09-14 — added Visual design tokens section: real color palette wired into `src/styles/index.css`, logo placed at `public/thyme-saver-logo.svg` and set as favicon, Beiruti font loaded for the logo only, dark mode removed pending a real dark palette.
- 2026-09-14 — UI overhaul Phases 2–3 implemented: AutoPlanPanel fully on `StepperPanel`/`StepperContent`, day-of-week badges on the review step (required threading `thumb_url` through the Auto Plan candidate pipeline — see `auto-plan.ts`), pantry step now inline (`IngredientPicker` + `PantryList`, no more navigating away), `RecipeDetailRoute` recomposed to a CSS Grid (image beside content on desktop, stacked on mobile), real shadcn `Input`/`Label` installed and wired into `SettingsRoute` (now grouped into small-caps sections matching the Mealime reference), `RecipesRoute` search, and `IngredientPicker` (which covers pantry/grocery/recipe-form/disliked-ingredients in one shot). Added `--input`/`--ring` tokens the new components needed. Phase 4 surveyed: Pantry/Grocery/Discover/MyRecipes were already reasonably aligned (grocery already had strikethrough-on-check, Discover's `MatchBadge` was already a visual pill) — no changes made rather than inventing busywork; revisit only if something specific comes up.
- 2026-09-14 — note for future sessions: the shadcn CLI's default registry (anything without an `@reui/` prefix — `dialog`, `tabs`, `card`, `input`, `label` all hit this) writes files to a literal `./@/components/ui/` directory in this repo instead of resolving to `src/components/ui/` via tsconfig paths, and pulls in a redundant `cn` npm package + `radix-ui` instead of this project's own `@/lib/utils` cn. After every such install: move the file(s) into `src/components/ui/`, remove the stray `./@` dir, fix the `cn` import to `@/lib/utils`, and `npm uninstall cn`. `@reui/`-prefixed installs (components, examples) are unaffected and land correctly.
