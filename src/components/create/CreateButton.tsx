'use client'

import { motion } from 'framer-motion'

interface CreateButtonProps {
  onClick: () => void
}

export default function CreateButton({ onClick }: CreateButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 px-6 py-3 bg-[#1c1c1c] text-[#f9f8f6] rounded-sm shadow-lg hover:opacity-90 transition-opacity"
    >
      <span className="flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-80"
        >
          <path
            d="M10 4V16M4 10H16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-light tracking-wide">構造を残す</span>
      </span>
    </motion.button>
  )
}