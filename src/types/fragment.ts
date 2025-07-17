// Enhanced Fragment Types v2.2.1 - サンプルデータ完全対応版
// 既存構造を尊重しつつ、サンプルデータの全プロパティを型安全にサポート

// 🆕 詩的カテゴリ型（要件定義書v2.2.0準拠）
export type PoeticCategory = 
  | 'canvas'      // 🌸 Canvas の庭
  | 'interactive' // 🌊 Interactive の海  
  | 'html'        // 🏛️ HTML の神殿
  | 'webgl'       // 🎵 WebGL の宇宙
  | 'hybrid'      // ✨ Hybrid の森
  | 'css'         // 🌙 Pure CSS の月

// 🔄 既存FragmentTypeとの互換性保持
export type FragmentType = 'canvas' | 'three' | 'glsl' | 'svg' | 'css'

// 🆕 言語型
export type Language = 'en' | 'ja'

// 🆕 表示方法型（サンプルデータ対応）
export type DisplayMethod = 'react-canvas' | 'react-svg' | 'iframe' | 'component'

// 🆕 アート種別型（サンプルデータ対応）
export type ArtType = 
  | 'particle-system' 
  | 'css-animation' 
  | 'svg-graphic' 
  | 'mathematical' 
  | 'minimal' 
  | 'generative'

// 🆕 セキュリティレベル型
export type SecurityLevel = 0 | 1 | 2 | 3

// 🆕 パラメータ設定型
export interface ParamConfig {
  type: 'number' | 'color' | 'string' | 'boolean'
  label: string
  default: any
  min?: number
  max?: number
  step?: number
}

export interface ParamsConfig {
  [key: string]: ParamConfig
}

// 🆕 バイリンガルコンテンツ
export interface BilingualContent {
  title_primary: string          // メイン言語タイトル
  title_secondary?: string       // 副言語タイトル
  description_primary?: string   // メイン言語説明
  description_secondary?: string // 副言語説明
  primary_language: Language     // 主言語
}

// 🆕 創作者アイデンティティ
export interface CreatorIdentity {
  creator_hash: string           // 統一ハッシュ
  creator_nickname?: string      // Fragment Weaver #A7B2
}

// 🔄 Fragment型（完全型安全版 - サンプルデータ全プロパティ対応）
export interface Fragment {
  // ====== 既存コアフィールド（変更なし） ======
  id: string
  display_number: number
  title: string                  // 既存互換性のため維持
  code: string
  prompt?: string
  description?: string           // 既存互換性のため維持
  thumbnail_url?: string
  password_hash: string
  type: FragmentType
  is_published: boolean
  forked_from?: string
  has_params: boolean
  params_config?: ParamsConfig
  created_at: string
  updated_at: string
  
  // ====== サンプルデータ対応フィールド ======
  display_method?: DisplayMethod  // 'react-canvas' | 'react-svg' など
  security_level?: SecurityLevel  // 0, 1, 2, 3
  art_type?: ArtType             // 'particle-system' | 'css-animation' など
  fork_count?: number            // フォーク数
  resonance_count?: number       // 共鳴数
  whisper_count?: number         // ささやき数
  view_count?: number            // 閲覧数
  
  // ====== バイリンガルフィールド（将来拡張用） ======
  title_primary?: string
  title_secondary?: string
  description_primary?: string
  description_secondary?: string
  primary_language?: Language
  
  // ====== 創作者・カテゴリフィールド（将来拡張用） ======
  creator_hash?: string
  creator_nickname?: string
  category?: PoeticCategory
}

// 🆕 統計付きFragment（後方互換性維持）
export interface FragmentWithStats extends Fragment {
  resonance_count: number        // 必須（Fragment型では任意）
  whisper_count: number          // 必須（Fragment型では任意）
  user_has_resonated?: boolean   // ユーザーの共鳴状態
}

// 🔄 ギャラリー表示用の軽量Fragment型（サンプルデータ対応）
export interface FragmentSummary {
  id: string
  display_number: number
  title: string
  thumbnail_url?: string
  display_method?: DisplayMethod  // サンプルデータ対応
  art_type?: ArtType             // サンプルデータ対応
  resonance_count: number
  whisper_count: number
  created_at: string
}

// 🆕 投稿フォーム用型
export interface CreateFragmentRequest {
  // バイリンガルコンテンツ
  title_primary: string
  title_secondary?: string
  description_primary?: string
  description_secondary?: string
  primary_language: Language
  
  // 既存フィールド
  code: string
  prompt?: string
  password: string               // ハッシュ化前
  thumbnail_url?: string
  
  // 既存互換性フィールド
  title: string                  // title_primaryのエイリアス
  description?: string           // description_primaryのエイリアス
  type?: FragmentType           // 自動判定可能なため任意
}

// 既存型は維持（既存コードとの互換性）
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

// 🆕 詩的肩書きパターン
export const POETIC_TITLES = [
  'Fragment Weaver',    // 断片の織り手
  'Canvas Poet',        // キャンバスの詩人
  'Structure Dreamer',  // 構造の夢想家
  'Code Painter',       // コードの画家
  'Digital Sculptor',   // デジタルの彫刻家
  'Pixel Composer',     // ピクセルの作曲家
  'Algorithm Artist',   // アルゴリズムの芸術家
  'Interactive Sage',   // インタラクティブの賢者
  'Visual Poet',        // 視覚の詩人
  'Creative Coder'      // クリエイティブコーダー
] as const

// 🆕 カテゴリマスターデータ
export const CATEGORY_DATA: Record<PoeticCategory, {
  category: PoeticCategory
  name_en: string
  name_ja: string
  icon: string
}> = {
  canvas: {
    category: 'canvas',
    name_en: 'Canvas Garden',
    name_ja: 'Canvas の庭',
    icon: '🌸'
  },
  interactive: {
    category: 'interactive', 
    name_en: 'Interactive Ocean',
    name_ja: 'Interactive の海',
    icon: '🌊'
  },
  html: {
    category: 'html',
    name_en: 'HTML Temple', 
    name_ja: 'HTML の神殿',
    icon: '🏛️'
  },
  webgl: {
    category: 'webgl',
    name_en: 'WebGL Universe',
    name_ja: 'WebGL の宇宙', 
    icon: '🎵'
  },
  hybrid: {
    category: 'hybrid',
    name_en: 'Hybrid Forest',
    name_ja: 'Hybrid の森',
    icon: '✨'
  },
  css: {
    category: 'css',
    name_en: 'Pure CSS Moon',
    name_ja: 'Pure CSS の月',
    icon: '🌙'
  }
}

// 🎯 ヘルパー関数
export const getFragmentTitle = (fragment: Fragment): string => {
  return fragment.title_primary || fragment.title || 'Untitled'
}

export const getFragmentDescription = (fragment: Fragment): string | undefined => {
  return fragment.description_primary || fragment.description
}

export const getCategoryInfo = (category?: PoeticCategory) => {
  if (!category) return CATEGORY_DATA.canvas
  return CATEGORY_DATA[category] || CATEGORY_DATA.canvas
}