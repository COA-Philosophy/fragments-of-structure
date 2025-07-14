// 🎨 Fragments of Structure - Executor Types v2.0
// 統一マルチメディア実行エンジンの型定義システム

/**
 * 実行結果の統一インターフェース
 * すべての技術スタックで共通の結果形式
 */
export interface ExecutionResult {
  success: boolean
  error?: string
  warnings?: string[]
  executionTime?: number
  metadata?: ExecutionMetadata
}

/**
 * 実行メタデータ
 * デバッグ・分析用の詳細情報
 */
export interface ExecutionMetadata {
  codeType: CodeType
  processedLines: number
  detectedFeatures: string[]
  performance: {
    parseTime: number
    executionTime: number
    renderTime: number
  }
  securityChecks: {
    passed: boolean
    warnings: string[]
  }
}

/**
 * サポートされるコード技術タイプ
 * Phase 2で段階的に拡張予定
 */
export type CodeType = 
  | 'canvas'     // Canvas 2D API
  | 'three'      // Three.js 3D
  | 'webgl'      // WebGL/GLSL
  | 'svg'        // SVG + Animation
  | 'css'        // CSS Animation
  | 'p5'         // p5.js
  | 'html'       // HTML + JavaScript
  | 'unknown'    // 未分類

/**
 * 実行環境の設定オプション
 * 各技術に応じたカスタマイズ対応
 */
export interface ExecutionOptions {
  // 基本設定
  enableAnimation?: boolean
  enableInteraction?: boolean
  enableAudio?: boolean
  
  // パフォーマンス制御
  maxExecutionTime?: number
  frameRateLimit?: number
  memoryLimit?: number
  
  // セキュリティ設定
  sandboxLevel?: 'strict' | 'normal' | 'permissive'
  allowedAPIs?: string[]
  blockedAPIs?: string[]
  
  // デバッグ・開発設定
  enableDebugMode?: boolean
  enablePerformanceMonitoring?: boolean
  enableErrorReporting?: boolean
  
  // UI/UX設定
  showLoadingIndicator?: boolean
  showErrorOverlay?: boolean
  fallbackArt?: boolean
}

/**
 * 実行環境のコンテキスト
 * 各エンジンで共有される実行時情報
 */
export interface ExecutionContext {
  // 描画ターゲット
  canvas?: HTMLCanvasElement
  container?: HTMLElement
  targetId: string
  
  // 環境情報
  isFullscreen: boolean
  viewport: {
    width: number
    height: number
  }
  
  // ライフサイクル管理
  cleanup?: () => void
  animationId?: number | null
  timers: {
    timeouts: number[]
    intervals: number[]
  }
  
  // イベント管理
  eventListeners: Map<string, EventListener[]>
  keyboardShortcuts: Map<string, () => void>
}

/**
 * コード解析結果
 * 実行前の詳細分析情報
 */
export interface CodeAnalysis {
  codeType: CodeType
  confidence: number // 0-1 の確信度
  detectedFeatures: DetectedFeature[]
  dependencies: string[]
  securityRisks: SecurityRisk[]
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'advanced'
  recommendedExecutor: string
}

/**
 * 検出された機能・API
 */
export interface DetectedFeature {
  name: string
  type: 'api' | 'library' | 'pattern' | 'syntax'
  confidence: number
  description: string
  supportLevel: 'full' | 'partial' | 'experimental' | 'unsupported'
}

/**
 * セキュリティリスク評価
 */
export interface SecurityRisk {
  level: 'low' | 'medium' | 'high' | 'critical'
  type: 'dom-manipulation' | 'network-access' | 'storage-access' | 'eval-usage' | 'infinite-loop'
  description: string
  mitigation?: string
}

/**
 * 実行エンジンの抽象インターフェース
 * すべてのエンジンが実装すべき基本契約
 */
export interface ICodeExecutor {
  // エンジン情報
  readonly name: string
  readonly version: string
  readonly supportedTypes: CodeType[]
  
  // 主要機能
  analyze(code: string): Promise<CodeAnalysis>
  execute(
    code: string, 
    context: ExecutionContext, 
    options?: ExecutionOptions
  ): Promise<ExecutionResult>
  
  // ライフサイクル管理
  cleanup(context: ExecutionContext): Promise<void>
  
  // 機能チェック
  supports(codeType: CodeType): boolean
  canExecute(code: string): Promise<boolean>
}

/**
 * ファクトリーの設定オプション
 */
export interface ExecutorFactoryConfig {
  defaultOptions: ExecutionOptions
  enabledExecutors: string[]
  fallbackExecutor: string
  debug: boolean
}

/**
 * エラー分類システム
 * 美しいエラー表示のための詳細分類
 */
export enum ErrorCategory {
  SYNTAX_ERROR = 'syntax',
  RUNTIME_ERROR = 'runtime', 
  SECURITY_ERROR = 'security',
  TIMEOUT_ERROR = 'timeout',
  RESOURCE_ERROR = 'resource',
  COMPATIBILITY_ERROR = 'compatibility',
  UNKNOWN_ERROR = 'unknown'
}

/**
 * 拡張エラー情報
 * ユーザーフレンドリーなエラー表示用
 */
export interface ExtendedError extends Error {
  category: ErrorCategory
  code: string
  line?: number
  column?: number
  suggestion?: string
  documentation?: string
  relatedCode?: string
}

/**
 * デフォルト設定
 * 美学的配慮を含む推奨値
 */
export const DEFAULT_EXECUTION_OPTIONS: ExecutionOptions = {
  enableAnimation: true,
  enableInteraction: true,
  enableAudio: false,
  maxExecutionTime: 30000, // 30秒
  frameRateLimit: 60,
  memoryLimit: 50 * 1024 * 1024, // 50MB
  sandboxLevel: 'normal',
  allowedAPIs: [
    'canvas',
    'webgl',
    'audio-context',
    'request-animation-frame',
    'performance'
  ],
  blockedAPIs: [
    'local-storage',
    'session-storage',
    'indexed-db',
    'fetch',
    'xhr'
  ],
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  showLoadingIndicator: true,
  showErrorOverlay: true,
  fallbackArt: true
}