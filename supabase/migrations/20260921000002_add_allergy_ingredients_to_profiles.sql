-- Specific-ingredient allergies (e.g. a particular fruit) that don't fit one of the
-- fixed allergen_type categories. Exact-match against ingredients.name, same treatment
-- as disliked_ingredients (hard exclude), just a separate field for the user's mental model.
alter table profiles add column allergy_ingredients text[] not null default '{}';
