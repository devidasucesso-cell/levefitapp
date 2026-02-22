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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      affiliate_sales: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string | null
          customer_email: string | null
          id: string
          order_id: string
          paid_at: string | null
          sale_amount: number
          status: string | null
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          created_at?: string | null
          customer_email?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          sale_amount: number
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string | null
          customer_email?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          sale_amount?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          pix_key: string | null
          pix_key_type: string | null
          total_commission: number | null
          total_sales: number | null
          user_id: string
        }
        Insert: {
          affiliate_code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          total_commission?: number | null
          total_sales?: number | null
          user_id: string
        }
        Update: {
          affiliate_code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          total_commission?: number | null
          total_sales?: number | null
          user_id?: string
        }
        Relationships: []
      }
      capsule_days: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      completed_detox: {
        Row: {
          completed_at: string
          created_at: string
          detox_id: string
          detox_name: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          detox_id: string
          detox_name: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          detox_id?: string
          detox_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      completed_exercises: {
        Row: {
          completed_at: string
          created_at: string
          exercise_id: string
          exercise_name: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          exercise_id: string
          exercise_name: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      completed_recipes: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          recipe_id: string
          recipe_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          recipe_id: string
          recipe_name: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          recipe_id?: string
          recipe_name?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          capsule_reminder: boolean | null
          capsule_time: string | null
          created_at: string
          id: string
          last_water_notification: string | null
          updated_at: string
          user_id: string
          water_interval: number | null
          water_reminder: boolean | null
        }
        Insert: {
          capsule_reminder?: boolean | null
          capsule_time?: string | null
          created_at?: string
          id?: string
          last_water_notification?: string | null
          updated_at?: string
          user_id: string
          water_interval?: number | null
          water_reminder?: boolean | null
        }
        Update: {
          capsule_reminder?: boolean | null
          capsule_time?: string | null
          created_at?: string
          id?: string
          last_water_notification?: string | null
          updated_at?: string
          user_id?: string
          water_interval?: number | null
          water_reminder?: boolean | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_total: number
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          items: Json | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_total?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          items?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_total?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          items?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_withdrawals: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          pix_key: string
          pix_key_type: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          pix_key: string
          pix_key_type: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          pix_key?: string
          pix_key_type?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          code_validated: boolean | null
          created_at: string
          height: number | null
          id: string
          imc: number | null
          imc_category: string | null
          is_approved: boolean | null
          kit_type: string | null
          last_active_at: string | null
          name: string
          onboarding_completed: boolean | null
          push_activated: boolean | null
          push_prompt_shown: boolean | null
          treatment_start_date: string | null
          updated_at: string
          user_id: string
          water_goal: number | null
          water_intake: number | null
          weight: number | null
        }
        Insert: {
          code_validated?: boolean | null
          created_at?: string
          height?: number | null
          id?: string
          imc?: number | null
          imc_category?: string | null
          is_approved?: boolean | null
          kit_type?: string | null
          last_active_at?: string | null
          name: string
          onboarding_completed?: boolean | null
          push_activated?: boolean | null
          push_prompt_shown?: boolean | null
          treatment_start_date?: string | null
          updated_at?: string
          user_id: string
          water_goal?: number | null
          water_intake?: number | null
          weight?: number | null
        }
        Update: {
          code_validated?: boolean | null
          created_at?: string
          height?: number | null
          id?: string
          imc?: number | null
          imc_category?: string | null
          is_approved?: boolean | null
          kit_type?: string | null
          last_active_at?: string | null
          name?: string
          onboarding_completed?: boolean | null
          push_activated?: boolean | null
          push_prompt_shown?: boolean | null
          treatment_start_date?: string | null
          updated_at?: string
          user_id?: string
          water_goal?: number | null
          water_intake?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      progress_history: {
        Row: {
          created_at: string
          date: string
          id: string
          imc: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          imc: number
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          imc?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          approved_at: string | null
          converted_at: string | null
          created_at: string
          credit_amount: number | null
          id: string
          kiwify_order_id: string | null
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          converted_at?: string | null
          created_at?: string
          credit_amount?: number | null
          id?: string
          kiwify_order_id?: string | null
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          converted_at?: string | null
          created_at?: string
          credit_amount?: number | null
          id?: string
          kiwify_order_id?: string | null
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          product_title: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          product_title: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          product_title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shown_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          shown_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          shown_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          referral_id: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          referral_id?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          referral_id?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          referral_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          referral_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          referral_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_intake_history: {
        Row: {
          created_at: string
          date: string
          id: string
          total_intake: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_intake?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_intake?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_generate_and_claim_code: {
        Args: { claiming_user_id: string }
        Returns: Json
      }
      claim_access_code: {
        Args: { claiming_user_id: string; code_input: string }
        Returns: Json
      }
      get_monthly_affiliate_ranking: {
        Args: never
        Returns: {
          affiliate_code: string
          affiliate_name: string
          rank_position: number
          sales_count: number
          total_commission: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
