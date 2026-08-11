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
      accounts: {
        Row: {
          business_id: string
          closed_at: string | null
          id: string
          opened_at: string
          order_point_id: string | null
          status: string
          unit_id: string
        }
        Insert: {
          business_id: string
          closed_at?: string | null
          id?: string
          opened_at?: string
          order_point_id?: string | null
          status?: string
          unit_id: string
        }
        Update: {
          business_id?: string
          closed_at?: string | null
          id?: string
          opened_at?: string
          order_point_id?: string | null
          status?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_order_point_id_fkey"
            columns: ["order_point_id"]
            isOneToOne: false
            referencedRelation: "order_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          after: Json | null
          before: Json | null
          business_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          after?: Json | null
          before?: Json | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          after?: Json | null
          before?: Json | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_counters: {
        Row: {
          business_id: string
          next_folio: number
        }
        Insert: {
          business_id: string
          next_folio?: number
        }
        Update: {
          business_id?: string
          next_folio?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_counters_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          auth_user_id: string
          business_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          auth_user_id: string
          business_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          auth_user_id?: string
          business_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_signup_requests: {
        Row: {
          auth_user_id: string
          business_name: string
          city: string
          contact_email: string
          created_at: string
          id: string
          note: string | null
          phone: string | null
          resolved_at: string | null
          resolved_business_id: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          auth_user_id: string
          business_name: string
          city: string
          contact_email: string
          created_at?: string
          id?: string
          note?: string | null
          phone?: string | null
          resolved_at?: string | null
          resolved_business_id?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          auth_user_id?: string
          business_name?: string
          city?: string
          contact_email?: string
          created_at?: string
          id?: string
          note?: string | null
          phone?: string | null
          resolved_at?: string | null
          resolved_business_id?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_signup_requests_resolved_business_id_fkey"
            columns: ["resolved_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          billing_mode: string
          brand_color: string | null
          brand_motif: string
          cover_photo_url: string | null
          created_at: string
          default_alert_amber_minutes: number
          default_alert_red_minutes: number
          header_style: string
          id: string
          logo_url: string | null
          menu_style: string
          name: string
          slug: string
          subscription_status: string
          tax_included: boolean
          timezone: string
        }
        Insert: {
          billing_mode?: string
          brand_color?: string | null
          brand_motif?: string
          cover_photo_url?: string | null
          created_at?: string
          default_alert_amber_minutes?: number
          default_alert_red_minutes?: number
          header_style?: string
          id?: string
          logo_url?: string | null
          menu_style?: string
          name: string
          slug: string
          subscription_status?: string
          tax_included?: boolean
          timezone?: string
        }
        Update: {
          billing_mode?: string
          brand_color?: string | null
          brand_motif?: string
          cover_photo_url?: string | null
          created_at?: string
          default_alert_amber_minutes?: number
          default_alert_red_minutes?: number
          header_style?: string
          id?: string
          logo_url?: string | null
          menu_style?: string
          name?: string
          slug?: string
          subscription_status?: string
          tax_included?: boolean
          timezone?: string
        }
        Relationships: []
      }
      daily_unit_sales: {
        Row: {
          business_id: string
          cancelled_count: number
          created_at: string
          gross_sales: number
          id: string
          item_count: number
          net_sales: number
          order_count: number
          sale_date: string
          tax_amount: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          cancelled_count?: number
          created_at?: string
          gross_sales?: number
          id?: string
          item_count?: number
          net_sales?: number
          order_count?: number
          sale_date: string
          tax_amount?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          cancelled_count?: number
          created_at?: string
          gross_sales?: number
          id?: string
          item_count?: number
          net_sales?: number
          order_count?: number
          sale_date?: string
          tax_amount?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_unit_sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_unit_sales_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sessions: {
        Row: {
          device_id: string
          expires_at: string
          id: string
          issued_at: string
          last_seen_at: string | null
          revoked_at: string | null
          session_secret_hash: string
          staff_id: string
        }
        Insert: {
          device_id: string
          expires_at: string
          id?: string
          issued_at?: string
          last_seen_at?: string | null
          revoked_at?: string | null
          session_secret_hash: string
          staff_id: string
        }
        Update: {
          device_id?: string
          expires_at?: string
          id?: string
          issued_at?: string
          last_seen_at?: string | null
          revoked_at?: string | null
          session_secret_hash?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_sessions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          business_id: string
          created_at: string
          device_secret_hash: string | null
          failed_pin_attempts: number
          id: string
          label: string
          last_seen_at: string | null
          paired_at: string | null
          pairing_code_expires_at: string | null
          pairing_code_hash: string | null
          pin_locked_until: string | null
          revoked_at: string | null
          unit_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          device_secret_hash?: string | null
          failed_pin_attempts?: number
          id?: string
          label: string
          last_seen_at?: string | null
          paired_at?: string | null
          pairing_code_expires_at?: string | null
          pairing_code_hash?: string | null
          pin_locked_until?: string | null
          revoked_at?: string | null
          unit_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          device_secret_hash?: string | null
          failed_pin_attempts?: number
          id?: string
          label?: string
          last_seen_at?: string | null
          paired_at?: string | null
          pairing_code_expires_at?: string | null
          pairing_code_hash?: string | null
          pin_locked_until?: string | null
          revoked_at?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          business_id: string
          id: string
          name_en: string
          name_es: string
          sort_order: number
        }
        Insert: {
          business_id: string
          id?: string
          name_en: string
          name_es: string
          sort_order?: number
        }
        Update: {
          business_id?: string
          id?: string
          name_en?: string
          name_es?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          business_id: string
          customizations_snapshot: Json
          id: string
          line_total: number
          notes: string | null
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
        }
        Insert: {
          business_id: string
          customizations_snapshot?: Json
          id?: string
          line_total: number
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
        }
        Update: {
          business_id?: string
          customizations_snapshot?: Json
          id?: string
          line_total?: number
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          unit_price_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
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
      order_points: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          id: string
          label: string
          qr_slug: string
          unit_id: string
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          id?: string
          label?: string
          qr_slug: string
          unit_id: string
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          id?: string
          label?: string
          qr_slug?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_points_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_points_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          business_id: string
          created_at: string
          from_status: string | null
          id: string
          order_id: string
          to_status: string
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          business_id: string
          created_at?: string
          from_status?: string | null
          id?: string
          order_id: string
          to_status: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          business_id?: string
          created_at?: string
          from_status?: string | null
          id?: string
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id: string | null
          business_id: string
          channel: string
          created_at: string
          customer_name: string | null
          folio: number | null
          id: string
          notes: string | null
          order_point_id: string | null
          payment_status: string
          status: string
          subtotal: number
          tax_amount: number
          tax_included_snapshot: boolean
          total: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          business_id: string
          channel: string
          created_at?: string
          customer_name?: string | null
          folio?: number | null
          id?: string
          notes?: string | null
          order_point_id?: string | null
          payment_status?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_included_snapshot?: boolean
          total?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          business_id?: string
          channel?: string
          created_at?: string
          customer_name?: string | null
          folio?: number | null
          id?: string
          notes?: string | null
          order_point_id?: string | null
          payment_status?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_included_snapshot?: boolean
          total?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_order_point_id_fkey"
            columns: ["order_point_id"]
            isOneToOne: false
            referencedRelation: "order_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          auth_user_id: string
          created_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      product_option_groups: {
        Row: {
          business_id: string
          group_name_en: string
          group_name_es: string
          id: string
          max_select: number
          min_select: number
          product_id: string
          required: boolean
          sort_order: number
        }
        Insert: {
          business_id: string
          group_name_en: string
          group_name_es: string
          id?: string
          max_select?: number
          min_select?: number
          product_id: string
          required?: boolean
          sort_order?: number
        }
        Update: {
          business_id?: string
          group_name_en?: string
          group_name_es?: string
          id?: string
          max_select?: number
          min_select?: number
          product_id?: string
          required?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_option_groups_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          business_id: string
          group_id: string
          id: string
          kind: string
          option_name_en: string
          option_name_es: string
          price_delta: number
          sold_out: boolean
          sort_order: number
        }
        Insert: {
          business_id: string
          group_id: string
          id?: string
          kind?: string
          option_name_en: string
          option_name_es: string
          price_delta?: number
          sold_out?: boolean
          sort_order?: number
        }
        Update: {
          business_id?: string
          group_id?: string
          id?: string
          kind?: string
          option_name_en?: string
          option_name_es?: string
          price_delta?: number
          sold_out?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_options_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          description_en: string | null
          description_es: string | null
          id: string
          name_en: string
          name_es: string
          photo_url: string | null
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en: string
          name_es: string
          photo_url?: string | null
          price: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en?: string
          name_es?: string
          photo_url?: string | null
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          id: string
          name: string
          pin_hash: string
          removed_at: string | null
          role: string
          unit_id: string | null
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          id?: string
          name: string
          pin_hash: string
          removed_at?: string | null
          role?: string
          unit_id?: string | null
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          id?: string
          name?: string
          pin_hash?: string
          removed_at?: string | null
          role?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      truck_requests: {
        Row: {
          business_id: string
          created_at: string
          id: string
          note: string | null
          owner_acknowledged_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_unit_id: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          note?: string | null
          owner_acknowledged_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_unit_id?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          note?: string | null
          owner_acknowledged_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_unit_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "truck_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truck_requests_resolved_unit_id_fkey"
            columns: ["resolved_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_products: {
        Row: {
          business_id: string
          id: string
          is_offered: boolean
          product_id: string
          sold_out: boolean
          unit_id: string
        }
        Insert: {
          business_id: string
          id?: string
          is_offered?: boolean
          product_id: string
          sold_out?: boolean
          unit_id: string
        }
        Update: {
          business_id?: string
          id?: string
          is_offered?: boolean
          product_id?: string
          sold_out?: boolean
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          alert_amber_minutes: number | null
          alert_red_minutes: number | null
          archive_warned_at: string | null
          archived_at: string | null
          brand_color: string | null
          business_id: string
          created_at: string
          hours: Json
          id: string
          location: string | null
          name: string
          pause_reason: string | null
          paused_until: string | null
          photo_url: string | null
          status: string
          type: string
        }
        Insert: {
          alert_amber_minutes?: number | null
          alert_red_minutes?: number | null
          archive_warned_at?: string | null
          archived_at?: string | null
          brand_color?: string | null
          business_id: string
          created_at?: string
          hours?: Json
          id?: string
          location?: string | null
          name: string
          pause_reason?: string | null
          paused_until?: string | null
          photo_url?: string | null
          status?: string
          type?: string
        }
        Update: {
          alert_amber_minutes?: number | null
          alert_red_minutes?: number | null
          archive_warned_at?: string | null
          archived_at?: string | null
          brand_color?: string | null
          business_id?: string
          created_at?: string
          hours?: Json
          id?: string
          location?: string | null
          name?: string
          pause_reason?: string | null
          paused_until?: string | null
          photo_url?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_business_ids: { Args: never; Returns: string[] }
      is_platform_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_after?: Json
          p_before?: Json
          p_business_id: string
          p_entity_id: string
          p_entity_type: string
        }
        Returns: undefined
      }
      log_owner_action: {
        Args: {
          p_action: string
          p_after?: Json
          p_before?: Json
          p_business_id: string
          p_entity_id: string
          p_entity_type: string
        }
        Returns: undefined
      }
      next_order_folio: { Args: { p_business_id: string }; Returns: number }
      request_subscription_cancel: {
        Args: { p_business_id: string; p_note?: string }
        Returns: undefined
      }
      staff_business_id: { Args: never; Returns: string }
      staff_last_used: {
        Args: { p_business_id: string }
        Returns: {
          last_used: string
          staff_id: string
        }[]
      }
      staff_unit_id: { Args: never; Returns: string }
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
  public: {
    Enums: {},
  },
} as const
