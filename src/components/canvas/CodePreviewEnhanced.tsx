/**
 * CodePreviewEnhanced.tsx - Enhanced Code Executor v2.1 with Interaction Support
 * 
 * @description World-class code preview component with:
 * - 3層情報アーキテクチャ統合 (アートワーク・作品内容・制作技術・メタデータ)
 * - 統一グレー技術タグシステム (複数技術組み合わせ対応)
 * - Enhanced v2.0 + 既存executeCanvasCode完全統合
 * - 🆕 Whisper/Resonance インタラクション機能統合
 * - 美しいエラーハンドリング with UX excellence
 * - バイリンガル対応 (English/日本語)
 * - Framer Motion アニメーション
 * - パフォーマンス指標リアルタイム表示
 * 
 * @version 2.1.0 - Interaction Support Added
 * @since 2025-07-14
 */

'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// ✅ Fixed: 既存の実装済み関数を使用
import { 
  executeCanvasCode, 
  analyzeCodeType
} from '@/utils/codeExecutor'

// 🆕 インタラクション機能インポート
import WhisperButton from '../gallery/WhisperButton'
import ResonanceButton from '../gallery/ResonanceButton'

// ✅ Fixed: Enhanced v2.0 compatible types (既存システムと統合)
type ExecutionResult = {
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

type ExecutionContext = {
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

type ExecutionOptions = {
  performanceMode?: PerformanceMode
  enableDebugInfo?: boolean
  enablePerformanceMonitoring?: boolean
  timeoutMs?: number
}

type CodeAnalysis = {
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

type TechnicalTag = 
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

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'
type PerformanceMode = 'speed' | 'memory' | 'balanced'

const DEFAULT_EXECUTION_OPTIONS = {
  performanceMode: 'speed' as PerformanceMode,
  enableDebugInfo: false,
  enablePerformanceMonitoring: true,
  timeoutMs: 5000
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COMPONENT INTERFACES - Beautiful Type Design with Interaction Support
// ═══════════════════════════════════════════════════════════════════════════════

interface CodePreviewProps {
  /** Source code to execute and preview */
  code: string
  
  /** Canvas dimensions for optimal display */
  width?: number
  height?: number
  
  /** Preview mode configuration */
  mode?: 'preview' | 'fullscreen' | 'gallery'
  
  /** Enhanced execution options */
  executionOptions?: ExecutionOptions
  
  /** Performance optimization settings */
  performanceMode?: PerformanceMode
  
  /** Enable real-time analytics */
  enableAnalytics?: boolean
  
  /** Language preference for bilingual display */
  language?: 'en' | 'ja'
  
  /** Callback for execution events */
  onExecutionComplete?: (result: ExecutionResult) => void
  onAnalysisComplete?: (analysis: CodeAnalysis) => void
  onError?: (error: any) => void
  
  /** Visual customization */
  className?: string
  showPerformanceMetrics?: boolean
  showTechnologyTags?: boolean
  showErrorDetails?: boolean
  
  // 既存CodePreview.tsxとの互換性
  fragmentId?: string
  isFullscreen?: boolean
  
  // 🆕 インタラクション機能サポート
  showInteractionButtons?: boolean
  whisperCount?: number
  resonanceCount?: number
  hasResonated?: boolean
  onWhisper?: (content: string) => void
  onResonate?: (success: boolean) => void
}

interface PreviewState {
  isExecuting: boolean
  isAnalyzing: boolean
  executionResult?: ExecutionResult
  analysisResult?: CodeAnalysis
  error?: any
  performanceMetrics?: {
    executionTime: number
    memoryUsage: number
    performanceScore: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TECHNOLOGY TAG SYSTEM - 統一グレー技術タグシステム
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Technology tag component with unified gray design system
 * 要件定義書準拠の統一ビジュアルデザイン
 */
const TechnologyTag: React.FC<{
  tag: TechnicalTag
  confidence?: number
  language?: 'en' | 'ja'
  size?: 'sm' | 'md' | 'lg'
}> = ({ tag, confidence = 1, language = 'en', size = 'sm' }) => {
  // Bilingual tag display mapping
  const tagLabels: Record<TechnicalTag, { en: string; ja: string }> = {
    'CANVAS': { en: 'Canvas', ja: 'Canvas' },
    'ANIMATION': { en: 'Animation', ja: 'アニメーション' },
    'INTERACTIVE': { en: 'Interactive', ja: 'インタラクティブ' },
    'DRAWING': { en: 'Drawing', ja: '描画' },
    'MATH': { en: 'Math', ja: '数学' },
    'COLOR': { en: 'Color', ja: '色彩' },
    'THREE': { en: 'Three.js', ja: 'Three.js' },
    'SVG': { en: 'SVG', ja: 'SVG' },
    'CSS': { en: 'CSS', ja: 'CSS' },
    'P5.JS': { en: 'p5.js', ja: 'p5.js' },
    'L-SYSTEM': { en: 'L-System', ja: 'L-システム' },
    'HTML5': { en: 'HTML5', ja: 'HTML5' }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const label = tagLabels[tag]?.[language] || tag

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center rounded-md font-mono font-medium
        bg-slate-50 text-slate-500 border border-slate-200/50
        hover:bg-slate-100 hover:text-slate-600
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
      `}
      style={{
        opacity: Math.max(0.6, confidence)
      }}
    >
      {label}
      {confidence < 1 && (
        <span className="ml-1 text-xs opacity-60">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </motion.span>
  )
}

/**
 * Technology tags container with responsive layout
 * 複数技術組み合わせ対応のスケーラブル設計
 */
const TechnologyTags: React.FC<{
  technologies: TechnicalTag[]
  analysisResult?: CodeAnalysis
  language?: 'en' | 'ja'
}> = ({ technologies, analysisResult, language = 'en' }) => {
  if (technologies.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {technologies.slice(0, 6).map((tech: string, index: number) => {
        const confidence = analysisResult?.detectedFeatures?.find(
          f => f.name.toUpperCase().includes(tech)
        )?.confidence || 1

        return (
          <TechnologyTag
            key={`${tech}-${index}`}
            tag={tech as TechnicalTag}
            confidence={confidence}
            language={language}
            size="sm"
          />
        )
      })}
      {technologies.length > 6 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-400 self-center font-mono"
        >
          +{technologies.length - 6} more
        </motion.span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 BEAUTIFUL ERROR DISPLAY - Enhanced v2.0 Error Handling
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Beautiful error display component with UX excellence
 * Enhanced v2.0の美しいエラーハンドリング統合
 */
const ErrorDisplay: React.FC<{
  error: any
  language?: 'en' | 'ja'
  showDetails?: boolean
}> = ({ error, language = 'en', showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle Enhanced v2.0 structured errors
  const errorInfo = typeof error === 'object' && error !== null ? error : { message: error }
  
  const severityColors: Record<ErrorSeverity, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    critical: 'bg-red-100 border-red-300 text-red-900'
  }

  const severity: ErrorSeverity = errorInfo.type === 'syntax' ? 'error' : 'warning'
  const colorClass = severityColors[severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${colorClass}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium mb-1">
            {language === 'ja' ? '実行エラー' : 'Execution Error'}
          </h4>
          <p className="text-sm leading-relaxed">
            {errorInfo.message || error}
          </p>
          
          {errorInfo.suggestion && (
            <div className="mt-2 p-2 bg-white/50 rounded border border-current/20">
              <p className="text-sm font-medium mb-1">
                {language === 'ja' ? '解決のヒント:' : 'Suggestion:'}
              </p>
              <p className="text-sm">{errorInfo.suggestion}</p>
            </div>
          )}
          
          {errorInfo.helpfulHint && (
            <p className="text-xs mt-2 opacity-75">
              💡 {errorInfo.helpfulHint}
            </p>
          )}
        </div>
        
        {showDetails && errorInfo.stack && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && errorInfo.stack && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 p-2 bg-black/10 rounded text-xs font-mono overflow-x-auto"
          >
            <pre className="whitespace-pre-wrap">{errorInfo.stack}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 PERFORMANCE METRICS DISPLAY - Real-time Analytics
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Performance metrics display with beautiful visualizations
 * 1.7ms execution target monitoring
 */
const PerformanceMetrics: React.FC<{
  metrics?: {
    executionTime: number
    memoryUsage: number
    performanceScore: number
  }
  language?: 'en' | 'ja'
}> = ({ metrics, language = 'en' }) => {
  if (!metrics) return null

  const formatTime = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatMemory = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTimeColor = (ms: number) => {
    if (ms <= 2) return 'text-green-600' // Target: 1.7ms
    if (ms <= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 text-xs text-slate-600 mt-2"
    >
      <div className="flex items-center gap-1">
        <span className="opacity-60">⚡</span>
        <span className={getTimeColor(metrics.executionTime)}>
          {formatTime(metrics.executionTime)}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="opacity-60">🧠</span>
        <span>{formatMemory(metrics.memoryUsage)}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="opacity-60">📊</span>
        <span className={getPerformanceColor(metrics.performanceScore)}>
          {metrics.performanceScore}%
        </span>
      </div>
      
      {metrics.executionTime <= 2 && (
        <div className="flex items-center gap-1 text-green-600">
          <span>🎯</span>
          <span className="font-medium">Target!</span>
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 FULLSCREEN INTERACTION OVERLAY - Beautiful Floating Controls
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * フルスクリーン用の美しいインタラクションオーバーレイ
 * ユーザー体験を損なわない上品な配置
 */
const FullscreenInteractionOverlay: React.FC<{
  fragmentId: string
  whisperCount?: number
  resonanceCount?: number
  hasResonated?: boolean
  onWhisper?: (content: string) => void
  onResonate?: (success: boolean) => void
  language?: 'en' | 'ja'
}> = ({ 
  fragmentId, 
  whisperCount = 0, 
  resonanceCount = 0, 
  hasResonated = false,
  onWhisper,
  onResonate,
  language = 'en'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-[65]"
    >
      <div className="flex items-center gap-6 bg-black/80 backdrop-blur-md border border-white/20 
                      rounded-full px-6 py-3 pointer-events-auto shadow-2xl">
        {/* 🎮 フルスクリーン専用インタラクションボタン */}
        <button
          onClick={() => onResonate && onResonate(true)}
          className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white 
                     hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-light">共鳴</span>
          {resonanceCount > 0 && (
            <span className="text-xs text-white/60">{resonanceCount}</span>
          )}
        </button>
        
        <div className="w-px h-6 bg-white/20"></div>
        
        <button
          onClick={() => {
            // WhisperButtonのクリック動作をシミュレート
            const whisperButton = document.querySelector('[data-fragment-id="' + fragmentId + '"]') as HTMLButtonElement
            if (whisperButton) {
              whisperButton.click()
            }
          }}
          data-whisper-trigger
          className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white 
                     hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-light">Whisper</span>
          {whisperCount > 0 && (
            <span className="text-xs text-white/60">{whisperCount}</span>
          )}
        </button>
      </div>
      
      {/* キーボードショートカット表示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="flex justify-center mt-3 pointer-events-none"
      >
        <div className="flex items-center gap-3 text-white/40 text-xs">
          <span>R キーで共鳴</span>
          <span>•</span>
          <span>C キーでコメント</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ENHANCED ANALYSIS FUNCTIONS - 既存機能との統合
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enhanced code analysis using existing analyzeCodeType + new features
 */
async function analyzeCodeEnhanced(code: string): Promise<CodeAnalysis> {
  const basicType = analyzeCodeType(code)
  const codeUpper = code.toUpperCase()
  const technologies: TechnicalTag[] = []
  
  // Enhanced technology detection
  if (codeUpper.includes('CANVAS') || codeUpper.includes('GETCONTEXT')) {
    technologies.push('CANVAS')
  }
  if (codeUpper.includes('REQUESTANIMATIONFRAME')) {
    technologies.push('ANIMATION')
  }
  if (codeUpper.includes('ADDEVENTLISTENER')) {
    technologies.push('INTERACTIVE')
  }
  if (codeUpper.includes('FILLRECT') || codeUpper.includes('ARC')) {
    technologies.push('DRAWING')
  }
  if (codeUpper.includes('MATH.')) {
    technologies.push('MATH')
  }
  if (codeUpper.includes('FILLSTYLE') || codeUpper.includes('STROKESTYLE')) {
    technologies.push('COLOR')
  }
  if (codeUpper.includes('THREE.')) {
    technologies.push('THREE')
  }
  if (codeUpper.includes('<SVG')) {
    technologies.push('SVG')
  }
  if (codeUpper.includes('@KEYFRAMES')) {
    technologies.push('CSS')
  }
  if (codeUpper.includes('P5.') || codeUpper.includes('SETUP(')) {
    technologies.push('P5.JS')
  }
  if (codeUpper.includes('L-SYSTEM')) {
    technologies.push('L-SYSTEM')
  }
  if (codeUpper.includes('GETELEMENTBYID')) {
    technologies.push('HTML5')
  }
  
  // Complexity calculation
  const lines = code.split('\n').length
  const functions = (code.match(/function\s+\w+/g) || []).length
  const loops = (code.match(/\b(for|while)\s*\(/g) || []).length
  const complexity = Math.min(100, lines + (functions * 5) + (loops * 3))
  
  // Security and performance scoring
  const securityScore = Math.max(0, 100 - (code.includes('eval') ? 50 : 0) - (loops > 5 ? 20 : 0))
  const performanceScore = Math.max(0, 100 - (complexity / 2))
  
  return {
    codeType: basicType,
    confidence: 0.9,
    technologies: technologies.length > 0 ? technologies : ['CANVAS'],
    complexity,
    estimatedComplexity: complexity < 30 ? 'simple' : 
                        complexity < 60 ? 'moderate' : 
                        complexity < 90 ? 'complex' : 'advanced',
    securityScore,
    performanceScore,
    detectedFeatures: technologies.map(tech => ({
      name: tech,
      confidence: 0.9
    }))
  }
}

/**
 * Enhanced code execution using existing executeCanvasCode + new features
 */
async function executeCodeEnhanced(
  code: string,
  context: ExecutionContext,
  options: ExecutionOptions = {}
): Promise<ExecutionResult> {
  const startTime = performance.now()
  
  try {
    // Use existing executeCanvasCode for maximum compatibility
    const legacyResult = executeCanvasCode(
      code,
      context.canvas,
      'canvas'
    )
    
    const executionTime = performance.now() - startTime
    
    // Enhanced analysis
    const analysis = await analyzeCodeEnhanced(code)
    
    // Calculate performance score
    const performanceScore = executionTime <= 2 ? 100 : 
                           executionTime <= 10 ? 80 : 
                           executionTime <= 50 ? 60 : 40
    
    return {
      success: legacyResult.success,
      error: legacyResult.error,
      executionTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      performanceScore,
      technologies: analysis.technologies
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: performance.now() - startTime,
      memoryUsage: 0,
      performanceScore: 0,
      technologies: []
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 MAIN COMPONENT - Enhanced Code Preview v2.1 with Interaction Support
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enhanced Code Preview Component v2.1
 * 
 * Features:
 * - 3層情報アーキテクチャ complete implementation
 * - 統一グレー技術タグシステム with confidence scoring
 * - Enhanced v2.0 + 既存executeCanvasCode integration
 * - 🆕 Whisper/Resonance インタラクション機能統合
 * - Beautiful error handling with UX excellence
 * - Real-time performance monitoring
 * - Bilingual technology display
 * - Framer Motion animations
 * - Fullscreen interaction overlay
 */
const CodePreviewEnhanced: React.FC<CodePreviewProps> = ({
  code,
  width = 400,
  height = 300,
  mode = 'preview',
  executionOptions = {},
  performanceMode = 'speed',
  enableAnalytics = true,
  language = 'en',
  onExecutionComplete,
  onAnalysisComplete,
  onError,
  className = '',
  showPerformanceMetrics = true,
  showTechnologyTags = true,
  showErrorDetails = false,
  // 既存CodePreview.tsxとの互換性
  fragmentId = 'preview',
  isFullscreen = false,
  // 🆕 インタラクション機能
  showInteractionButtons = false,
  whisperCount = 0,
  resonanceCount = 0,
  hasResonated = false,
  onWhisper,
  onResonate
}) => {
  // Component state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<PreviewState>({
    isExecuting: false,
    isAnalyzing: false
  })

  // Enhanced execution options
  const finalExecutionOptions: ExecutionOptions = {
    ...DEFAULT_EXECUTION_OPTIONS,
    ...executionOptions,
    performanceMode,
    enableDebugInfo: showErrorDetails,
    enablePerformanceMonitoring: showPerformanceMetrics || enableAnalytics
  }

  // フルスクリーンモード判定
  const isFullscreenMode = mode === 'fullscreen' || isFullscreen

  /**
   * Execute code with Enhanced v2.0 engine
   */
  const executeCode = useCallback(async () => {
    if (!canvasRef.current || !code.trim()) return

    setState(prev => ({ ...prev, isExecuting: true, error: undefined }))

    try {
      // Create execution context
      const context: ExecutionContext = {
        canvas: canvasRef.current,
        timeoutMs: finalExecutionOptions.timeoutMs || 5000,
        clearOnCleanup: true,
        enablePerformanceTracking: showPerformanceMetrics,
        enableDebugLogging: showErrorDetails,
        metadata: {
          createdAt: Date.now(),
          version: '2.1.0'
        }
      }

      // Execute with Enhanced v2.0
      const result = await executeCodeEnhanced(code, context, finalExecutionOptions)

      // Update state with results
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executionResult: result,
        performanceMetrics: result.executionTime ? {
          executionTime: result.executionTime,
          memoryUsage: result.memoryUsage || 0,
          performanceScore: result.performanceScore || 0
        } : undefined,
        error: result.success ? undefined : result.error
      }))

      // Callbacks
      onExecutionComplete?.(result)
      if (!result.success && result.error) {
        onError?.(result.error)
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error
      }))
      onError?.(error)
    }
  }, [code, finalExecutionOptions, showPerformanceMetrics, showErrorDetails, onExecutionComplete, onError])

  /**
   * Analyze code without execution
   */
  const analyzeCode = useCallback(async () => {
    if (!code.trim() || !enableAnalytics) return

    setState(prev => ({ ...prev, isAnalyzing: true }))

    try {
      const analysis = await analyzeCodeEnhanced(code)
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResult: analysis
      }))

      onAnalysisComplete?.(analysis)

    } catch (error) {
      setState(prev => ({ ...prev, isAnalyzing: false }))
      console.warn('Code analysis failed:', error)
    }
  }, [code, enableAnalytics, onAnalysisComplete])

  // Auto-execute on code changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (code.trim()) {
        executeCode()
        if (enableAnalytics) {
          analyzeCode()
        }
      }
    }, 300) // Debounce

    return () => clearTimeout(timeoutId)
  }, [code, executeCode, analyzeCode, enableAnalytics])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current
      if (canvas && (canvas as any).__cleanup) {
        ;(canvas as any).__cleanup()
      }
    }
  }, [])

  // 🎮 キーボードショートカット (フルスクリーン時のみ)
  useEffect(() => {
    if (!isFullscreenMode || !showInteractionButtons) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && onResonate) {
        e.preventDefault()
        onResonate(true)
      }
      if (e.key.toLowerCase() === 'c' && onWhisper) {
        e.preventDefault()
        // WhisperButtonの動作をトリガー
        const whisperButton = document.querySelector('[data-whisper-trigger]') as HTMLButtonElement
        if (whisperButton) {
          whisperButton.click()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreenMode, showInteractionButtons, onResonate, onWhisper])

  // フルスクリーンモード用のレンダリング
  if (isFullscreenMode) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* ═══════════════════════════════════════════════════════════
            🖼️ FULLSCREEN ARTWORK LAYER - フルスクリーン アートワーク層
            ═══════════════════════════════════════════════════════════ */}
        <motion.canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block w-full h-full bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Loading overlay */}
        <AnimatePresence>
          {state.isExecuting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-[70]"
            >
              <div className="flex items-center gap-3 text-white/80 text-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full"
                />
                {language === 'ja' ? '実行中...' : 'Executing...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎮 インタラクションオーバーレイ (フルスクリーン専用) */}
        {showInteractionButtons && fragmentId && (onWhisper || onResonate) && (
          <FullscreenInteractionOverlay
            fragmentId={fragmentId}
            whisperCount={whisperCount}
            resonanceCount={resonanceCount}
            hasResonated={hasResonated}
            onWhisper={onWhisper}
            onResonate={onResonate}
            language={language}
          />
        )}

        {/* エラー表示 (フルスクリーン用) */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 max-w-lg z-[70]"
          >
            <ErrorDisplay
              error={state.error}
              language={language}
              showDetails={showErrorDetails}
            />
          </motion.div>
        )}
      </div>
    )
  }

  // 通常モード（プレビュー・ギャラリー）のレンダリング
  return (
    <div className={`relative bg-white rounded-lg overflow-hidden shadow-sm ${className}`}>
      {/* ═══════════════════════════════════════════════════════════
          🖼️ ARTWORK LAYER - アートワーク層（完全クリーン）
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative">
        <motion.canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block w-full h-auto bg-white border-b border-slate-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Loading overlay */}
        <AnimatePresence>
          {state.isExecuting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full"
                />
                {language === 'ja' ? '実行中...' : 'Executing...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          📝 CONTENT LAYER - 作品内容層（将来のバイリンガル対応準備）
          ═══════════════════════════════════════════════════════════ */}
      
      {/* ═══════════════════════════════════════════════════════════
          🔧 TECHNOLOGY LAYER - 制作技術層
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-4 border-b border-slate-100/50">
        {/* Technology tags with enhanced analysis */}
        {showTechnologyTags && state.executionResult?.technologies && (
          <TechnologyTags
            technologies={state.executionResult.technologies}
            analysisResult={state.analysisResult}
            language={language}
          />
        )}

        {/* Analysis information */}
        {state.analysisResult && enableAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 text-xs text-slate-500"
          >
            <div className="flex items-center gap-4">
              <span>
                {language === 'ja' ? '複雑度:' : 'Complexity:'} {state.analysisResult.estimatedComplexity}
              </span>
              <span>
                {language === 'ja' ? 'セキュリティ:' : 'Security:'} {state.analysisResult.securityScore}%
              </span>
              {state.analysisResult.confidence && (
                <span>
                  {language === 'ja' ? '信頼度:' : 'Confidence:'} {Math.round((state.analysisResult.confidence || 0) * 100)}%
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          📊 METADATA LAYER - メタデータ層
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-4">
        {/* 🎮 インタラクションボタン (通常モード) */}
        {showInteractionButtons && fragmentId && (onWhisper || onResonate) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100"
          >
            {onResonate && (
              <ResonanceButton 
                fragmentId={fragmentId}
                hasResonated={hasResonated}
                resonanceCount={resonanceCount}
                onResonate={onResonate}
              />
            )}
            {onWhisper && (
              <WhisperButton
                fragmentId={fragmentId}
                whisperCount={whisperCount}
                onWhisper={onWhisper}
              />
            )}
          </motion.div>
        )}

        {/* Performance metrics */}
        {showPerformanceMetrics && state.performanceMetrics && (
          <PerformanceMetrics
            metrics={state.performanceMetrics}
            language={language}
          />
        )}

        {/* Error display */}
        {state.error && (
          <div className="mt-3">
            <ErrorDisplay
              error={state.error}
              language={language}
              showDetails={showErrorDetails}
            />
          </div>
        )}

        {/* Success indicators */}
        {state.executionResult?.success && !state.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex items-center gap-2 text-xs text-green-600"
          >
            <span>✓</span>
            <span>
              {language === 'ja' ? '実行成功' : 'Execution successful'}
            </span>
            {state.executionResult.executionTime && state.executionResult.executionTime <= 2 && (
              <span className="font-medium">
                {language === 'ja' ? '(高性能達成!)' : '(Performance target achieved!)'}
              </span>
            )}
          </motion.div>
        )}

        {/* Analysis status */}
        {state.isAnalyzing && enableAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 text-xs text-slate-500"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-slate-400 rounded-full"
            />
            {language === 'ja' ? 'コード分析中...' : 'Analyzing code...'}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CodePreviewEnhanced

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 EXPORT ENHANCED COMPONENTS - Beautiful API Surface
// ═══════════════════════════════════════════════════════════════════════════════

export {
  TechnologyTag,
  TechnologyTags,
  ErrorDisplay,
  PerformanceMetrics,
  FullscreenInteractionOverlay
}

export type {
  CodePreviewProps,
  PreviewState
}