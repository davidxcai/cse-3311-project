# Project Brief

## One-liner

A single-player web app that turns "here's what's in my kitchen" into a planned
week of meals and a grocery list.

## Course context

CSE 3311 — Object-Oriented Software Engineering. Team of 4, mixed experience (not
everyone has web-dev background). Deadline: **December 1, 2026** (~12 weeks from
start). Design priority: **quick comprehension over industry-grade patterns.**
Small reusable components, no monolithic components, hooks kept in their own files.

## Problem

People have ingredients on hand but don't know what to cook, forget dietary
constraints when browsing, and end up shopping without a plan. Meal-planning apps
usually start from recipes; this one starts from the pantry.

## Core loop

1. **Pantry** — user records ingredients they currently have.
2. **Discover** — app ranks recipes by pantry match, filtered by the user's
   dietary restrictions and disliked ingredients.
3. **Plan** — user assigns recipes to days of the week. Each of the 7 days is a
   slot the user can turn on ("cook this day") or off.
4. **Grocery list** — user generates a list of ingredients their active planned
   recipes need but their pantry lacks. Items are checkable.
5. **My recipes** — user can create/edit their own recipes and save (bookmark)
   system recipes for later.

## Users

One persona: the home cook, signed in, planning for themselves. No sharing, no
following, no comments, no public profiles.

## Data seeding

The database is seeded once from a local MealDB dump (`data/`): ingredients,
categories, areas, and ~hundreds of recipes with their ingredient lists. The app
does **not** call MealDB at runtime. Seeded recipes are `source = 'system'`.

## Features (scoped to the deadline)

### Must have (v1 — this is the demo)

- Email/password sign-in. (Google OAuth was descoped — not worth the Google
  Cloud setup for a school project.)
- Profile settings: dietary restrictions (tag list), disliked ingredients.
- Pantry: add / remove ingredients (typeahead over the seeded ingredient list).
- Browse recipes (system + own), filter by category / area / diet tag.
- Recipe detail: ingredients with measures, instructions, image.
- Discover: pantry-based ranked suggestions honoring diet + dislikes.
- Weekly plan: 7 day slots, toggle a day on/off, assign one recipe per active day.
- Grocery list: "Generate" button materializes needed-but-missing ingredients;
  check items off; add a manual item.
- Create / edit / delete own recipes.
- Save / unsave any recipe; "My recipes" view (own + saved).

### Should have (if time allows)

- "Duplicate to my recipes" from a system recipe.
- Swap a day's recipe from within the plan view.
- Basic recipe search by name.
- Servings / portion note per recipe.

### Won't have (v1)

- Multiple or historical weekly plans / calendar dates.
- Nutrition data, calorie tracking.
- Recipe ratings or reviews.
- Any social / multi-user feature.
- Realtime updates.
- Recipe image upload (use a URL field; revisit if time allows).
- Native mobile app.

## Suggestion algorithm (the "engineering hook")

Pure function, runs client-side, unit-tested. No SQL functions.

**Input:** candidate recipes (each with its ingredient name list), the user's
pantry (set of ingredient names), the user's dietary restrictions and disliked
ingredients.

**Steps:**

1. **Exclude** any recipe that contains a disliked ingredient, or whose diet tags
   don't cover every restriction the user requires.
2. For each remaining recipe compute:
   - `haveCount` = recipe ingredients the user has,
   - `missingCount` = recipe ingredients the user lacks,
   - `coverage` = `haveCount / totalIngredients`.
3. **Rank** by `coverage` descending, then `missingCount` ascending, then name.
4. Return ranked list with `haveCount` / `missingCount` / `missing[]` attached so
   the UI can show "you have 6 of 8" and a "need to buy" preview.

Ingredient comparison is case-insensitive on the trimmed canonical name (recipes
and pantry both reference `ingredients.name`). Seed diet tags are best-effort from
MealDB category/tags and may be imperfect — acceptable for v1.

## Diet tags (fixed set)

Both a recipe's `diet_tags` and a profile's `dietary_restrictions` draw from one
closed list, stored as a Postgres enum (`diet_tag`):

`vegetarian`, `vegan`, `gluten_free`, `dairy_free`, `nut_free`, `pescatarian`,
`halal`, `kosher`, `low_carb`

A recipe satisfies a user only if its `diet_tags` contains **every** tag in the
user's `dietary_restrictions`. Seed values are best-effort from MealDB
category/tags and will be incomplete; that is acceptable for v1.

## Data model (summary)

Full DDL + RLS in `ARCHITECTURE.md`.

- **Reference (seed, read-only to clients):** `ingredients`, `categories`, `areas`.
- **`recipes`** — one table for system and user recipes, distinguished by
  `source` (`'system'` / `'user'`) and nullable `created_by`. Single table so
  that meal-plan, saved-recipe, and grocery references need only one foreign key.
- **`recipe_ingredients`** — ordered (recipe, ingredient, measure) rows.
- **`profiles`** — 1:1 with the auth user; dietary restrictions, disliked
  ingredients, display name.
- **`pantry_items`** — (user, ingredient).
- **`saved_recipes`** — (user, recipe) bookmarks.
- **`meal_plan_entries`** — up to 7 rows per user, one per `day_of_week`, each
  with `is_active` and a nullable `recipe_id`.
- **`grocery_items`** — (user, ingredient) with `checked` and `is_manual`,
  populated by the generate action.

## Rough timeline

| Weeks | Focus |
| ----- | ----- |
| 1–2   | Scaffold, Supabase project, schema + migrations, seed script, auth (email/password), app shell + nav. |
| 3–4   | Profile settings, pantry CRUD, shared `IngredientPicker` + `RecipeCard`, recipe browse + detail. |
| 5–6   | Discover: ranking function + tests, diet/dislike filtering. |
| 7–8   | Weekly planner: day toggles, recipe assignment. |
| 9     | Grocery list generation + check-off. |
| 10    | User recipe create/edit/delete, "My recipes" + saved. |
| 11    | Polish: empty/error/loading states, responsive, accessibility pass, tests. |
| 12    | Buffer, documentation, demo prep. |

## Success criteria

A signed-in user can, in one sitting: set dietary restrictions, enter a pantry,
get sensible ranked suggestions, plan four days of the week, generate a grocery
list of exactly the missing ingredients, and add one recipe of their own.
