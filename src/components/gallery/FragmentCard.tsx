'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodePreview from '../canvas/CodePreview'
import FullscreenModal from './FullscreenModal'
import WhisperButton from './WhisperButton'
import ResonanceButton from './ResonanceButton'
import Toast from './Toast'
import { Fragment, Whisper } from '@/types/fragment'

interface FragmentCardProps {
  fragment: Fragment & {
    resonance_count?: number
    whispers?: Whisper[]
  }
  index?: number
}

export default function FragmentCard({ fragment, index = 0 }: FragmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [hasResonated, setHasResonated] = useState(false)
  const [whisperCount, setWhisperCount] = useState(fragment.whispers?.length || 0)

  const menuRef = useRef<HTMLDivElement>(null)

  // Fragment番号のフォーマット（3桁ゼロパディング）
  const fragmentNumber = `Fragment ${String(fragment.display_number || index + 1).padStart(3, '0')}`

  // 画像読み込み完了ハンドラ
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  // 画像エラーハンドラ
  const handleImageError = useCallback(() => {
    setImageError(true)
    console.warn(`Failed to load thumbnail for ${fragmentNumber}`)
  }, [fragmentNumber])

  // 共鳴時のハンドラ
  const handleResonate = useCallback(() => {
    setHasResonated(true)
  }, [])

  // Whisper追加時のハンドラ
  const handleWhisper = useCallback((content: string) => {
    setWhisperCount(prev => prev + 1)
  }, [])

  // クリックアウトサイドで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // 削除処理
  const handleDelete = async () => {
    if (!deletePassword) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/fragments/${fragment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // コードをコピー
  const copyCode = () => {
    navigator.clipboard.writeText(fragment.code)
    setToastMessage('コードをコピーしました')
    setShowToast(true)
    setMenuOpen(false)
  }

  // プロンプトをコピー
  const copyPrompt = () => {
    if (fragment.prompt) {
      navigator.clipboard.writeText(fragment.prompt)
      setToastMessage('プロンプトをコピーしました')
      setShowToast(true)
    }
    setMenuOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.08,
          ease: [0.19, 1, 0.22, 1]
        }}
        className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        {/* プレビュー領域 */}
        <div 
          className="relative w-full h-64 bg-gray-50 cursor-pointer overflow-hidden"
          onClick={() => setShowFullscreen(true)}
        >
          {/* サムネイル優先表示 */}
          {fragment.thumbnail_url && !imageError ? (
            <>
              {/* ローディングプレースホルダー */}
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-gray-50"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* サムネイル画像 */}
<motion.img
  src={`${fragment.thumbnail_url}?f_auto,q_auto`}
  alt={fragment.title}
  onLoad={handleImageLoad}
  onError={handleImageError}
  className="w-full h-full object-cover"
  initial={{ opacity: 0 }}
  animate={{ opacity: imageLoaded ? 1 : 0 }}
  transition={{ duration: 0.6 }}
/>
            </>
          ) : (
            /* Canvas フォールバック */
            <CodePreview 
              code={fragment.code} 
              fragmentId={fragment.id}
              className="w-full h-full"
            />
          )}

          {/* Fragment番号 */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
            {fragmentNumber}
          </div>
        </div>

        {/* カード情報 */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 flex-1 mr-2">{fragment.title}</h3>
            
            {/* 3点メニュー */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    削除
                  </button>
                  <button
                    onClick={copyCode}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    コードをコピー
                  </button>
                  {fragment.prompt && (
                    <button
                      onClick={copyPrompt}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      プロンプトをコピー
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 説明文 */}
          {fragment.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {fragment.description}
            </p>
          )}

          {/* プロンプト */}
          {fragment.prompt && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
              <span className="opacity-60">Prompt:</span> {fragment.prompt.slice(0, 100)}
              {fragment.prompt.length > 100 && '...'}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ResonanceButton 
                fragmentId={fragment.id}
                hasResonated={hasResonated}
                onResonate={handleResonate}
              />
              <WhisperButton
                fragmentId={fragment.id}
                whisperCount={whisperCount}
                onWhisper={handleWhisper}
              />
            </div>

            {/* 作成日時 */}
            <time className="text-xs text-gray-400">
              {new Date(fragment.created_at).toLocaleDateString('ja-JP')}
            </time>
          </div>
        </div>
      </motion.div>

      {/* フルスクリーンモーダル */}
      <FullscreenModal
        fragment={fragment}
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
      />

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Fragmentを削除</h3>
            <p className="text-sm text-gray-600 mb-4">
              削除するにはパスワードを入力してください
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="パスワード"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={!deletePassword || deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トースト */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  )
}