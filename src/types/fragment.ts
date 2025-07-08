export type FragmentType = 'canvas' | 'three' | 'glsl' | 'svg' | 'css'

export interface Fragment {
  id: string
  display_number: number
  title: string
  code: string
  prompt?: string
  description?: string
  thumbnail_url?: string
  password_hash: string
  type: FragmentType
  is_published: boolean
  forked_from?: string
  has_params: boolean
  params_config?: any
  created_at: string
  updated_at: string
}

export interface FragmentWithStats extends Fragment {
  resonance_count: number
  whisper_count: number
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