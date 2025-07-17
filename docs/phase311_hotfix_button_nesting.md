# Phase 3.1.1: ボタンネスト修正 - Cursor緊急修正指示

## 🚨 修正対象エラー
```
button cannot be a descendant of a button
```

## 📁 対象ファイル
- `src/components/discovery/DiscoveryBar.tsx`

## 🔧 修正内容

### 1. デスクトップ版 - ×ボタンをdivに変更

**修正箇所を探す:**
```typescript
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
```

**この部分を以下に置き換える:**
```typescript
{/* 個別削除ボタン */}
{isSelected && (
  <div
    onClick={(e) => {
      e.stopPropagation()
      onTechnologyToggle(tech)
    }}
    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
    title={`Remove ${tech} filter`}
  >
    ×
  </div>
)}
```

### 2. モバイル版 - ×ボタンをdivに変更

**修正箇所を探す:**
```typescript
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
```

**この部分を以下に置き換える:**
```typescript
{/* モバイル用個別削除ボタン */}
{isSelected && (
  <div
    onClick={(e) => {
      e.stopPropagation()
      onTechnologyToggle(tech)
    }}
    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shadow-sm cursor-pointer"
    title={`Remove ${tech} filter`}
  >
    ×
  </div>
)}
```

## ✅ 修正のポイント
1. **button → div**: ネスト問題解決
2. **cursor-pointer追加**: クリック可能性を視覚化
3. **onClick動作**: 完全に同じ動作を維持

## 🚀 実行後確認
1. **コンソールエラー**: 消えることを確認
2. **×ボタン動作**: 変更なく正常動作
3. **見た目**: 変更なし

## 📝 Git保存
```bash
git add .
git commit -m "Phase 3.1.1: HTMLバリデーション修正 - ×ボタンのネスト問題解決"
```