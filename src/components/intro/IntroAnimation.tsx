'use client'

import { useEffect, useRef } from 'react'

interface IntroProps {
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  r: number
  dx: number
  dy: number
  opacity: number
  startX?: number
  startY?: number
}

export default function IntroAnimation({ onComplete }: IntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)
  const animationRef = useRef({
    isConverging: false,
    convergenceStartTime: null as number | null,
    convergenceComplete: false,
    lineAnimation: {
      active: false,
      position: 0,
      opacity: 0,
      complete: false,
      startTime: null as number | null
    },
    textImplosion: {
      active: false,
      startTime: null as number | null,
      complete: false
    },
    whiteOverlay: {
      opacity: 0,
      active: false
    }
  })

  // Easing functions
  const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  const easeInCubic = (t: number) => t * t * t

  useEffect(() => {
    // 既に実行中の場合はスキップ
    if (isTypingRef.current) return
    isTypingRef.current = true

    const text = 'Fragments   of   Structure'
    const container = document.getElementById('logo')
    let index = 0
    const delay = 130

    // 最初にコンテナをクリアして初期状態を設定
    if (container) {
      container.innerHTML = ''
      container.style.opacity = '1'
    }

    function typeWriter() {
      const currentContainer = document.getElementById('logo')
      if (!currentContainer) return

      if (index < text.length) {
        const char = text.charAt(index)
        const span = document.createElement('span')
        span.style.display = 'inline-block'
        span.style.transition = 'transform 0.2s ease'
        
        // F と S を太字に
        if (char === 'F' || char === 'S') {
          span.style.fontWeight = '500'
        }
        
        // ホバー効果のためのイベントリスナー
        span.addEventListener('mouseenter', () => {
          span.style.transform = 'translateY(-1px) rotateZ(0.5deg)'
        })
        span.addEventListener('mouseleave', () => {
          span.style.transform = ''
        })
        
        span.textContent = char === ' ' ? '\u00A0' : char
        currentContainer.appendChild(span)
        index++
        typewriterTimeoutRef.current = setTimeout(typeWriter, delay)
      } else {
        // 日本語タイトルを表示
        const jpTitle = document.getElementById('jpTitle')
        if (jpTitle) {
          jpTitle.style.opacity = '1'
          jpTitle.style.animation = 'fadeIn 1s ease forwards, sway 6s ease-in-out infinite'
        }
        
        setTimeout(() => {
          const tagline = document.getElementById('tagline')
          if (tagline) {
            tagline.style.opacity = '1'
            tagline.style.animation = 'fadeIn 1s ease forwards'
          }
        }, 2000)
      }
    }

    // Canvas setup
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w: number, h: number
    let particles: Particle[] = []
    let animationId: number

    function initCanvas() {
      if (!canvas) return
      
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      particles = Array.from({ length: 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.3
      }))
    }

    function drawParticles() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, w, h)
      const anim = animationRef.current

      // Draw particles
      for (let p of particles) {
        if (!anim.isConverging) {
          p.x += p.dx
          p.y += p.dy
          if (p.x < 0 || p.x > w) p.dx *= -1
          if (p.y < 0 || p.y > h) p.dy *= -1
        } else if (!anim.convergenceComplete && anim.convergenceStartTime !== null) {
          const elapsed = Date.now() - anim.convergenceStartTime
          const progress = Math.min(elapsed / 1500, 1)
          const eased = easeInOutQuad(progress)
          
          if (!p.startX) {
            p.startX = p.x
            p.startY = p.y
          }
          
          const centerX = w / 2
          const centerY = h / 2
          
          if (p.startX !== undefined && p.startY !== undefined) {
            p.x = p.startX + (centerX - p.startX) * eased
            p.y = p.startY + (centerY - p.startY) * eased
          }
          
          if (progress >= 1 && !anim.convergenceComplete) {
            anim.convergenceComplete = true
            setTimeout(() => {
              anim.lineAnimation.active = true
              anim.lineAnimation.startTime = performance.now()
            }, 300)
          }
        }
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        
        let contrastReduction = 1
        if (anim.lineAnimation.active && anim.lineAnimation.startTime !== null) {
          const lineElapsed = performance.now() - anim.lineAnimation.startTime
          const lineProgress = Math.min(lineElapsed / 350, 1)
          contrastReduction = 1 - (lineProgress * 0.5)
        }
        
        const particleOpacity = anim.whiteOverlay.active ? 
          p.opacity * 0.15 * (1 - anim.whiteOverlay.opacity) * contrastReduction : 
          p.opacity * 0.15 * contrastReduction
        ctx.fillStyle = `rgba(0,0,0,${particleOpacity})`
        ctx.fill()
      }
      
      // Draw horizontal line animation
      if (anim.lineAnimation.active && !anim.lineAnimation.complete && anim.lineAnimation.startTime !== null) {
        const duration = 350
        const elapsed = performance.now() - anim.lineAnimation.startTime
        const progress = Math.min(elapsed / duration, 1)
        
        if (!anim.textImplosion.active && progress > 0) {
          anim.textImplosion.active = true
          anim.textImplosion.startTime = performance.now()
          startTextImplosion()
        }
        
        const eased = easeOutExpo(progress)
        const centerX = w / 2
        const centerY = h / 2
        const maxWidth = w + 40
        const currentHalfWidth = (maxWidth / 2) * eased
        
        let lineOpacity
        if (progress < 0.1) {
          lineOpacity = progress * 10
        } else if (progress < 0.8) {
          lineOpacity = 1
        } else {
          lineOpacity = 1 - (progress - 0.8) * 5
        }
        
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(centerX - currentHalfWidth, centerY)
        ctx.lineTo(centerX + currentHalfWidth, centerY)
        ctx.strokeStyle = `rgba(80, 80, 80, ${0.3 * lineOpacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.restore()
        
        if (progress >= 1) {
          anim.lineAnimation.complete = true
          setTimeout(() => {
            anim.whiteOverlay.active = true
            startWhiteFade()
          }, 400)
        }
      }
      
      // Draw white overlay
      if (anim.whiteOverlay.active && anim.whiteOverlay.opacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${anim.whiteOverlay.opacity})`
        ctx.fillRect(0, 0, w, h)
      }
      
      animationId = requestAnimationFrame(drawParticles)
    }

    function startTextImplosion() {
      const duration = 600
      const textContainer = document.getElementById('textContainer')
      
      function animateImplosion() {
        if (!animationRef.current.textImplosion.startTime) return
        
        const elapsed = performance.now() - animationRef.current.textImplosion.startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeInCubic(progress)
        const scale = 1 - eased
        const opacity = 1 - eased
        
        if (textContainer) {
          textContainer.style.transform = `scale(${scale})`
          textContainer.style.opacity = opacity.toString()
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateImplosion)
        } else {
          animationRef.current.textImplosion.complete = true
        }
      }
      
      animateImplosion()
    }

    function startWhiteFade() {
      const duration = 1500
      const startTime = Date.now()
      
      function animateWhiteFade() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        animationRef.current.whiteOverlay.opacity = easeOutCubic(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animateWhiteFade)
        } else {
          setTimeout(() => {
            onComplete()
          }, 500)
        }
      }
      
      animateWhiteFade()
    }

    // Start animations
    typeWriter()
    initCanvas()
    drawParticles()

    // Start convergence after 6 seconds
    const convergenceTimeout = setTimeout(() => {
      animationRef.current.isConverging = true
      animationRef.current.convergenceStartTime = Date.now()
    }, 6000)

    // Handle resize
    const handleResize = () => initCanvas()
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      isTypingRef.current = false
      window.removeEventListener('resize', handleResize)
      clearTimeout(convergenceTimeout)
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current)
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(1px); }
        }
        
        #logo {
          font-family: 'Satoshi', system-ui, -apple-system, sans-serif;
          font-size: 2rem;
          font-weight: 300;
          letter-spacing: 0.05em;
        }
        
        #jpTitle {
          font-family: 'Zen Kurenaido', 'Yu Mincho', serif;
        }
        
        @media (max-width: 768px) {
          #logo {
            font-size: 1.5rem;
          }
        }
      `}</style>
      
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      
      <div
        id="textContainer"
        style={{ 
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          transformOrigin: 'center center',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          id="logo"
          style={{
            opacity: 1,
            whiteSpace: 'nowrap',
            marginBottom: '0.5rem'
          }}
        />
        <div
          id="jpTitle"
          style={{
            fontSize: '1rem',
            marginTop: '0.25rem',
            opacity: 0
          }}
        >
          構造のかけらたち
        </div>
        <div
          id="tagline"
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: '1.25rem',
            fontStyle: 'italic',
            opacity: 0
          }}
        >
          Not mine. Not yours. Just fragments left behind.
        </div>
      </div>
    </div>
  )
}