'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import FragmentCard from './FragmentCard'
import FullscreenModal from './FullscreenModal'
import { Fragment } from '@/types/fragment'
import { generateUserIpHash, debugHashGeneration } from '@/lib/hashUtils'

interface ExtendedFragment extends Fragment {
  resonance_count: number
  whispers: any[]
  whisper_count: number
  user_has_resonated: boolean
}

export default function GalleryView() {
  const [fragments, setFragments] = useState<ExtendedFragment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userIpHash, setUserIpHash] = useState<string>('')
  
  // 🎨 FullscreenModal管理
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState<number>(0)

  // ✨ デザインシステム: 段階的出現遅延
  const ANIMATION_DELAYS = {
    header: 0,
    subtitle: 120,
    counter: 240,
    cards: 360,
    cardStagger: 120
  }

  // 🎭 FullscreenModal制御関数
  const openFullscreen = useCallback((fragmentIndex: number) => {
    setCurrentFragmentIndex(fragmentIndex)
    setIsFullscreenOpen(true)
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false)
  }, [])

  const goToNext = useCallback(() => {
    if (currentFragmentIndex < fragments.length - 1) {
      setCurrentFragmentIndex(prev => prev + 1)
    }
  }, [currentFragmentIndex, fragments.length])

  const goToPrevious = useCallback(() => {
    if (currentFragmentIndex > 0) {
      setCurrentFragmentIndex(prev => prev - 1)
    }
  }, [currentFragmentIndex])

  // 🎯 現在のFragment取得
  const currentFragment = fragments[currentFragmentIndex]
  const hasNext = currentFragmentIndex < fragments.length - 1
  const hasPrevious = currentFragmentIndex > 0

  // 🎯 データ取得: 完全な関連データ + ユーザー状態
  const fetchFragments = useCallback(async () => {
    try {
      setLoading(true)
      
      // 🔐 統一ハッシュ生成
      const currentUserHash = generateUserIpHash()
      setUserIpHash(currentUserHash)
      
      // 🔍 デバッグ: ハッシュ生成プロセス表示
      const debugInfo = debugHashGeneration()
      console.log('🔐 [Step 2] Hash generation debug:', debugInfo)
      
      // Step 1: 基本Fragmentデータ取得
      const { data: fragmentsData, error: fragmentsError } = await supabase
        .from('fragments')
        .select('*')
        .order('created_at', { ascending: false })

      if (fragmentsError) throw fragmentsError
      if (!fragmentsData) {
        setFragments([])
        return
      }

      console.log(`📊 [Step 2] Processing ${fragmentsData.length} fragments with unified hash`)

      // Step 2: 並行処理による関連データ取得 + ユーザー状態照合
      const fragmentsWithCounts = await Promise.all(
        fragmentsData.map(async (fragment) => {
          // 共鳴データ取得（ip_hash含む）
          const { data: resonances } = await supabase
            .from('resonances')
            .select('id, ip_hash')
            .eq('fragment_id', fragment.id)

          // コメント取得
          const { data: whispers } = await supabase
            .from('whispers')
            .select('id, content, created_at')
            .eq('fragment_id', fragment.id)
            .order('created_at', { ascending: false })

          // 🎯 重要: ユーザー共鳴状態の正確な判定
          const hasUserResonated = resonances?.some(r => r.ip_hash === currentUserHash) || false

          console.log(`🔍 [Step 2] Fragment ${fragment.display_number} resonance check:`, {
            fragmentId: fragment.id,
            userHash: currentUserHash,
            resonanceHashes: resonances?.map(r => r.ip_hash) || [],
            hasUserResonated,
            totalResonances: resonances?.length || 0,
            hashMatches: resonances?.filter(r => r.ip_hash === currentUserHash).length || 0
          })

          return {
            ...fragment,
            resonance_count: resonances?.length || 0,
            whispers: whispers || [],
            whisper_count: whispers?.length || 0,
            user_has_resonated: hasUserResonated
          }
        })
      )

      console.log('📊 [Step 2] Fragments with complete data:', 
        fragmentsWithCounts.map(f => ({
          number: f.display_number,
          resonances: f.resonance_count,
          userResonated: f.user_has_resonated,
          whispers: f.whisper_count
        }))
      )
      
      console.log('🔐 [Step 2] Final User Hash:', currentUserHash)

      setFragments(fragmentsWithCounts)
    } catch (error) {
      console.error('❌ Error fetching fragments:', error)
      setError('作品の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // 🔄 リアルタイム更新ハンドラ
  const handleFragmentUpdate = useCallback((fragmentId: string) => {
    // 個別Fragment再取得（パフォーマンス最適化）
    const updateSingleFragment = async () => {
      try {
        // 🔐 統一ハッシュ生成
        const currentUserHash = generateUserIpHash()
        
        console.log(`🔄 [Step 2] Updating fragment ${fragmentId} with hash:`, currentUserHash)
        
        const { data: resonances } = await supabase
          .from('resonances')
          .select('id, ip_hash')
          .eq('fragment_id', fragmentId)

        const { data: whispers } = await supabase
          .from('whispers')
          .select('id, content, created_at')
          .eq('fragment_id', fragmentId)
          .order('created_at', { ascending: false })

        const hasUserResonated = resonances?.some(r => r.ip_hash === currentUserHash) || false

        // 🎯 ローカル状態更新（リアルタイム）
        setFragments(prev => prev.map(fragment => 
          fragment.id === fragmentId 
            ? {
                ...fragment,
                resonance_count: resonances?.length || 0,
                whispers: whispers || [],
                whisper_count: whispers?.length || 0,
                user_has_resonated: hasUserResonated
              }
            : fragment
        ))

        console.log('🔄 [Step 2] Fragment updated:', fragmentId, { 
          resonances: resonances?.length, 
          whispers: whispers?.length,
          userResonated: hasUserResonated,
          userHash: currentUserHash
        })
      } catch (error) {
        console.error('❌ Error updating fragment:', error)
      }
    }

    updateSingleFragment()
  }, [])

  useEffect(() => {
    fetchFragments()
  }, [fetchFragments])

  // 🎨 Loading State: ミニマル瞑想的デザイン
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* 禅的ローディング */}
          <div className="w-12 h-12 mx-auto">
            <div className="w-full h-full border-2 border-[#6a6a6a]/20 border-t-[#3a3a3a] rounded-full animate-spin"></div>
          </div>
          <p className="text-[#6a6a6a] text-sm font-light tracking-wide animate-pulse">
            Still becoming...
          </p>
        </div>
      </div>
    )
  }

  // 🚨 Error State: 詩的エラー表現
  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 opacity-30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-[#6a6a6a]">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-[#6a6a6a] text-sm mb-2">{error}</p>
          <button 
            onClick={() => fetchFragments()}
            className="text-xs text-[#3a3a3a] hover:text-[#1c1c1c] transition-colors duration-300 underline underline-offset-4"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* 🎨 Header: タイポグラフィ階層とアニメーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center space-y-6">
          {/* メインタイトル */}
          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: `${ANIMATION_DELAYS.header}ms` }}
          >
            <h1 className="text-4xl font-light text-[#1c1c1c] tracking-wide mb-2">
              Fragments of Structure
            </h1>
            <div className="w-12 h-px bg-[#3a3a3a] mx-auto opacity-30"></div>
          </div>

          {/* サブタイトル */}
          <p 
            className="text-sm text-[#6a6a6a] font-light tracking-wide animate-fade-in-up"
            style={{ animationDelay: `${ANIMATION_DELAYS.subtitle}ms` }}
          >
            構造のかけらたち
          </p>

          {/* 作品数カウンター */}
          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: `${ANIMATION_DELAYS.counter}ms` }}
          >
            <p className="text-xs text-[#6a6a6a] opacity-60">
              {fragments.length} の構造が見つかりました
            </p>
          </div>
        </div>
      </div>

      {/* 🔧 デバッグ情報: 開発環境限定 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
            <p className="font-medium mb-2">🔧 [Step 2] Debug Information - Unified Hash System</p>
            <p className="mb-1">User Hash: <code className="bg-blue-100 px-1 rounded">{userIpHash}</code></p>
            <p>
              Fragments: {fragments.map(f => 
                `${f.display_number}: ${f.resonance_count}共鳴${f.user_has_resonated ? '(✓済)' : '(未)'}, ${f.whisper_count}コメント`
              ).join(' | ')}
            </p>
          </div>
        </div>
      )}

      {/* 🎨 Gallery Grid: レスポンシブ + ステージングアニメーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {fragments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fragments.map((fragment, index) => (
              <div 
                key={fragment.id}
                className="animate-fade-in-up"
                style={{ 
                  animationDelay: `${ANIMATION_DELAYS.cards + index * ANIMATION_DELAYS.cardStagger}ms` 
                }}
              >
                <FragmentCard 
                  fragment={fragment} 
                  index={index}
                  onUpdate={() => handleFragmentUpdate(fragment.id)}
                  onOpenFullscreen={() => openFullscreen(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* 🎭 Empty State: 詩的な空状態 */
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-8 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full text-[#6a6a6a]">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <p className="text-[#6a6a6a] text-sm font-light mb-2">
              まだ構造のかけらはありません
            </p>
            <p className="text-xs text-[#6a6a6a]/60">
              最初の Fragment を投稿してみましょう
            </p>
          </div>
        )}
      </div>

      {/* 🎭 FullscreenModal: 統合ナビゲーション */}
      {currentFragment && (
        <FullscreenModal
          fragment={currentFragment}
          isOpen={isFullscreenOpen}
          onClose={closeFullscreen}
          onNext={hasNext ? goToNext : undefined}
          onPrevious={hasPrevious ? goToPrevious : undefined}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}

      {/* 🎨 カスタムアニメーション定義 */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(24px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  )
}