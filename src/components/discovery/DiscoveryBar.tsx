import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronDown, X, Grid, List } from 'lucide-react'

interface DiscoveryBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTechnologies: string[]
  onTechnologyToggle: (tech: string) => void
  onTechnologyClear: () => void
  sortBy: 'newest' | 'popular' | 'trending' | 'technology'
  onSortChange: (sort: 'newest' | 'popular' | 'trending' | 'technology') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  resultCount: number
  totalCount: number
  availableTechnologies: string[]
}

const SORT_OPTIONS = [
  { value: 'newest', label: '新着順', labelEn: 'Newest' },
  { value: 'popular', label: '人気順', labelEn: 'Popular' },
  { value: 'trending', label: 'トレンド', labelEn: 'Trending' },
  { value: 'technology', label: '技術順', labelEn: 'Technology' }
] as const

const TECH_DISPLAY_NAMES: Record<string, string> = {
  'CANVAS': 'Canvas',
  'THREE': 'Three.js',
  'INTERACTIVE': 'Interactive',
  'HTML5': 'HTML5',
  'CSS': 'CSS',
  'P5.JS': 'p5.js',
  'SVG': 'SVG',
  'L-SYSTEM': 'L-System'
}

export default function DiscoveryBar({
  searchQuery,
  onSearchChange,
  selectedTechnologies,
  onTechnologyToggle,
  onTechnologyClear,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
  availableTechnologies
}: DiscoveryBarProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  // アニメーション設定
  const springConfig = {
    type: "spring" as const,
    damping: 30,
    stiffness: 300
  }

  const expandAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: springConfig
  }

  // 技術フィルターの表示制御
  const hasActiveFilters = selectedTechnologies.length > 0
  const isFiltered = hasActiveFilters || searchQuery.trim() !== ''

  return (
    <div className="w-full bg-white border-b border-gray-100">
      {/* メイン検索バー */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 検索入力 */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="作品を検索..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* デスクトップ版コントロール */}
          <div className="hidden md:flex items-center space-x-4 ml-6">
            {/* ソートドロップダウン */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              >
                <span>新着順</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                  >
                    <div className="py-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onSortChange(option.value as any)
                            setIsSortDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                            sortBy === option.value
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500">{option.labelEn}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 表示切り替え */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-50">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-l-lg transition-colors duration-150 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-r-lg transition-colors duration-150 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* モバイル版フィルタートグル */}
          <div className="md:hidden ml-4">
            <button
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                hasActiveFilters || isMobileExpanded
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>絞り込む</span>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {selectedTechnologies.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 技術フィルターセクション（デスクトップ常時表示、モバイル展開式） */}
        <div className="hidden md:block pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {availableTechnologies.map((tech) => {
                const isSelected = selectedTechnologies.includes(tech)
                
                return (
                  <motion.button
                    key={tech}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTechnologyToggle(tech)}
                    className={`relative group px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#1c1c1c] text-white border-[#d4af37] shadow-md ring-1 ring-[#d4af37]/30'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {/* 技術名 */}
                    <span className="flex items-center space-x-1">
                      <span>{TECH_DISPLAY_NAMES[tech] || tech}</span>
                      {isSelected && (
                        <span className="text-[#d4af37]">✓</span>
                      )}
                    </span>
                    
                    {/* 個別削除ボタン */}
                    {isSelected && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          onTechnologyToggle(tech)
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                        title={`Remove ${tech} filter`}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            onTechnologyToggle(tech)
                          }
                        }}
                      >
                        ×
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={onTechnologyClear}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                <X className="h-3 w-3" />
                <span>クリア</span>
              </button>
            )}
          </div>
        </div>

        {/* モバイル展開セクション */}
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div
              {...expandAnimation}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 border-t border-gray-100">
                {/* モバイルソート */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    並び順
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onSortChange(option.value as any)}
                        className={`p-2 text-xs rounded-lg border transition-colors duration-150 ${
                          sortBy === option.value
                            ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* モバイル技術フィルター */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-700">
                      技術フィルター
                    </label>
                    {hasActiveFilters && (
                      <button
                        onClick={onTechnologyClear}
                        className="flex items-center space-x-1 text-xs text-gray-500"
                      >
                        <X className="h-3 w-3" />
                        <span>クリア</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTechnologies.map((tech) => {
                      const isSelected = selectedTechnologies.includes(tech)
                      
                      return (
                        <motion.button
                          key={tech}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onTechnologyToggle(tech)}
                          className={`relative group px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#1c1c1c] text-white border-[#d4af37] shadow-md'
                              : 'bg-slate-50 text-slate-500 border-slate-200 active:bg-slate-100'
                          }`}
                        >
                          {/* 技術名 */}
                          <span className="flex items-center space-x-1">
                            <span>{TECH_DISPLAY_NAMES[tech] || tech}</span>
                            {isSelected && (
                              <span className="text-[#d4af37]">✓</span>
                            )}
                          </span>
                          
                          {/* モバイル用個別削除ボタン */}
                          {isSelected && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                onTechnologyToggle(tech)
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-sm cursor-pointer"
                              title={`Remove ${tech} filter`}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  onTechnologyToggle(tech)
                                }
                              }}
                            >
                              ×
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* モバイル表示切り替え */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    表示形式
                  </label>
                  <div className="flex rounded-lg border border-gray-200 bg-gray-50">
                    <button
                      onClick={() => onViewModeChange('grid')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-l-lg transition-colors duration-150 ${
                        viewMode === 'grid'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                      <span className="text-xs">グリッド</span>
                    </button>
                    <button
                      onClick={() => onViewModeChange('list')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-r-lg transition-colors duration-150 ${
                        viewMode === 'list'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      <List className="h-4 w-4" />
                      <span className="text-xs">リスト</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 結果表示 */}
        <div className="pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {isFiltered ? (
                <>
                  <span className="font-medium text-gray-900">{resultCount}</span>
                  <span className="text-gray-500">/{totalCount}</span>
                  <span className="ml-1">の構造が見つかりました</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-900">{totalCount}</span>
                  <span className="ml-1">の構造が見つかりました</span>
                </>
              )}
            </span>

            {/* アクティブフィルター表示（モバイル） */}
            {hasActiveFilters && (
              <div className="md:hidden flex items-center space-x-2">
                <span className="text-xs text-gray-500">フィルター:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedTechnologies.slice(0, 2).map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
                    >
                      {TECH_DISPLAY_NAMES[tech] || tech}
                    </span>
                  ))}
                  {selectedTechnologies.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{selectedTechnologies.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アクティブフィルターバー */}
        {hasActiveFilters && (
          <div className="pb-4 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-600">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-[#1c1c1c] text-white text-xs rounded-md"
                      >
                        <span>{TECH_DISPLAY_NAMES[tech] || tech}</span>
                        <span
                          onClick={() => onTechnologyToggle(tech)}
                          className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center cursor-pointer ml-1 text-white text-xs leading-none"
                          title={`Remove ${tech} filter`}
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              onTechnologyToggle(tech)
                            }
                          }}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onTechnologyClear}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors duration-150"
                >
                  <X className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 背景オーバーレイ（ドロップダウン用） */}
      {isSortDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSortDropdownOpen(false)}
        />
      )}
    </div>
  )
}