'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import CodePreview from '../canvas/CodePreview'

interface CreateFragmentModalProps {
  isOpen: boolean
  onClose: () => void
}

type FragmentType = 'canvas' | 'three' | 'glsl' | 'svg' | 'css'

export default function CreateFragmentModal({ isOpen, onClose }: CreateFragmentModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    type: 'canvas' as FragmentType,
    prompt: '',
    description: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSubmit = async () => {
    if (!formData.title || !formData.code || !formData.password) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/fragments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onClose()
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to create fragment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value })
    // 簡易的なコード解析でtypeを自動判定
    if (value.includes('THREE.') || value.includes('new THREE')) {
      setFormData(prev => ({ ...prev, type: 'three' }))
    } else if (value.includes('gl_FragCoord') || value.includes('gl_Position')) {
      setFormData(prev => ({ ...prev, type: 'glsl' }))
    } else if (value.includes('<svg') || value.includes('createElementNS')) {
      setFormData(prev => ({ ...prev, type: 'svg' }))
    } else if (value.includes('@keyframes') || value.includes('animation:')) {
      setFormData(prev => ({ ...prev, type: 'css' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f9f8f6] rounded-sm"
          >
            {/* ヘッダー */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-8 bg-[#f9f8f6] border-b border-[#3a3a3a]/10">
              <h2 className="text-2xl font-light tracking-wide text-[#1c1c1c]">
                構造を残す
              </h2>
              <button
                onClick={onClose}
                className="p-2 transition-opacity hover:opacity-60"
              >
                <X size={24} className="text-[#6a6a6a]" />
              </button>
            </div>

            <div className="p-8">
              {/* Step 1: 基本情報 */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* タイトル */}
                  <div>
                    <label className="block mb-2 text-sm text-[#6a6a6a]">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={50}
                      placeholder="作品に名前をつけてください"
                      className="w-full px-4 py-3 bg-white border border-[#3a3a3a]/20 rounded-sm focus:outline-none focus:border-[#3a3a3a]/40 transition-colors"
                    />
                    <p className="mt-1 text-xs text-[#6a6a6a]">
                      {formData.title.length}/50
                    </p>
                  </div>

                  {/* タイプ選択 */}
                  <div>
                    <label className="block mb-2 text-sm text-[#6a6a6a]">
                      表現形式
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['canvas', 'three', 'glsl', 'svg', 'css'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`px-4 py-2 text-sm rounded-sm transition-all ${
                            formData.type === type
                              ? 'bg-[#1c1c1c] text-[#f9f8f6]'
                              : 'bg-white border border-[#3a3a3a]/20 text-[#1c1c1c] hover:border-[#3a3a3a]/40'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 説明文 */}
                  <div>
                    <label className="block mb-2 text-sm text-[#6a6a6a]">
                      説明文（任意）
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={200}
                      rows={3}
                      placeholder="作品について一言"
                      className="w-full px-4 py-3 bg-white border border-[#3a3a3a]/20 rounded-sm focus:outline-none focus:border-[#3a3a3a]/40 transition-colors resize-none"
                    />
                    <p className="mt-1 text-xs text-[#6a6a6a]">
                      {formData.description.length}/200
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.title}
                    className="w-full py-4 bg-[#1c1c1c] text-[#f9f8f6] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    次へ：コードを書く
                  </button>
                </motion.div>
              )}

              {/* Step 2: コード入力 */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-[#1c1c1c]">コード</h3>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-4 py-2 text-sm border border-[#3a3a3a]/20 rounded-sm hover:border-[#3a3a3a]/40 transition-colors"
                    >
                      {showPreview ? 'エディタに戻る' : 'プレビューを見る'}
                    </button>
                  </div>

                  {!showPreview ? (
                    <>
                      <textarea
                        ref={codeTextareaRef}
                        value={formData.code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="// あなたの構造をここに"
                        className="w-full h-96 px-4 py-3 font-mono text-sm bg-white border border-[#3a3a3a]/20 rounded-sm focus:outline-none focus:border-[#3a3a3a]/40 transition-colors resize-none"
                        spellCheck={false}
                      />

                      {/* プロンプト（任意） */}
                      <div>
                        <label className="block mb-2 text-sm text-[#6a6a6a]">
                          プロンプト（AIで生成した場合）
                        </label>
                        <textarea
                          value={formData.prompt}
                          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                          rows={2}
                          placeholder="使用したプロンプトがあれば"
                          className="w-full px-4 py-3 bg-white border border-[#3a3a3a]/20 rounded-sm focus:outline-none focus:border-[#3a3a3a]/40 transition-colors resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="h-96 bg-black rounded-sm overflow-hidden">
                      <CodePreview code={formData.code} />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border border-[#3a3a3a]/20 rounded-sm hover:border-[#3a3a3a]/40 transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!formData.code}
                      className="flex-1 py-4 bg-[#1c1c1c] text-[#f9f8f6] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      次へ：最終確認
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: パスワード設定と確認 */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="p-8 bg-white rounded-sm">
                    <h3 className="mb-6 text-lg text-[#1c1c1c]">投稿内容の確認</h3>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="text-[#6a6a6a]">タイトル：</span>
                        <span className="text-[#1c1c1c]">{formData.title}</span>
                      </div>
                      <div>
                        <span className="text-[#6a6a6a]">タイプ：</span>
                        <span className="text-[#1c1c1c]">{formData.type}</span>
                      </div>
                      {formData.description && (
                        <div>
                          <span className="text-[#6a6a6a]">説明：</span>
                          <span className="text-[#1c1c1c]">{formData.description}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[#6a6a6a]">コード：</span>
                        <span className="text-[#1c1c1c]">{formData.code.length}文字</span>
                      </div>
                    </div>
                  </div>

                  {/* 削除パスワード */}
                  <div>
                    <label className="block mb-2 text-sm text-[#6a6a6a]">
                      削除用パスワード
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="後で削除する際に必要です"
                      className="w-full px-4 py-3 bg-white border border-[#3a3a3a]/20 rounded-sm focus:outline-none focus:border-[#3a3a3a]/40 transition-colors"
                    />
                    <p className="mt-2 text-xs text-[#6a6a6a]">
                      このパスワードは復元できません。必ず覚えておいてください。
                    </p>
                  </div>

                  <div className="pt-8 text-center">
                    <p className="mb-8 text-sm italic text-[#6a6a6a]">
                      Not mine. Not yours. Just fragments left behind.
                    </p>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-4 border border-[#3a3a3a]/20 rounded-sm hover:border-[#3a3a3a]/40 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!formData.password || isSubmitting}
                        className="flex-1 py-4 bg-[#1c1c1c] text-[#f9f8f6] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                      >
                        {isSubmitting ? '投稿中...' : '構造を残す'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}