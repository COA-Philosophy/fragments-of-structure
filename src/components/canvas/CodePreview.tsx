'use client'

import React, { useEffect, useRef, useState } from 'react'
import { executeCanvasCode, analyzeCodeType } from '@/utils/codeExecutor'

interface CodePreviewProps {
  code: string
  fragmentId: string
  className?: string  // オプショナルで追加
}

export default function CodePreview({ code, fragmentId, className = '' }: CodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [codeType, setCodeType] = useState<string>('canvas')

  useEffect(() => {
    if (!code || !canvasRef.current) return

    // エラーをクリア
    setError(null)

    // コードタイプを判定
    const type = analyzeCodeType(code)
    setCodeType(type)

    // Canvas以外はまだサポートしていない
    if (type !== 'canvas') {
      setError(`${type}タイプは準備中です`)
      return
    }

    // Canvasコードを実行
    const result = executeCanvasCode(code, canvasRef.current)
    
    if (!result.success) {
      setError(result.error || '実行エラー')
    }

    // クリーンアップ
    return () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }
  }, [code])

  return (
    <div className={`relative w-full h-full bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {/* Canvas要素 */}
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full object-contain"
        style={{ display: error ? 'none' : 'block' }}
      />
      
      {/* エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">⚠️</div>
            <div className="text-xs text-gray-600">{error}</div>
          </div>
        </div>
      )}
      
      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-1 right-1 text-xs text-gray-400 bg-white/70 px-1 rounded">
          {codeType} #{fragmentId}
        </div>
      )}
    </div>
  )
}