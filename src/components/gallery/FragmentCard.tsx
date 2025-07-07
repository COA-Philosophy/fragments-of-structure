import React, { useState } from 'react';
import { Fragment } from '@/lib/supabase';

interface FragmentCardProps {
  fragment: Fragment;
  index: number;
}

const FragmentCard: React.FC<FragmentCardProps> = ({ fragment, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isResonating, setIsResonating] = useState(false);

  const handleResonate = () => {
    if (!isResonating) {
      setIsResonating(true);
      // アニメーション後に元に戻す
      setTimeout(() => setIsResonating(false), 1000);
    }
  };

  return (
    <div 
      className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      style={{
        animationDelay: `${index * 120}ms`,
      }}
    >
      {/* プレビューエリア */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Canvas プレビュー（Phase 3で実装） */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-20">{ }</div>
            <div className="text-xs">Preview Coming Soon</div>
          </div>
        </div>

        {/* 3点メニュー */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
          >
            <span className="block w-1 h-1 bg-gray-600 rounded-full mb-1"></span>
            <span className="block w-1 h-1 bg-gray-600 rounded-full mb-1"></span>
            <span className="block w-1 h-1 bg-gray-600 rounded-full"></span>
          </button>

          {/* メニュー */}
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors">
                削除
              </button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors">
                コードコピー
              </button>
              {fragment.prompt && (
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors">
                  プロンプトコピー
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fragment番号 */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs text-gray-500 tracking-wider">
          Fragment {String(fragment.display_number || index + 1).padStart(3, '0')}
        </span>
      </div>

      {/* タイトルと説明 */}
      <div className="px-4 pb-3">
        <h3 className="text-lg font-light mb-1 text-gray-800">
          {fragment.title}
        </h3>
        {fragment.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {fragment.description}
          </p>
        )}
      </div>

      {/* アクションエリア */}
      <div className="px-4 pb-4 flex justify-between items-center">
        <div className="flex-1">
          {/* 後でwhispers機能を実装 */}
        </div>

        {/* 共鳴ボタン */}
        <button
          onClick={handleResonate}
          className={`text-sm text-gray-400 hover:text-gray-600 transition-all duration-300 ${
            isResonating ? 'scale-110' : ''
          }`}
        >
          <span className={`inline-block ${isResonating ? 'animate-pulse' : ''}`}>
            共鳴
          </span>
        </button>
      </div>
    </div>
  );
};

export default FragmentCard;