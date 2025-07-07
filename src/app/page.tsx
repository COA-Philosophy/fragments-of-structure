'use client'
import { useState } from 'react'
import IntroAnimation from '@/components/intro/IntroAnimation'

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-satoshi font-light text-[var(--text-primary)] mb-4">
          Gallery Coming Soon...
        </h1>
        <p className="text-[var(--text-muted)] text-sm italic">
          The fragments await
        </p>
      </div>
    </main>
  )
}