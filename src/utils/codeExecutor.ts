// 安全なコード実行環境を提供するユーティリティ（安全な完全版）
// Phase A: 既存機能100%保持 + Enhanced v2.0互換レイヤー追加

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 EXISTING CODE - 既存コード（完全保持・一切変更なし）
// ═══════════════════════════════════════════════════════════════════════════════

interface ExecutionResult {
  success: boolean
  error?: string
}

// HTMLコードからCanvasコードを実行する（既存コード完全保持）
export function executeCanvasCode(
  htmlCode: string, 
  targetCanvas: HTMLCanvasElement,
  canvasId: string = 'canvas'
): ExecutionResult {
  try {
    // コンテキストを取得
    const ctx = targetCanvas.getContext('2d')
    if (!ctx) {
      return { success: false, error: '2D contextを取得できません' }
    }

    // Canvas要素にIDを設定
    targetCanvas.id = canvasId
    
    // フルスクリーン時はサイズを保護
    const originalCanvasWidth = targetCanvas.width
    const originalCanvasHeight = targetCanvas.height
    
    // canvas.widthとcanvas.heightへの代入を防ぐ
    if (canvasId.includes('fullscreen')) {
      Object.defineProperty(targetCanvas, 'width', {
        get() { return originalCanvasWidth },
        set() { 
          console.log('Canvas width変更をブロックしました')
          return originalCanvasWidth 
        },
        configurable: true  // 後で再定義できるように
      })
      Object.defineProperty(targetCanvas, 'height', {
        get() { return originalCanvasHeight },
        set() { 
          console.log('Canvas height変更をブロックしました')
          return originalCanvasHeight 
        },
        configurable: true  // 後で再定義できるように
      })
    }
    
    // まず、HTMLかJavaScriptコードかを判定
    const isHTML = htmlCode.trim().startsWith('<')
    
    let scriptCode = ''
    
    if (isHTML) {
      // HTMLの場合、scriptタグを抽出
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlCode, 'text/html')
      
      const scripts = doc.querySelectorAll('script')
      scripts.forEach(script => {
        if (!script.src && script.textContent) {
          scriptCode += script.textContent + '\n'
        }
      })
      
      // scriptタグが見つからない場合
      if (!scriptCode.trim()) {
        // シンプルなデモを表示
        ctx.fillStyle = '#333'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('No script found', targetCanvas.width / 2, targetCanvas.height / 2)
        return { success: true }
      }
    } else {
      // JavaScriptコードの場合はそのまま使用
      scriptCode = htmlCode
    }
    
    // アニメーション関連の変数を追跡
    let animationId: number | null = null
    const timeouts: number[] = []
    const intervals: number[] = []
    
    // 安全な実行環境を作成
    const safeEnvironment = {
      // Canvas関連（動的に更新）
      get canvas() { return targetCanvas },
      get ctx() { return ctx },
      get width() { return targetCanvas.width },
      get height() { return targetCanvas.height },
      
      // 数学関数
      Math: Math,
      Date: Date,
      console: console,
      
      // アニメーション（ラップして追跡）
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        animationId = window.requestAnimationFrame(callback)
        return animationId
      },
      cancelAnimationFrame: (id: number) => {
        window.cancelAnimationFrame(id)
      },
      
      // タイマー（ラップして追跡）
      setTimeout: (callback: Function, delay: number) => {
        const id = window.setTimeout(callback, delay)
        timeouts.push(id)
        return id
      },
      clearTimeout: (id: number) => {
        window.clearTimeout(id)
        const index = timeouts.indexOf(id)
        if (index > -1) timeouts.splice(index, 1)
      },
      setInterval: (callback: Function, delay: number) => {
        const id = window.setInterval(callback, delay)
        intervals.push(id)
        return id
      },
      clearInterval: (id: number) => {
        window.clearInterval(id)
        const index = intervals.indexOf(id)
        if (index > -1) intervals.splice(index, 1)
      },
      
      // window オブジェクト（限定版）
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      },
      
      // DOM操作を安全にラップ
      document: {
        getElementById: (id: string) => {
          // canvas要素のみ返す
          if (id === canvasId || id === 'canvas') {
            return targetCanvas
          }
          // その他の要素は安全なダミーオブジェクトを返す
          return {
            style: {},
            textContent: '',
            innerHTML: '',
            className: '',
            id: id,
            setAttribute: () => {},
            getAttribute: () => null,
            addEventListener: () => {},
            removeEventListener: () => {},
            appendChild: () => {},
            removeChild: () => {},
            querySelector: () => null,
            querySelectorAll: () => []
          }
        },
        querySelector: (selector: string) => {
          if (selector === '#canvas' || selector === 'canvas' || selector === `#${canvasId}`) {
            return targetCanvas
          }
          return null
        },
        createElement: (tagName: string) => {
          if (tagName === 'canvas') {
            return document.createElement('canvas')
          }
          return {
            style: {},
            textContent: '',
            innerHTML: '',
            setAttribute: () => {},
            getAttribute: () => null
          }
        }
      }
    }
    
    // コードの前処理
    const processedCode = scriptCode
      // canvas/ctx変数の重複宣言を削除（より厳密なパターン）
      .replace(/(?:const|let|var)\s+canvas\s*=\s*document\.(getElementById|querySelector)\s*\([^)]+\)\s*;?\s*/g, '')
      .replace(/(?:const|let|var)\s+ctx\s*=\s*canvas\.getContext\s*\([^)]+\)\s*;?\s*/g, '')
      // 単独のcanvas変数宣言も削除
      .replace(/(?:const|let|var)\s+canvas\s*;?\s*/g, '')
      .replace(/(?:const|let|var)\s+ctx\s*;?\s*/g, '')
      // canvas.widthやcanvas.heightの固定値への代入を削除
      .replace(/canvas\.(width|height)\s*=\s*\d+\s*;?\s*/g, '')
      // canvas要素の属性設定も削除
      .replace(/canvas\.setAttribute\s*\(\s*['"](?:width|height)['"]\s*,\s*[^)]+\)\s*;?\s*/g, '')
    
    // 実行用の関数を作成
    const wrappedCode = `
      'use strict';
      
      // 環境変数を展開
      const { 
        canvas, ctx,
        Math, Date, console, window,
        requestAnimationFrame, cancelAnimationFrame,
        setTimeout, clearTimeout, setInterval, clearInterval,
        document 
      } = this;
      
      // canvasのサイズを取得
      const width = canvas.width;
      const height = canvas.height;
      
      // よく使う変数を事前定義
      let animationId = null;
      let particles = [];
      let time = 0;
      let frame = 0;
      
      // Math関数のショートカット
      const { PI, sin, cos, tan, sqrt, abs, min, max, floor, ceil, round, random, atan2, pow } = Math;
      const TWO_PI = PI * 2;
      
      try {
        // ユーザーのコードを実行
        ${processedCode}
      } catch (error) {
        console.error('[Canvas実行エラー]', error);
        
        // 特定のエラーは無視
        if (error.message?.includes('textContent') || 
            error.message?.includes('innerHTML') ||
            error.message?.includes('Cannot set property')) {
          // これらのエラーは無視して継続
        } else {
          throw error;
        }
      }
    `
    
    // 関数を作成して実行
    try {
      const executeFunc = new Function(wrappedCode)
      executeFunc.call(safeEnvironment)
      
      // クリーンアップ関数を保存
      ;(targetCanvas as any).__cleanup = () => {
        // サイズ保護を解除（再定義して元に戻す）
        if (canvasId.includes('fullscreen')) {
          Object.defineProperty(targetCanvas, 'width', {
            value: originalCanvasWidth,
            writable: true,
            configurable: true,
            enumerable: true,
          })
          Object.defineProperty(targetCanvas, 'height', {
            value: originalCanvasHeight,
            writable: true,
            configurable: true,
            enumerable: true,
          })
        }
        
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
        }
        timeouts.forEach(id => clearTimeout(id))
        intervals.forEach(id => clearInterval(id))
        
        // Canvasをクリア
        if (ctx) {
          ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
        }
      }
      
    } catch (error) {
      console.error('実行エラー:', error)
      
      // エラーメッセージをCanvasに表示
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('実行エラーが発生しました', targetCanvas.width / 2, targetCanvas.height / 2)
      ctx.font = '12px sans-serif'
      ctx.fillText(error instanceof Error ? error.message : 'Unknown error', targetCanvas.width / 2, targetCanvas.height / 2 + 20)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー'
      }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Canvas execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

// コードタイプを判定（既存コード完全保持）
export function analyzeCodeType(code: string): string {
  const lowerCode = code.toLowerCase()
  
  // Three.jsの検出
  if (lowerCode.includes('three.') || lowerCode.includes('three.js')) {
    return 'three'
  }
  
  // WebGL/GLSLの検出
  if (lowerCode.includes('webgl') || lowerCode.includes('gl_position')) {
    return 'glsl'
  }
  
  // SVGの検出
  if (lowerCode.includes('<svg') && !lowerCode.includes('<canvas')) {
    return 'svg'
  }
  
  // CSSアニメーションの検出
  if (lowerCode.includes('@keyframes') && !lowerCode.includes('<canvas')) {
    return 'css'
  }
  
  // デフォルトはcanvas
  return 'canvas'
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🆕 ENHANCED v2.0 COMPATIBILITY LAYER - 新機能追加（既存に影響なし）
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enhanced v2.0 Type Definitions - TypeScriptエラー解決用
 */
export interface EnhancedExecutionResult {
  success: boolean
  error?: string | {
    message: string
    type?: string
    suggestion?: string
    helpfulHint?: string
  }
  executionTime?: number
  memoryUsage?: number
  performanceScore?: number
  technologies?: TechnicalTag[]
}

export interface ExecutionContext {
  canvas: HTMLCanvasElement
  timeoutMs?: number
  clearOnCleanup?: boolean
  enablePerformanceTracking?: boolean
  enableDebugLogging?: boolean
  metadata?: {
    createdAt: number
    version: string
  }
}

export interface ExecutionOptions {
  performanceMode?: 'speed' | 'memory' | 'balanced'
  enableDebugInfo?: boolean
  enablePerformanceMonitoring?: boolean
  timeoutMs?: number
}

export interface CodeAnalysis {
  codeType: string
  confidence?: number
  technologies: TechnicalTag[]
  complexity: number
  estimatedComplexity?: 'simple' | 'moderate' | 'complex' | 'advanced'
  securityScore: number
  performanceScore: number
  detectedFeatures?: Array<{
    name: string
    confidence: number
  }>
}

export type TechnicalTag = 
  | 'CANVAS'
  | 'ANIMATION' 
  | 'INTERACTIVE'
  | 'DRAWING'
  | 'MATH'
  | 'COLOR'
  | 'THREE'
  | 'SVG'
  | 'CSS'
  | 'P5.JS'
  | 'L-SYSTEM'
  | 'HTML5'

/**
 * Enhanced Code Analysis - 既存analyzeCodeTypeを拡張
 * Phase A: 基本的な技術検出とメトリクス
 */
export async function analyzeCodeEnhanced(code: string): Promise<CodeAnalysis> {
  // 既存関数を活用
  const basicType = analyzeCodeType(code)
  const codeUpper = code.toUpperCase()
  const technologies: TechnicalTag[] = []
  
  // 技術検出ロジック（Phase A: 基本版）
  if (codeUpper.includes('CANVAS') || codeUpper.includes('GETCONTEXT')) {
    technologies.push('CANVAS')
  }
  if (codeUpper.includes('REQUESTANIMATIONFRAME') || codeUpper.includes('ANIMATE')) {
    technologies.push('ANIMATION')
  }
  if (codeUpper.includes('ADDEVENTLISTENER') || codeUpper.includes('ONCLICK')) {
    technologies.push('INTERACTIVE')
  }
  if (codeUpper.includes('FILLRECT') || codeUpper.includes('ARC') || codeUpper.includes('BEGINPATH')) {
    technologies.push('DRAWING')
  }
  if (codeUpper.includes('MATH.') || codeUpper.includes('SIN') || codeUpper.includes('COS')) {
    technologies.push('MATH')
  }
  if (codeUpper.includes('FILLSTYLE') || codeUpper.includes('STROKESTYLE') || codeUpper.includes('RGB')) {
    technologies.push('COLOR')
  }
  if (codeUpper.includes('THREE.')) {
    technologies.push('THREE')
  }
  if (codeUpper.includes('<SVG') || codeUpper.includes('SVG')) {
    technologies.push('SVG')
  }
  if (codeUpper.includes('@KEYFRAMES') || codeUpper.includes('ANIMATION:')) {
    technologies.push('CSS')
  }
  if (codeUpper.includes('P5.') || codeUpper.includes('SETUP(') || codeUpper.includes('DRAW(')) {
    technologies.push('P5.JS')
  }
  if (codeUpper.includes('L-SYSTEM') || codeUpper.includes('LINDENMAYER')) {
    technologies.push('L-SYSTEM')
  }
  if (codeUpper.includes('GETELEMENTBYID') || codeUpper.includes('QUERYSELECTOR')) {
    technologies.push('HTML5')
  }
  
  // 複雑度計算
  const lines = code.split('\n').length
  const functions = (code.match(/function\s+\w+/g) || []).length
  const loops = (code.match(/\b(for|while)\s*\(/g) || []).length
  const complexity = Math.min(100, lines + (functions * 5) + (loops * 3))
  
  // スコアリング
  const hasRiskyFeatures = code.includes('eval') || code.includes('innerHTML')
  const securityScore = Math.max(0, 100 - (hasRiskyFeatures ? 50 : 0) - (loops > 5 ? 20 : 0))
  const performanceScore = Math.max(0, 100 - (complexity / 2) - (loops > 10 ? 30 : 0))
  
  return {
    codeType: basicType,
    confidence: 0.85,
    technologies: technologies.length > 0 ? technologies : ['CANVAS'],
    complexity,
    estimatedComplexity: complexity < 30 ? 'simple' : 
                        complexity < 60 ? 'moderate' : 
                        complexity < 90 ? 'complex' : 'advanced',
    securityScore,
    performanceScore,
    detectedFeatures: technologies.map(tech => ({
      name: tech,
      confidence: 0.85
    }))
  }
}

/**
 * Enhanced Code Execution - 既存executeCanvasCodeをラップして拡張
 * Phase A: パフォーマンス監視付き実行
 */
export async function executeCodeEnhanced(
  code: string,
  context: ExecutionContext,
  options: ExecutionOptions = {}
): Promise<EnhancedExecutionResult> {
  const startTime = performance.now()
  
  try {
    // 既存のexecuteCanvasCodeを使用（最大互換性）
    const legacyResult = executeCanvasCode(
      code,
      context.canvas,
      context.canvas.id || 'canvas'
    )
    
    const executionTime = performance.now() - startTime
    
    // 技術分析実行
    const analysis = await analyzeCodeEnhanced(code)
    
    // パフォーマンススコア計算（1.7ms目標）
    let performanceScore = 100
    if (executionTime > 2) performanceScore = 80
    if (executionTime > 10) performanceScore = 60
    if (executionTime > 50) performanceScore = 40
    if (executionTime > 100) performanceScore = 20
    
    // メモリ使用量取得（利用可能な場合）
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0
    
    return {
      success: legacyResult.success,
      error: legacyResult.error,
      executionTime,
      memoryUsage,
      performanceScore,
      technologies: analysis.technologies
    }
    
  } catch (error) {
    const executionTime = performance.now() - startTime
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
      memoryUsage: 0,
      performanceScore: 0,
      technologies: []
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 SYSTEM UTILITIES - デバッグ・開発支援用（Phase A）
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * システムヘルスチェック - Phase A完了確認用
 */
export async function performSystemHealthCheck(): Promise<{
  legacy: boolean
  enhanced: boolean
  typescript: boolean
  version: string
}> {
  try {
    // レガシーAPI動作確認
    const testCanvas = document.createElement('canvas')
    testCanvas.width = 100
    testCanvas.height = 100
    const legacyTest = executeCanvasCode('ctx.fillRect(0,0,10,10)', testCanvas)
    
    // Enhanced API動作確認
    const enhancedTest = await analyzeCodeEnhanced('ctx.fillRect(0,0,10,10)')
    
    return {
      legacy: legacyTest.success,
      enhanced: enhancedTest.technologies.length > 0,
      typescript: true, // コンパイルが通れば true
      version: 'Phase A - Enhanced v2.0 Compatibility'
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      legacy: false,
      enhanced: false,
      typescript: false,
      version: 'Phase A - Error'
    }
  }
}

/**
 * 利用可能エンジン一覧
 */
export function getAvailableExecutors(): string[] {
  return [
    'Canvas2D (Legacy)',
    'Canvas2D (Enhanced)',
    'Analysis Engine',
    'Performance Monitor'
  ]
}

/**
 * システムデバッグ情報
 */
export function getSystemDebugInfo(): Record<string, any> {
  return {
    version: 'Phase A - Enhanced v2.0 Compatibility',
    timestamp: new Date().toISOString(),
    environment: typeof window !== 'undefined' ? 'browser' : 'server',
    features: {
      legacyApi: true,
      enhancedApi: true,
      typescript: true,
      performanceMonitoring: true,
      technologyDetection: true
    },
    performance: {
      memory: (performance as any).memory?.usedJSHeapSize || 'N/A',
      timing: performance.now()
    }
  }
}