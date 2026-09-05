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
      entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          moments: string[]
          token_url: string | null
          token_fallback: boolean
          sealed: boolean
          sealed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          moments: string[]
          token_url?: string | null
          token_fallback?: boolean
          sealed?: boolean
          sealed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          moments?: string[]
          token_url?: string | null
          token_fallback?: boolean
          sealed?: boolean
          sealed_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
