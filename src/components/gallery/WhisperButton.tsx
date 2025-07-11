'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhisperButtonProps {
  fragmentId: string
  onWhisper?: (content: string) => void
  whisperCount?: number
}

export default function WhisperButton({ 
  fragmentId, 
  onWhisper,
  whisperCount = 0
}: WhisperButtonProps) {
  // 🎯 状態管理: モーダル + フォーム
  const [showModal, setShowModal] = useState(false)
  const [whisperText, setWhisperText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🎨 アニメーション設定（型安全）
  const ANIMATIONS = {
    modal: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      },
      content: {
        initial: { opacity: 0, scale: 0.95, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 8 },
        transition: { 
          duration: 0.2, 
          ease: "easeOut" as const
        }
      }
    }
  }

  // 💬 Whisper送信処理
  const handleSubmit = async () => {
    const trimmedText = whisperText.trim()
    if (!trimmedText || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('💬 Submitting whisper:', { fragmentId, content: trimmedText })

      const response = await fetch(`/api/fragments/${fragmentId}/whisper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmedText })
      })
      
      console.log('💬 Whisper API response:', { status: response.status })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'コメントの投稿に失敗しました')
      }

      const result = await response.json()
      console.log('✅ Whisper success:', result)
      
      // ✅ 成功: 親コンポーネントに通知
      if (onWhisper) {
        onWhisper(trimmedText)
      }
      
      // 🎨 UI リセット
      setWhisperText('')
      setShowModal(false)
      
    } catch (error) {
      console.error('❌ Whisper submission failed:', error)
      setError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ⌨️ キーボードショートカット
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  // 🚪 モーダル閉じる
  const handleClose = () => {
    setShowModal(false)
    setWhisperText('')
    setError(null)
  }

  return (
    <>
      {/* 💬 Whisper トリガーボタン */}
      <div className="relative flex items-center gap-2">
        <motion.button
          onClick={() => setShowModal(true)}
          className="group relative opacity-60 hover:opacity-100 transition-all duration-300 ease-out
                     hover:scale-110"
          whileTap={{ scale: 0.95 }}
          aria-label="言葉を添える"
        >
          {/* 🎨 吹き出しアイコン: 統一デザイン */}
          <div className="w-5 h-5">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 300 300" 
              className="text-[#6a6a6a] group-hover:text-[#3a3a3a] transition-colors duration-300"
            >
              <path 
                d="M90 110h100c11 0 20 9 20 20v60c0 11-9 20-20 20h-40l-20 20v-20h-40c-11 0-20-9-20-20v-60c0-11 9-20 20-20z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.button>

        {/* 📊 コメント数表示: ミニマル設計 */}
        {whisperCount > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-light text-[#6a6a6a] tabular-nums"
          >
            {whisperCount}
          </motion.span>
        )}
      </div>

      {/* 🎭 Whisper入力モーダル */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            {...ANIMATIONS.modal.overlay}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {/* モーダルコンテンツ */}
            <motion.div
              {...ANIMATIONS.modal.content}
              className="bg-[#f9f8f6]/95 backdrop-blur-md rounded-lg shadow-2xl border border-[#3a3a3a]/10 
                        max-w-md w-full overflow-hidden"
            >
              {/* 🎨 ヘッダー: 詩的タイポグラフィ */}
              <div className="px-6 py-5 border-b border-[#3a3a3a]/10">
                <h3 className="text-sm font-light text-[#1c1c1c] mb-1">
                  言葉を添える / <span className="font-light italic">Add a whisper</span>
                </h3>
                <p className="text-xs text-[#6a6a6a] leading-relaxed">
                  一言どうぞ / <span className="italic">Leave a message</span>
                </p>
              </div>
              
              {/* 📝 入力フォーム */}
              <div className="px-6 py-5 space-y-4">
                {/* エラー表示 */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-xs text-red-600">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* テキスト入力 */}
                <div className="space-y-2">
                  <textarea
                    value={whisperText}
                    onChange={(e) => {
                      if (e.target.value.length <= 30) {
                        setWhisperText(e.target.value)
                        setError(null)
                      }
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="30 characters..."
                    maxLength={30}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 border border-[#3a3a3a]/20 rounded-lg 
                              focus:outline-none focus:border-[#3a3a3a]/40 focus:bg-white/80
                              text-[#1c1c1c] placeholder-[#6a6a6a]/60 resize-none
                              transition-all duration-200 leading-relaxed"
                    autoFocus
                    disabled={isSubmitting}
                  />
                  
                  {/* 🔢 文字数カウンター */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs transition-colors duration-200 ${
                      whisperText.length > 25 
                        ? 'text-amber-600' 
                        : whisperText.length > 20 
                          ? 'text-[#6a6a6a]' 
                          : 'text-[#6a6a6a]/60'
                    }`}>
                      {whisperText.length}/30
                    </span>
                    
                    {whisperText.length > 0 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#6a6a6a]/60"
                      >
                        Enter で送信
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 🎯 アクションボタン */}
              <div className="flex border-t border-[#3a3a3a]/10">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                            hover:bg-[#3a3a3a]/5 transition-all duration-200
                            border-r border-[#3a3a3a]/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!whisperText.trim() || isSubmitting}
                  className="flex-1 px-4 py-4 text-sm bg-[#1c1c1c] text-[#f9f8f6]
                            hover:bg-[#3a3a3a] disabled:bg-[#6a6a6a] 
                            disabled:cursor-not-allowed transition-all duration-200
                            font-light"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}