// 🎨 Fragments of Structure - Base Executor v2.0
// 統一マルチメディア実行エンジンの抽象基底クラス

import type { 
  ICodeExecutor,
  ExecutionResult,
  ExecutionContext,
  ExecutionOptions,
  CodeAnalysis,
  CodeType,
  DetectedFeature,
  SecurityRisk,
  ExtendedError
} from './types'

import { 
  ErrorCategory,
  DEFAULT_EXECUTION_OPTIONS 
} from './types'

/**
 * 抽象基底実行エンジン
 * すべての技術特化エンジンの共通基盤
 * 
 * 設計原則:
 * - Apple級の美学的配慮
 * - 型安全性の完全保証
 * - 拡張性とモジュラリティ
 * - パフォーマンス最適化
 */
export abstract class BaseExecutor implements ICodeExecutor {
  abstract readonly name: string
  abstract readonly version: string
  abstract readonly supportedTypes: CodeType[]

  /**
   * コード解析の共通ロジック
   * 各エンジンで特化した解析を実装
   */
  async analyze(code: string): Promise<CodeAnalysis> {
    const startTime = performance.now()
    
    try {
      // 基本的な構文チェック
      const basicAnalysis = this.performBasicAnalysis(code)
      
      // 技術特化解析（継承クラスで実装）
      const specificAnalysis = await this.performSpecificAnalysis(code)
      
      // セキュリティリスク評価
      const securityRisks = this.evaluateSecurityRisks(code)
      
      // 結果統合
      const analysis: CodeAnalysis = {
        ...basicAnalysis,
        ...specificAnalysis,
        securityRisks,
        estimatedComplexity: this.estimateComplexity(code, specificAnalysis.detectedFeatures)
      }
      
      const analyzeTime = performance.now() - startTime
      console.log(`[${this.name}] Analysis completed in ${analyzeTime.toFixed(2)}ms`)
      
      return analysis
      
    } catch (error) {
      console.error(`[${this.name}] Analysis failed:`, error)
      return this.createFailsafeAnalysis(code)
    }
  }

  /**
   * メイン実行ロジック
   * 段階的実行で安全性と品質を保証
   */
  async execute(
    code: string,
    context: ExecutionContext,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const mergedOptions = { ...DEFAULT_EXECUTION_OPTIONS, ...options }
    const startTime = performance.now()
    
    try {
      // Phase 1: 事前分析
      console.log(`[${this.name}] Starting execution analysis...`)
      const analysis = await this.analyze(code)
      
      if (analysis.securityRisks.some(risk => risk.level === 'critical')) {
        return this.createSecurityErrorResult('Critical security risks detected', analysis)
      }
      
      // Phase 2: 実行環境準備
      console.log(`[${this.name}] Preparing execution environment...`)
      await this.prepareExecutionEnvironment(context, mergedOptions)
      
      // Phase 3: コード前処理
      console.log(`[${this.name}] Processing code...`)
      const processedCode = await this.preprocessCode(code, context, mergedOptions)
      
      // Phase 4: 実際の実行（技術特化）
      console.log(`[${this.name}] Executing code...`)
      const executionResult = await this.executeSpecific(
        processedCode,
        context,
        mergedOptions,
        analysis
      )
      
      const executionTime = performance.now() - startTime
      
      return {
        ...executionResult,
        executionTime,
        metadata: {
          codeType: analysis.codeType,
          processedLines: processedCode.split('\n').length,
          detectedFeatures: analysis.detectedFeatures.map(f => f.name),
          performance: {
            parseTime: 0, // 継承クラスで設定
            executionTime,
            renderTime: 0  // 継承クラスで設定
          },
          securityChecks: {
            passed: true,
            warnings: analysis.securityRisks
              .filter(risk => risk.level === 'medium')
              .map(risk => risk.description)
          }
        }
      }
      
    } catch (error) {
      const executionTime = performance.now() - startTime
      console.error(`[${this.name}] Execution failed:`, error)
      
      // 美しいフォールバックアートを表示
      if (mergedOptions.fallbackArt && context.canvas) {
        this.renderFallbackArt(context.canvas, error)
      }
      
      return this.createErrorResult(error, executionTime)
    }
  }

