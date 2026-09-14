---
name: component-conventions
description: "Use before creating ANY new React component in this app, or when a component needs a different presentation on desktop vs. mobile. Consult first — this app expects a small number of highly reusable components with low variation; check the inventory before adding a new one, and follow the responsive-variant convention below instead of inventing a new pattern."
metadata:
  type: project-design-doc
  status: "living — v0.1, no components catalogued yet"
---

# Component Conventions — cse-3311-project

Sibling doc to `ux-oracle` (which covers UX/layout judgment). This one covers component-level implementation conventions — how components get structured and reused, not what they should look like. Keep it just as sparse: add an entry once a real decision gets made, not speculatively.

## How to use this

1. Before creating a new component, check whether an existing one (see Inventory below, or `src/components/`) already covers the need via a prop, not a new file.
2. This app should end up with a SMALL number of reusable components with LOW variation between uses (confirmed by the Mealime reference in `ux-oracle`: settings reuses the exact same selection components as onboarding). If you're about to build a near-duplicate of an existing component, that's a signal to add a prop/variant instead.
3. Not yet populated with real entries — keep the inventory current as components actually get built, not pre-guessed.

## Responsive variants: desktop vs. mobile presentation of the same component

Decided 2026-09-14: default to **one file per component**, not separate `Component.Desktop.tsx` / `Component.Mobile.tsx` files.

- **If desktop/mobile differ only in layout** (reflow, reordering, spacing) — use CSS Grid/Flex with Tailwind breakpoint classes in a single render. CSS Grid `order` / `grid-template-areas` can reorder visual layout per breakpoint without duplicating JSX. Example: recipe detail (image+nutrition beside tabs on desktop, stacked on mobile per `ux-oracle`'s Mealime reference) is a layout change, not a different component — do this with one component.
- **If desktop/mobile differ enough in actual composition or interaction** that breakpoint-prefixed Tailwind classes would turn into unreadable soup — split into two small render functions in the SAME FILE, backed by one shared hook for data/logic. E.g. in `recipe-card.tsx`: a `useRecipeCard()` hook for data/handlers, plus `RecipeCardDesktop()` and `RecipeCardMobile()` render functions, plus a thin default export that picks one.
- Don't split into separate files for this — once the shared logic is already extracted into one hook, two files just means two places that can drift out of sync for no real benefit.
- **Switching mechanism:** default to rendering the CSS-relevant variant only, toggled via Tailwind responsive display classes (`hidden md:block` / `block md:hidden`) rather than a JS `matchMedia`/breakpoint hook — avoids SSR/hydration mismatches and extra state. Reach for a JS breakpoint hook only when a variant is expensive to mount twice (heavy data fetching, a chart, etc.).

## Component inventory

Not yet catalogued as reusable patterns. Existing pieces as of 2026-09-14 (`src/components/common/`): `AppShell`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `IngredientPicker`, `LoadingState`, `Nav`, `RecipeCard`; plus `src/components/ui/button.tsx` and the ReUI stepper (`src/components/reui/stepper.tsx`, `src/components/examples/c-stepper-11.tsx`) installed for the AutoPlanPanel migration. Update this list with real notes (what varies, what's shared) as each one gets touched — don't write speculative descriptions for ones that haven't been worked on yet.

**ReUI stepper gotcha (hit 2026-09-14):** `StepperNav` and `StepperPanel`/`StepperContent` both read from the same `useStepper()` context, but only `StepperNav` needs to visually sit inside the nav row — it's easy to accidentally close the `<Stepper>` tag right after `StepperNav` (e.g. to put a Cancel button outside it) and leave `StepperPanel` as a sibling outside the provider. That throws `useStepper must be used within a Stepper` at runtime — no type error, since the context check is a runtime throw, not a type constraint, so `npm run typecheck` won't catch it. Keep `StepperNav` and `StepperPanel` both as descendants of one `<Stepper>`; wrap other elements (like a Cancel button) inside extra `<div>`s within that same `<Stepper>` rather than pulling them outside it.

## Change log

- 2026-09-14 — created; responsive-variant convention decided (single file, shared hook, CSS-first breakpoint switch over separate Desktop/Mobile files).
