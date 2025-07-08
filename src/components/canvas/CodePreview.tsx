'use client'

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { executeCanvasCode, analyzeCodeType } from '@/utils/codeExecutor'

interface CodePreviewProps {
  code: string
  fragmentId?: string  // オプショナルに変更（?を追加）
  className?: string
  isFullscreen?: boolean  // フルスクリーンかどうか
}

export default function CodePreview({ code, fragmentId = 'preview', className = '', isFullscreen = false }: CodePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [codeType, setCodeType] = useState<string>('canvas')

  // Canvas描画処理
  useLayoutEffect(() => {
    if (!code || !containerRef.current) return

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

    // 既存のcanvasをクリア（クリーンアップ関数があれば実行）
    if (canvasRef.current && (canvasRef.current as any).__cleanup) {
      (canvasRef.current as any).__cleanup()
    }
    containerRef.current.innerHTML = ''

    // 新しいcanvas要素を作成
    const canvas = document.createElement('canvas')
    canvasRef.current = canvas
    
    // Canvas用のIDを生成
    const canvasId = isFullscreen ? `canvas-fullscreen-${fragmentId}` : `canvas-preview-${fragmentId}`
    
    // 元のcanvasサイズを解析
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    const sourceCanvas = doc.querySelector('canvas')
    
    let originalWidth = 300
    let originalHeight = 300
    
    if (sourceCanvas) {
      const width = sourceCanvas.getAttribute('width')
      const height = sourceCanvas.getAttribute('height')
      if (width) originalWidth = parseInt(width)
      if (height) originalHeight = parseInt(height)
    }
    
    // アスペクト比を計算
    const aspectRatio = originalWidth / originalHeight
    
    // サイズ設定
    if (isFullscreen) {
      // フルスクリーンの場合 - 画面全体を使用
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Canvasを画面サイズで作成
      canvas.width = screenWidth
      canvas.height = screenHeight
      
      // スタイル設定
      canvas.style.width = screenWidth + 'px'
      canvas.style.height = screenHeight + 'px'
      canvas.style.display = 'block'
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.zIndex = '9999'
      canvas.style.backgroundColor = 'black'  // 背景を黒に
      
      console.log('Fullscreen canvas set to:', screenWidth, 'x', screenHeight)
    } else {
      // 通常表示（元のサイズを維持、ただし最大300px）
      if (originalWidth > 300 || originalHeight > 300) {
        const scale = Math.min(300 / originalWidth, 300 / originalHeight)
        canvas.width = Math.floor(originalWidth * scale)
        canvas.height = Math.floor(originalHeight * scale)
      } else {
        canvas.width = originalWidth
        canvas.height = originalHeight
      }
      
      // スタイル設定
      canvas.style.display = 'block'
      canvas.style.margin = '0 auto'
      canvas.style.maxWidth = '100%'
      canvas.style.height = 'auto'
    }
    
    // Canvasを適切な場所に追加
    if (isFullscreen) {
      // フルスクリーン時はbodyに直接追加
      document.body.appendChild(canvas)
    } else {
      // 通常時はコンテナに追加
      containerRef.current.appendChild(canvas)
    }

    // 少し遅延を入れてからコードを実行（DOMが確実に準備されるように）
    const timeoutId = setTimeout(() => {
      // Canvasコードを実行（canvasIdを渡す）
      const result = executeCanvasCode(code, canvas, canvasId)
      
      if (!result.success) {
        setError(result.error || '実行エラー')
      }
    }, 50)

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId)
      
      // アニメーションやタイマーをクリア
      if (canvasRef.current && (canvasRef.current as any).__cleanup) {
        (canvasRef.current as any).__cleanup()
      }
      
      // Canvasを親要素から削除（bodyまたはcontainer）
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current)
      }
      
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      
      canvasRef.current = null
    }
  }, [code, isFullscreen, fragmentId])

  return (
    <div 
      className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-full h-full bg-gray-50 rounded-lg'} overflow-hidden ${className}`}
    >
      {/* Canvas コンテナ */}
      <div 
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center ${isFullscreen ? 'relative' : ''}`}
        style={{ 
          ...(isFullscreen && { 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent'
          })
        }}
      />
      
      {/* エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="text-center bg-black/50 p-4 rounded">
            <div className="text-sm text-gray-300 mb-1">⚠️</div>
            <div className="text-xs text-gray-400">{error}</div>
          </div>
        </div>
      )}
      
      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && canvasRef.current && (
        <div className="absolute bottom-4 left-4 text-xs text-white bg-black/70 px-2 py-1 rounded pointer-events-none z-50">
          {codeType} #{fragmentId} 
          {isFullscreen 
            ? ` (FS: Canvas ${canvasRef.current.width}x${canvasRef.current.height}, Style: ${canvasRef.current.style.width}x${canvasRef.current.style.height})` 
            : ''}
        </div>
      )}
    </div>
  )
}