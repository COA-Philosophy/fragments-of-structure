import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベースの型定義
export interface Fragment {
  id: string
  title: string
  code: string
  prompt?: string
  description?: string
  thumbnail_url?: string
  password_hash?: string
  forked_from?: string
  has_params?: boolean
  params_config?: any
  created_at: string
  updated_at: string
  display_number?: number
}

export interface Resonance {
  id: string
  fragment_id: string
  ip_hash: string
  created_at: string
}

export interface Whisper {
  id: string
  fragment_id: string
  content: string
  ip_hash: string
  created_at: string
}