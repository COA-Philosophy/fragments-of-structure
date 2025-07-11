'use client'

import { useState, useRef } from 'react'

interface ResonanceButtonProps {
  fragmentId: string
  hasResonated?: boolean
  onResonate?: () => void
}

export default function ResonanceButton({ 
  fragmentId, 
  hasResonated = false,
  onResonate
}: ResonanceButtonProps) {
  const [isResonated, setIsResonated] = useState(hasResonated)
  const [isAnimating, setIsAnimating] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleResonance = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isResonated || isAnimating) return

    setIsAnimating(true)
    setIsResonated(true)

    // SVGアニメーションをトリガー
    const svgElement = svgRef.current
    if (svgElement) {
      const pathElement = svgElement.querySelector('.heart-path') as SVGPathElement
      if (pathElement) {
        pathElement.style.strokeDashoffset = '400'
        pathElement.style.animation = 'none'
        void pathElement.getBoundingClientRect()
        pathElement.style.animation = 'draw 1.5s ease-out forwards'
      }
    }

    // APIコール
    try {
      const response = await fetch(`/api/fragments/${fragmentId}/resonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to resonate')
      }

      if (onResonate) {
        onResonate()
      }
    } catch (error) {
      console.error('Resonance failed:', error)
      setIsResonated(false)
    }

    setTimeout(() => setIsAnimating(false), 1500)
  }

  return (
    <button
      onClick={handleResonance}
      disabled={isResonated || isAnimating}
      className={`
        group relative transition-all duration-300
        ${isResonated ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
      `}
      aria-label={isResonated ? '共鳴済み' : '共鳴する'}
    >
      {/* 完全統一されたハートアイコン */}
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
                  transition: stroke 0.3s ease;
                  filter: ${isResonated ? 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.4))' : 'none'};
                }
                
                @keyframes draw {
                  0% { 
                    stroke-dashoffset: 400;
                    stroke: #6a6a6a;
                    filter: none;
                  }
                  50% {
                    stroke: #e0c870;
                    filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.3));
                  }
                  100% { 
                    stroke-dashoffset: 0;
                    stroke: #d4af37;
                    filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.5));
                  }
                }
              `}
            </style>
          </defs>
          
          {/* 新しい統一ハートパス - 90-210の正方形領域内 */}
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

        {/* ふわっとした光のエフェクト */}
        {isAnimating && (
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full rounded-full bg-amber-200 opacity-20"></div>
          </div>
        )}
      </div>

      {/* ツールチップ削除（この部分を完全削除） */}
    </button>
  )
}