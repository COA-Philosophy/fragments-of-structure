# Phase 3.1: 技術タグ選択状態UX改善 - Cursor実装指示

## 🎯 実装目標
DiscoveryBar.tsx の技術タグボタンの選択状態を明確化し、個別削除ボタンを追加する。

## 📁 対象ファイル
- `src/components/discovery/DiscoveryBar.tsx`

## 🔧 具体的変更内容

### 1. デスクトップ版技術タグボタン改善（119-132行目）

**変更前:**
```typescript
{availableTechnologies.map((tech) => (
  <button
    key={tech}
    onClick={() => onTechnologyToggle(tech)}
    className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-150 ${
      selectedTechnologies.includes(tech)
        ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
    }`}
  >
    {TECH_DISPLAY_NAMES[tech] || tech}
  </button>
))}
```

**変更後:**
```typescript
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
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTechnologyToggle(tech)
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-sm"
          title={`Remove ${tech} filter`}
        >
          ×
        </button>
      )}
    </motion.button>
  )
})}
```

### 2. モバイル版技術タグボタン改善（177-193行目）

**対象箇所を探す:**
```typescript
<div className="flex flex-wrap gap-2">
  {availableTechnologies.map((tech) => (
    <button
      key={tech}
      onClick={() => onTechnologyToggle(tech)}
      className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-150 ${
        selectedTechnologies.includes(tech)
          ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
    >
      {TECH_DISPLAY_NAMES[tech] || tech}
    </button>
  ))}
</div>
```

**この部分を以下に置き換える:**
```typescript
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTechnologyToggle(tech)
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-sm"
            title={`Remove ${tech} filter`}
          >
            ×
          </button>
        )}
      </motion.button>
    )
  })}
</div>
```

## ✅ 実装後確認事項

1. **コンパイルエラーなし**
2. **選択時の視覚表現**: 黒背景+ゴールドボーダー+✓マーク
3. **×ボタン表示**: デスクトップはホバー時、モバイルは常時
4. **×ボタン機能**: 個別フィルター削除動作
5. **アニメーション**: スムーズなホバー・タップ効果

## 🚀 実装手順
1. DiscoveryBar.tsxを開く
2. 指定箇所を正確に特定
3. コードを置き換える
4. 保存・動作確認
5. エラーがあれば報告

## 📝 Git保存
```bash
git add .
git commit -m "Phase 3.1: 技術タグ選択状態UX改善 - 明確な選択表示と個別削除ボタン追加"
```

実装完了後、動作確認結果を報告してください。