'use client';

import React, { useEffect, useState } from 'react';
import FragmentCard from './FragmentCard';
import { supabase, Fragment } from '@/lib/supabase';

const GalleryView: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchFragments();
  }, []);

  const fetchFragments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fragments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // display_numberを追加（もしない場合）
      const fragmentsWithNumber = (data || []).map((fragment, index) => ({
        ...fragment,
        display_number: fragment.display_number || index + 1
      }));

      setFragments(fragmentsWithNumber);
    } catch (err) {
      console.error('Error fetching fragments:', err);
      setError('Failed to load fragments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* ヘッダー */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-light tracking-wider text-gray-800">
            Fragments of Structure
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Not mine. Not yours. Just fragments left behind.
          </p>
        </div>
      </header>

      {/* ギャラリーセクション */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* セクションタイトル */}
        <div className="mb-8">
          <h2 className="text-xl font-light text-gray-700 mb-2">
            Recent Fragments
          </h2>
          <div className="w-16 h-px bg-gray-300"></div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        )}

        {/* ローディング状態 */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading fragments...</div>
          </div>
        )}

        {/* グリッドレイアウト */}
        {mounted && !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fragments.length > 0 ? (
              fragments.map((fragment, index) => (
                <div
                  key={fragment.id}
                  className="opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: `${index * 120}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <FragmentCard fragment={fragment} index={index} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No fragments found
              </div>
            )}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Fragments of Structure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GalleryView;