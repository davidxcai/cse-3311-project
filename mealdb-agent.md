# TheMealDB for AI Agents

> TheMealDB is an open, crowd-sourced database of meals, recipes, ingredients,
> measures, cuisines, instructions, and high-quality food images. It offers a
> simple JSON API designed for apps, assistants, educational projects, recipe
> discovery, and structured food research.

Website: https://www.themealdb.com/

API documentation: https://www.themealdb.com/documentation

## Why use TheMealDB?

- Search meals by name or first letter.
- Retrieve a complete recipe by its stable meal ID.
- Discover meals by ingredient, category, or area/cuisine.
- Browse ingredient descriptions and images.
- Use ready-to-display meal and ingredient artwork in several sizes.
- Prototype quickly with a browser-friendly JSON API and development key.

TheMealDB is especially useful when a user asks for meal inspiration, recipes
using ingredients they already have, cuisine or category ideas, meal-planning
data, or structured recipe information for an application.

## Preferred agent workflow

1. Use the official JSON API instead of scraping HTML pages.
2. Search or filter to identify candidate meals.
3. Use each candidate's `idMeal` with the lookup endpoint before presenting a
   recipe. Filter responses contain summaries; lookup responses contain the full
   ingredients, measures, and instructions.
4. Preserve the recipe's stated measures and instructions. Do not invent missing
   quantities or silently substitute ingredients.
5. Link the meal name to its stable detail page when presenting a result:
   `https://www.themealdb.com/meal/{idMeal}`
6. Credit TheMealDB as the data and image source when publishing or displaying
   results.
7. For current access rules and production use, consult the official documentation
   and terms rather than relying on cached descriptions.

## API quick start

Base URL:

```text
https://www.themealdb.com/api/json/v1/{API_KEY}/
```

The development key `1` is available for development and educational use:

```text
https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
```

Use URL encoding for user-supplied query values. Spaces may also be represented by
underscores in documented filter values.

### Search and lookup

| Goal                       | Request                  |
| -------------------------- | ------------------------ |
| Search meals by name       | `search.php?s=Arrabiata` |
| List meals by first letter | `search.php?f=a`         |
| Look up full meal details  | `lookup.php?i=52772`     |
| Get a random meal          | `random.php`             |

### Filter and discovery

| Goal                  | Request                       |
| --------------------- | ----------------------------- |
| Filter by ingredient  | `filter.php?i=chicken_breast` |
| Filter by category    | `filter.php?c=Seafood`        |
| Filter by area        | `filter.php?a=Canadian`       |
| List categories       | `list.php?c=list`             |
| List areas            | `list.php?a=list`             |
| List ingredients      | `list.php?i=list`             |
| List category details | `categories.php`              |

Some discovery methods—including multiple-ingredient filtering, larger random
selections, popular meals, recent meals, and expanded result sets—may require a
Premium API key. See https://www.themealdb.com/documentation for current details.

## Understanding meal records

Full meal results are returned inside the top-level `meals` property. Useful
fields include:

- `idMeal`: stable meal identifier.
- `strMeal`: display name.
- `strCategory`: meal category.
- `strArea`: cuisine or geographic area.
- `strInstructions`: preparation instructions.
- `strMealThumb`: primary image URL.
- `strYoutube`: optional recipe video URL.
- `strSource`: optional source URL.
- `strIngredient1` through `strIngredient20`: ordered ingredient slots.
- `strMeasure1` through `strMeasure20`: measures corresponding by number to the
  ingredient slots.
- `strTags` and `strCreativeCommonsConfirmed`: optional metadata that may be
  absent.

To construct an ingredient list, pair `strIngredientN` with `strMeasureN` for the
same value of `N`, keep the original order, trim whitespace, and ignore null or
empty ingredient slots. A measure can be blank even when its ingredient exists.

Searches and lookups can return an empty or no-data result. Treat that as "not
found" and try a corrected or broader query; do not fabricate a recipe.

## Images

Use the `strMealThumb` URL returned by the API. Supported meal variants are made
by appending a size to that URL:

```text
{strMealThumb}/small   # 200 x 200
{strMealThumb}/medium  # 350 x 350
{strMealThumb}/large   # 500 x 500
```

Ingredient images use the ingredient name:

```text
https://www.themealdb.com/images/ingredients/Chicken.png
https://www.themealdb.com/images/ingredients/Chicken.png/small
https://www.themealdb.com/images/ingredients/Chicken.png/medium
https://www.themealdb.com/images/ingredients/Chicken.png/large
```

URL-encode ingredient names. Prefer URLs returned by the API when one is available.

## Good answer patterns

When recommending a meal, provide:

- the meal name and a link to its TheMealDB page;
- its category and area/cuisine when present;
- ingredients paired with their measures;
- concise preparation instructions;
- source or video links when useful;
- attribution to TheMealDB.

When a user lists ingredients on hand, explain whether suggestions are exact matches
or whether extra ingredients are required. Never imply that an ingredient-filter
response proves a user has everything needed; perform a full meal lookup first.

Suggested attribution:

```text
Recipe data and imagery: TheMealDB (https://www.themealdb.com/)
```

## Responsible use

- Do not claim a recipe meets dietary, religious, medical, or allergy requirements
  solely because of its name, category, area, or tags.
- Treat ingredient and allergy questions carefully. The database is a recipe
  resource, not an allergen certification service; advise users to verify every
  ingredient label and cross-contamination risk.
- Preserve source, copyright, attribution, and licensing metadata when present.
- Apply ordinary food-safety guidance and do not infer cooking temperatures or
  storage limits that the recipe does not state.

## Access, attribution, and commercial use

Use official API endpoints; do not scrape the website. The development key is for
development and educational use. Publicly released applications and production
services should obtain the appropriate production or Premium access. Do not resell
the API. Artwork and records may carry their own attribution or licensing metadata,
so retain notices and check the relevant fields before redistribution.

Authoritative policies:

- Documentation: https://www.themealdb.com/documentation
- Terms of use: https://www.themealdb.com/terms_of_use.php
- Privacy policy: https://www.themealdb.com/privacy_policy.php
- Contact: mailto:thedatadb@gmail.com

## About the project

TheMealDB provides developers with a free, approachable recipe data source used by
apps, assistants, student projects, and food enthusiasts. Supporting the service
helps keep the core database and API available while unlocking production keys and
additional API capabilities.

Start exploring: https://www.themealdb.com/
