'use client'

import { useEffect, useRef } from 'react'
import CodePreview from '../canvas/CodePreview'
import { Fragment } from '@/types/fragment'

interface FullscreenModalProps {
  fragment: Fragment
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export default function FullscreenModal({ 
  fragment, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious, 
  hasPrevious = false, 
  hasNext = false 
}: FullscreenModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      // 左右キーでのナビゲーション
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious()
      }
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // スクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onNext, onPrevious, hasPrevious, hasNext])

  if (!isOpen) return null

  return (
    <>
      {/* 🎯 最優先✕ボタン - 独立DOM */}
      <div 
        className="fixed inset-0 z-50 bg-black"
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        {/* Canvas表示エリア - 画面全体に配置 */}
        <div className="absolute inset-0 w-full h-full">
          <CodePreview 
            code={fragment.code} 
            fragmentId={fragment.id}
            className="w-full h-full"
            isFullscreen={true}
          />
        </div>

        {/* ヘッダー情報（オーバーレイ） */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-[60]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-2xl font-light mb-2 drop-shadow-lg">
                {fragment.title}
              </h2>
              {fragment.description && (
                <p className="text-white/80 text-sm max-w-2xl drop-shadow">
                  {fragment.description}
                </p>
              )}
            </div>
            <div className="text-white/60 text-sm drop-shadow">
              Fragment {String(fragment.display_number).padStart(3, '0')}
            </div>
          </div>
        </div>

        {/* 操作説明 */}
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-[60]">
          <div className="inline-flex items-center gap-4 text-white/40 text-sm drop-shadow">
            <span>ESC で閉じる</span>
            {(hasPrevious || hasNext) && (
              <>
                <span>•</span>
                <span>← → で移動</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 超強力✕ボタン - modalの外側に配置 */}
      {isOpen && (
        <div 
          className="fixed top-6 right-6 pointer-events-none"
          style={{ 
            zIndex: 99999,
            position: 'fixed',
            display: 'block'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="pointer-events-auto"
            style={{
              position: 'relative',
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            aria-label="閉じる"
          >
            <svg 
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 🎯 左右ナビゲーション - modalの外側に配置 */}
      {isOpen && hasPrevious && onPrevious && (
        <div 
          className="fixed left-6 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrevious()
            }}
            className="pointer-events-auto"
            style={{
              position: 'relative',
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-label="前の作品"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {isOpen && hasNext && onNext && (
        <div 
          className="fixed right-6 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="pointer-events-auto"
            style={{
              position: 'relative',
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-label="次の作品"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}