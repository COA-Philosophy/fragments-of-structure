// src/components/intro/IntroAnimation.tsx
// Fragments of Structure - イントロアニメーション（ギャラリー移行対応）

'use client';

import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete?: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; opacity: number }>>([]);

  useEffect(() => {
    // 粒子を初期化
    const initialParticles = [];
    for (let i = 0; i < 50; i++) {
      initialParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
    setParticles(initialParticles);

    // アニメーションシーケンス
    const timers = [
      setTimeout(() => setStep(1), 500),   // タイプライター開始
      setTimeout(() => setStep(2), 3000),  // 粒子収束
      setTimeout(() => setStep(3), 5000),  // 水平線形成
      setTimeout(() => setStep(4), 6500),  // テキスト内爆
      setTimeout(() => setStep(5), 7500),  // 白フェード
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 8500)  // ギャラリー移行
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [onComplete]);

  // 粒子アニメーション
  useEffect(() => {
    if (step < 2) return;

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x;
        let newY = particle.y;
        
        if (step === 2) {
          // 収束
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          newX += (centerX - particle.x) * 0.05;
          newY += (centerY - particle.y) * 0.05;
        } else if (step === 3) {
          // 水平線形成
          const targetY = window.innerHeight / 2;
          newY += (targetY - particle.y) * 0.1;
          newX += particle.vx;
        }

        return {
          ...particle,
          x: newX,
          y: newY
        };
      }));
    };

    const interval = setInterval(animateParticles, 16);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className={`fixed inset-0 z-50 bg-[#f9f8f6] flex items-center justify-center transition-opacity duration-1000 ${
      step === 5 ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* 粒子 */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute w-1 h-1 bg-[#1c1c1c] rounded-full transition-opacity duration-500"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: step >= 4 ? 0 : particle.opacity
          }}
        />
      ))}

      {/* メインテキスト */}
      <div className="text-center">
        {/* 英文タイトル */}
        <h1 className={`text-4xl md:text-6xl font-light text-[#1c1c1c] tracking-wider mb-4 transition-all duration-1000 ${
          step >= 4 ? 'opacity-0 scale-150' : 'opacity-100 scale-100'
        }`}>
          {step >= 1 && (
            <span className="inline-block">
              {'Fragments of Structure'.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          )}
        </h1>

        {/* 水平線 */}
        <div className={`w-0 h-px bg-[#3a3a3a] mx-auto mb-4 transition-all duration-1000 ${
          step >= 3 ? 'w-24' : 'w-0'
        } ${step >= 4 ? 'opacity-0' : 'opacity-100'}`} />

        {/* 和文サブタイトル */}
        <p className={`text-[#6a6a6a] text-sm md:text-base tracking-wide zen-kurenaido transition-all duration-1000 ${
          step >= 1 ? 'opacity-100' : 'opacity-0'
        } ${step >= 4 ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}>
          構造のかけらたち
        </p>

        {/* サブテキスト */}
        <div className={`mt-8 text-[#6a6a6a] text-xs tracking-wider transition-all duration-1000 ${
          step >= 2 ? 'opacity-100' : 'opacity-0'
        } ${step >= 4 ? 'opacity-0' : 'opacity-100'}`}>
          Not mine. Not yours. Just fragments left behind.
        </div>
      </div>

      {/* 進行インジケーター */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < step ? 'bg-[#1c1c1c]' : 'bg-[#6a6a6a] opacity-30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;