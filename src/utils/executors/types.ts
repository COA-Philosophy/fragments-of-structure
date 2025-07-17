// 🎨 Fragments of Structure - Enhanced Executor Types v2.1
// 統一マルチメディア実行エンジンの型定義システム
// ✅ 3Dサポート追加 - ThreeExecutor対応

/**
 * 実行結果の統一インターフェース
 * すべての技術スタックで共通の結果形式
 */
export interface ExecutionResult {
  success: boolean
  error?: string | { 
    message: string
    type?: string
    line?: number
    column?: number
    suggestion?: string
    helpfulHint?: string
  }
  warnings?: string[]
  executionTime?: number
  memoryUsage?: number
  performanceScore?: number
  technologies?: TechnicalTag[]
  output?: any
  metadata?: ExecutionMetadata
  debugInfo?: {
    originalError?: string
    codePreview?: string
    timestamp?: string
  }
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
 * ✅ 3D追加 - ThreeExecutor対応
 */
export type CodeType = 
  | 'canvas'     // Canvas 2D API
  | 'javascript' // Pure JavaScript
  | 'html5'      // HTML5 APIs
  | 'three'      // Three.js 3D
  | 'webgl'      // WebGL/GLSL
  | '3d'         // 3D Graphics (General)
  | 'svg'        // SVG + Animation
  | 'css'        // CSS Animation
  | 'p5'         // p5.js
  | 'html'       // HTML + JavaScript
  | 'unknown'    // 未分類

/**
 * 技術タグ分類
 * Fragment表示用の技術識別システム
 * ✅ WEBGL追加 - ThreeExecutor対応
 */
export type TechnicalTag = 
  | 'CANVAS'
  | 'ANIMATION' 
  | 'INTERACTIVE'
  | 'DRAWING'
  | 'MATH'
  | 'COLOR'
  | 'THREE'
  | 'WEBGL'      // ← 追加！ThreeExecutor対応
  | 'SVG'
  | 'CSS'
  | 'P5.JS'
  | 'L-SYSTEM'
  | 'HTML5'

/**
 * エラー重要度分類
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * パフォーマンスモード
 */
export type PerformanceMode = 'speed' | 'compatibility' | 'features'

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
  timeoutMs?: number
  frameRateLimit?: number
  memoryLimit?: number
  performanceMode?: PerformanceMode
  
  // セキュリティ設定
  sandboxLevel?: 'strict' | 'normal' | 'permissive'
  allowedAPIs?: string[]
  blockedAPIs?: string[]
  
  // デバッグ・開発設定
  enableDebugMode?: boolean
  enableDebugInfo?: boolean
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
  targetId?: string
  
  // 環境情報
  isFullscreen?: boolean
  viewport?: {
    width: number
    height: number
  }
  
  // ライフサイクル管理
  cleanup?: () => void
  animationId?: number | null
  animationIds?: Set<number>
  timers?: {
    timeouts: number[]
    intervals: number[]
  }
  
  // イベント管理
  eventListeners?: Map<string, EventListener[]>
  keyboardShortcuts?: Map<string, () => void>
  
  // 実行制御
  timeoutMs?: number
  clearOnCleanup?: boolean
  
  // パフォーマンス・デバッグ設定
  enablePerformanceTracking?: boolean
  enableDebugLogging?: boolean
  metadata?: {
    createdAt: number
    version: string
  }
}

/**
 * コード解析結果
 * 実行前の詳細分析情報
 */
export interface CodeAnalysis {
  codeType: CodeType
  confidence?: number // 0-1 の確信度
  technologies: TechnicalTag[]
  complexity: number
  estimatedRuntime: number
  potentialIssues: string[]
  securityScore: number
  performanceScore: number
  recommendations: string[]
  detectedFeatures?: DetectedFeature[]
  dependencies?: string[]
  securityRisks?: SecurityRisk[]
  estimatedComplexity?: 'simple' | 'moderate' | 'complex' | 'advanced'
  recommendedExecutor?: string
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
  readonly version?: string
  readonly supportedTypes: CodeType[]
  
  // 主要機能
  analyze(code: string): Promise<CodeAnalysis>
  execute(
    code: string, 
    context: ExecutionContext, 
    options?: ExecutionOptions
  ): Promise<ExecutionResult>
  
  // ライフサイクル管理
  cleanup?(context: ExecutionContext): Promise<void>
  
  // 機能チェック
  supports(codeType: CodeType): boolean
  canExecute(code: string): Promise<boolean>
  
  // 健康チェック（オプション）
  performHealthCheck?(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    metrics: any
    recommendations: string[]
  }>
}

/**
 * エグゼキューター情報
 */
export interface ExecutorInfo {
  name: string
  version: string
  description: string
  supportedTypes: CodeType[]
  capabilities: string[]
  status: 'active' | 'inactive' | 'maintenance'
  performanceRating: number
  compatibilityScore: number
  securityLevel: 'low' | 'medium' | 'high'
}

/**
 * システムヘルスレポート
 */
export interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'critical'
  timestamp: string
  executors: { [key: string]: ExecutorHealthStatus }
  performance: {
    averageExecutionTime: number
    successRate: number
    errorRate: number
    totalExecutions: number
  }
  recommendations: string[]
  systemInfo: {
    factoryVersion: string
    activeExecutors: number
    supportedTypes: CodeType[]
  }
}

/**
 * エグゼキューターヘルス状態
 */
export interface ExecutorHealthStatus {
  status: 'healthy' | 'warning' | 'critical'
  performanceScore: number
  errorRate: number
  recommendations: string[]
}

/**
 * パフォーマンス指標
 */
export interface PerformanceMetrics {
  totalExecutions: number
  averageTime: number
  errorRate: number
  successRate: number
}

/**
 * 実行指標
 */
export interface ExecutionMetrics {
  executionTime: number
  memoryUsage: number
  performanceScore: number
}

/**
 * システム指標
 */
export interface SystemMetrics {
  uptime: number
  totalExecutions: number
  activeExecutors: number
  systemLoad: number
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
  timeoutMs: 5000, // 5秒
  frameRateLimit: 60,
  memoryLimit: 50 * 1024 * 1024, // 50MB
  performanceMode: 'speed',
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
  enableDebugInfo: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  showLoadingIndicator: true,
  showErrorOverlay: true,
  fallbackArt: true
}