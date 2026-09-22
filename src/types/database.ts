/**
 * Generated from the live Supabase schema. Regenerate with `npm run db:types`
 * (`supabase gen types typescript --linked > src/types/database.ts`) after
 * every migration. Do not hand-edit.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          country: string | null
          name: string
        }
        Insert: {
          country?: string | null
          name: string
        }
        Update: {
          country?: string | null
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          checked: boolean
          created_at: string
          ingredient: string
          is_manual: boolean
          user_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          ingredient: string
          is_manual?: boolean
          user_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          ingredient?: string
          is_manual?: boolean
          user_id?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          allergen_types: Database["public"]["Enums"]["allergen_type"][]
          description: string | null
          image_url: string | null
          name: string
          type: string | null
        }
        Insert: {
          allergen_types?: Database["public"]["Enums"]["allergen_type"][]
          description?: string | null
          image_url?: string | null
          name: string
          type?: string | null
        }
        Update: {
          allergen_types?: Database["public"]["Enums"]["allergen_type"][]
          description?: string | null
          image_url?: string | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      meal_plan_entries: {
        Row: {
          is_active: boolean
          plan_date: string
          recipe_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          is_active?: boolean
          plan_date: string
          recipe_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          is_active?: boolean
          plan_date?: string
          recipe_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          created_at: string
          ingredient: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ingredient: string
          user_id: string
        }
        Update: {
          created_at?: string
          ingredient?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_ingredient_fkey"
            columns: ["ingredient"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["name"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: Database["public"]["Enums"]["allergen_type"][]
          allergy_ingredients: string[]
          created_at: string
          dietary_restrictions: Database["public"]["Enums"]["diet_tag"][]
          disliked_ingredients: string[]
          display_name: string | null
          id: string
        }
        Insert: {
          allergies?: Database["public"]["Enums"]["allergen_type"][]
          allergy_ingredients?: string[]
          created_at?: string
          dietary_restrictions?: Database["public"]["Enums"]["diet_tag"][]
          disliked_ingredients?: string[]
          display_name?: string | null
          id: string
        }
        Update: {
          allergies?: Database["public"]["Enums"]["allergen_type"][]
          allergy_ingredients?: string[]
          created_at?: string
          dietary_restrictions?: Database["public"]["Enums"]["diet_tag"][]
          disliked_ingredients?: string[]
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          ingredient: string
          measure: string | null
          position: number
          recipe_id: string
        }
        Insert: {
          ingredient: string
          measure?: string | null
          position: number
          recipe_id: string
        }
        Update: {
          ingredient?: string
          measure?: string | null
          position?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_fkey"
            columns: ["ingredient"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_plan_history: {
        Row: {
          created_at: string
          id: number
          planned_date: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          planned_date?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          planned_date?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_plan_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          area: string | null
          category: string | null
          country: string | null
          created_at: string
          created_by: string | null
          diet_tags: Database["public"]["Enums"]["diet_tag"][]
          id: string
          instructions: string | null
          name: string
          source: string
          source_url: string | null
          thumb_url: string | null
          youtube_url: string | null
        }
        Insert: {
          area?: string | null
          category?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          diet_tags?: Database["public"]["Enums"]["diet_tag"][]
          id: string
          instructions?: string | null
          name: string
          source: string
          source_url?: string | null
          thumb_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          area?: string | null
          category?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          diet_tags?: Database["public"]["Enums"]["diet_tag"][]
          id?: string
          instructions?: string | null
          name?: string
          source?: string
          source_url?: string | null
          thumb_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_area_fkey"
            columns: ["area"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "recipes_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
      saved_recipes: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      allergen_type:
        | "Shellfish"
        | "Fish"
        | "Gluten"
        | "Dairy"
        | "Peanuts"
        | "Tree Nuts"
        | "Soy"
        | "Eggs"
        | "Sesame"
        | "Mustard"
        | "Sulfites"
        | "Nightshades"
      diet_tag:
        | "vegetarian"
        | "vegan"
        | "gluten_free"
        | "dairy_free"
        | "nut_free"
        | "pescatarian"
        | "halal"
        | "kosher"
        | "low_carb"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allergen_type: [
        "Shellfish",
        "Fish",
        "Gluten",
        "Dairy",
        "Peanuts",
        "Tree Nuts",
        "Soy",
        "Eggs",
        "Sesame",
        "Mustard",
        "Sulfites",
        "Nightshades",
      ],
      diet_tag: [
        "vegetarian",
        "vegan",
        "gluten_free",
        "dairy_free",
        "nut_free",
        "pescatarian",
        "halal",
        "kosher",
        "low_carb",
      ],
    },
  },
} as const
