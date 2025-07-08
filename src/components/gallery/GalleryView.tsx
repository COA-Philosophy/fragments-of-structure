'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import FragmentCard from './FragmentCard'
import { Fragment } from '@/types/fragment'

export default function GalleryView() {
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchFragments()
  }, [])

  const fetchFragments = async () => {
    try {
      setLoading(true)
      
      // 公開されているFragmentのみを取得
      const { data, error } = await supabase
        .from('fragments')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFragments(data || [])
    } catch (error) {
      console.error('Error fetching fragments:', error)
      setError('作品の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // タイプでフィルタリング
  const filteredFragments = fragments.filter(fragment => {
    if (filterType === 'all') return true
    return fragment.type === filterType
  })

  // タイプ別の件数を計算
  const typeCounts = fragments.reduce((acc, fragment) => {
    acc[fragment.type] = (acc[fragment.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 animate-fade-in">
          作品を読み込んでいます...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-800 mb-4 animate-fade-in-up">
            Fragments of Structure
          </h1>
          <p className="text-sm text-gray-600 animate-fade-in-up animation-delay-120">
            構造のかけらたち
          </p>
        </div>

        {/* フィルターボタン */}
        <div className="flex justify-center mb-8 space-x-4 animate-fade-in-up animation-delay-240">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 transform hover:scale-105 ${
              filterType === 'all'
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            すべて ({fragments.length})
          </button>
          
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 transform hover:scale-105 ${
                filterType === type
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {type} ({count})
            </button>
          ))}
        </div>

        {/* 作品グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFragments.map((fragment, index) => (
            <div 
              key={fragment.id}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${360 + index * 120}ms` }}
            >
              <FragmentCard fragment={fragment} />
            </div>
          ))}
        </div>

        {/* 作品がない場合 */}
        {filteredFragments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {filterType === 'all' 
                ? '表示する作品がありません' 
                : `${filterType}タイプの作品はありません`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}