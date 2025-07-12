// CreatorNickname Component v2.2.0 - シンプル版
// 暗号化ニックネームの詩的表示 - "Fragment Weaver #A7B2" スタイル

import React from 'react'
import { Fragment, POETIC_TITLES } from '@/types/fragment'

/**
 * 👤 CreatorNickname Props Interface
 */
export interface CreatorNicknameProps {
  // Content Props
  nickname?: string                // 完全なニックネーム (Fragment Weaver #A7B2)
  creatorHash?: string            // ハッシュのみ (A7B2)
  title?: string                  // タイトルのみ (Fragment Weaver)
  
  // Visual Options
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'full' | 'title-only' | 'hash-only' | 'minimal'
  showIcon?: boolean              // 創作者アイコン表示
  showHashSymbol?: boolean        // # 記号表示
  
  // Style Options
  color?: 'default' | 'muted' | 'accent' | 'gold'
  weight?: 'light' | 'normal' | 'medium'
  
  // Interactive Options
  clickable?: boolean             // クリック可能（創作者ページへ）
  
  // Event Handlers
  onClick?: (creatorHash: string) => void
  
  // Style Overrides
  className?: string
}

/**
 * 🎨 Size Styles - 既存デザインシステム統合
 */
const sizeStyles = {
  xs: {
    container: 'text-xs',
    icon: 'w-3 h-3',
    spacing: 'gap-1',
  },
  sm: {
    container: 'text-sm',
    icon: 'w-3.5 h-3.5',
    spacing: 'gap-1.5',
  },
  md: {
    container: 'text-base',
    icon: 'w-4 h-4',
    spacing: 'gap-2',
  },
  lg: {
    container: 'text-lg',
    icon: 'w-5 h-5',
    spacing: 'gap-2.5',
  },
} as const

/**
 * 🌈 Color Variations
 */
const colorStyles = {
  default: 'text-[#6a6a6a]',
  muted: 'text-[#6a6a6a]/60',
  accent: 'text-[#3a3a3a]',
  gold: 'text-[#d4af37]',
} as const

/**
 * ⚖️ Weight Variations
 */
const weightStyles = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
} as const

/**
 * 🎭 Creator Icon Component
 */
function CreatorIcon({ size = 'sm', className = '' }: { 
  size?: keyof typeof sizeStyles
  className?: string 
}) {
  const iconSize = sizeStyles[size].icon
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      className={`${iconSize} ${className}`}
    >
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  )
}

/**
 * ✨ CreatorNickname Component
 */
export default function CreatorNickname({
  nickname,
  creatorHash,
  title,
  size = 'sm',
  variant = 'full',
  showIcon = false,
  showHashSymbol = true,
  color = 'default',
  weight = 'normal',
  clickable = false,
  onClick,
  className = '',
}: CreatorNicknameProps) {
  
  // 🎯 Data Processing
  const parsedData = parseNicknameData(nickname, creatorHash, title)
  if (!parsedData) return null
  
  const { titlePart, hashPart, fullHash } = parsedData
  
  // 🎨 Style Computation
  const sizeStyle = sizeStyles[size]
  const colorClass = colorStyles[color]
  const weightClass = weightStyles[weight]
  
  // 📝 Content Rendering by Variant
  const renderContent = () => {
    switch (variant) {
      case 'title-only':
        return <span className="tracking-wide">{titlePart}</span>
        
      case 'hash-only':
        return (
          <span className="font-mono tracking-wider">
            {showHashSymbol && '#'}{hashPart}
          </span>
        )
        
      case 'minimal':
        return (
          <span className="font-mono tracking-wider opacity-75">
            {hashPart}
          </span>
        )
        
      case 'full':
      default:
        return (
          <>
            <span className="tracking-wide">{titlePart}</span>
            <span className="font-mono tracking-wider opacity-75">
              {showHashSymbol && '#'}{hashPart}
            </span>
          </>
        )
    }
  }
  
  // 🎭 Interactive Handlers
  const handleClick = () => {
    if (clickable && onClick && fullHash) {
      onClick(fullHash)
    }
  }
  
  // 🎨 Container Classes
  const containerClasses = [
    'inline-flex items-center select-none',
    sizeStyle.container,
    sizeStyle.spacing,
    colorClass,
    weightClass,
    clickable && 'cursor-pointer',
    clickable && 'hover:text-[#d4af37] active:text-[#d4af37]/80',
    'transition-colors duration-200 ease-out',
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={nickname || `Creator ${titlePart} ${hashPart}`}
    >
      {/* Creator Icon */}
      {showIcon && (
        <CreatorIcon size={size} className="opacity-60" />
      )}
      
      {/* Nickname Content */}
      {renderContent()}
    </div>
  )
}

