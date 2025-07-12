// CategoryBadge Component v2.2.0 - シンプル版
// 詩的カテゴリの美しい表示 - 🌸Canvas の庭 スタイル

import React from 'react'
import { PoeticCategory, CATEGORY_DATA, Fragment } from '@/types/fragment'

/**
 * 🏷️ CategoryBadge Props Interface
 */
export interface CategoryBadgeProps {
  // Content Props
  category: PoeticCategory          // カテゴリ（必須）
  language?: 'en' | 'ja' | 'both'  // 表示言語
  
  // Visual Options
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outlined' | 'ghost' | 'minimal'
  showIcon?: boolean               // アイコン表示
  showText?: boolean               // テキスト表示
  
  // Interactive Options
  clickable?: boolean              // クリック可能
  selected?: boolean               // 選択状態（フィルター用）
  disabled?: boolean               // 無効状態
  
  // Event Handlers
  onClick?: (category: PoeticCategory) => void
  
  // Style Overrides  
  className?: string
}

/**
 * 🎨 Size Variations - 既存デザインシステム統合
 */
const sizeStyles = {
  xs: {
    container: 'px-2 py-1 text-xs rounded-lg',
    icon: 'text-xs',
    text: 'text-xs font-light',
    gap: 'gap-1',
  },
  sm: {
    container: 'px-3 py-1.5 text-xs rounded-lg',
    icon: 'text-sm', 
    text: 'text-xs font-light',
    gap: 'gap-1.5',
  },
  md: {
    container: 'px-3 py-2 text-sm rounded-lg',
    icon: 'text-base',
    text: 'text-sm font-medium',
    gap: 'gap-2',
  },
  lg: {
    container: 'px-4 py-2.5 text-base rounded-xl',
    icon: 'text-lg',
    text: 'text-base font-medium',
    gap: 'gap-2.5',
  },
} as const

/**
 * 🌈 Category Color Helpers
 */
function getCategoryBackground(category: PoeticCategory): string {
  const colorMap = {
    canvas: 'bg-pink-50',
    interactive: 'bg-sky-50', 
    html: 'bg-purple-50',
    webgl: 'bg-amber-50',
    hybrid: 'bg-emerald-50',
    css: 'bg-gray-50',
  }
  return colorMap[category] || colorMap.canvas
}

function getCategoryTextColor(category: PoeticCategory): string {
  const colorMap = {
    canvas: 'text-pink-600',
    interactive: 'text-sky-600',
    html: 'text-purple-600', 
    webgl: 'text-amber-600',
    hybrid: 'text-emerald-600',
    css: 'text-gray-600',
  }
  return colorMap[category] || colorMap.canvas
}

/**
 * 🎯 Variant Styles - 多様な表現バリエーション
 */
const getVariantStyles = (variant: string, category: PoeticCategory) => {
  switch (variant) {
    case 'solid':
      return {
        container: `border border-transparent ${getCategoryBackground(category)}`,
        text: getCategoryTextColor(category),
      }
    case 'outlined':
      return {
        container: `border border-current bg-transparent`,
        text: getCategoryTextColor(category),
      }
    case 'ghost':
      return {
        container: `border border-transparent hover:${getCategoryBackground(category)} bg-transparent`,
        text: getCategoryTextColor(category),
      }
    case 'minimal':
      return {
        container: 'border-none bg-transparent',
        text: getCategoryTextColor(category),
      }
    default:
      return {
        container: `border border-transparent ${getCategoryBackground(category)}`,
        text: getCategoryTextColor(category),
      }
  }
}

/**
 * ✨ CategoryBadge Component
 */
