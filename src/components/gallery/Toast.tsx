'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, isVisible, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
      <div className="bg-[#1c1c1c] text-[#f9f8f6] px-4 py-2 rounded-sm shadow-lg text-sm">
        {message}
      </div>
    </div>
  )
}