'use client'

import { useState, useEffect, useRef } from 'react'
import CodePreview from '../canvas/CodePreview'
import FullscreenModal from './FullscreenModal'
import WhisperButton from './WhisperButton'
import ResonanceButton from './ResonanceButton'
import Toast from './Toast'
import { Fragment } from '@/types/fragment'

interface FragmentCardProps {
  fragment: Fragment
}

export default function FragmentCard({ fragment }: FragmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  
  // Clear menu timeout
  const clearMenuTimeout = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
      menuTimeoutRef.current = null
    }
  }

  // Show toast notification
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Comments related state
  const [whispers, setWhispers] = useState<Array<{id: string, content: string, created_at: string}>>([])
  
  // Fullscreen display state
  const [showFullscreen, setShowFullscreen] = useState(false)

  // Type-based color settings
  const typeColor = {
    canvas: 'bg-blue-100 text-blue-800',
    three: 'bg-purple-100 text-purple-800',
    glsl: 'bg-pink-100 text-pink-800',
    svg: 'bg-green-100 text-green-800',
    css: 'bg-yellow-100 text-yellow-800'
  }[fragment.type] || 'bg-gray-100 text-gray-800'

  // Fetch comments
  const fetchWhispers = async () => {
    try {
      const response = await fetch(`/api/fragments/${fragment.id}/whisper`)
      const data = await response.json()
      if (response.ok) {
        setWhispers(data.whispers || [])
      }
    } catch (error) {
      console.error('Failed to fetch whispers:', error)
    }
  }

  // Close menu when clicking outside
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
      clearMenuTimeout()
    }
  }, [menuOpen])

  // Fetch comments on initial display
  useEffect(() => {
    fetchWhispers()
  }, [])

  // Delete process
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
        // Delete success - reload page
        window.location.reload()
      } else {
        setDeleteError(data.error || 'Failed to delete')
      }
    } catch (error) {
      setDeleteError('An error occurred during deletion')
    } finally {
      setDeleting(false)
    }
  }

  // Copy code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(fragment.code)
      setMenuOpen(false)
      showToastMessage('Code copied')
    } catch (error) {
      showToastMessage('Failed to copy')
    }
  }

  // Copy prompt
  const handleCopyPrompt = async () => {
    if (fragment.prompt) {
      try {
        await navigator.clipboard.writeText(fragment.prompt)
        setMenuOpen(false)
        showToastMessage('Prompt copied')
      } catch (error) {
        showToastMessage('Failed to copy')
      }
    }
  }

  // Whisper callback
  const handleWhisperSubmit = (content: string) => {
    fetchWhispers()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group">
      {/* Fragment number and type display */}
      <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
        <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          Fragment {String(fragment.display_number).padStart(3, '0')}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${typeColor}`}>
          {fragment.type}
        </span>
      </div>

      {/* 3-dot menu */}
      <div 
        className="absolute top-2 right-2 z-10" 
        ref={menuRef}
        onMouseEnter={() => {
          clearMenuTimeout()
        }}
        onMouseLeave={() => {
          // Close menu after 1 second delay
          menuTimeoutRef.current = setTimeout(() => {
            setMenuOpen(false)
          }, 1000) // 1000ms = 1 second (adjustable)
        }}
      >
        <button
          onClick={() => {
            clearMenuTimeout()
            setMenuOpen(!menuOpen)
          }}
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

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            <button 
              onClick={() => {
                clearMenuTimeout()
                setShowDeleteModal(true)
                setMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Delete
            </button>
            <button 
              onClick={async () => {
                clearMenuTimeout()
                await handleCopyCode()
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Copy code
            </button>
            {fragment.prompt && (
              <button 
                onClick={async () => {
                  clearMenuTimeout()
                  await handleCopyPrompt()
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Copy prompt
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div 
        className="relative h-64 bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowFullscreen(true)}
      >
        <CodePreview 
          code={fragment.code} 
          fragmentId={fragment.display_number.toString()}
          isFullscreen={false}
        />
        
        {/* Fullscreen icon (shown on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
          <div className="bg-white/90 rounded-full p-3">
            <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>
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
            Prompt: {fragment.prompt.substring(0, 50)}...
          </p>
        )}

        {/* Latest comments display */}
        {whispers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              {whispers.slice(0, 2).map((whisper) => (
                <p key={whisper.id} className="text-xs text-gray-600 italic">
                  "{whisper.content}"
                </p>
              ))}
              {whispers.length > 2 && (
                <p className="text-xs text-gray-400">
                  +{whispers.length - 2} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer - Using new button components */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          {/* ResonanceButton */}
          <ResonanceButton 
            fragmentId={fragment.id}
            hasResonated={false}
            onResonate={fetchWhispers}
          />
          
          {/* WhisperButton */}
          <WhisperButton 
            fragmentId={fragment.id}
            whisperCount={whispers.length}
            onWhisper={handleWhisperSubmit}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Fragment {String(fragment.display_number).padStart(3, '0')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Please enter your password to delete.
            </p>
            
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Password"
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
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!deletePassword || deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen modal */}
      <FullscreenModal
        fragment={fragment}
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
      />

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}