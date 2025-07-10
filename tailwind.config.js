/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#f9f8f6',
        'text-primary': '#1c1c1c',
        'text-muted': '#6a6a6a',
        'line-color': '#3a3a3a',
        'accent-gold': '#d4af37',
      },
      fontFamily: {
        // 英文ロゴ・Fragment番号用（Satoshi）
        'satoshi-light': ['Satoshi', 'sans-serif'],
        'satoshi-medium': ['Satoshi', 'sans-serif'],
        // 和文タイトル用
        'zen-kurenaido': ['Zen Kurenaido', 'serif'],
        // 詩的プロンプト用（游明朝代替）
        'yu-mincho': ['Noto Serif JP', 'serif'],
        // 英語本文用
        'lora': ['Lora', 'serif'],
        // 日本語本文用
        'noto-serif': ['Noto Serif JP', 'serif'],
      },
      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'slideInFromBottom': 'slideInFromBottom 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInFromBottom: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}