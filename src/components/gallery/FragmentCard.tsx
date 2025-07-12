'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodePreview from '../canvas/CodePreview'
import WhisperButton from './WhisperButton'
import ResonanceButton from './ResonanceButton'
import Toast from './Toast'
import { Fragment, Whisper } from '@/types/fragment'

// 🆕 新しいデザインシステムコンポーネントをインポート
import { FragmentTitle, FragmentDescription } from '../design-system/BilingualText/BilingualText'
import { FragmentCreator } from '../design-system/CreatorNickname/CreatorNickname'

interface ExtendedFragment extends Fragment {
  resonance_count: number
  whispers: Whisper[]
  whisper_count: number
  user_has_resonated: boolean
}

interface FragmentCardProps {
  fragment: ExtendedFragment
  index?: number
  onUpdate?: () => void
  onOpenFullscreen?: () => void
}

// 🎨 技術タグコンポーネント - 控えめグレー版
function TechTag({ tech, className = '' }: { tech: string; className?: string }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide
      bg-slate-50 text-slate-500 border border-slate-200/50 rounded-md
      transition-colors duration-200
      ${className}
    `}>
      {tech}
    </span>
  )
}

// 🔍 コードから技術を自動検出
function detectTechnologies(code: string): string[] {
  const codeUpper = code.toUpperCase()
  const technologies: string[] = []

  // Canvas系
  if (codeUpper.includes('CANVAS') || codeUpper.includes('GETCONTEXT') || codeUpper.includes('2D')) {
    technologies.push('CANVAS')
  }

  // Three.js/WebGL
  if (codeUpper.includes('THREE') || codeUpper.includes('WEBGL') || codeUpper.includes('GL_')) {
    technologies.push('THREE')
  }

  // Interactive
  if (codeUpper.includes('ADDEVENTLISTENER') || codeUpper.includes('ONCLICK') || codeUpper.includes('MOUSEMOVE')) {
    technologies.push('INTERACTIVE')
  }

  // HTML5 API
  if (codeUpper.includes('GETELEMENTBYID') || codeUpper.includes('QUERYSELECTOR')) {
    technologies.push('HTML5')
  }

  // CSS Animation
  if (codeUpper.includes('@KEYFRAMES') || codeUpper.includes('ANIMATION:')) {
    technologies.push('CSS')
  }

  // P5.js
  if (codeUpper.includes('P5') || codeUpper.includes('SETUP()') || codeUpper.includes('DRAW()')) {
    technologies.push('P5.JS')
  }

  // L-system (プロンプトからも検出)
  if (codeUpper.includes('L-SYSTEM') || codeUpper.includes('LINDENMAYER')) {
    technologies.push('L-SYSTEM')
  }

  // SVG
  if (codeUpper.includes('<SVG') || codeUpper.includes('CREATEELEMENT(\'SVG\'')) {
    technologies.push('SVG')
  }

  // デフォルトでCANVASを追加（何も検出されない場合）
  if (technologies.length === 0) {
    technologies.push('CANVAS')
  }

  return technologies
}

export default function FragmentCard({ 
  fragment, 
  index = 0,
  onUpdate,
  onOpenFullscreen
}: FragmentCardProps) {
  // 🎯 State Management: データベース同期状態
  const [hasResonated, setHasResonated] = useState(fragment.user_has_resonated)
  const [resonanceCount, setResonanceCount] = useState(fragment.resonance_count)
  const [whisperCount, setWhisperCount] = useState(fragment.whisper_count)
  
  // 🎨 UI State: インタラクション状態
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // 🖼️ Image State: サムネイル表示制御
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  // 🎨 デザインシステム: アニメーション設定
  const ANIMATIONS = {
    duration: 0.6,
    ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
    stagger: 0.08
  }

  // 📊 Fragment番号のフォーマット（3桁ゼロパディング）
  const fragmentNumber = `Fragment ${String(fragment.display_number || index + 1).padStart(3, '0')}`

  // 🔍 技術検出
  const detectedTechnologies = detectTechnologies(fragment.code)

  // 🔄 Props変化時の状態同期
  useEffect(() => {
    setHasResonated(fragment.user_has_resonated)
    setResonanceCount(fragment.resonance_count)
    setWhisperCount(fragment.whisper_count)
  }, [
    fragment.user_has_resonated, 
    fragment.resonance_count, 
    fragment.whisper_count,
    fragment.id
  ])

  // 🎯 共鳴ハンドラ
  const handleResonate = useCallback(async (success: boolean) => {
    if (success && !hasResonated) {
      setHasResonated(true)
      setResonanceCount(prev => prev + 1)
      setToastMessage('共鳴が生まれました')
      setShowToast(true)
      
      setTimeout(() => {
        if (onUpdate) onUpdate()
      }, 1000)
    }
  }, [hasResonated, onUpdate])

  // 💬 Whisperハンドラ
  const handleWhisper = useCallback((content: string) => {
    setWhisperCount(prev => prev + 1)
    setToastMessage('言葉が添えられました')
    setShowToast(true)
    
    setTimeout(() => {
      if (onUpdate) onUpdate()
    }, 1000)
  }, [onUpdate])

  // 🖼️ 画像ハンドラ
  const handleImageLoad = useCallback(() => setImageLoaded(true), [])
  const handleImageError = useCallback(() => {
    setImageError(true)
    console.warn(`⚠️ Failed to load thumbnail for ${fragmentNumber}`)
  }, [fragmentNumber])

  // 🖼️ プレビュークリックハンドラ
  const handlePreviewClick = useCallback(() => {
    if (onOpenFullscreen) {
      onOpenFullscreen()
    }
  }, [onOpenFullscreen])

  // 🖱️ メニュー制御
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // 🗑️ 削除処理
  const handleDelete = async () => {
    if (!deletePassword) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/fragments/${fragment.id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        setToastMessage(error.error || '削除に失敗しました')
        setShowToast(true)
      }
    } catch (error) {
      setToastMessage('削除に失敗しました')
      setShowToast(true)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setDeletePassword('')
    }
  }

  // 📋 コピー機能
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(fragment.code)
    setToastMessage('コードをコピーしました')
    setShowToast(true)
    setMenuOpen(false)
  }, [fragment.code])

  const copyPrompt = useCallback(() => {
    if (fragment.prompt) {
      navigator.clipboard.writeText(fragment.prompt)
      setToastMessage('プロンプトをコピーしました')
      setShowToast(true)
    }
    setMenuOpen(false)
  }, [fragment.prompt])

  return (
    <>
      {/* 🎨 Main Card: 構造化レイアウト */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          ...ANIMATIONS,
          delay: index * ANIMATIONS.stagger
        }}
        className="group relative bg-white/80 backdrop-blur-sm border border-[#3a3a3a]/10 rounded-lg overflow-hidden
                   hover:shadow-xl hover:shadow-[#3a3a3a]/5 hover:border-[#3a3a3a]/20 transition-all duration-500
                   hover:-translate-y-1"
      >
        {/* 🖼️ Preview Area: 完全クリーン */}
        <div 
          className="relative w-full h-64 bg-[#f9f8f6] cursor-pointer overflow-hidden group/preview"
          onClick={handlePreviewClick}
        >
          {/* サムネイル優先表示システム */}
          {fragment.thumbnail_url && !imageError ? (
            <>
              {/* ローディング状態 */}
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-[#f9f8f6]"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-[#6a6a6a]/20 border-t-[#3a3a3a] rounded-full animate-spin"></div>
                      <div className="absolute inset-0 border-2 border-transparent border-b-[#d4af37]/30 rounded-full animate-spin"
                           style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* サムネイル画像 */}
              <motion.img
                src={`${fragment.thumbnail_url}?f_auto,q_auto,w_800`}
                alt={fragment.title_primary || fragment.title}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ 
                  opacity: imageLoaded ? 1 : 0,
                  scale: imageLoaded ? 1 : 1.1
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </>
          ) : (
            /* Canvas フォールバック */
            <div className="relative w-full h-full">
              <CodePreview 
                code={fragment.code} 
                fragmentId={fragment.id}
                className="w-full h-full transition-transform duration-700 group-hover/preview:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Fragment番号のみ - 最小限 */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md
                         border border-white/50 shadow-sm">
            <span className="text-xs font-light text-[#6a6a6a] tracking-wide">
              {fragmentNumber}
            </span>
          </div>

          {/* ホバー時のプレビュー指示 */}
          <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/10 transition-colors duration-300
                         flex items-center justify-center opacity-0 group-hover/preview:opacity-100">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/50">
              <span className="text-xs text-[#3a3a3a] font-light">詳細を見る</span>
            </div>
          </div>
        </div>

        {/* 📝 Card Content: 構造化情報レイアウト */}
        <div className="p-5">
          {/* 🎨 作品内容層 - タイトル・説明 */}
          <div className="space-y-3 mb-4">
            {/* タイトル + メニュー */}
            <div className="flex items-start justify-between gap-3">
              <FragmentTitle 
                fragment={fragment} 
                className="flex-1 min-w-0"
              />
              
              {/* 3点メニュー */}
              <div ref={menuRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 -m-2 hover:bg-[#3a3a3a]/5 rounded-lg transition-colors duration-200 group/menu"
                  aria-label="メニューを開く"
                >
                  <svg className="w-4 h-4 text-[#6a6a6a] group-hover/menu:text-[#3a3a3a] transition-colors" 
                       fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* ドロップダウンメニュー */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg 
                                shadow-lg border border-[#3a3a3a]/10 py-1 z-20"
                    >
                      <button
                        onClick={() => {
                          setShowDeleteModal(true)
                          setMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                                  hover:bg-[#3a3a3a]/5 transition-colors duration-150"
                      >
                        削除
                      </button>
                      <button
                        onClick={copyCode}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                                  hover:bg-[#3a3a3a]/5 transition-colors duration-150"
                      >
                        コードをコピー
                      </button>
                      {fragment.prompt && (
                        <button
                          onClick={copyPrompt}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                                    hover:bg-[#3a3a3a]/5 transition-colors duration-150"
                        >
                          プロンプトをコピー
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* バイリンガル説明文 */}
            <FragmentDescription 
              fragment={fragment}
              maxLength={120}
            />
          </div>

          {/* 🔧 制作技術層 - プロンプト・技術タグ */}
          {(fragment.prompt || detectedTechnologies.length > 0) && (
            <div className="space-y-3 mb-6 pb-4 border-b border-[#3a3a3a]/5">
              {/* プロンプト */}
              {fragment.prompt && (
                <div className="bg-[#f9f8f6] rounded-lg p-3 border border-[#3a3a3a]/5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-[#6a6a6a]/60 font-light shrink-0 mt-0.5">Prompt:</span>
                    <p className="text-xs text-[#6a6a6a] italic leading-relaxed">
                      {fragment.prompt.slice(0, 120)}
                      {fragment.prompt.length > 120 && '...'}
                    </p>
                  </div>
                </div>
              )}

              {/* 🎯 技術タグ群 - プロンプト直下の統一グレー */}
              {detectedTechnologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detectedTechnologies.map((tech, index) => (
                    <TechTag key={index} tech={tech} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 📊 メタデータ層 - アクション・作者・日時 */}
          <div className="flex items-center justify-between">
            {/* アクションボタン */}
            <div className="flex items-center gap-4">
              <ResonanceButton 
                fragmentId={fragment.id}
                hasResonated={hasResonated}
                resonanceCount={resonanceCount}
                onResonate={handleResonate}
              />
              <WhisperButton
                fragmentId={fragment.id}
                whisperCount={whisperCount}
                onWhisper={handleWhisper}
              />
            </div>

            {/* メタデータ情報 */}
            <div className="flex items-center gap-3 text-xs text-[#6a6a6a]/60">
              {/* 創作者 */}
              {(fragment.creator_nickname || fragment.creator_hash) && (
                <FragmentCreator 
                  fragment={fragment}
                  size="xs"
                />
              )}
              
              {/* 区切り */}
              {(fragment.creator_nickname || fragment.creator_hash) && (
                <span>·</span>
              )}
              
              {/* 作成日時 */}
              <time className="font-light">
                {new Date(fragment.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🗑️ 削除確認モーダル */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-[#3a3a3a]/10 
                        p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-light text-[#1c1c1c] mb-3">Fragmentを削除</h3>
              <p className="text-sm text-[#6a6a6a] mb-4 leading-relaxed">
                削除するにはパスワードを入力してください
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#3a3a3a]/20 rounded-lg mb-4 
                          focus:outline-none focus:border-[#3a3a3a]/40 transition-colors duration-200
                          bg-white/50 text-[#1c1c1c] placeholder-[#6a6a6a]/60"
                placeholder="パスワード"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                  }}
                  className="px-4 py-2 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!deletePassword || deleting}
                  className="px-5 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {deleting ? '削除中...' : '削除'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎊 トースト通知 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  )
}