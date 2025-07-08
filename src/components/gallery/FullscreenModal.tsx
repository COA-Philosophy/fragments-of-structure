'use client'

import { useEffect, useRef } from 'react'
import CodePreview from '../canvas/CodePreview'
import { Fragment } from '@/types/fragment'

interface FullscreenModalProps {
  fragment: Fragment
  isOpen: boolean
  onClose: () => void
}

export default function FullscreenModal({ fragment, isOpen, onClose }: FullscreenModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      onClick={onClose}
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
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10">
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

      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-20 drop-shadow-lg"
        aria-label="閉じる"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 操作説明 */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-white/50 text-sm drop-shadow">
          ESCキーまたはクリックで閉じる
        </p>
      </div>
    </div>
  )
}