'use client'

import { useState, useCallback } from 'react'
import CodePreview from '../canvas/CodePreview'
import ThreePreview from '../canvas/ThreePreview'

interface SmartPreviewProps {
  code: string
  fragmentId: string
  width?: number
  height?: number
  className?: string
}

// 🎯 シンプル&確実なThree.js判定
function isThreeJSCode(code: string): boolean {
  const codeUpper = code.toUpperCase()
  
  // 🛡️ 除外条件（HTML/CSS）
  if (code.includes('<') && code.includes('>')) return false
  if (code.includes('@keyframes') || code.includes('background:')) return false
  
  // 🌌 Three.js確実判定（シンプルかつ強力）
  const hasThreeNamespace = codeUpper.includes('THREE.')
  const hasThreeConstructor = codeUpper.includes('NEW THREE')
  const hasThreeElements = (
    codeUpper.includes('SCENE') ||
    codeUpper.includes('CAMERA') ||
    codeUpper.includes('RENDERER') ||
    codeUpper.includes('MESH') ||
    codeUpper.includes('GEOMETRY') ||
    codeUpper.includes('MATERIAL')
  )
  
  // 判定ロジック：THREE名前空間 + Three.js要素
  const isThree = (hasThreeNamespace || hasThreeConstructor) && hasThreeElements
  
  // 🔍 詳細ログ（コンソールのみ）
  console.log('🔍 Three.js Detection:', {
    hasThreeNamespace,
    hasThreeConstructor, 
    hasThreeElements,
    isThree,
    codePreview: code.substring(0, 100)
  })
  
  return isThree
}

export default function SmartPreview({
  code,
  fragmentId,
  width = 400,
  height = 225,
  className = ''
}: SmartPreviewProps) {
  const [forceCanvas, setForceCanvas] = useState(false)

  // 🔄 Three.jsエラー時のフォールバック処理
  const handleThreeJSError = useCallback((error: Error) => {
    console.warn('Three.js preview failed, falling back to Canvas:', error)
    setForceCanvas(true)
  }, [])

  // 🎯 Three.js成功時の処理
  const handleThreeJSSuccess = useCallback(() => {
    console.log('Three.js preview loaded successfully')
  }, [])

  // 🌌 シンプル判定システム
  const isThreeJS = isThreeJSCode(code)
  const shouldUseThreeJS = isThreeJS && !forceCanvas

  // 📊 コンソールデバッグのみ
  console.log('🔍 SmartPreview Debug:', {
    codeLength: code.length,
    isThreeJS,
    forceCanvas,
    shouldUseThreeJS
  })

  if (shouldUseThreeJS) {
    console.log('✨ Using ThreePreview for:', code.substring(0, 50) + '...')
    return (
      <ThreePreview
        code={code}
        width={width}
        height={height}
        autoRun={true}
        showControls={true}
        className={className}
        onError={handleThreeJSError}
        onSuccess={handleThreeJSSuccess}
      />
    )
  }

  // 🎨 Canvas版（既存・安定）
  console.log('🎨 Using CodePreview for:', code.substring(0, 50) + '...')
  return (
    <CodePreview
      code={code}
      fragmentId={fragmentId}
      className={className}
    />
  )
}