export default function CategoryBadge({
  category,
  language = 'ja', // 日本語をデフォルト（詩的表現）
  size = 'md',
  variant = 'solid',
  showIcon = true,
  showText = true,
  clickable = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
}: CategoryBadgeProps) {
  
  // 🎯 Category Data Retrieval
  const categoryData = CATEGORY_DATA[category]
  if (!categoryData) {
    console.warn(`Unknown category: ${category}`)
    return null
  }

  // 🎨 Style Computation
  const sizeStyle = sizeStyles[size]
  const variantStyle = getVariantStyles(variant, category)
  
  // 📝 Text Content Selection
  const getText = () => {
    if (!showText) return ''
    
    if (language === 'both') {
      return `${categoryData.name_en} / ${categoryData.name_ja}`
    }
    return language === 'en' ? categoryData.name_en : categoryData.name_ja
  }

  // 🎯 Interactive Handlers
  const handleClick = () => {
    if (clickable && !disabled && onClick) {
      onClick(category)
    }
  }

  // 🎨 Dynamic Classes
  const containerClasses = [
    // Base Styles
    'inline-flex items-center justify-center',
    sizeStyle.container,
    sizeStyle.gap,
    variantStyle.container,
    variantStyle.text,
    
    // Interactive States
    clickable && !disabled && 'cursor-pointer select-none',
    disabled && 'opacity-50 cursor-not-allowed',
    selected && 'ring-2 ring-current ring-opacity-20',
    
    // Transitions
    'transition-all duration-200 ease-out',
    
    // Custom Classes
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-label={`Category: ${getText()}`}
    >
      {/* Category Icon */}
      {showIcon && (
        <span className={`${sizeStyle.icon} select-none`} aria-hidden="true">
          {categoryData.icon}
        </span>
      )}
      
      {/* Category Text */}
      {showText && (
        <span className={`${sizeStyle.text} select-none tracking-wide`}>
          {getText()}
        </span>
      )}
    </div>
  )
}

/**
 * 🎯 Specialized Variants - 特定用途向けコンポーネント
 */

// Fragment用カテゴリバッジ（既存FragmentCardに統合予定）
export function FragmentCategoryBadge({ 
  fragment,
  size = 'sm',
  className = '' 
}: {
  fragment: Fragment
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const category = fragment.category || 'canvas'
  
  return (
    <CategoryBadge
      category={category}
      size={size}
      variant="solid"
      showIcon={true}
      showText={true}
      className={className}
    />
  )
}

// フィルター用カテゴリバッジ（クリック可能）
export function FilterCategoryBadge({
  category,
  selected = false,
  onSelect,
  size = 'md',
  className = ''
}: {
  category: PoeticCategory
  selected?: boolean
  onSelect?: (category: PoeticCategory) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <CategoryBadge
      category={category}
      size={size}
      variant={selected ? 'solid' : 'outlined'}
      clickable={true}
      selected={selected}
      onClick={onSelect}
      className={className}
    />
  )
}

/**
 * 🔧 Utility Functions
 */

// Fragmentからカテゴリを自動判定（既存システム統合）
export function detectFragmentCategory(code: string): PoeticCategory {
  const codeUpperCase = code.toUpperCase()
  
  // WebGL/Three.js 判定
  if (codeUpperCase.includes('THREE') || 
      codeUpperCase.includes('WEBGL') || 
      codeUpperCase.includes('GL_')) {
    return 'webgl'
  }
  
  // Interactive 判定
  if (codeUpperCase.includes('ADDEVENTLISTENER') || 
      codeUpperCase.includes('ONCLICK') || 
      codeUpperCase.includes('MOUSEMOVE') ||
      codeUpperCase.includes('KEYDOWN')) {
    return 'interactive'
  }
  
  // Canvas 判定
  if (codeUpperCase.includes('CANVAS') || 
      codeUpperCase.includes('GETCONTEXT') || 
      codeUpperCase.includes('2D') ||
      codeUpperCase.includes('P5')) {
    return 'canvas'
  }
  
  // Pure CSS 判定
  if (codeUpperCase.includes('@KEYFRAMES') || 
      codeUpperCase.includes('ANIMATION:') ||
      (codeUpperCase.includes('TRANSFORM') && !codeUpperCase.includes('<SCRIPT'))) {
    return 'css'
  }
  
  // HTML DOM 判定
  if (codeUpperCase.includes('GETELEMENTBYID') || 
      codeUpperCase.includes('QUERYSELECTOR') ||
      codeUpperCase.includes('INNERHTML')) {
    return 'html'
  }
  
  // 複数技術の組み合わせ判定
  const techCount = [
    codeUpperCase.includes('CANVAS'),
    codeUpperCase.includes('ADDEVENTLISTENER'),
    codeUpperCase.includes('THREE'),
    codeUpperCase.includes('@KEYFRAMES')
  ].filter(Boolean).length
  
  if (techCount >= 2) {
    return 'hybrid'
  }
  
  // デフォルトはCanvas
  return 'canvas'
}

// 全カテゴリ一覧取得
export function getAllCategories(): PoeticCategory[] {
  return Object.keys(CATEGORY_DATA) as PoeticCategory[]
}

// カテゴリ情報取得
export function getCategoryInfo(category: PoeticCategory) {
  return CATEGORY_DATA[category] || CATEGORY_DATA.canvas
}