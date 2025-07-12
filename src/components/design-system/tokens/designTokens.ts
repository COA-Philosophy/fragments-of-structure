// Design Tokens for Fragments of Structure v2.2.0
// 既存デザインシステムとの完全統合 + バイリンガル・詩的表現対応

/**
 * 🎨 Color Palette - 既存システムから抽出・体系化
 */
export const colors = {
  // Primary Background System
  background: {
    primary: '#f9f8f6',      // メインバックグラウンド
    card: 'rgba(255, 255, 255, 0.8)',  // カード背景
    overlay: 'rgba(255, 255, 255, 0.95)', // オーバーレイ
    accent: '#f9f8f6',       // アクセント背景
  },

  // Text Hierarchy
  text: {
    primary: '#1c1c1c',      // メインテキスト
    secondary: '#6a6a6a',    // セカンダリテキスト
    muted: '#6a6a6a',        // 薄いテキスト
    accent: '#3a3a3a',       // アクセントテキスト
    light: 'rgba(106, 106, 106, 0.6)', // 極薄テキスト
  },

  // Border System
  border: {
    light: 'rgba(58, 58, 58, 0.1)',   // 薄いボーダー
    medium: 'rgba(58, 58, 58, 0.2)',  // 中程度ボーダー
    accent: 'rgba(255, 255, 255, 0.5)', // アクセントボーダー
  },

  // Special Accent
  gold: {
    primary: '#d4af37',      // ゴールドアクセント
    light: 'rgba(212, 175, 55, 0.3)', // 薄いゴールド
  },

  // Category Colors - 詩的カテゴリ用
  category: {
    canvas: {
      bg: 'rgba(255, 182, 193, 0.15)',
      text: '#d63384',
    },
    interactive: {
      bg: 'rgba(91, 192, 235, 0.15)', 
      text: '#0ea5e9',
    },
    html: {
      bg: 'rgba(168, 85, 247, 0.15)',
      text: '#8b5cf6',
    },
    webgl: {
      bg: 'rgba(251, 191, 36, 0.15)',
      text: '#f59e0b',
    },
    hybrid: {
      bg: 'rgba(34, 197, 94, 0.15)',
      text: '#22c55e',
    },
    css: {
      bg: 'rgba(156, 163, 175, 0.15)',
      text: '#6b7280',
    },
  }
} as const

/**
 * 📏 Spacing System - 詩的リズムに基づく余白設計
 */
export const spacing = {
  // Base Spacing (rem)
  xs: '0.375rem',    // 6px - 微細な余白
  sm: '0.75rem',     // 12px - 小さな余白  
  md: '1rem',        // 16px - 標準余白
  lg: '1.5rem',      // 24px - 大きな余白
  xl: '2rem',        // 32px - 特大余白
  xxl: '3rem',       // 48px - 詩的な余白

  // Semantic Spacing
  poetic: '1.5rem',  // 詩的な標準余白
  section: '3rem',   // セクション間余白
  component: '1rem', // コンポーネント内余白
  element: '0.75rem', // 要素間余白
} as const

/**
 * 🔤 Typography System - バイリンガル対応
 */
export const typography = {
  // Font Families
  fontFamily: {
    primary: "'Satoshi', sans-serif",           // 英語メイン
    secondary: "'Yu Mincho', serif",            // 日本語メイン  
    monospace: "'JetBrains Mono', monospace",   // コード用
  },

  // Font Sizes (rem)
  fontSize: {
    xs: '0.75rem',     // 12px - 極小
    sm: '0.875rem',    // 14px - 小
    base: '1rem',      // 16px - 標準
    lg: '1.125rem',    // 18px - 大
    xl: '1.25rem',     // 20px - 特大
    '2xl': '1.5rem',   // 24px - 見出し小
    '3xl': '1.875rem', // 30px - 見出し中
    '4xl': '2.25rem',  // 36px - 見出し大
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400', 
    medium: '500',
    semibold: '600',
  },

  // Line Heights
  lineHeight: {
    tight: '1.2',      // タイトル用
    normal: '1.5',     // 標準テキスト
    relaxed: '1.6',    // 説明文用
    loose: '2',        // 詩的な余白
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

/**
 * 🎭 Animation System - 詩的な動きの定義
 */
export const animation = {
  // Duration (ms)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    elegant: 800,
  },

  // Easing Functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elegant: 'cubic-bezier(0.19, 1, 0.22, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Stagger Delays (ms)
  stagger: {
    fast: 50,
    normal: 80,
    slow: 120,
  },
} as const

/**
 * 📐 Layout System - レスポンシブ・グリッド
 */
export const layout = {
  // Container Max Widths
  container: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    max: '1792px', // 7xl equivalent
  },

  // Grid Gaps
  gap: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px  
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
} as const

/**
 * 🌸 Component-specific Tokens - コンポーネント専用トークン
 */
export const component = {
  // Fragment Card
  fragmentCard: {
    height: '16rem',           // h-64 equivalent
    borderRadius: layout.borderRadius.lg,
    backdropBlur: 'blur(4px)', // backdrop-blur-sm
    hoverTransform: '-translate-y-1',
    hoverShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Bilingual Text
  bilingualText: {
    primaryWeight: typography.fontWeight.medium,
    secondaryWeight: typography.fontWeight.light,
    secondaryOpacity: '0.8',
    verticalSpacing: spacing.xs,
  },

  // Category Badge  
  categoryBadge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: '16px',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Creator Nickname
  creatorNickname: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.wide,
    opacity: '0.9',
  },
} as const

/**
 * 🎯 Utility Functions - トークン活用ヘルパー
 */
export const utils = {
  // カテゴリカラー取得
  getCategoryColors: (category: keyof typeof colors.category) => {
    return colors.category[category] || colors.category.canvas
  },

  // フォント選択（言語に応じて）
  getFontFamily: (language: 'en' | 'ja' = 'en') => {
    return language === 'ja' 
      ? typography.fontFamily.secondary 
      : typography.fontFamily.primary
  },

  // アニメーション遅延計算
  getStaggerDelay: (index: number, baseDelay = 0) => {
    return baseDelay + (index * animation.stagger.normal)
  },
} as const

/**
 * 🎨 CSS Custom Properties - CSS変数への変換
 */
export const cssVariables = {
  ':root': {
    // Colors
    '--color-bg-primary': colors.background.primary,
    '--color-text-primary': colors.text.primary, 
    '--color-text-secondary': colors.text.secondary,
    '--color-gold-primary': colors.gold.primary,

    // Spacing
    '--space-xs': spacing.xs,
    '--space-sm': spacing.sm,
    '--space-md': spacing.md,
    '--space-lg': spacing.lg,
    '--space-xl': spacing.xl,
    '--space-poetic': spacing.poetic,

    // Typography
    '--font-primary': typography.fontFamily.primary,
    '--font-secondary': typography.fontFamily.secondary,
    '--font-size-base': typography.fontSize.base,
    '--line-height-normal': typography.lineHeight.normal,

    // Animation
    '--duration-normal': `${animation.duration.normal}ms`,
    '--easing-smooth': animation.easing.smooth,
    '--easing-elegant': animation.easing.elegant,
  }
} as const

// Export all tokens as default
export default {
  colors,
  spacing, 
  typography,
  animation,
  layout,
  component,
  utils,
  cssVariables,
} as const