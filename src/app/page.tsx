'use client'

import { useState } from 'react'
import Intro from '@/components/intro/Intro'
import GalleryView from '@/components/gallery/GalleryView'
import CreateButton from '@/components/create/CreateButton'
import { CreateFragmentModal } from '@/components/create/CreateFragmentModal'

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // ギャラリー更新用

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  const handleFragmentCreated = () => {
    // ページリロードの代わりにギャラリーを更新
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      {showIntro ? (
        <Intro onComplete={handleIntroComplete} />
      ) : (
        <>
          <main className="min-h-screen bg-[#f9f8f6]">
            {/* refreshKeyでギャラリーを更新 */}
            <GalleryView key={refreshKey} />
          </main>

          {/* 投稿ボタン */}
          <CreateButton onClick={() => setIsCreateModalOpen(true)} />

          {/* 投稿モーダル */}
          <CreateFragmentModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleFragmentCreated} // 成功時にギャラリー更新
          />
        </>
      )}
    </>
  )
}