// CategoryBadge Component v2.2.0 - クリーン版
// 技術名のみの洗練されたカテゴリ表示

import React from 'react'
import { PoeticCategory, CATEGORY_DATA, Fragment } from '@/types/fragment'

/**
 * 🏷️ CategoryBadge Props Interface
 */
export interface CategoryBadgeProps {
  // Content Props
  category: PoeticCategory          // カテゴリ（必須）
  
  // Visual Options
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outlined' | 'ghost' | 'minimal'
  
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
    container: 'px-2 py-1 text-xs rounded-md',
    text: 'text-xs font-medium tracking-wider',
  },
  sm: {
    container: 'px-3 py-1.5 text-xs rounded-md',
    text: 'text-xs font-medium tracking-wider',
  },
  md: {
    container: 'px-3 py-2 text-sm rounded-lg',
    text: 'text-sm font-medium tracking-wide',
  },
  lg: {
    container: 'px-4 py-2.5 text-base rounded-lg',
    text: 'text-base font-medium tracking-wide',
  },
} as const

/**
 * 🌈 Category Color Helpers - 洗練されたカラーパレット
 */
function getCategoryBackground(category: PoeticCategory): string {
  const colorMap = {
    canvas: 'bg-rose-50',
    interactive: 'bg-sky-50', 
    html: 'bg-purple-50',
    webgl: 'bg-amber-50',
    hybrid: 'bg-emerald-50',
    css: 'bg-slate-50',
  }
  return colorMap[category] || colorMap.canvas
}

function getCategoryTextColor(category: PoeticCategory): string {
  const colorMap = {
    canvas: 'text-rose-700',
    interactive: 'text-sky-700',
    html: 'text-purple-700', 
    webgl: 'text-amber-700',
    hybrid: 'text-emerald-700',
    css: 'text-slate-700',
  }
  return colorMap[category] || colorMap.canvas
}

/**
 * 🔤 Technical Category Names - クリーンで明確
 */
const getTechnicalName = (category: PoeticCategory): string => {
  const nameMap = {
    canvas: 'CANVAS',
    interactive: 'INTERACTIVE',
    html: 'HTML',
    webgl: 'THREE',
    hybrid: 'HYBRID',
    css: 'CSS',
  }
  return nameMap[category] || nameMap.canvas
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
        container: `border border-current bg-white/80`,
        text: getCategoryTextColor(category),
      }
    case 'ghost':
      return {
        container: `border border-transparent hover:${getCategoryBackground(category)} bg-transparent`,
        text: getCategoryTextColor(category),
      }
    case 'minimal':
      return {
        container: 'border-none bg-white/60',
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
  size = 'xs',
  variant = 'solid',
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
  const technicalName = getTechnicalName(category)
  
  // 🎯 Interactive Handlers
  const handleClick = () => {
    if (clickable && !disabled && onClick) {
      onClick(category)
    }
  }

  // 🎨 Dynamic Classes
  const containerClasses = [
    // Base Styles
    'inline-flex items-center justify-center select-none',
    sizeStyle.container,
    sizeStyle.text,
    variantStyle.container,
    variantStyle.text,
    
    // Interactive States
    clickable && !disabled && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    selected && 'ring-1 ring-current ring-opacity-30',
    clickable && 'hover:scale-105 active:scale-95',
    
    // Transitions
    'transition-all duration-200 ease-out',
    'backdrop-blur-sm',
    
    // Custom Classes
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-label={`Category: ${technicalName}`}
      title={`${technicalName} - ${categoryData.name_ja}`} // ホバー時に詩的名称表示
    >
      {/* Category Text - 技術名のみ */}
      <span className="font-mono">
        {technicalName}
      </span>
    </div>
  )
}

/**
 * 🎯 Specialized Variants - 特定用途向けコンポーネント
 */

// Fragment用カテゴリバッジ（既存FragmentCardに統合予定）
export function FragmentCategoryBadge({ 
  fragment,
  size = 'xs',
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
      className={className}
    />
  )
}

// フィルター用カテゴリバッジ（クリック可能）
export function FilterCategoryBadge({
  category,
  selected = false,
  onSelect,
  size = 'sm',
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