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

  // 🔍 検索・フィルター機能
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [filteredFragments, setFilteredFragments] = useState<ExtendedFragment[]>([])
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([])

  // ✨ デザインシステム: 段階的出現遅延
  const ANIMATION_DELAYS = {
    header: 0,
    subtitle: 120,
    counter: 240,
    cards: 360,
    cardStagger: 120
  }

  // 🏷️ 技術タグ選択/解除
  const toggleTechnology = useCallback((tech: string) => {
    setSelectedTechnologies(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }, [])

  // 🔄 フィルタークリア
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedTechnologies([])
  }, [])

  // 🎭 FullscreenModal制御関数
  const openFullscreen = useCallback((fragmentIndex: number) => {
    setCurrentFragmentIndex(fragmentIndex)
    setIsFullscreenOpen(true)
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false)
  }, [])

  const goToNext = useCallback(() => {
    if (currentFragmentIndex < filteredFragments.length - 1) {
      setCurrentFragmentIndex(prev => prev + 1)
    }
  }, [currentFragmentIndex, filteredFragments.length])

  const goToPrevious = useCallback(() => {
    if (currentFragmentIndex > 0) {
      setCurrentFragmentIndex(prev => prev - 1)
    }
  }, [currentFragmentIndex])

  // 🎯 現在のFragment取得
  const currentFragment = filteredFragments[currentFragmentIndex]
  const hasNext = currentFragmentIndex < filteredFragments.length - 1
  const hasPrevious = currentFragmentIndex > 0

  // 🔍 技術検出関数（FragmentCardと同じロジック）
  const detectTechnologies = useCallback((code: string): string[] => {
    const codeUpper = code.toUpperCase()
    const technologies: string[] = []

    if (codeUpper.includes('CANVAS') || codeUpper.includes('GETCONTEXT') || codeUpper.includes('2D')) {
      technologies.push('CANVAS')
    }
    if (codeUpper.includes('THREE') || codeUpper.includes('WEBGL') || codeUpper.includes('GL_')) {
      technologies.push('THREE')
    }
    if (codeUpper.includes('ADDEVENTLISTENER') || codeUpper.includes('ONCLICK') || codeUpper.includes('MOUSEMOVE')) {
      technologies.push('INTERACTIVE')
    }
    if (codeUpper.includes('GETELEMENTBYID') || codeUpper.includes('QUERYSELECTOR')) {
      technologies.push('HTML5')
    }
    if (codeUpper.includes('@KEYFRAMES') || codeUpper.includes('ANIMATION:')) {
      technologies.push('CSS')
    }
    if (codeUpper.includes('P5') || codeUpper.includes('SETUP()') || codeUpper.includes('DRAW()')) {
      technologies.push('P5.JS')
    }
    if (codeUpper.includes('L-SYSTEM') || codeUpper.includes('LINDENMAYER')) {
      technologies.push('L-SYSTEM')
    }
    if (codeUpper.includes('<SVG') || codeUpper.includes('CREATEELEMENT(\'SVG\'')) {
      technologies.push('SVG')
    }

    return technologies.length > 0 ? technologies : ['CANVAS']
  }, [])

  // 🔍 フィルター関数
  const filterFragments = useCallback(() => {
    let filtered = [...fragments]

    // 検索クエリでフィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(fragment => {
        const titleMatch = (fragment.title_primary || fragment.title || '').toLowerCase().includes(query) ||
                          (fragment.title_secondary || '').toLowerCase().includes(query)
        const descMatch = (fragment.description_primary || fragment.description || '').toLowerCase().includes(query) ||
                         (fragment.description_secondary || '').toLowerCase().includes(query)
        const promptMatch = (fragment.prompt || '').toLowerCase().includes(query)
        
        return titleMatch || descMatch || promptMatch
      })
    }

    // 技術タグでフィルター
    if (selectedTechnologies.length > 0) {
      filtered = filtered.filter(fragment => {
        const fragmentTechs = detectTechnologies(fragment.code)
        return selectedTechnologies.every(tech => fragmentTechs.includes(tech))
      })
    }

    setFilteredFragments(filtered)
    setCurrentFragmentIndex(0) // フィルター時はインデックスリセット
  }, [fragments, searchQuery, selectedTechnologies, detectTechnologies])

  // 🏷️ 利用可能な技術タグ抽出
  const extractAvailableTechnologies = useCallback(() => {
    const techSet = new Set<string>()
    fragments.forEach(fragment => {
      const techs = detectTechnologies(fragment.code)
      techs.forEach(tech => techSet.add(tech))
    })
    setAvailableTechnologies(Array.from(techSet).sort())
  }, [fragments, detectTechnologies])

  // 🔄 フィルター実行
  useEffect(() => {
    filterFragments()
  }, [filterFragments])

  // 🔄 技術タグ抽出実行
  useEffect(() => {
    extractAvailableTechnologies()
  }, [extractAvailableTechnologies])

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
        setFilteredFragments([])
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
      setFilteredFragments(fragmentsWithCounts) // 初期状態ではフィルターなし
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

          {/* 🔍 検索・フィルターシステム */}
          <div 
            className="animate-fade-in-up space-y-4"
            style={{ animationDelay: `${ANIMATION_DELAYS.counter}ms` }}
          >
            {/* 検索バー */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[#6a6a6a]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[#3a3a3a]/10 rounded-full focus:outline-none focus:border-[#3a3a3a]/30 focus:bg-white transition-all duration-300 text-[#1c1c1c] placeholder-[#6a6a6a]/60 text-sm font-light"
                  placeholder="作品を検索..."
                />
              </div>
            </div>

            {/* 技術タグフィルター */}
            {availableTechnologies.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                {availableTechnologies.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTechnology(tech)}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium tracking-wide rounded-full transition-all duration-200 border ${selectedTechnologies.includes(tech) ? 'bg-[#3a3a3a] text-white border-[#3a3a3a] shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200/50 hover:border-slate-300 hover:bg-slate-100'}`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}

            {/* フィルター状態表示 */}
            <div className="flex items-center justify-center gap-4 text-xs text-[#6a6a6a]/60">
              <span>
                {filteredFragments.length} の構造が見つかりました
                {searchQuery || selectedTechnologies.length > 0 ? (
                  <span className="ml-2">
                    ({fragments.length} 件中)
                  </span>
                ) : null}
              </span>
              
              {(searchQuery || selectedTechnologies.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-[#3a3a3a] hover:text-[#1c1c1c] transition-colors duration-200 underline underline-offset-2"
                >
                  フィルタークリア
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 デバッグ情報: 開発環境限定 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
            <p className="font-medium mb-2">🔧 [Step 2] Debug Information - Unified Hash System</p>
            <p className="mb-1">User Hash: <code className="bg-blue-100 px-1 rounded">{userIpHash}</code></p>
            <p className="mb-1">
              Search: <code className="bg-blue-100 px-1 rounded">"{searchQuery}"</code> | 
              Tech Filters: <code className="bg-blue-100 px-1 rounded">[{selectedTechnologies.join(', ')}]</code>
            </p>
            <p>
              Fragments: {filteredFragments.map(f => 
                `${f.display_number}: ${f.resonance_count}共鳴${f.user_has_resonated ? '(✓済)' : '(未)'}, ${f.whisper_count}コメント`
              ).join(' | ')}
            </p>
          </div>
        </div>
      )}

      {/* 🎨 Gallery Grid: レスポンシブ + ステージングアニメーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredFragments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFragments.map((fragment, index) => (
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
          /* 🎭 Empty State: 検索結果なし or 全体が空 */
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-8 opacity-20">
              {searchQuery || selectedTechnologies.length > 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full text-[#6a6a6a]">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="21 21l-4.35-4.35"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full text-[#6a6a6a]">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              )}
            </div>
            <p className="text-[#6a6a6a] text-sm font-light mb-2">
              {searchQuery || selectedTechnologies.length > 0 
                ? '条件に一致する構造が見つかりませんでした'
                : 'まだ構造のかけらはありません'
              }
            </p>
            <p className="text-xs text-[#6a6a6a]/60">
              {searchQuery || selectedTechnologies.length > 0 
                ? '検索条件を変更してみてください'
                : '最初の Fragment を投稿してみましょう'
              }
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