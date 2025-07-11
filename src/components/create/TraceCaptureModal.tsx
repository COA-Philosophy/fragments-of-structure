import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TraceCaptureModalProps {
  isOpen: boolean;
  onCapture: () => void;
  onSkip: () => void;
  isProcessing?: boolean;
}

export const TraceCaptureModal: React.FC<TraceCaptureModalProps> = ({
  isOpen,
  onCapture,
  onSkip,
  isProcessing = false
}) => {
  const [isHoveringCapture, setIsHoveringCapture] = useState(false);
  const [isHoveringSkip, setIsHoveringSkip] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          {/* 背景ブラー効果 */}
          <div 
            className="absolute inset-0 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          />
          
          {/* メインコンテンツ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="relative z-10 max-w-2xl mx-auto px-8 text-center"
          >
            {/* 詩的プロンプト - 日本語 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white mb-3 leading-relaxed"
              style={{
                fontFamily: "'Yu Mincho', 'YuMincho', '游明朝', serif",
                fontSize: '1.125rem',
                letterSpacing: '0.1em',
                fontWeight: 300
              }}
            >
              この構造がいちばん美しいと感じた瞬間に、
              <br />
              「痕跡を残す」を押してください。
            </motion.p>
            
            {/* 詩的プロンプト - 英語 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white mb-16 italic"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: '1rem',
                letterSpacing: '0.05em',
                opacity: 0.8
              }}
            >
              When you feel this structure at its most beautiful,
              <br />
              press "Leave a trace."
            </motion.p>

            {/* ボタングループ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* 痕跡を残すボタン */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHoveringCapture(true)}
                onHoverEnd={() => setIsHoveringCapture(false)}
                onClick={onCapture}
                disabled={isProcessing}
                className="relative px-12 py-4 rounded transition-all duration-300"
                style={{
                  backgroundColor: isProcessing ? '#6a6a6a' : '#d4af37',
                  color: '#1c1c1c',
                  minWidth: '200px',
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  fontWeight: 400
                }}
              >
                {isProcessing ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-[#1c1c1c] border-t-transparent rounded-full"
                    />
                    処理中...
                  </motion.span>
                ) : (
                  <>
                    <span className="relative z-10">
                      痕跡を残す
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHoveringCapture ? 0.6 : 0 }}
                      className="absolute inset-x-0 -bottom-6 text-xs"
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Leave a trace
                    </motion.span>
                  </>
                )}
              </motion.button>

              {/* スキップボタン */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHoveringSkip(true)}
                onHoverEnd={() => setIsHoveringSkip(false)}
                onClick={onSkip}
                disabled={isProcessing}
                className="relative px-12 py-4 rounded transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  minWidth: '200px',
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  fontWeight: 300
                }}
              >
                <span className="relative z-10">
                  スキップして投稿
                </span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHoveringSkip ? 0.6 : 0 }}
                  className="absolute inset-x-0 -bottom-6 text-xs"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  Skip and post
                </motion.span>
              </motion.button>
            </motion.div>

            {/* 追加説明（オプション） */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16 text-xs"
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: "'Satoshi', sans-serif",
                letterSpacing: '0.1em'
              }}
            >
              サムネイルはいつでもスキップできます
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};