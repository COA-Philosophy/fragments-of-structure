'use client'

import { useState } from 'react'

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
  const [showModal, setShowModal] = useState(false)
  const [whisperText, setWhisperText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!whisperText.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/fragments/${fragmentId}/whisper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: whisperText.trim() })
      })
      
      if (!response.ok) throw new Error('Failed to submit whisper')
      
      if (onWhisper) onWhisper(whisperText.trim())
      
      setWhisperText('')
      setShowModal(false)
    } catch (error) {
      console.error('Whisper submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      {/* Whisperボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="group relative opacity-60 hover:opacity-100 transition-opacity duration-300"
        aria-label="言葉を添える"
      >
        {/* 完全統一された吹き出しアイコン */}
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
        
        {/* ツールチップ - 右側配置 */}
        <div className="absolute bottom-full right-0 mb-2 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                        pointer-events-none z-10">
          <div className="bg-[#1c1c1c] text-[#f9f8f6] text-xs px-2 py-1 rounded 
                          whitespace-nowrap shadow-lg">
            言葉を添える{whisperCount > 0 && ` (${whisperCount})`}
          </div>
          <div className="w-2 h-2 bg-[#1c1c1c] transform rotate-45 absolute top-full right-3 -mt-1"></div>
        </div>
      </button>

      {/* Whisper入力モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f9f8f6] rounded-sm shadow-xl max-w-md w-full mx-4">
            {/* ヘッダー */}
            <div className="p-6 border-b border-[#3a3a3a]/10">
              <h3 className="text-lg font-light text-[#1c1c1c] mb-1">
                言葉を添える
              </h3>
              <p className="text-sm text-[#6a6a6a]">
                音のない声を、そっと残してください
              </p>
            </div>
            
            {/* 入力フォーム */}
            <div className="p-6">
              <textarea
                value={whisperText}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    setWhisperText(e.target.value)
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="30文字以内で..."
                maxLength={30}
                rows={3}
                className="w-full px-3 py-2 border border-[#3a3a3a]/20 rounded-sm 
                          focus:outline-none focus:border-[#3a3a3a]/40
                          text-[#1c1c1c] placeholder-[#6a6a6a] resize-none
                          transition-colors"
                autoFocus
              />
              
              {/* 文字数カウンター */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-[#6a6a6a]">
                  {whisperText.length}/30
                </span>
                
                {/* ボタン群 */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setWhisperText('')
                    }}
                    className="px-4 py-2 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                              transition-colors duration-200"
                  >
                    やめる
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!whisperText.trim() || isSubmitting}
                    className="px-4 py-2 text-sm bg-[#1c1c1c] text-[#f9f8f6] rounded-sm
                              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                              transition-opacity duration-200"
                  >
                    {isSubmitting ? '送信中...' : '囁く'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}