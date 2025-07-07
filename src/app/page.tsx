'use client';

import React, { useState } from 'react';
import Intro from '@/components/intro/Intro';
import GalleryView from '@/components/gallery/GalleryView';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <main>
      {showIntro ? (
        <Intro onComplete={handleIntroComplete} />
      ) : (
        <GalleryView />
      )}
    </main>
  );
}