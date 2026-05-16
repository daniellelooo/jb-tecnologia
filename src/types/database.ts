export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          build_id: string | null
          cart_id: string
          created_at: string
          id: string
          price_at_add: number
          product_id: string
          quantity: number
        }
        Insert: {
          build_id?: string | null
          cart_id: string
          created_at?: string
          id?: string
          price_at_add: number
          product_id: string
          quantity?: number
        }
        Update: {
          build_id?: string | null
          cart_id?: string
          created_at?: string
          id?: string
          price_at_add?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "pc_builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      component_slots: {
        Row: {
          display_order: number
          help_text: string
          id: string
          is_required: boolean
          name: string
          slug: string
        }
        Insert: {
          display_order: number
          help_text?: string
          id?: string
          is_required?: boolean
          name: string
          slug: string
        }
        Update: {
          display_order?: number
          help_text?: string
          id?: string
          is_required?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          build_id: string | null
          created_at: string
          customer_email: string | null
          customer_id_number: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          delivery_neighborhood: string | null
          delivery_type: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_reference: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          build_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id_number?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_neighborhood?: string | null
          delivery_type: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method: string
          payment_reference?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          build_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id_number?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_neighborhood?: string | null
          delivery_type?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_reference?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "pc_builds"
            referencedColumns: ["id"]
          },
        ]
      }
      pc_builds: {
        Row: {
          budget_hint: string | null
          case_id: string | null
          compatibility_issues: Json
          cooling_id: string | null
          cpu_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          gpu_id: string | null
          id: string
          is_compatible: boolean
          motherboard_id: string | null
          notes: string | null
          psu_id: string | null
          ram_id: string | null
          session_id: string
          status: string
          storage_id: string | null
          total_price: number
          use_case: string | null
        }
        Insert: {
          budget_hint?: string | null
          case_id?: string | null
          compatibility_issues?: Json
          cooling_id?: string | null
          cpu_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          gpu_id?: string | null
          id?: string
          is_compatible?: boolean
          motherboard_id?: string | null
          notes?: string | null
          psu_id?: string | null
          ram_id?: string | null
          session_id: string
          status?: string
          storage_id?: string | null
          total_price?: number
          use_case?: string | null
        }
        Update: {
          budget_hint?: string | null
          case_id?: string | null
          compatibility_issues?: Json
          cooling_id?: string | null
          cpu_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          gpu_id?: string | null
          id?: string
          is_compatible?: boolean
          motherboard_id?: string | null
          notes?: string | null
          psu_id?: string | null
          ram_id?: string | null
          session_id?: string
          status?: string
          storage_id?: string | null
          total_price?: number
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pc_builds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_cooling_id_fkey"
            columns: ["cooling_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_cpu_id_fkey"
            columns: ["cpu_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_gpu_id_fkey"
            columns: ["gpu_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_motherboard_id_fkey"
            columns: ["motherboard_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_psu_id_fkey"
            columns: ["psu_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_ram_id_fkey"
            columns: ["ram_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pc_builds_storage_id_fkey"
            columns: ["storage_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          display_order: number
          id: string
          is_primary: boolean
          product_id: string
          storage_url: string
        }
        Insert: {
          alt_text?: string | null
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id: string
          storage_url: string
        }
        Update: {
          alt_text?: string | null
          display_order?: number
          id?: string
          is_primary?: boolean
          product_id?: string
          storage_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category_id: string
          compare_price: number | null
          component_slot_id: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          is_featured: boolean
          model: string
          name: string
          price: number
          short_description: string
          sku: string
          slug: string
          specs: Json
          stock: number
          tags: string[]
          updated_at: string
          weight_g: number | null
        }
        Insert: {
          brand: string
          category_id: string
          compare_price?: number | null
          component_slot_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          model: string
          name: string
          price: number
          short_description?: string
          sku: string
          slug: string
          specs?: Json
          stock?: number
          tags?: string[]
          updated_at?: string
          weight_g?: number | null
        }
        Update: {
          brand?: string
          category_id?: string
          compare_price?: number | null
          component_slot_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          model?: string
          name?: string
          price?: number
          short_description?: string
          sku?: string
          slug?: string
          specs?: Json
          stock?: number
          tags?: string[]
          updated_at?: string
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_component_slot_id_fkey"
            columns: ["component_slot_id"]
            isOneToOne: false
            referencedRelation: "component_slots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_items: {
        Args: {
          p_build_id: string
          p_customer_email: string
          p_customer_id_number: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_delivery_fee: number
          p_delivery_neighborhood: string
          p_delivery_type: string
          p_items: Json
          p_notes: string
          p_payment_method: string
          p_subtotal: number
          p_total: number
        }
        Returns: Json
      }
      generate_order_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

