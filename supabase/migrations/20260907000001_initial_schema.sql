-- Initial schema for the pantry-first weekly meal planner.
-- See ARCHITECTURE.md § Schema. One migration per logical change from here on.
--
-- Authorization is entirely RLS: there is no server code enforcing access.
-- Reference tables (categories, areas, ingredients) are world-readable and
-- written only by the seed script, which uses the service_role key and bypasses RLS.

-- ======================================================================
-- fixed vocabularies
-- ======================================================================
create type diet_tag as enum (
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
  'pescatarian', 'halal', 'kosher', 'low_carb'
);

-- ======================================================================
-- reference data (seeded once; clients read only)
-- ======================================================================
create table categories (
  name text primary key
);

create table areas (
  name    text primary key,
  country text
);

create table ingredients (
  name        text primary key,   -- canonical name; pantry + recipe_ingredients reference this
  description text,
  image_url   text,
  type        text
);

-- ======================================================================
-- recipes: ONE table for system + user recipes
-- ======================================================================
create table recipes (
  id           text primary key,   -- MealDB idMeal, or a uuid string for user recipes
  source       text not null check (source in ('system', 'user')),
  created_by   uuid references auth.users(id) on delete cascade,  -- null for system rows
  name         text not null,
  category     text references categories(name),
  area         text references areas(name),
  country      text,
  instructions text,
  thumb_url    text,
  youtube_url  text,
  source_url   text,
  diet_tags    diet_tag[] not null default '{}',
  created_at   timestamptz not null default now(),
  constraint recipes_user_has_author check ((source = 'user') = (created_by is not null))
);

create index recipes_created_by_idx on recipes (created_by);
create index recipes_category_idx   on recipes (category);
create index recipes_area_idx       on recipes (area);
create index recipes_diet_tags_idx  on recipes using gin (diet_tags);

create table recipe_ingredients (
  recipe_id  text not null references recipes(id) on delete cascade,
  position   int  not null,
  ingredient text not null references ingredients(name),
  measure    text,
  primary key (recipe_id, position)   -- leading column covers the recipe_id FK
);

create index recipe_ingredients_ingredient_idx on recipe_ingredients (ingredient);

-- ======================================================================
-- per-user data (all guarded by user_id = auth.uid())
-- ======================================================================
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text,
  dietary_restrictions diet_tag[] not null default '{}',
  disliked_ingredients text[]     not null default '{}',
  created_at           timestamptz not null default now()
);

create table pantry_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ingredient text not null references ingredients(name),
  created_at timestamptz not null default now(),
  primary key (user_id, ingredient)   -- leading column covers the user_id FK
);

create index pantry_items_ingredient_idx on pantry_items (ingredient);

create table saved_recipes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  recipe_id  text not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index saved_recipes_recipe_id_idx on saved_recipes (recipe_id);

-- one active meal plan per user: up to 7 rows, one per weekday
create table meal_plan_entries (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day_of_week int  not null check (day_of_week between 0 and 6),
  is_active   boolean not null default true,   -- "cook this day"
  recipe_id   text references recipes(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day_of_week)
);

create index meal_plan_entries_recipe_id_idx on meal_plan_entries (recipe_id);

-- materialized by the "Generate list" action
create table grocery_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ingredient text not null,   -- not an FK: manual items may be free text
  checked    boolean not null default false,
  is_manual  boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, ingredient)
);

-- ======================================================================
-- auto-create a blank profile on sign-up so the app can assume one exists
-- ======================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ======================================================================
-- Row Level Security
-- ======================================================================
alter table categories         enable row level security;
alter table areas              enable row level security;
alter table ingredients        enable row level security;
alter table recipes            enable row level security;
alter table recipe_ingredients enable row level security;
alter table profiles           enable row level security;
alter table pantry_items       enable row level security;
alter table saved_recipes      enable row level security;
alter table meal_plan_entries  enable row level security;
alter table grocery_items      enable row level security;

-- ---- reference tables: world-readable, no client writes ----
create policy categories_read  on categories  for select to authenticated using (true);
create policy areas_read       on areas       for select to authenticated using (true);
create policy ingredients_read on ingredients for select to authenticated using (true);

-- ---- recipes: system rows or your own ----
create policy recipes_read on recipes
  for select to authenticated
  using (source = 'system' or created_by = (select auth.uid()));

create policy recipes_write on recipes
  for all to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- ---- recipe_ingredients: follow the parent recipe ----
create policy recipe_ingredients_read on recipe_ingredients
  for select to authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and (r.source = 'system' or r.created_by = (select auth.uid()))
    )
  );

create policy recipe_ingredients_write on recipe_ingredients
  for all to authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and r.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and r.created_by = (select auth.uid())
    )
  );

-- ---- profiles: your row only ----
create policy profiles_read on profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_write on profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---- pantry / saved / plan / grocery: rows where user_id = auth.uid() ----
create policy pantry_items_all on pantry_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy saved_recipes_all on saved_recipes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy meal_plan_entries_all on meal_plan_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy grocery_items_all on grocery_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
