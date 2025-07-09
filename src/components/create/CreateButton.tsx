'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CreateButtonProps {
  onClick: () => void
}

export default function CreateButton({ onClick }: CreateButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group fixed bottom-8 right-8 z-40 px-6 py-3 bg-[#1c1c1c] text-[#f9f8f6] rounded-sm shadow-lg hover:opacity-90 transition-opacity"
    >
      <span className="flex items-center gap-3">
        {/* アニメーション付き+アイコン */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-80"
        >
          <defs>
            <style>
              {`
                .plus-vertical {
                  stroke: #ffffff;
                  stroke-width: 2;
                  stroke-linecap: round;
                  fill: none;
                  stroke-dasharray: 14;
                  stroke-dashoffset: ${isHovered ? '0' : '14'};
                  transition: stroke-dashoffset 0.8s ease-out;
                }
                .plus-horizontal {
                  stroke: #ffffff;
                  stroke-width: 2;
                  stroke-linecap: round;
                  fill: none;
                  stroke-dasharray: 14;
                  stroke-dashoffset: ${isHovered ? '0' : '14'};
                  transition: stroke-dashoffset 0.8s ease-out 0.2s;
                }
              `}
            </style>
          </defs>
          
          {/* 縦線 */}
          <line 
            x1="10" 
            y1="3" 
            x2="10" 
            y2="17" 
            className="plus-vertical"
          />
          
          {/* 横線 */}
          <line 
            x1="3" 
            y1="10" 
            x2="17" 
            y2="10" 
            className="plus-horizontal"
          />
        </svg>
        
        <span className="font-light tracking-wide">Create Fragment</span>
      </span>

      {/* ホバー時のツールチップ */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none z-10">
        <div className="bg-[#f9f8f6] text-[#1c1c1c] text-xs px-2 py-1 rounded 
                        whitespace-nowrap shadow-lg">
          Create Fragment / 構造を残す
        </div>
        <div className="w-2 h-2 bg-[#f9f8f6] transform rotate-45 mx-auto -mt-1"></div>
      </div>
    </motion.button>
  )
}