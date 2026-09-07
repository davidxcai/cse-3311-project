-- Broaden read access on reference + system-recipe data to anon as well as
-- authenticated, matching ARCHITECTURE.md § RLS (select = true / "source = 'system'
-- OR created_by = auth.uid()", with no role restriction). Per-user tables stay
-- authenticated-only. The app gates every route behind login regardless; this
-- just lets unauthenticated clients (and curl with the anon key) read public data.

drop policy categories_read  on categories;
drop policy areas_read       on areas;
drop policy ingredients_read on ingredients;
drop policy recipes_read     on recipes;
drop policy recipe_ingredients_read on recipe_ingredients;

create policy categories_read on categories
  for select using (true);

create policy areas_read on areas
  for select using (true);

create policy ingredients_read on ingredients
  for select using (true);

create policy recipes_read on recipes
  for select
  using (source = 'system' or created_by = (select auth.uid()));

create policy recipe_ingredients_read on recipe_ingredients
  for select
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and (r.source = 'system' or r.created_by = (select auth.uid()))
    )
  );
