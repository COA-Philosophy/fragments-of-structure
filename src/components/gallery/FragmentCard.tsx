'use client'

import { useState, useEffect, useRef } from 'react'
import CodePreview from '../canvas/CodePreview'
import { Fragment } from '@/types/fragment'

interface FragmentCardProps {
  fragment: Fragment
}

export default function FragmentCard({ fragment }: FragmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resonating, setResonating] = useState(false)
  const [hasResonated, setHasResonated] = useState(false)
  const [showResonateEffect, setShowResonateEffect] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  
  // コメント関連の状態
  const [showWhisperModal, setShowWhisperModal] = useState(false)
  const [whisperContent, setWhisperContent] = useState('')
  const [whispers, setWhispers] = useState<Array<{id: string, content: string, created_at: string}>>([])
  const [submittingWhisper, setSubmittingWhisper] = useState(false)
  const [whisperError, setWhisperError] = useState('')

  // タイプに応じた色を設定
  const typeColor = {
    canvas: 'bg-blue-100 text-blue-800',
    three: 'bg-purple-100 text-purple-800',
    glsl: 'bg-pink-100 text-pink-800',
    svg: 'bg-green-100 text-green-800',
    css: 'bg-yellow-100 text-yellow-800'
  }[fragment.type] || 'bg-gray-100 text-gray-800'

  // コメントを取得
  const fetchWhispers = async () => {
    try {
      const response = await fetch(`/api/fragments/${fragment.id}/whisper`)
      const data = await response.json()
      if (response.ok) {
        setWhispers(data.whispers || [])
      }
    } catch (error) {
      console.error('コメント取得エラー:', error)
    }
  }

  // メニューの外側クリックで閉じる
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

  // 初期表示時にコメントを取得
  useEffect(() => {
    fetchWhispers()
  }, [])

  // 共鳴処理
  const handleResonate = async () => {
    if (hasResonated || resonating) return

    setResonating(true)
    setShowResonateEffect(true)

    try {
      const response = await fetch(`/api/fragments/${fragment.id}/resonate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setHasResonated(true)
        // エフェクトを1秒後に消す
        setTimeout(() => setShowResonateEffect(false), 1000)
      } else if (response.status === 400) {
        // 既に共鳴している
        setHasResonated(true)
      }
    } catch (error) {
      console.error('共鳴エラー:', error)
    } finally {
      setResonating(false)
    }
  }

  // 削除処理
  const handleDelete = async () => {
    if (!deletePassword || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch(`/api/fragments/${fragment.id}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await response.json()

      if (response.ok) {
        // 削除成功 - ページをリロード
        window.location.reload()
      } else {
        setDeleteError(data.error || '削除に失敗しました')
      }
    } catch (error) {
      setDeleteError('削除処理中にエラーが発生しました')
    } finally {
      setDeleting(false)
    }
  }

  // コードコピー
  const handleCopyCode = () => {
    navigator.clipboard.writeText(fragment.code)
    setMenuOpen(false)
    // TODO: コピー成功の通知を表示
  }

  // プロンプトコピー
  const handleCopyPrompt = () => {
    if (fragment.prompt) {
      navigator.clipboard.writeText(fragment.prompt)
      setMenuOpen(false)
      // TODO: コピー成功の通知を表示
    }
  }

  // コメント投稿
  const handleWhisperSubmit = async () => {
    if (!whisperContent.trim() || submittingWhisper) return

    setSubmittingWhisper(true)
    setWhisperError('')

    try {
      const response = await fetch(`/api/fragments/${fragment.id}/whisper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: whisperContent.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        // 成功 - コメントを追加してモーダルを閉じる
        await fetchWhispers()
        setWhisperContent('')
        setShowWhisperModal(false)
      } else {
        setWhisperError(data.error || 'コメントの投稿に失敗しました')
      }
    } catch (error) {
      setWhisperError('コメント投稿中にエラーが発生しました')
    } finally {
      setSubmittingWhisper(false)
    }
  }

  // コメントモーダルを開く時にコメントを取得
  const openWhisperModal = () => {
    setShowWhisperModal(true)
    fetchWhispers()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
      {/* Fragment番号とタイプ表示 */}
      <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
        <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          Fragment {String(fragment.display_number).padStart(3, '0')}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${typeColor}`}>
          {fragment.type}
        </span>
      </div>

      {/* 3点メニュー */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {/* ドロップダウンメニュー */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
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
              onClick={handleCopyCode}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              コードをコピー
            </button>
            {fragment.prompt && (
              <button 
                onClick={handleCopyPrompt}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                プロンプトをコピー
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
        <CodePreview 
          code={fragment.code} 
          fragmentId={fragment.display_number.toString()}
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          {fragment.title}
        </h3>
        
        {fragment.description && (
          <p className="text-sm text-gray-600 mb-3">
            {fragment.description}
          </p>
        )}

        {fragment.prompt && (
          <p className="text-xs text-gray-500 italic">
            プロンプト: {fragment.prompt.substring(0, 50)}...
          </p>
        )}

        {/* 最新のコメント表示 */}
        {whispers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              {whispers.slice(0, 2).map((whisper) => (
                <p key={whisper.id} className="text-xs text-gray-600 italic">
                  「{whisper.content}」
                </p>
              ))}
              {whispers.length > 2 && (
                <p className="text-xs text-gray-400">
                  他{whispers.length - 2}件...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <button 
            onClick={handleResonate}
            disabled={hasResonated || resonating}
            className={`text-sm transition-all duration-200 hover:scale-105 flex items-center space-x-1 relative ${
              hasResonated 
                ? 'text-gray-400 cursor-default' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className={showResonateEffect ? 'animate-pulse' : ''}>
              {hasResonated ? '共鳴済' : resonating ? '共鳴中...' : '共鳴'}
            </span>
            {/* 共鳴エフェクト */}
            {showResonateEffect && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75 animate-ping"></span>
              </span>
            )}
          </button>
          
          <button 
            onClick={openWhisperModal}
            className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-105"
          >
            言葉を添える{whispers.length > 0 && ` (${whispers.length})`}
          </button>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Fragment {String(fragment.display_number).padStart(3, '0')} を削除
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              この操作は取り消せません。削除するにはパスワードを入力してください。
            </p>
            
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="パスワード"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
              disabled={deleting}
            />
            
            {deleteError && (
              <p className="text-red-500 text-sm mb-4">{deleteError}</p>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={deleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={!deletePassword || deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* コメントモーダル */}
      {showWhisperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              言葉を添える
            </h3>
            
            {/* 既存のコメント表示 */}
            {whispers.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">これまでの声：</p>
                {whispers.map((whisper) => (
                  <div key={whisper.id} className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                    {whisper.content}
                  </div>
                ))}
              </div>
            )}
            
            <textarea
              value={whisperContent}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setWhisperContent(e.target.value)
                }
              }}
              placeholder="30文字以内で言葉を添えてください"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
              rows={2}
              disabled={submittingWhisper}
            />
            
            <div className="flex justify-between items-center mt-2 mb-4">
              <span className="text-xs text-gray-500">
                {whisperContent.length}/30文字
              </span>
              {whisperError && (
                <span className="text-red-500 text-xs">{whisperError}</span>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWhisperModal(false)
                  setWhisperContent('')
                  setWhisperError('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={submittingWhisper}
              >
                キャンセル
              </button>
              <button
                onClick={handleWhisperSubmit}
                disabled={!whisperContent.trim() || submittingWhisper}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submittingWhisper ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}