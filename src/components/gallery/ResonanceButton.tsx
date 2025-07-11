'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { generateUserIpHash } from '@/lib/hashUtils'

interface ResonanceButtonProps {
  fragmentId: string
  hasResonated?: boolean
  resonanceCount?: number
  onResonate?: (success: boolean) => void
}

export default function ResonanceButton({ 
  fragmentId, 
  hasResonated = false,
  resonanceCount = 0,
  onResonate
}: ResonanceButtonProps) {
  // 🎯 状態管理: Props同期 + ローカルアニメーション
  const [isResonated, setIsResonated] = useState(hasResonated)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // 🔄 Props変化時の状態同期
  useEffect(() => {
    console.log('💖 [Step 3a] ResonanceButton state sync:', {
      fragmentId,
      propsHasResonated: hasResonated,
      currentIsResonated: isResonated,
      resonanceCount,
      willUpdate: isResonated !== hasResonated
    })
    
    setIsResonated(hasResonated)
  }, [hasResonated, fragmentId, isResonated, resonanceCount])

  // 🎨 共鳴アニメーション実行
  const triggerResonanceAnimation = () => {
    const svgElement = svgRef.current
    if (!svgElement) return

    const pathElement = svgElement.querySelector('.heart-path') as SVGPathElement
    if (!pathElement) return

    // SVGアニメーション: 描画エフェクト
    pathElement.style.strokeDashoffset = '400'
    pathElement.style.animation = 'none'
    
    // 強制リフロー
    void pathElement.getBoundingClientRect()
    
    // アニメーション開始
    pathElement.style.animation = 'heart-draw 1.8s ease-out forwards'

    // リップルエフェクト
    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 1000)
  }

  // 🎯 共鳴処理: API + UI更新
  const handleResonance = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 既に共鳴済みまたはアニメーション中は無効
    if (isResonated || isAnimating) {
      console.log('🚫 [Step 3a] Resonance blocked:', { isResonated, isAnimating })
      return
    }

    console.log('🎵 [Step 3a] Starting resonance for fragment:', fragmentId)

    setIsAnimating(true)
    setIsResonated(true) // 楽観的UI更新
    triggerResonanceAnimation()

    try {
      // 🔐 統一ハッシュ生成
      const userHash = generateUserIpHash()
      
      console.log('🔐 [Step 3a] Sending resonance with unified hash:', {
        fragmentId,
        userHash,
        hashLength: userHash.length
      })

      const response = await fetch(`/api/fragments/${fragmentId}/resonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userHash // クライアントで生成した統一ハッシュを送信
        })
      })
      
      const result = await response.json()
      console.log('🎵 [Step 3a] Resonance API response:', { 
        status: response.status, 
        result,
        fragmentId,
        sentHash: userHash
      })

      if (response.ok) {
        // ✅ 成功: 親コンポーネントに通知
        console.log('✅ [Step 3a] Resonance successful with unified hash!')
        if (onResonate) onResonate(true)
      } else if (response.status === 409) {
        // ⚠️ 既に共鳴済み: エラーではない
        console.log('ℹ️ [Step 3a] Already resonated - keeping current state')
        if (onResonate) onResonate(true)
      } else {
        // ❌ その他のエラー: 元に戻す
        console.error('❌ [Step 3a] Resonance failed:', result)
        setIsResonated(false)
        if (onResonate) onResonate(false)
      }
    } catch (error) {
      console.error('❌ [Step 3a] Resonance network error:', error)
      setIsResonated(false)
      if (onResonate) onResonate(false)
    } finally {
      setTimeout(() => setIsAnimating(false), 1800)
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* 🎨 共鳴ボタン: アニメーション + 状態表示 */}
      <motion.button
        onClick={handleResonance}
        disabled={isResonated || isAnimating}
        className={`
          group relative transition-all duration-300 ease-out
          ${isResonated 
            ? 'opacity-100 cursor-default' 
            : 'opacity-60 hover:opacity-100 cursor-pointer hover:scale-110'
          }
        `}
        whileTap={!isResonated ? { scale: 0.95 } : undefined}
        aria-label={isResonated ? '共鳴済み' : '共鳴する'}
      >
        {/* 🎊 リップルエフェクト背景 */}
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 -m-2 rounded-full bg-[#d4af37]/20 pointer-events-none"
          />
        )}

        {/* 🎨 ハートアイコン: 統一デザイン */}
        <div className="relative w-5 h-5">
          <svg 
            ref={svgRef}
            width="20" 
            height="20" 
            viewBox="0 0 300 300" 
            className="absolute inset-0"
          >
            <defs>
              <style>
                {`
                  .heart-path {
                    fill: none;
                    stroke: ${isResonated ? '#d4af37' : '#6a6a6a'};
                    stroke-width: 16;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: 400;
                    stroke-dashoffset: ${isResonated ? '0' : '0'};
                    transition: stroke 0.4s ease-out;
                    filter: ${isResonated 
                      ? 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.4))' 
                      : 'none'
                    };
                  }
                  
                  @keyframes heart-draw {
                    0% { 
                      stroke-dashoffset: 400;
                      stroke: #6a6a6a;
                      filter: none;
                    }
                    30% {
                      stroke: #e0c870;
                      filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.3));
                    }
                    60% {
                      stroke: #d4af37;
                      filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
                    }
                    100% { 
                      stroke-dashoffset: 0;
                      stroke: #d4af37;
                      filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.4));
                    }
                  }
                `}
              </style>
            </defs>
            
            {/* 統一ハートパス */}
            <path 
              className="heart-path" 
              d="M150 190 
                 C150 175, 135 160, 120 160
                 C105 160, 90 175, 90 190
                 C90 205, 105 220, 150 250
                 C195 220, 210 205, 210 190
                 C210 175, 195 160, 180 160
                 C165 160, 150 175, 150 190 Z"
            />
          </svg>

          {/* ✨ アニメーション中の光のエフェクト */}
          {isAnimating && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 -m-1 rounded-full bg-[#d4af37]/20"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="absolute inset-0 rounded-full bg-[#d4af37]/30"
              />
            </>
          )}
        </div>
      </motion.button>

      {/* 📊 共鳴数表示: ミニマル設計 */}
      {resonanceCount > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`
            text-xs font-light tabular-nums transition-colors duration-300
            ${isResonated ? 'text-[#d4af37]' : 'text-[#6a6a6a]'}
          `}
        >
          {resonanceCount}
        </motion.span>
      )}
    </div>
  )
}