'use client'

import { useState } from 'react'
import Intro from '@/components/intro/Intro'
import GalleryView from '@/components/gallery/GalleryView'
import CreateButton from '@/components/create/CreateButton'
import CreateFragmentModal from '@/components/create/CreateFragmentModal'

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  return (
    <>
      {showIntro ? (
        <Intro onComplete={handleIntroComplete} />
      ) : (
        <>
          <main className="min-h-screen bg-[#f9f8f6]">
            {/* GalleryViewは自分でデータを取得するので、propsは不要 */}
            <GalleryView />
          </main>

          {/* 投稿ボタン */}
          <CreateButton onClick={() => setIsCreateModalOpen(true)} />

          {/* 投稿モーダル */}
          <CreateFragmentModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false)
              // モーダルを閉じた後、ページをリロードして新しい投稿を表示
              window.location.reload()
            }}
          />
        </>
      )}
    </>
  )
}