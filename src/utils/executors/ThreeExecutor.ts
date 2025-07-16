/**
 * ThreeExecutor.ts - Three.js専用実行エンジン v1.1.1
 * 
 * @description 
 * - BaseExecutorを継承したThree.js専用実行システム
 * - 🔧 構文エラー修正 + CDN問題解決: 複数CDNフォールバック + 堅牢な読み込み確認
 * - WebGL対応チェック機能
 * - 安全な3D実行環境
 * 
 * @version v1.1.1 - 構文エラー修正版
 */

import { BaseExecutor } from './BaseExecutor'
import { 
  CodeAnalysis, 
  ExecutionContext, 
  ExecutionResult, 
  ExecutionOptions,
  CodeType,
  DetectedFeature
} from './types'

export class ThreeExecutor extends BaseExecutor {
  readonly name = 'Three.js'
  readonly supportedTypes: CodeType[] = ['three', 'webgl', '3d']
  readonly version = '1.1.1'
  
  // 🔧 修正: 複数CDN設定（フォールバック対応）
  private readonly THREE_CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js',  // 推奨: jsDelivr
    'https://unpkg.com/three@0.155.0/build/three.min.js',            // フォールバック1: unpkg
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.155.0/three.min.js', // フォールバック2: cdnjs
    'https://cdn.skypack.dev/three@0.155.0/build/three.min.js'       // フォールバック3: skypack
  ]
  
  private readonly CDN_TIMEOUT = 8000 // 8秒（少し延長）
  private readonly LOAD_RETRY_COUNT = 2 // リトライ回数
  
  // パフォーマンス指標
  private performanceMetrics = {
    totalExecutions: 0,
    averageTime: 0,
    webglSuccessRate: 100,
    cdnLoadTime: 0,
    successfulCdnIndex: -1 // どのCDNが成功したかを記録
  }

  /**
   * Three.js特化コード解析
   */
  protected async performSpecificAnalysis(code: string): Promise<{
    codeType: CodeType
    confidence: number
    detectedFeatures?: DetectedFeature[]
    dependencies?: string[]
    recommendedExecutor?: string
  }> {
    const codeUpper = code.toUpperCase()
    let confidence = 0.1
    let codeType: CodeType = 'three'

    // Three.js namespace検出（より包括的）
    if (codeUpper.includes('THREE.') || codeUpper.includes('NEW THREE') || codeUpper.includes('FROM THREE')) {
      confidence = 0.95
    }

    // WebGL検出
    if (codeUpper.includes('WEBGL') || codeUpper.includes('WEBGLRENDERER')) {
      confidence = Math.max(confidence, 0.9)
    }

    // 3D要素の検出（拡張版）
    const threeElements = [
      'SCENE', 'CAMERA', 'RENDERER', 'MESH', 'GEOMETRY', 'MATERIAL', 'LIGHT',
      'TEXTURE', 'VECTOR3', 'EULER', 'QUATERNION', 'MATRIX4', 'RAYCASTER'
    ]
    const elementCount = threeElements.reduce((count, element) => {
      return count + (codeUpper.includes(element) ? 1 : 0)
    }, 0)

    if (elementCount >= 3) {
      confidence = Math.max(confidence, 0.85)
    }

    const detectedFeatures: DetectedFeature[] = []

    // 機能検出（拡張版）
    if (codeUpper.includes('SCENE') && codeUpper.includes('ADD')) {
      detectedFeatures.push({
        name: 'sceneManagement',
        type: 'api',
        confidence: 0.9,
        description: '3D scene management',
        supportLevel: 'full'
      })
    }

    if (codeUpper.includes('CAMERA')) {
      detectedFeatures.push({
        name: 'cameraSystem',
        type: 'api',
        confidence: 0.9,
        description: '3D camera system',
        supportLevel: 'full'
      })
    }

    if (codeUpper.includes('LIGHT')) {
      detectedFeatures.push({
        name: 'lighting',
        type: 'api',
        confidence: 0.8,
        description: '3D lighting system',
        supportLevel: 'full'
      })
    }

    if (codeUpper.includes('ANIMATE') || codeUpper.includes('REQUESTANIMATIONFRAME')) {
      detectedFeatures.push({
        name: 'animation',
        type: 'api',
        confidence: 0.85,
        description: '3D animation system',
        supportLevel: 'full'
      })
    }

    console.log(`[Three.js] Analysis confidence: ${confidence.toFixed(2)}`)

    return {
      codeType,
      confidence,
      detectedFeatures,
      dependencies: ['three.js', 'webgl'],
      recommendedExecutor: 'Three.js'
    }
  }

  /**
   * Three.js特化実行処理
   */
  protected async executeSpecific(
    code: string,
    context: ExecutionContext,
    options: ExecutionOptions,
    analysis: CodeAnalysis
  ): Promise<ExecutionResult> {
    const executionStart = performance.now()

    try {
      // Canvas要素確認
      if (!context.canvas) {
        throw new Error('Canvas element required for Three.js execution')
      }

      // Step 1: WebGL対応チェック
      console.log('[Three.js] Checking WebGL support...')
      const webglSupported = this.checkWebGLSupport()
      if (!webglSupported) {
        throw new Error('WebGL is not supported in this browser')
      }

      // Step 2: 🔧 修正 - 複数CDN対応のThree.js読み込み
      console.log('[Three.js] Loading Three.js library with fallback system...')
      const cdnStart = performance.now()
      await this.ensureThreeJSLoadedWithFallback()
      this.performanceMetrics.cdnLoadTime = performance.now() - cdnStart

      // Step 3: 安全な実行環境作成
      console.log('[Three.js] Creating execution environment...')
      const threeEnvironment = this.createThreeJSEnvironment(context.canvas, context)

      // Step 4: コード実行
      console.log('[Three.js] Executing Three.js code...')
      const result = await this.executeThreeJSSafely(code, threeEnvironment, context)

      const executionTime = performance.now() - executionStart
      this.updatePerformanceMetrics(executionTime, true)

      console.log(`[Three.js] ✅ Execution completed in ${executionTime.toFixed(2)}ms`)

      return {
        success: true,
        output: result,
        executionTime,
        memoryUsage: this.getMemoryUsage(),
        performanceScore: this.calculateThreePerformanceScore(executionTime),
        technologies: analysis.technologies
      }

    } catch (error) {
      const executionTime = performance.now() - executionStart
      this.updatePerformanceMetrics(executionTime, false)
      
      console.error('[Three.js] ❌ Execution failed:', error)
      return this.createThreeJSErrorResult(error as Error, executionTime)
    }
  }

  /**
   * Three.js特化クリーンアップ
   */
  protected async performSpecificCleanup(context: ExecutionContext): Promise<void> {
    console.log('[Three.js] Starting specific cleanup...')
    
    // WebGLコンテキストクリーンアップ
    if (context.canvas) {
      const gl = (context.canvas.getContext('webgl') || context.canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context') as any
        if (ext) {
          ext.loseContext()
        }
      }
    }

    // Three.jsオブジェクトクリーンアップ（基本版）
    // 将来的にscene、geometry、materialの詳細クリーンアップを追加

    console.log('[Three.js] ✅ Specific cleanup completed')
  }

  // =====================================================================
  // 🔧 THREE.JS固有のユーティリティメソッド
  // =====================================================================

  /**
   * WebGL対応チェック
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!context) {
        console.warn('[Three.js] WebGL context not available')
        return false
      }

      // 基本的なWebGL機能チェック
      const gl = context as WebGLRenderingContext
      const hasBasicFeatures = !!(gl && gl.getShaderPrecisionFormat)
      
      console.log(`[Three.js] WebGL support: ${hasBasicFeatures ? '✅' : '❌'}`)
      return hasBasicFeatures

    } catch (error) {
      console.warn('[Three.js] WebGL check failed:', error)
      return false
    }
  }

  /**
   * 🔧 修正: Three.js CDN動的読み込み（複数フォールバック対応）
   */
  private async ensureThreeJSLoadedWithFallback(): Promise<void> {
    // 既に読み込み済みかチェック
    if ((window as any).THREE) {
      console.log('[Three.js] ✅ Library already loaded')
      return
    }

    console.log('[Three.js] 🚀 Loading from CDN with fallback system...')

    // 既存のスクリプトタグをクリーンアップ
    this.cleanupExistingThreeScripts()

    // 複数CDNを順番に試行
    for (let i = 0; i < this.THREE_CDN_URLS.length; i++) {
      const cdnUrl = this.THREE_CDN_URLS[i]
      console.log(`[Three.js] Trying CDN ${i + 1}/${this.THREE_CDN_URLS.length}: ${cdnUrl}`)

      try {
        await this.loadThreeJSFromCDN(cdnUrl, i)
        
        // 成功した場合
        this.performanceMetrics.successfulCdnIndex = i
        console.log(`[Three.js] ✅ Successfully loaded from CDN ${i + 1}: ${cdnUrl}`)
        return

      } catch (error) {
        console.warn(`[Three.js] ❌ CDN ${i + 1} failed:`, error)
        
        // 最後のCDNでも失敗した場合
        if (i === this.THREE_CDN_URLS.length - 1) {
          throw new Error(`All CDN sources failed. Last error: ${error}`)
        }
        
        // 次のCDNを試行（短い待機時間）
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
  }

  /**
   * 🔧 新機能: 既存Three.jsスクリプトタグのクリーンアップ
   */
  private cleanupExistingThreeScripts(): void {
    const existingScripts = document.querySelectorAll('script[src*="three"]')
    existingScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    })
  }

  /**
   * 🔧 修正: 単一CDNからのThree.js読み込み（堅牢化）
   */
  private async loadThreeJSFromCDN(cdnUrl: string, cdnIndex: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // 既存のスクリプトタグをチェック
      const existingScript = document.querySelector(`script[src="${cdnUrl}"]`)
      if (existingScript) {
        existingScript.remove() // 既存のものは削除して再作成
      }

      // 新しいスクリプトタグを作成
      const script = document.createElement('script')
      script.src = cdnUrl
      script.async = true
      script.crossOrigin = 'anonymous' // CORS対応

      // タイムアウト設定（CDN別に調整可能）
      const timeoutDuration = cdnIndex === 0 ? this.CDN_TIMEOUT : this.CDN_TIMEOUT * 0.7 // 最初のCDNは時間をかける
      const timeout = setTimeout(() => {
        script.remove()
        reject(new Error(`CDN loading timeout (${timeoutDuration}ms): ${cdnUrl}`))
      }, timeoutDuration)

      script.onload = () => {
        clearTimeout(timeout)
        
        // Three.jsオブジェクトの存在確認（より堅牢）
        setTimeout(() => {
          const THREE = (window as any).THREE
          if (THREE && THREE.Scene && THREE.WebGLRenderer && THREE.PerspectiveCamera) {
            console.log(`[Three.js] ✅ CDN ${cdnIndex + 1} loaded successfully - Version:`, THREE.REVISION || 'Unknown')
            resolve()
          } else {
            script.remove()
            reject(new Error(`Three.js object incomplete after load: ${cdnUrl}`))
          }
        }, 100) // 安定化のための待機時間
      }

      script.onerror = (event) => {
        clearTimeout(timeout)
        script.remove()
        reject(new Error(`CDN load error: ${cdnUrl} - ${event}`))
      }

      // DOMに追加
      document.head.appendChild(script)
    })
  }

  /**
   * Three.js安全実行環境作成
   */
  private createThreeJSEnvironment(canvas: HTMLCanvasElement, context: ExecutionContext) {
    const THREE = (window as any).THREE

    if (!THREE) {
      throw new Error('Three.js library not loaded')
    }

    return {
      // コアThree.js API
      THREE,
      canvas,
      width: canvas.width,
      height: canvas.height,

      // WebGL情報
      _webgl: {
        supported: this.checkWebGLSupport(),
        version: this.getWebGLVersion(),
        revision: THREE.REVISION || 'Unknown'
      },

      // 安全なレンダラー作成
      _createRenderer: (canvas: HTMLCanvasElement) => {
        return new THREE.WebGLRenderer({ 
          canvas,
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance' // パフォーマンス重視
        })
      },

      // 基本オブジェクト作成
      _createScene: () => new THREE.Scene(),
      _createCamera: (aspect: number) => new THREE.PerspectiveCamera(75, aspect, 0.1, 1000),

      // パフォーマンス監視
      _performance: {
        now: () => performance.now(),
        mark: (label: string) => console.log(`[Three.js] ${label}: ${performance.now()}ms`)
      },

      // アニメーション管理（Canvas版と同じパターン）
      _animation: {
        requestFrame: (callback: FrameRequestCallback) => {
          const id = requestAnimationFrame(callback)
          if (context.animationIds) {
            context.animationIds.add(id)
          }
          return id
        },
        cancelFrame: (id: number) => {
          cancelAnimationFrame(id)
          if (context.animationIds) {
            context.animationIds.delete(id)
          }
        }
      },

      // エラーハンドリング
      _error: {
        log: (message: string) => console.log(`[Three.js] ${message}`)
      }
    }
  }

  /**
   * Three.js安全コード実行
   */
  private async executeThreeJSSafely(
    code: string,
    environment: any,
    context: ExecutionContext
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Three.js execution timeout'))
      }, context.timeoutMs || 12000) // 3D用の長めのタイムアウト（12秒に延長）

      try {
        // Function引数分離方式（Canvas版と同じパターン）
        const executeFunction = new Function(
          'THREE', 'canvas', 'width', 'height',
          '_webgl', '_createRenderer', '_createScene', '_createCamera',
          '_performance', '_animation', '_error',
          'userCode',
          `
          try {
            // Three.js実行前の安全チェック
            if (!THREE || !THREE.Scene) {
              throw new Error('Three.js library not properly loaded');
            }
            
            eval(userCode);
            return { success: true, result: 'Three.js execution completed' };
          } catch (error) {
            return { success: false, error: error.message };
          }
          `
        )

        const result = executeFunction(
          environment.THREE,
          environment.canvas,
          environment.width,
          environment.height,
          environment._webgl,
          environment._createRenderer,
          environment._createScene,
          environment._createCamera,
          environment._performance,
          environment._animation,
          environment._error,
          code // ← Function引数分離方式
        )

        clearTimeout(timeout)
        resolve(result)

      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  /**
   * Three.jsエラー結果作成
   */
  private createThreeJSErrorResult(error: Error, executionTime: number): ExecutionResult {
    return {
      success: false,
      error: {
        message: this.beautifyThreeJSError(error.message),
        type: error.constructor.name,
        suggestion: this.getThreeJSSuggestion(error.message),
        helpfulHint: 'Check browser WebGL support and Three.js syntax'
      },
      executionTime,
      memoryUsage: this.getMemoryUsage(),
      performanceScore: 0,
      technologies: ['THREE', 'WEBGL']
    }
  }

  /**
   * Three.jsエラーメッセージの美化
   */
  private beautifyThreeJSError(message: string): string {
    if (message.includes('WebGL')) {
      return 'WebGL関連エラー - ブラウザの3D対応をご確認ください'
    }
    if (message.includes('THREE')) {
      return 'Three.js API使用エラー - コードの構文をご確認ください'
    }
    if (message.includes('timeout')) {
      return '3D実行タイムアウト - 処理が複雑すぎる可能性があります'
    }
    if (message.includes('CDN') || message.includes('load')) {
      return 'Three.js読み込みエラー - インターネット接続をご確認ください'
    }
    return `3D実行エラー: ${message}`
  }

  /**
   * エラー別推奨事項
   */
  private getThreeJSSuggestion(message: string): string {
    if (message.includes('WebGL')) {
      return 'ブラウザのハードウェアアクセラレーションを有効にしてください'
    }
    if (message.includes('CDN') || message.includes('load')) {
      return 'インターネット接続を確認するか、しばらく待ってから再試行してください'
    }
    if (message.includes('timeout')) {
      return 'より単純な3Dコードから始めてみてください'
    }
    return 'Three.jsドキュメントで構文を確認してください'
  }

  // =====================================================================
  // 🔧 ユーティリティメソッド
  // =====================================================================

  private getWebGLVersion(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      if (!gl) return 'Not supported'
      
      return gl.getParameter(gl.VERSION) || 'Unknown'
    } catch {
      return 'Not supported'
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  private calculateThreePerformanceScore(executionTime: number): number {
    // Three.js用のパフォーマンス基準（8ms = 100点に調整）
    const targetTime = 8.0
    const maxTime = 25.0
    
    if (executionTime <= targetTime) return 100
    if (executionTime >= maxTime) return 0
    
    return Math.round((maxTime - executionTime) / (maxTime - targetTime) * 100)
  }

  private updatePerformanceMetrics(executionTime: number, success: boolean): void {
    this.performanceMetrics.totalExecutions++
    
    if (success) {
      const alpha = 0.1
      this.performanceMetrics.averageTime = 
        this.performanceMetrics.averageTime * (1 - alpha) + executionTime * alpha
        
      this.performanceMetrics.webglSuccessRate = 
        (this.performanceMetrics.webglSuccessRate * 0.9 + 100 * 0.1)
    } else {
      this.performanceMetrics.webglSuccessRate = 
        (this.performanceMetrics.webglSuccessRate * 0.9 + 0 * 0.1)
    }

    console.log(`[Three.js] 📊 Performance: ${executionTime.toFixed(2)}ms, Success: ${success}`)
  }

  /**
   * 🔧 新機能: システム情報取得
   */
  public getSystemInfo(): Record<string, any> {
    return {
      version: this.version,
      supportedTypes: this.supportedTypes,
      webglSupport: this.checkWebGLSupport(),
      webglVersion: this.getWebGLVersion(),
      availableCdns: this.THREE_CDN_URLS.length,
      successfulCdnIndex: this.performanceMetrics.successfulCdnIndex,
      performanceMetrics: this.performanceMetrics,
      threeJsLoaded: !!(window as any).THREE,
      threeJsRevision: (window as any).THREE?.REVISION || 'Not loaded'
    }
  }
}