/**
 * 🎯 Specialized Variants - 特定用途向けコンポーネント
 */

// Fragment用創作者表示（FragmentCardに統合予定）
export function FragmentCreator({ 
  fragment,
  size = 'sm',
  showIcon = false,
  className = '' 
}: {
  fragment: Fragment
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}) {
  return (
    <CreatorNickname
      nickname={fragment.creator_nickname}
      creatorHash={fragment.creator_hash}
      size={size}
      variant="full"
      showIcon={showIcon}
      color="muted"
      weight="light"
      className={className}
    />
  )
}

// ギャラリーヘッダー用（創作者ページ等）
export function CreatorPageHeader({
  nickname,
  creatorHash,
  fragmentCount,
  className = ''
}: {
  nickname?: string
  creatorHash?: string
  fragmentCount?: number
  className?: string
}) {
  return (
    <div className={`text-center space-y-3 ${className}`}>
      <CreatorNickname
        nickname={nickname}
        creatorHash={creatorHash}
        size="lg"
        variant="full"
        showIcon={true}
        color="accent"
        weight="medium"
      />
      {fragmentCount !== undefined && (
        <p className="text-sm text-[#6a6a6a] font-light">
          {fragmentCount} の構造を残しました
        </p>
      )}
    </div>
  )
}

/**
 * 🔧 Utility Functions
 */

// ニックネームデータのパース
function parseNicknameData(
  nickname?: string,
  creatorHash?: string,
  title?: string
): {
  titlePart: string
  hashPart: string
  fullHash: string
} | null {
  
  // 完全なニックネームがある場合
  if (nickname) {
    const match = nickname.match(/^(.+?)\s*#(.+)$/)
    if (match) {
      return {
        titlePart: match[1].trim(),
        hashPart: match[2].trim(),
        fullHash: creatorHash || match[2].trim()
      }
    }
    // ニックネームにハッシュが含まれていない場合
    return {
      titlePart: nickname,
      hashPart: creatorHash?.slice(-4) || '????',
      fullHash: creatorHash || ''
    }
  }
  
  // タイトルとハッシュが別々にある場合
  if (title && creatorHash) {
    return {
      titlePart: title,
      hashPart: creatorHash.slice(-4), // 最後の4文字
      fullHash: creatorHash
    }
  }
  
  // ハッシュのみの場合
  if (creatorHash) {
    const randomTitle = getRandomPoeticTitle(creatorHash)
    return {
      titlePart: randomTitle,
      hashPart: creatorHash.slice(-4),
      fullHash: creatorHash
    }
  }
  
  return null
}

// ハッシュベースでランダムな詩的タイトルを選択
function getRandomPoeticTitle(hash: string): string {
  if (!hash) return 'Anonymous Creator'
  
  // ハッシュから数値を生成してタイトルを選択
  const hashNumber = hash.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  const titleIndex = hashNumber % POETIC_TITLES.length
  return POETIC_TITLES[titleIndex]
}

// 新しいニックネームを生成（投稿時使用）
export function generateCreatorNickname(userHash: string): string {
  if (!userHash) return 'Anonymous Creator #0000'
  
  const title = getRandomPoeticTitle(userHash)
  const suffix = userHash.slice(-4).toUpperCase()
  
  return `${title} #${suffix}`
}

// ニックネームからハッシュを抽出
export function extractHashFromNickname(nickname: string): string | null {
  const match = nickname.match(/#([A-Z0-9]+)$/)
  return match ? match[1] : null
}

// 創作者の匿名性チェック
export function isAnonymousCreator(nickname?: string, hash?: string): boolean {
  if (!nickname && !hash) return true
  if (nickname?.includes('Anonymous')) return true
  if (hash === 'legacy_user') return true
  return false
}