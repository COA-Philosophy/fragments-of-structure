'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ThreePreviewProps {
  code: string
  width?: number
  height?: number
  autoRun?: boolean
  showControls?: boolean
  className?: string
  onError?: (error: Error) => void
  onSuccess?: () => void
}

// 🛡️ WebGLサポート検出
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!context
  } catch {
    return false
  }
}

// 🌌 Three.js動的ロード & 安全実行
async function loadAndExecuteThreeJS(
  code: string, 
  canvas: HTMLCanvasElement, 
  width: number, 
  height: number
) {
  // 1. Three.js CDNの確実な読み込み
  if (!(window as any).THREE) {
    console.log('🚀 Loading Three.js CDN...')
    await new Promise<void>((resolve, reject) => {
      // 既存スクリプトタグの確認
      const existingScript = document.querySelector('script[src*="three.min.js"]')
      if (existingScript && (window as any).THREE) {
        console.log('✅ Three.js already loaded')
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.async = true
      script.onload = () => {
        console.log('✅ Three.js CDN loaded successfully')
        // CDN読み込み後の安定化待機
        setTimeout(() => {
          if ((window as any).THREE) {
            resolve()
          } else {
            reject(new Error('Three.js object not available after load'))
          }
        }, 200)
      }
      script.onerror = () => {
        console.error('❌ Three.js CDN load failed')
        reject(new Error('Three.js CDN load failed'))
      }
      
      // 重複追加防止
      if (!document.querySelector('script[src*="three.min.js"]')) {
        document.head.appendChild(script)
      } else {
        resolve()
      }
    })
  }

  // 2. Three.jsの利用可能性確認
  if (!(window as any).THREE) {
    throw new Error('Three.js library not available after loading')
  }

  console.log('🌌 Three.js available, executing code...')
  const THREE = (window as any).THREE

  // 3. Canvas準備・既存内容クリア
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  
  canvas.width = width
  canvas.height = height

  // 4. 実行環境の準備
  const container = canvas.parentElement
  if (!container) {
    throw new Error('Canvas container not found')
  }

  // 5. ユーザーコードの安全な実行
  try {
    console.log('🎯 Executing Three.js code...')
    
    // 安全な実行環境構築
    const executionContext = {
      THREE,
      canvas,
      width,
      height,
      console: {
        log: (...args: any[]) => console.log('[Three.js]', ...args),
        warn: (...args: any[]) => console.warn('[Three.js]', ...args),
        error: (...args: any[]) => console.error('[Three.js]', ...args)
      }
    }

    // より柔軟なコード実行（レンダラー自動設定付き）
    const enhancedCode = `
      (function() {
        ${code}
        
        // 🎯 レンダラーの自動canvas接続
        if (typeof renderer !== 'undefined' && renderer.domElement) {
          // レンダラーがcanvasを作成した場合、既存canvasと置換
          const targetCanvas = canvas;
          const rendererCanvas = renderer.domElement;
          
          if (rendererCanvas !== targetCanvas) {
            // スタイルとサイズを継承
            rendererCanvas.style.width = '100%';
            rendererCanvas.style.height = '100%';
            rendererCanvas.style.display = 'block';
            rendererCanvas.className = targetCanvas.className;
            
            // DOMで置換
            if (targetCanvas.parentNode) {
              targetCanvas.parentNode.replaceChild(rendererCanvas, targetCanvas);
            }
          }
        }
        
        return { success: true };
      })();
    `

    // 安全なコード実行
    const func = new Function(
      'THREE', 'canvas', 'width', 'height', 'console', 
      `return ${enhancedCode}`
    )
    
    const result = func(
      THREE, 
      canvas, 
      width, 
      height, 
      executionContext.console
    )

    console.log('✅ Three.js code executed successfully:', result)
    return { success: true }

  } catch (error) {
    console.error('❌ Three.js execution error:', error)
    throw error
  }
}

export default function ThreePreview({
  code,
  width = 400,
  height = 225,
  autoRun = true,
  showControls = false,
  className = '',
  onError,
  onSuccess
}: ThreePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [webglSupported, setWebglSupported] = useState<boolean>(true)
  const [debugInfo, setDebugInfo] = useState({
    cdnLoaded: false,
    threeAvailable: false,
    executionStatus: 'pending' as 'pending' | 'success' | 'error'
  })

  // 🌌 Three.js実行関数
  const executeThreeCode = useCallback(async () => {
    if (!canvasRef.current || !containerRef.current) {
      console.warn('Canvas or container ref not ready')
      return
    }

    // WebGLサポート確認
    if (!isWebGLSupported()) {
      setWebglSupported(false)
      setError('WebGLがサポートされていません')
      onError?.(new Error('WebGL not supported'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setDebugInfo(prev => ({ ...prev, executionStatus: 'pending' }))

    try {
      // CDN状態更新
      setDebugInfo(prev => ({ 
        ...prev, 
        cdnLoaded: !!(window as any).THREE,
        threeAvailable: !!(window as any).THREE
      }))

      await loadAndExecuteThreeJS(code, canvasRef.current, width, height)
      
      setDebugInfo(prev => ({ 
        ...prev, 
        executionStatus: 'success',
        threeAvailable: true,
        cdnLoaded: true
      }))
      
      onSuccess?.()
      console.log('🎉 Three.js preview completed successfully')

    } catch (executeError: any) {
      console.warn('⚠️ Three.js execution error:', executeError)
      setError(executeError.message || 'Three.js実行エラー')
      setDebugInfo(prev => ({ ...prev, executionStatus: 'error' }))
      onError?.(executeError)
    } finally {
      setIsLoading(false)
    }
  }, [code, width, height, onError, onSuccess])

  // 🔄 自動実行・コード変更対応
  useEffect(() => {
    if (autoRun && code.trim()) {
      // CDN読み込み確実化のため遅延実行
      const timer = setTimeout(executeThreeCode, 600)
      return () => clearTimeout(timer)
    }
  }, [code, autoRun, executeThreeCode])

  // 💡 WebGL非対応時のフォールバック表示
  if (!webglSupported) {
    return (
      <div 
        className={`flex items-center justify-center bg-neutral-100 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-amber-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-neutral-600 font-medium">WebGL未対応</p>
          <p className="text-xs text-neutral-400">Canvas版で表示します</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded ${className}`} 
      style={{ width, height }}
    >
      {/* 🖼️ Three.jsキャンバス */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-neutral-50 block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* 📡 ローディング表示 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-center">
              <div className="text-sm text-neutral-600 font-medium">3D読み込み中</div>
              <div className="text-xs text-neutral-400">Three.js初期化...</div>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/95 backdrop-blur-sm">
          <div className="text-center p-4 max-w-sm">
            <div className="text-red-400 mb-3">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-red-600 font-medium mb-1">3D実行エラー</p>
            <p className="text-xs text-red-500 break-words leading-relaxed">{error}</p>
            <p className="text-xs text-red-400 mt-2">Canvas版に切り替わります</p>
          </div>
        </div>
      )}

      {/* 🎮 コントロール表示（オプション） */}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-2 left-2 bg-black/25 backdrop-blur-sm rounded-md px-2 py-1">
          <span className="text-xs text-white/90 font-medium">Three.js</span>
        </div>
      )}

      {/* 🔍 デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs p-2 rounded-md font-mono">
          <div className="flex items-center gap-1">
            <span>CDN:</span>
            <span className={debugInfo.cdnLoaded ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.cdnLoaded ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>THREE:</span>
            <span className={debugInfo.threeAvailable ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.threeAvailable ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Status:</span>
            <span className={
              debugInfo.executionStatus === 'success' ? 'text-green-400' : 
              debugInfo.executionStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
            }>
              {debugInfo.executionStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}