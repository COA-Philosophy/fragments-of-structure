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
      {/* Whisperボタン（ツールチップ削除） */}
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
        
        {/* ツールチップ削除（この部分を完全削除） */}
      </button>

      {/* Whisper入力モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f9f8f6] rounded-sm shadow-2xl max-w-md w-full border border-[#3a3a3a]/10">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-[#3a3a3a]/10">
              <h3 className="text-sm font-normal text-[#1c1c1c] whitespace-nowrap font-noto-serif">
                言葉を添える / <span className="font-lora">Add a whisper</span>
              </h3>
              <p className="text-xs text-[#6a6a6a] mt-1 whitespace-nowrap font-noto-serif">
                一言どうぞ / <span className="font-lora">Leave a message</span>
              </p>
            </div>
            
            {/* 入力フォーム */}
            <div className="px-6 py-5">
              <textarea
                value={whisperText}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    setWhisperText(e.target.value)
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="30 characters..."
                maxLength={30}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[#3a3a3a]/20 rounded-sm 
                          focus:outline-none focus:border-[#3a3a3a]/40
                          text-[#1c1c1c] placeholder-[#6a6a6a] resize-none
                          transition-colors duration-200"
                autoFocus
              />
              
              {/* 文字数カウンター */}
              <div className="flex justify-end mt-2">
                <span className="text-xs text-[#6a6a6a]">
                  {whisperText.length}/30
                </span>
              </div>
            </div>
            
            {/* ボタン群 */}
            <div className="flex border-t border-[#3a3a3a]/10">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setWhisperText('')
                }}
                className="flex-1 px-4 py-3 text-sm text-[#6a6a6a] hover:text-[#1c1c1c] 
                          hover:bg-[#3a3a3a]/5 transition-all duration-200
                          border-r border-[#3a3a3a]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!whisperText.trim() || isSubmitting}
                className="flex-1 px-4 py-3 text-sm bg-[#1c1c1c] text-[#f9f8f6]
                          hover:bg-[#3a3a3a] disabled:bg-[#6a6a6a] 
                          disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}