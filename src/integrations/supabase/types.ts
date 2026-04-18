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
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          revoked_by: string | null
          scope: Database["public"]["Enums"]["api_key_scope"]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          revoked_by?: string | null
          scope?: Database["public"]["Enums"]["api_key_scope"]
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scope?: Database["public"]["Enums"]["api_key_scope"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          method: string
          request_ip: string | null
          response_time_ms: number | null
          status_code: number
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          request_ip?: string | null
          response_time_ms?: number | null
          status_code: number
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          request_ip?: string | null
          response_time_ms?: number | null
          status_code?: number
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          customer_id: string
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_onu: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_seen_at: string | null
          notes: string | null
          olt_port_id: string
          onu_mac: string | null
          onu_number: number | null
          onu_serial: string | null
          onu_status: string
          onu_type: string | null
          rx_power: number | null
          service_port_id: number | null
          tenant_id: string
          tx_power: number | null
          updated_at: string
          vlan_id: number | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_seen_at?: string | null
          notes?: string | null
          olt_port_id: string
          onu_mac?: string | null
          onu_number?: number | null
          onu_serial?: string | null
          onu_status?: string
          onu_type?: string | null
          rx_power?: number | null
          service_port_id?: number | null
          tenant_id: string
          tx_power?: number | null
          updated_at?: string
          vlan_id?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_seen_at?: string | null
          notes?: string | null
          olt_port_id?: string
          onu_mac?: string | null
          onu_number?: number | null
          onu_serial?: string | null
          onu_status?: string
          onu_type?: string | null
          rx_power?: number | null
          service_port_id?: number | null
          tenant_id?: string
          tx_power?: number | null
          updated_at?: string
          vlan_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_onu_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_onu_olt_port_id_fkey"
            columns: ["olt_port_id"]
            isOneToOne: false
            referencedRelation: "olt_ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_onu_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          advance_balance: number | null
          connection_status:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at: string
          due_balance: number | null
          email: string | null
          id: string
          join_date: string
          last_network_sync_at: string | null
          last_payment_date: string | null
          name: string
          network_password_encrypted: string | null
          network_sync_status:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          network_username: string | null
          package_id: string | null
          phone: string
          reseller_id: string | null
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          advance_balance?: number | null
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at?: string
          due_balance?: number | null
          email?: string | null
          id?: string
          join_date?: string
          last_network_sync_at?: string | null
          last_payment_date?: string | null
          name: string
          network_password_encrypted?: string | null
          network_sync_status?:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          network_username?: string | null
          package_id?: string | null
          phone: string
          reseller_id?: string | null
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          advance_balance?: number | null
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at?: string
          due_balance?: number | null
          email?: string | null
          id?: string
          join_date?: string
          last_network_sync_at?: string | null
          last_payment_date?: string | null
          name?: string
          network_password_encrypted?: string | null
          network_sync_status?:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          network_username?: string | null
          package_id?: string | null
          phone?: string
          reseller_id?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      network_integrations: {
        Row: {
          created_at: string
          created_by: string | null
          credentials_encrypted: string | null
          host: string
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          last_sync_status:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          mikrotik_address_list: string | null
          mikrotik_ppp_profile: string | null
          mikrotik_use_ssl: boolean | null
          name: string
          port: number | null
          provider_type: Database["public"]["Enums"]["network_provider_type"]
          radius_acct_port: number | null
          radius_auth_port: number | null
          radius_secret_encrypted: string | null
          sync_interval_minutes: number | null
          sync_mode: Database["public"]["Enums"]["network_sync_mode"]
          tenant_id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credentials_encrypted?: string | null
          host: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          last_sync_status?:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          mikrotik_address_list?: string | null
          mikrotik_ppp_profile?: string | null
          mikrotik_use_ssl?: boolean | null
          name: string
          port?: number | null
          provider_type: Database["public"]["Enums"]["network_provider_type"]
          radius_acct_port?: number | null
          radius_auth_port?: number | null
          radius_secret_encrypted?: string | null
          sync_interval_minutes?: number | null
          sync_mode?: Database["public"]["Enums"]["network_sync_mode"]
          tenant_id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credentials_encrypted?: string | null
          host?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          last_sync_status?:
            | Database["public"]["Enums"]["network_sync_status"]
            | null
          mikrotik_address_list?: string | null
          mikrotik_ppp_profile?: string | null
          mikrotik_use_ssl?: boolean | null
          name?: string
          port?: number | null
          provider_type?: Database["public"]["Enums"]["network_provider_type"]
          radius_acct_port?: number | null
          radius_auth_port?: number | null
          radius_secret_encrypted?: string | null
          sync_interval_minutes?: number | null
          sync_mode?: Database["public"]["Enums"]["network_sync_mode"]
          tenant_id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      network_sync_logs: {
        Row: {
          action: Database["public"]["Enums"]["network_sync_action"]
          completed_at: string | null
          created_at: string
          customer_id: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          next_retry_at: string | null
          request_payload: Json | null
          response_payload: Json | null
          retry_count: number | null
          started_at: string
          status: Database["public"]["Enums"]["network_sync_status"]
          tenant_id: string
          triggered_by: string | null
          triggered_by_user: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["network_sync_action"]
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          next_retry_at?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["network_sync_status"]
          tenant_id: string
          triggered_by?: string | null
          triggered_by_user?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["network_sync_action"]
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          next_retry_at?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["network_sync_status"]
          tenant_id?: string
          triggered_by?: string | null
          triggered_by_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_sync_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "network_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_sync_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      network_sync_queue: {
        Row: {
          action: Database["public"]["Enums"]["network_sync_action"]
          completed_at: string | null
          created_at: string
          customer_id: string | null
          id: string
          integration_id: string
          last_error: string | null
          max_retries: number | null
          payload: Json | null
          priority: number | null
          retry_count: number | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["network_sync_status"]
          tenant_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["network_sync_action"]
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          integration_id: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["network_sync_status"]
          tenant_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["network_sync_action"]
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          integration_id?: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["network_sync_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_sync_queue_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_sync_queue_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "network_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_sync_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          created_at: string
          customer_id: string | null
          data: Json | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          tenant_id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          customer_id?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string
          tenant_id: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          customer_id?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      olt_devices: {
        Row: {
          brand: string
          created_at: string
          created_by: string | null
          credentials_encrypted: string | null
          host: string
          id: string
          is_enabled: boolean
          model: string | null
          name: string
          notes: string | null
          port: number | null
          protocol: string
          snmp_community: string | null
          snmp_version: string | null
          tenant_id: string
          total_pon_ports: number | null
          updated_at: string
          username: string
        }
        Insert: {
          brand?: string
          created_at?: string
          created_by?: string | null
          credentials_encrypted?: string | null
          host: string
          id?: string
          is_enabled?: boolean
          model?: string | null
          name: string
          notes?: string | null
          port?: number | null
          protocol?: string
          snmp_community?: string | null
          snmp_version?: string | null
          tenant_id: string
          total_pon_ports?: number | null
          updated_at?: string
          username?: string
        }
        Update: {
          brand?: string
          created_at?: string
          created_by?: string | null
          credentials_encrypted?: string | null
          host?: string
          id?: string
          is_enabled?: boolean
          model?: string | null
          name?: string
          notes?: string | null
          port?: number | null
          protocol?: string
          snmp_community?: string | null
          snmp_version?: string | null
          tenant_id?: string
          total_pon_ports?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "olt_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      olt_ports: {
        Row: {
          created_at: string
          id: string
          max_onus: number | null
          notes: string | null
          olt_device_id: string
          port: number
          port_label: string | null
          port_type: string
          slot: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_onus?: number | null
          notes?: string | null
          olt_device_id: string
          port: number
          port_label?: string | null
          port_type?: string
          slot?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_onus?: number | null
          notes?: string | null
          olt_device_id?: string
          port?: number
          port_label?: string | null
          port_type?: string
          slot?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "olt_ports_olt_device_id_fkey"
            columns: ["olt_device_id"]
            isOneToOne: false
            referencedRelation: "olt_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olt_ports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          mikrotik_address_pool: string | null
          mikrotik_profile_name: string | null
          mikrotik_queue_type: string | null
          mikrotik_rate_limit: string | null
          monthly_price: number
          name: string
          speed_label: string
          tenant_id: string
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mikrotik_address_pool?: string | null
          mikrotik_profile_name?: string | null
          mikrotik_queue_type?: string | null
          mikrotik_rate_limit?: string | null
          monthly_price: number
          name: string
          speed_label: string
          tenant_id: string
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mikrotik_address_pool?: string | null
          mikrotik_profile_name?: string | null
          mikrotik_queue_type?: string | null
          mikrotik_rate_limit?: string | null
          monthly_price?: number
          name?: string
          speed_label?: string
          tenant_id?: string
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          method: string | null
          notes: string | null
          reference: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          method?: string | null
          notes?: string | null
          reference?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          method?: string | null
          notes?: string | null
          reference?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_addon_tiers: {
        Row: {
          addon_id: string
          created_at: string
          id: string
          max_customers: number | null
          min_customers: number
          price: number
        }
        Insert: {
          addon_id: string
          created_at?: string
          id?: string
          max_customers?: number | null
          min_customers?: number
          price: number
        }
        Update: {
          addon_id?: string
          created_at?: string
          id?: string
          max_customers?: number | null
          min_customers?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "platform_addon_tiers_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "platform_addons"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_addons: {
        Row: {
          base_price: number
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          pricing_type: Database["public"]["Enums"]["addon_pricing_type"]
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          pricing_type?: Database["public"]["Enums"]["addon_pricing_type"]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pricing_type?: Database["public"]["Enums"]["addon_pricing_type"]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_invoice_items: {
        Row: {
          addon_id: string | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          item_type: string
          metadata: Json | null
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          addon_id?: string | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          item_type: string
          metadata?: Json | null
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          addon_id?: string | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string
          metadata?: Json | null
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "platform_invoice_items_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "platform_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "platform_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_invoices: {
        Row: {
          created_at: string
          customer_count_snapshot: number | null
          due_date: string
          id: string
          invoice_number: string
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          subscription_id: string | null
          subtotal: number
          tax_amount: number
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_count_snapshot?: number | null
          due_date: string
          id?: string
          invoice_number: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_count_snapshot?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tenant_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          base_price: number
          billing_cycle: Database["public"]["Enums"]["platform_billing_cycle"]
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          max_customers: number | null
          max_staff: number | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          billing_cycle?: Database["public"]["Enums"]["platform_billing_cycle"]
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_customers?: number | null
          max_staff?: number | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          billing_cycle?: Database["public"]["Enums"]["platform_billing_cycle"]
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_customers?: number | null
          max_staff?: number | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      proration_items: {
        Row: {
          addon_id: string | null
          created_at: string
          days_remaining: number
          description: string
          effective_date: string
          id: string
          invoice_id: string | null
          item_type: string
          metadata: Json | null
          new_plan_id: string | null
          old_plan_id: string | null
          original_price: number
          period_end: string
          period_start: string
          prorated_amount: number
          status: string
          tenant_id: string
          total_days: number
        }
        Insert: {
          addon_id?: string | null
          created_at?: string
          days_remaining: number
          description: string
          effective_date?: string
          id?: string
          invoice_id?: string | null
          item_type: string
          metadata?: Json | null
          new_plan_id?: string | null
          old_plan_id?: string | null
          original_price?: number
          period_end: string
          period_start: string
          prorated_amount: number
          status?: string
          tenant_id: string
          total_days: number
        }
        Update: {
          addon_id?: string | null
          created_at?: string
          days_remaining?: number
          description?: string
          effective_date?: string
          id?: string
          invoice_id?: string | null
          item_type?: string
          metadata?: Json | null
          new_plan_id?: string | null
          old_plan_id?: string | null
          original_price?: number
          period_end?: string
          period_start?: string
          prorated_amount?: number
          status?: string
          tenant_id?: string
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "proration_items_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "platform_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proration_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "platform_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proration_items_new_plan_id_fkey"
            columns: ["new_plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proration_items_old_plan_id_fkey"
            columns: ["old_plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proration_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          customer_id: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          tenant_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          customer_id: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          tenant_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          customer_id?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          tenant_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_commissions: {
        Row: {
          commission_amount: number
          commission_type: string
          commission_value: number
          created_at: string
          customer_id: string
          id: string
          payment_amount: number
          payment_id: string
          reseller_id: string
          tenant_id: string
        }
        Insert: {
          commission_amount: number
          commission_type: string
          commission_value: number
          created_at?: string
          customer_id: string
          id?: string
          payment_amount: number
          payment_id: string
          reseller_id: string
          tenant_id: string
        }
        Update: {
          commission_amount?: number
          commission_type?: string
          commission_value?: number
          created_at?: string
          customer_id?: string
          id?: string
          payment_amount?: number
          payment_id?: string
          reseller_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_commissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_commissions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_commissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          description: string
          id: string
          reference_id: string | null
          reseller_id: string
          tenant_id: string
          type: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          reference_id?: string | null
          reseller_id: string
          tenant_id: string
          type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          reseller_id?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_wallet_transactions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_wallet_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          accent_color: string | null
          address: string | null
          brand_name: string | null
          commission_type: string
          commission_value: number
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string
          primary_color: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          brand_name?: string | null
          commission_type?: string
          commission_value?: number
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone: string
          primary_color?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          brand_name?: string | null
          commission_type?: string
          commission_value?: number
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string
          primary_color?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resellers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_addon_subscriptions: {
        Row: {
          activated_at: string
          addon_id: string
          created_at: string
          deactivated_at: string | null
          id: string
          is_active: boolean
          tenant_id: string
        }
        Insert: {
          activated_at?: string
          addon_id: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          tenant_id: string
        }
        Update: {
          activated_at?: string
          addon_id?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_addon_subscriptions_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "platform_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_addon_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          allow_reseller_branding: boolean | null
          allow_reseller_logo: boolean | null
          allow_reseller_name: boolean | null
          allow_reseller_theme: boolean | null
          api_enabled: boolean | null
          auto_suspend_days: number | null
          created_at: string
          currency: string | null
          enable_online_payment: boolean | null
          id: string
          language: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          resend_api_key: string | null
          sender_email: string | null
          subdomain: string
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone: string | null
          uddoktapay_api_key: string | null
          uddoktapay_base_url: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          allow_reseller_branding?: boolean | null
          allow_reseller_logo?: boolean | null
          allow_reseller_name?: boolean | null
          allow_reseller_theme?: boolean | null
          api_enabled?: boolean | null
          auto_suspend_days?: number | null
          created_at?: string
          currency?: string | null
          enable_online_payment?: boolean | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          resend_api_key?: string | null
          sender_email?: string | null
          subdomain: string
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone?: string | null
          uddoktapay_api_key?: string | null
          uddoktapay_base_url?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          allow_reseller_branding?: boolean | null
          allow_reseller_logo?: boolean | null
          allow_reseller_name?: boolean | null
          allow_reseller_theme?: boolean | null
          api_enabled?: boolean | null
          auto_suspend_days?: number | null
          created_at?: string
          currency?: string | null
          enable_online_payment?: boolean | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          resend_api_key?: string | null
          sender_email?: string | null
          subdomain?: string
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone?: string | null
          uddoktapay_api_key?: string | null
          uddoktapay_base_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_addon_price: {
        Args: { _addon_id: string; _customer_count: number }
        Returns: number
      }
      calculate_proration: {
        Args: {
          _effective_date?: string
          _original_price: number
          _period_end: string
          _period_start: string
        }
        Returns: {
          daily_rate: number
          days_remaining: number
          prorated_amount: number
          total_days: number
        }[]
      }
      calculate_reseller_commission: {
        Args: {
          _customer_id: string
          _payment_amount: number
          _payment_id: string
          _tenant_id: string
        }
        Returns: number
      }
      can_access_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      create_addon_proration: {
        Args: {
          _addon_id: string
          _effective_date?: string
          _is_activation?: boolean
          _tenant_id: string
        }
        Returns: string
      }
      create_plan_proration: {
        Args: {
          _effective_date?: string
          _new_plan_id: string
          _old_plan_id: string
          _tenant_id: string
        }
        Returns: string
      }
      get_reseller_id: { Args: { _user_id: string }; Returns: string }
      get_tenant_billing_estimate: {
        Args: { _tenant_id: string }
        Returns: {
          addons_cost: number
          base_plan_cost: number
          customer_count: number
          total_cost: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_isp_staff: { Args: { _user_id: string }; Returns: boolean }
      is_reseller: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_api_request: {
        Args: {
          _api_key_id: string
          _endpoint: string
          _error_message?: string
          _method: string
          _request_ip?: string
          _response_time_ms?: number
          _status_code: number
          _tenant_id: string
          _user_agent?: string
        }
        Returns: string
      }
      onboard_tenant: {
        Args: { _subdomain: string; _tenant_name: string; _user_id: string }
        Returns: string
      }
      update_api_key_last_used: {
        Args: { _api_key_id: string }
        Returns: undefined
      }
      user_tenant_id: { Args: { _user_id: string }; Returns: string }
      validate_api_key: {
        Args: { _key_hash: string }
        Returns: {
          api_key_id: string
          is_valid: boolean
          scope: Database["public"]["Enums"]["api_key_scope"]
          tenant_id: string
        }[]
      }
    }
    Enums: {
      addon_pricing_type: "fixed" | "tiered" | "usage_based"
      api_key_scope: "read_only" | "read_write"
      app_role:
        | "super_admin"
        | "isp_owner"
        | "admin"
        | "manager"
        | "staff"
        | "accountant"
        | "marketing"
        | "member"
        | "reseller"
      billing_cycle: "monthly" | "quarterly" | "yearly"
      connection_status: "active" | "suspended" | "pending"
      network_provider_type: "mikrotik" | "radius" | "custom"
      network_sync_action:
        | "enable"
        | "disable"
        | "update_speed"
        | "create"
        | "delete"
        | "test_connection"
      network_sync_mode: "manual" | "scheduled" | "event_driven"
      network_sync_status:
        | "pending"
        | "in_progress"
        | "success"
        | "failed"
        | "retrying"
      payment_status: "paid" | "due" | "partial" | "overdue"
      platform_billing_cycle: "monthly" | "quarterly" | "yearly"
      subscription_status: "active" | "suspended" | "trial"
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
      addon_pricing_type: ["fixed", "tiered", "usage_based"],
      api_key_scope: ["read_only", "read_write"],
      app_role: [
        "super_admin",
        "isp_owner",
        "admin",
        "manager",
        "staff",
        "accountant",
        "marketing",
        "member",
        "reseller",
      ],
      billing_cycle: ["monthly", "quarterly", "yearly"],
      connection_status: ["active", "suspended", "pending"],
      network_provider_type: ["mikrotik", "radius", "custom"],
      network_sync_action: [
        "enable",
        "disable",
        "update_speed",
        "create",
        "delete",
        "test_connection",
      ],
      network_sync_mode: ["manual", "scheduled", "event_driven"],
      network_sync_status: [
        "pending",
        "in_progress",
        "success",
        "failed",
        "retrying",
      ],
      payment_status: ["paid", "due", "partial", "overdue"],
      platform_billing_cycle: ["monthly", "quarterly", "yearly"],
      subscription_status: ["active", "suspended", "trial"],
    },
  },
} as const
