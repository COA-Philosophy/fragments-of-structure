// 🔐 統一ユーザー識別システム
// GalleryView・ResonanceButton・API で同一のハッシュ生成を保証

/**
 * ユーザー識別用の一意ハッシュを生成
 * ブラウザフィンガープリント方式
 */
export function generateUserIpHash(): string {
  if (typeof window === 'undefined') return ''
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen.width,
    screen.height
  ].join('-')
  
  // Base64エンコード + 短縮ハッシュ（10文字）- 完全統一
  return btoa(fingerprint).substring(0, 10)
}

/**
 * デバッグ用: ハッシュ生成プロセスの詳細表示
 */
export function debugHashGeneration(): {
  userAgent: string
  language: string
  timeZone: string
  screenSize: string
  fingerprint: string
  hash: string
} {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      timeZone: '',
      screenSize: '',
      fingerprint: '',
      hash: ''
    }
  }

  const userAgent = navigator.userAgent
  const language = navigator.language
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const screenSize = `${screen.width}x${screen.height}`
  const fingerprint = [userAgent, language, timeZone, screen.width, screen.height].join('-')
  const hash = btoa(fingerprint).substring(0, 10)

  return {
    userAgent,
    language,
    timeZone,
    screenSize,
    fingerprint,
    hash
  }
}