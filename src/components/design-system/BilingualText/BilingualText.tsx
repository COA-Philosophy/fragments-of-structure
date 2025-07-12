// BilingualText Component v2.2.0 - シンプル版
// 英日対訳の美しい階層表示（アニメーション無効化でエラー回避）

import React from 'react'
import { Fragment, Language } from '@/types/fragment'

/**
 * 🌍 BilingualText Props Interface
 */
export interface BilingualTextProps {
  // Content Props
  primary: string                    // メイン言語テキスト（必須）
  secondary?: string                 // 副言語テキスト（任意）
  primaryLang?: Language            // プライマリ言語 ('en' | 'ja')
  
  // Style Variants
  variant?: 'title' | 'subtitle' | 'description' | 'caption'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  // Layout Options
  layout?: 'stacked' | 'inline'
  alignment?: 'left' | 'center' | 'right'
  
  // Visual Options
  showDivider?: boolean             // 言語間の区切り線
  
  // Style Overrides
  className?: string
  primaryClassName?: string
  secondaryClassName?: string
}

/**
 * 🎯 Variant Style Definitions - 既存デザインシステム統合
 */
const variantStyles = {
  title: {
    primary: 'text-lg font-light text-[#1c1c1c] leading-snug',
    secondary: 'text-base font-light text-[#6a6a6a] leading-relaxed',
    spacing: 'space-y-1',
  },
  subtitle: {
    primary: 'text-base font-light text-[#1c1c1c] leading-snug',
    secondary: 'text-sm font-light text-[#6a6a6a] leading-relaxed',
    spacing: 'space-y-0.5',
  },
  description: {
    primary: 'text-sm text-[#6a6a6a] leading-relaxed',
    secondary: 'text-xs text-[#6a6a6a]/80 leading-relaxed',
    spacing: 'space-y-1',
  },
  caption: {
    primary: 'text-xs text-[#6a6a6a]/60 leading-relaxed',
    secondary: 'text-xs text-[#6a6a6a]/40 leading-relaxed',
    spacing: 'space-y-0.5',
  },
} as const

/**
 * 📏 Size Modifiers
 */
const sizeModifiers = {
  sm: 'scale-90',
  md: 'scale-100',
  lg: 'scale-110', 
  xl: 'scale-125',
} as const

/**
 * 🎨 Font Family Selection - Language-aware
 */
const getFontFamily = (language: Language = 'en') => {
  return language === 'ja' 
    ? 'font-serif' // Yu Mincho系
    : 'font-sans'  // Satoshi系
}

/**
 * ✨ BilingualText Component - シンプル版
 */
export default function BilingualText({
  primary,
  secondary,
  primaryLang = 'en',
  variant = 'title',
  size = 'md',
  layout = 'stacked',
  alignment = 'left',
  showDivider = false,
  className = '',
  primaryClassName = '',
  secondaryClassName = '',
}: BilingualTextProps) {
  
  // 🎯 Style Computation
  const styles = variantStyles[variant]
  const sizeClass = sizeModifiers[size]
  const alignmentClass = alignment === 'center' ? 'text-center' : 
                        alignment === 'right' ? 'text-right' : 'text-left'

  // 🌟 Stacked Layout (Default - 最も美しい)
  if (layout === 'stacked') {
    return (
      <div className={`${styles.spacing} ${alignmentClass} ${sizeClass} ${className}`}>
        {/* Primary Text */}
        <div className={`${styles.primary} ${getFontFamily(primaryLang)} ${primaryClassName}`}>
          {primary}
        </div>

        {/* Divider (Optional) */}
        {showDivider && secondary && (
          <div className="w-8 h-px bg-[#6a6a6a]/20 mx-auto" />
        )}

        {/* Secondary Text */}
        {secondary && (
          <div className={`${styles.secondary} ${getFontFamily(primaryLang === 'en' ? 'ja' : 'en')} ${secondaryClassName}`}>
            {secondary}
          </div>
        )}
      </div>
    )
  }

  // 🔗 Inline Layout
  if (layout === 'inline') {
    return (
      <div className={`${alignmentClass} ${sizeClass} ${className}`}>
        <span className={`${styles.primary} ${getFontFamily(primaryLang)} ${primaryClassName}`}>
          {primary}
        </span>
        {secondary && (
          <>
            <span className="mx-2 text-[#6a6a6a]/40">·</span>
            <span className={`${styles.secondary} ${getFontFamily(primaryLang === 'en' ? 'ja' : 'en')} ${secondaryClassName}`}>
              {secondary}
            </span>
          </>
        )}
      </div>
    )
  }

  return null
}

/**
 * 🎯 Specialized Variants - 専用コンポーネント
 */

// Fragment Title用（最も使用頻度が高い）
export function FragmentTitle({ 
  fragment, 
  className = '' 
}: { 
  fragment: Fragment
  className?: string
}) {
  const title = fragment.title_primary || fragment.title || 'Untitled'
  const subtitle = fragment.title_secondary
  const primaryLang = fragment.primary_language || 'en'

  return (
    <BilingualText
      primary={title}
      secondary={subtitle}
      primaryLang={primaryLang}
      variant="title"
      className={className}
    />
  )
}

// Fragment Description用
export function FragmentDescription({ 
  fragment, 
  className = '',
  maxLength = 120
}: { 
  fragment: Fragment
  className?: string
  maxLength?: number
}) {
  const description = fragment.description_primary || fragment.description
  const secondaryDescription = fragment.description_secondary
  const primaryLang = fragment.primary_language || 'en'

  if (!description) return null

  // 文字数制限
  const truncatedPrimary = description.length > maxLength 
    ? description.slice(0, maxLength) + '...'
    : description
  
  const truncatedSecondary = secondaryDescription && secondaryDescription.length > maxLength
    ? secondaryDescription.slice(0, maxLength) + '...'
    : secondaryDescription

  return (
    <BilingualText
      primary={truncatedPrimary}
      secondary={truncatedSecondary}
      primaryLang={primaryLang}
      variant="description"
      className={className}
    />
  )
}

// 既存コードとの互換性保証
export function getDisplayTitle(fragment: Fragment): string {
  return fragment.title_primary || fragment.title || 'Untitled'
}

export function getDisplayDescription(fragment: Fragment): string | undefined {
  return fragment.description_primary || fragment.description
}