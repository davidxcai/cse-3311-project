import { supabase } from '@/lib/supabase'
import type { DietTag, Recipe, RecipeIngredient } from '@/types/models'

export type RecipeFilters = {
  category?: string
  area?: string
  dietTag?: DietTag
  search?: string
  mineOnly?: boolean
  offset?: number
  limit?: number
}

const RECIPE_COLUMNS =
  'id, source, created_by, name, category, area, country, instructions, thumb_url, youtube_url, source_url, diet_tags, created_at'

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const { offset = 0, limit = 40 } = filters
  let q = supabase.from('recipes').select(RECIPE_COLUMNS).order('name')

  if (filters.category) q = q.eq('category', filters.category)
  if (filters.area) q = q.eq('area', filters.area)
  if (filters.dietTag) q = q.contains('diet_tags', [filters.dietTag])
  if (filters.search) q = q.ilike('name', `%${filters.search}%`)
  if (filters.mineOnly) q = q.eq('source', 'user')

  const { data, error } = await q.range(offset, offset + limit - 1)
  if (error) throw error
  return (data ?? []) as Recipe[]
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data, error } = await supabase.from('recipes').select(RECIPE_COLUMNS).eq('id', id).single()
  if (error) throw error
  return data as Recipe
}

export async function getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, position, ingredient, measure')
    .eq('recipe_id', recipeId)
    .order('position')
  if (error) throw error
  return (data ?? []) as RecipeIngredient[]
}

/** All recipes with their ingredient name lists — feeds the ranking function. */
export async function listRecipesWithIngredients(): Promise<
  Array<Pick<Recipe, 'id' | 'name' | 'diet_tags'> & { ingredients: string[] }>
> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, diet_tags, recipe_ingredients(ingredient)')
  if (error) throw error
  type Row = {
    id: string
    name: string
    diet_tags: Recipe['diet_tags'] | null
    recipe_ingredients: { ingredient: string }[] | null
  }
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    name: row.name,
    diet_tags: row.diet_tags ?? [],
    ingredients: (row.recipe_ingredients ?? []).map((ri) => ri.ingredient),
  }))
}

export async function listIngredients(): Promise<string[]> {
  const { data, error } = await supabase.from('ingredients').select('name').order('name')
  if (error) throw error
  return (data ?? []).map((r: { name: string }) => r.name)
}

export async function listCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('categories').select('name').order('name')
  if (error) throw error
  return (data ?? []).map((r: { name: string }) => r.name)
}

export async function listAreas(): Promise<string[]> {
  const { data, error } = await supabase.from('areas').select('name').order('name')
  if (error) throw error
  return (data ?? []).map((r: { name: string }) => r.name)
}

export async function listSavedRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('saved_recipes').select(`recipe:recipes(${RECIPE_COLUMNS})`)
  if (error) throw error
  return ((data ?? []) as unknown as Array<{ recipe: Recipe | null }>)
    .map((r) => r.recipe)
    .filter((recipe): recipe is Recipe => recipe !== null)
}

export type RecipeDraft = {
  name: string
  category: string | null
  area: string | null
  instructions: string | null
  thumb_url: string | null
  diet_tags: DietTag[]
  ingredients: Array<{ ingredient: string; measure: string | null }>
}

export async function createRecipe(draft: RecipeDraft, userId: string): Promise<string> {
  const id = crypto.randomUUID()
  const { error } = await supabase.from('recipes').insert({
    id,
    source: 'user',
    created_by: userId,
    name: draft.name,
    category: draft.category,
    area: draft.area,
    instructions: draft.instructions,
    thumb_url: draft.thumb_url,
    diet_tags: draft.diet_tags,
  })
  if (error) throw error
  await replaceRecipeIngredients(id, draft.ingredients)
  return id
}

export async function updateRecipe(id: string, draft: RecipeDraft): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update({
      name: draft.name,
      category: draft.category,
      area: draft.area,
      instructions: draft.instructions,
      thumb_url: draft.thumb_url,
      diet_tags: draft.diet_tags,
    })
    .eq('id', id)
  if (error) throw error
  await replaceRecipeIngredients(id, draft.ingredients)
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

async function replaceRecipeIngredients(
  recipeId: string,
  ingredients: Array<{ ingredient: string; measure: string | null }>,
): Promise<void> {
  const del = await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)
  if (del.error) throw del.error
  if (ingredients.length === 0) return
  const rows = ingredients.map((ing, position) => ({
    recipe_id: recipeId,
    position,
    ingredient: ing.ingredient,
    measure: ing.measure,
  }))
  const { error } = await supabase.from('recipe_ingredients').insert(rows)
  if (error) throw error
}

export async function saveRecipe(recipeId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('saved_recipes').insert({ recipe_id: recipeId, user_id: userId })
  if (error) throw error
}

export async function unsaveRecipe(recipeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
  if (error) throw error
}