  /**
   * クリーンアップ処理
   * メモリリーク防止とリソース解放
   */
  async cleanup(context: ExecutionContext): Promise<void> {
    try {
      console.log(`[${this.name}] Starting cleanup...`)
      
      // アニメーション停止
      if (context.animationId !== null && context.animationId !== undefined) {
        cancelAnimationFrame(context.animationId)
        context.animationId = null
      }
      
      // タイマークリア
      context.timers.timeouts.forEach(id => clearTimeout(id))
      context.timers.intervals.forEach(id => clearInterval(id))
      context.timers.timeouts = []
      context.timers.intervals = []
      
      // イベントリスナー削除
      context.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          document.removeEventListener(event, listener)
        })
      })
      context.eventListeners.clear()
      
      // キーボードショートカット削除
      context.keyboardShortcuts.clear()
      
      // カスタムクリーンアップ（継承クラスで実装）
      await this.performSpecificCleanup(context)
      
      console.log(`[${this.name}] Cleanup completed`)
      
    } catch (error) {
      console.error(`[${this.name}] Cleanup failed:`, error)
    }
  }

  /**
   * 技術サポート確認
   */
  supports(codeType: CodeType): boolean {
    return this.supportedTypes.includes(codeType)
  }

  /**
   * 実行可能性チェック
   */
  async canExecute(code: string): Promise<boolean> {
    try {
      const analysis = await this.analyze(code)
      return analysis.confidence > 0.7 && 
             !analysis.securityRisks.some(risk => risk.level === 'critical')
    } catch {
      return false
    }
  }

  // === 抽象メソッド（継承クラスで実装） ===

  /**
   * 技術特化コード解析
   * 各エンジンの専門知識を活用した詳細解析
   */
  protected abstract performSpecificAnalysis(code: string): Promise<{
    codeType: CodeType
    confidence: number
    detectedFeatures: DetectedFeature[]
    dependencies: string[]
    recommendedExecutor: string
  }>

  /**
   * 技術特化実行処理
   * 各エンジンの実際の実行ロジック
   */
  protected abstract executeSpecific(
    code: string,
    context: ExecutionContext,
    options: ExecutionOptions,
    analysis: CodeAnalysis
  ): Promise<ExecutionResult>

  /**
   * 技術特化クリーンアップ
   * 各エンジン固有のリソース解放
   */
  protected abstract performSpecificCleanup(context: ExecutionContext): Promise<void>

  // === 共通ユーティリティメソッド ===

  /**
   * 基本コード解析
   * 言語・構文レベルの基本チェック
   */
  protected performBasicAnalysis(code: string): {
    codeType: CodeType
    confidence: number
    dependencies: string[]
  } {
    const lowerCode = code.toLowerCase()
    
    // 基本的な技術検出
    let detectedType: CodeType = 'unknown'
    let confidence = 0.1
    
    if (lowerCode.includes('canvas') || lowerCode.includes('getcontext')) {
      detectedType = 'canvas'
      confidence = 0.8
    } else if (lowerCode.includes('three.') || lowerCode.includes('webgl')) {
      detectedType = 'three'
      confidence = 0.9
    } else if (lowerCode.includes('<svg')) {
      detectedType = 'svg'
      confidence = 0.9
    } else if (lowerCode.includes('@keyframes')) {
      detectedType = 'css'
      confidence = 0.8
    }
    
    // 依存関係検出
    const dependencies = this.extractDependencies(code)
    
    return {
      codeType: detectedType,
      confidence,
      dependencies
    }
  }

  /**
   * セキュリティリスク評価
   * 共通的なセキュリティチェック
   */
  protected evaluateSecurityRisks(code: string): SecurityRisk[] {
    const risks: SecurityRisk[] = []
    const lowerCode = code.toLowerCase()
    
    // eval使用チェック
    if (lowerCode.includes('eval(') || lowerCode.includes('function(')) {
      risks.push({
        level: 'high',
        type: 'eval-usage',
        description: 'Dynamic code evaluation detected',
        mitigation: 'Remove eval() usage for security'
      })
    }
    
    // ネットワークアクセスチェック
    if (lowerCode.includes('fetch(') || lowerCode.includes('xmlhttprequest')) {
      risks.push({
        level: 'medium',
        type: 'network-access',
        description: 'Network access detected',
        mitigation: 'Network requests will be blocked in sandbox'
      })
    }
    
    // 無限ループチェック（基本的な検出）
    if (lowerCode.includes('while(true)') || lowerCode.includes('for(;;)')) {
      risks.push({
        level: 'high',
        type: 'infinite-loop',
        description: 'Potential infinite loop detected',
        mitigation: 'Add timeout protection'
      })
    }
    
    return risks
  }

  /**
   * 複雑さ推定
   * コードの複雑さレベルを判定
   */
  protected estimateComplexity(
    code: string, 
    features: DetectedFeature[]
  ): 'simple' | 'moderate' | 'complex' | 'advanced' {
    const lines = code.split('\n').length
    const featureCount = features.length
    const hasAnimation = features.some(f => f.name.includes('animation'))
    const hasInteraction = features.some(f => f.name.includes('event'))
    
    if (lines < 20 && featureCount < 3) return 'simple'
    if (lines < 50 && featureCount < 6) return 'moderate'
    if (lines < 100 || hasAnimation || hasInteraction) return 'complex'
    return 'advanced'
  }

  /**
   * 依存関係抽出
   * コードから使用ライブラリを検出
   */
  protected extractDependencies(code: string): string[] {
    const dependencies: string[] = []
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    
    let match
    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1])
    }
    while ((match = requireRegex.exec(code)) !== null) {
      dependencies.push(match[1])
    }
    
    return [...new Set(dependencies)]
  }

  /**
   * 実行環境準備
   * 安全で最適化された実行コンテキスト構築
   */
  protected async prepareExecutionEnvironment(
    context: ExecutionContext,
    options: ExecutionOptions
  ): Promise<void> {
    // タイマー配列初期化
    context.timers = {
      timeouts: [],
      intervals: []
    }
    
    // イベントリスナー管理初期化
    context.eventListeners = new Map()
    context.keyboardShortcuts = new Map()
    
    // Canvas特有の準備
    if (context.canvas) {
      // Canvas ID設定
      context.canvas.id = context.targetId
      
      // フルスクリーン時のサイズ保護
      if (context.isFullscreen) {
        this.protectCanvasSize(context.canvas)
      }
    }
  }

  /**
   * コード前処理
   * 安全性と互換性のためのコード変換
   */
  protected async preprocessCode(
    code: string,
    context: ExecutionContext,
    options: ExecutionOptions
  ): Promise<string> {
    let processedCode = code
    
    // 基本的なサニタイゼーション
    processedCode = this.sanitizeCode(processedCode)
    
    // 変数宣言の重複削除
    processedCode = this.removeDuplicateDeclarations(processedCode)
    
    // セキュリティ関連の置換
    processedCode = this.applySecurityTransforms(processedCode, options)
    
    return processedCode
  }

  /**
   * 美しいフォールバックアート表示
   * エラー時の芸術的な表現
   */
  protected renderFallbackArt(canvas: HTMLCanvasElement, error: any): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1a1a1a')
    gradient.addColorStop(1, '#2d2d2d')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 中央にエラーメッセージ
    ctx.fillStyle = '#666'
    ctx.font = '16px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    ctx.fillText('✨ Fragment paused', centerX, centerY - 20)
    ctx.fillStyle = '#999'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText('Technical details in console', centerX, centerY + 10)
  }

  /**
   * Canvasサイズ保護
   * フルスクリーン時の意図しないサイズ変更を防止
   */
  protected protectCanvasSize(canvas: HTMLCanvasElement): void {
    const originalWidth = canvas.width
    const originalHeight = canvas.height
    
    Object.defineProperty(canvas, 'width', {
      get: () => originalWidth,
      set: () => originalWidth,
      configurable: true
    })
    
    Object.defineProperty(canvas, 'height', {
      get: () => originalHeight,
      set: () => originalHeight,
      configurable: true
    })
  }

  /**
   * エラー結果の生成
   * 統一されたエラーレスポンス
   */
  protected createErrorResult(error: any, executionTime: number): ExecutionResult {
    const extendedError = this.categorizeError(error)
    
    return {
      success: false,
      error: extendedError.message,
      executionTime,
      metadata: {
        codeType: 'unknown',
        processedLines: 0,
        detectedFeatures: [],
        performance: {
          parseTime: 0,
          executionTime,
          renderTime: 0
        },
        securityChecks: {
          passed: false,
          warnings: [extendedError.category]
        }
      }
    }
  }

  /**
   * セキュリティエラー結果の生成
   */
  protected createSecurityErrorResult(message: string, analysis: CodeAnalysis): ExecutionResult {
    return {
      success: false,
      error: message,
      warnings: analysis.securityRisks.map(risk => risk.description)
    }
  }

  /**
   * フェイルセーフ分析結果の生成
   */
  protected createFailsafeAnalysis(code: string): CodeAnalysis {
    return {
      codeType: 'unknown',
      confidence: 0.1,
      detectedFeatures: [],
      dependencies: [],
      securityRisks: [],
      estimatedComplexity: 'simple',
      recommendedExecutor: 'canvas'
    }
  }

  // === プライベートユーティリティ ===

  private sanitizeCode(code: string): string {
    // 基本的なサニタイゼーション
    return code
      .replace(/\u0000/g, '') // null文字削除
      .replace(/\u000D/g, '') // CR文字削除
  }

  private removeDuplicateDeclarations(code: string): string {
    // 重複変数宣言の削除（基本的なパターン）
    return code
      .replace(/(?:const|let|var)\s+canvas\s*=\s*document\.(getElementById|querySelector)\s*\([^)]+\)\s*;?\s*/g, '')
      .replace(/(?:const|let|var)\s+ctx\s*=\s*canvas\.getContext\s*\([^)]+\)\s*;?\s*/g, '')
  }

  private applySecurityTransforms(code: string, options: ExecutionOptions): string {
    if (options.sandboxLevel === 'strict') {
      // 厳格モードでの追加制限
      code = code.replace(/eval\s*\(/g, '/* eval blocked */ (')
    }
    
    return code
  }

  private categorizeError(error: any): ExtendedError {
    const extendedError = error as ExtendedError
    
    if (error.name === 'SyntaxError') {
      extendedError.category = ErrorCategory.SYNTAX_ERROR
    } else if (error.name === 'SecurityError') {
      extendedError.category = ErrorCategory.SECURITY_ERROR
    } else if (error.message?.includes('timeout')) {
      extendedError.category = ErrorCategory.TIMEOUT_ERROR
    } else {
      extendedError.category = ErrorCategory.RUNTIME_ERROR
    }
    
    return extendedError
  }
}