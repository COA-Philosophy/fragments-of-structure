'use client'

import { useState } from 'react'
import CodePreview from '../canvas/CodePreview'
import { Fragment } from '@/types/fragment'

interface FragmentCardProps {
  fragment: Fragment
}

export default function FragmentCard({ fragment }: FragmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  // タイプに応じた色を設定
  const typeColor = {
    canvas: 'bg-blue-100 text-blue-800',
    three: 'bg-purple-100 text-purple-800',
    glsl: 'bg-pink-100 text-pink-800',
    svg: 'bg-green-100 text-green-800',
    css: 'bg-yellow-100 text-yellow-800'
  }[fragment.type] || 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
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
      <div className="absolute top-2 right-2 z-10">
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
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              削除
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              コードをコピー
            </button>
            {fragment.prompt && (
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1">
            <span>共鳴</span>
          </button>
          
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            言葉を添える
          </button>
        </div>
      </div>
    </div>
  )
}