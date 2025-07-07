export type FragmentType = 'canvas' | 'three' | 'glsl' | 'svg' | 'css'

export interface Fragment {
  id: string
  display_number: number
  title: string
  code: string
  prompt?: string
  description?: string
  thumbnail_url?: string
  type: FragmentType
  is_published: boolean
  created_at: string
  updated_at: string
}