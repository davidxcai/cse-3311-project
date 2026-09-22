-- Closed allergen vocabulary, matching ALLERGY_TYPES in src/types/models.ts.
create type allergen_type as enum (
  'Shellfish', 'Fish', 'Gluten', 'Dairy', 'Peanuts', 'Tree Nuts',
  'Soy', 'Eggs', 'Sesame', 'Mustard', 'Sulfites', 'Nightshades'
);

-- Which allergen categories an ingredient belongs to (an ingredient can span more than one,
-- e.g. a broth roux touching both Gluten and Dairy). Seeded by a curated pass, not string
-- matching against ingredient names at query time.
alter table ingredients add column allergen_types allergen_type[] not null default '{}';
create index ingredients_allergen_types_idx on ingredients using gin (allergen_types);

-- profiles.allergies was a free-standing text[]; move it onto the same closed vocabulary
-- as ingredients.allergen_types so a hard-exclude filter can compare them directly.
alter table profiles alter column allergies drop default;
alter table profiles alter column allergies type allergen_type[] using allergies::allergen_type[];
alter table profiles alter column allergies set default '{}';
