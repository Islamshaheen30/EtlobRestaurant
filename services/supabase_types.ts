
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'customer' | 'restaurant' | 'driver' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'customer' | 'restaurant' | 'driver' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'customer' | 'restaurant' | 'driver' | 'admin'
          created_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name_en: string
          name_ar: string
          address: string
          area: string
          logo_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name_en: string
          name_ar: string
          address: string
          area: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name_en?: string
          name_ar?: string
          address?: string
          area?: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          restaurant_id: string
          driver_id: string | null
          status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          total_amount: number
          delivery_fee: number
          commission_amount: number
          delivery_address: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          restaurant_id: string
          driver_id?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          total_amount: number
          delivery_fee: number
          commission_amount: number
          delivery_address: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          restaurant_id?: string
          driver_id?: string | null
          status?: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled'
          total_amount?: number
          delivery_fee?: number
          commission_amount?: number
          delivery_address?: string
          created_at?: string
        }
      }
    }
  }
}
