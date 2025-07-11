import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// 🆕 詩的肩書きパターン
const POETIC_TITLES = [
  'Fragment Weaver',    // 断片の織り手
  'Canvas Poet',        // キャンバスの詩人
  'Structure Dreamer',  // 構造の夢想家
  'Code Painter',       // コードの画家
  'Digital Sculptor',   // デジタルの彫刻家
  'Pixel Composer',     // ピクセルの作曲家
  'Algorithm Artist',   // アルゴリズムの芸術家
  'Interactive Sage',   // インタラクティブの賢者
  'Visual Poet',        // 視覚の詩人
  'Creative Coder'      // クリエイティブコーダー
] as const

// 🆕 カテゴリ自動判定
const detectCategory = (code: string): string => {
  const lowerCode = code.toLowerCase()
  
  // WebGL/Three.js検出
  if (lowerCode.includes('three.') || lowerCode.includes('webgl') || lowerCode.includes('shader')) {
    return 'webgl'
  }
  
  // Canvas検出
  if (lowerCode.includes('canvas') || lowerCode.includes('getcontext') || lowerCode.includes('p5.')) {
    return 'canvas'
  }
  
  // Interactive検出
  if (lowerCode.includes('addeventlistener') || lowerCode.includes('onclick') || lowerCode.includes('onmouse')) {
    return 'interactive'
  }
  
  // CSS Animation検出
  if (lowerCode.includes('@keyframes') || lowerCode.includes('animation:') || lowerCode.includes('transform:')) {
    return 'css'
  }
  
  // HTML/DOM検出
  if (lowerCode.includes('document.') || lowerCode.includes('queryselector') || lowerCode.includes('innerhtml')) {
    return 'html'
  }
  
  // 複数技術の組み合わせ検出
  const technologies = [
    lowerCode.includes('canvas'),
    lowerCode.includes('css'),
    lowerCode.includes('svg'),
    lowerCode.includes('three.'),
    lowerCode.includes('webgl')
  ].filter(Boolean).length
  
  if (technologies >= 2) {
    return 'hybrid'
  }
  
  // デフォルト
  return 'canvas'
}

// 🆕 創作者ニックネーム生成
const generateCreatorNickname = (userHash: string): string => {
  // ハッシュから数値を生成してタイトルを選択
  const hashNumber = userHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const titleIndex = hashNumber % POETIC_TITLES.length
  
  // サフィックス生成（ハッシュの最初の4文字を使用）
  const suffix = userHash.substring(0, 4).toUpperCase()
  
  return `${POETIC_TITLES[titleIndex]} #${suffix}`
}

// 🆕 バイリンガルバリデーション
const validateBilingualRequest = (body: any) => {
  const errors: string[] = []
  
  // 必須フィールド
  if (!body.title_primary && !body.title) {
    errors.push('Title is required')
  }
  if (!body.code) errors.push('Code is required')
  if (!body.password) errors.push('Password is required')
  
  // 言語設定のバリデーション（任意フィールド）
  if (body.primary_language && !['en', 'ja'].includes(body.primary_language)) {
    errors.push('Primary language must be "en" or "ja"')
  }
  
  // 長さ制限
  const title = body.title_primary || body.title
  if (title && title.length > 50) {
    errors.push('Title must be 50 characters or less')
  }
  if (body.title_secondary && body.title_secondary.length > 50) {
    errors.push('Secondary title must be 50 characters or less')
  }
  
  const description = body.description_primary || body.description
  if (description && description.length > 200) {
    errors.push('Description must be 200 characters or less')
  }
  if (body.description_secondary && body.description_secondary.length > 200) {
    errors.push('Secondary description must be 200 characters or less')
  }
  
  return errors
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')
  const category = searchParams.get('category') // 🆕 カテゴリフィルター
  const creator = searchParams.get('creator') // 🆕 創作者フィルター
  const published = searchParams.get('published')

  try {
    let query = supabase
      .from('fragments')
      .select('*')
      .order('created_at', { ascending: false })

    // 🆕 フィルタリング拡張
    if (type) {
      query = query.eq('type', type)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (creator) {
      query = query.eq('creator_nickname', creator)
    }
    
    // デフォルトは公開作品のみ表示
    if (published !== 'all') {
      query = query.eq('is_published', true)
    }

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ fragments: data || [] })
  } catch (error) {
    console.error('Failed to fetch fragments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fragments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const body = await request.json()
    console.log('🎨 Received fragment request:', {
      title_primary: body.title_primary,
      title: body.title,
      title_secondary: body.title_secondary,
      primary_language: body.primary_language,
      creator_hash: body.creator_hash
    })

    // 🆕 バイリンガルバリデーション
    const validationErrors = validateBilingualRequest(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }

    // 🔐 創作者情報生成
    const creatorHash = body.creator_hash || 'anonymous_user'
    const creatorNickname = generateCreatorNickname(creatorHash)
    
    // 🎯 カテゴリ自動判定
    const autoCategory = detectCategory(body.code)
    
    console.log('🎭 Generated creator info:', {
      creator_hash: creatorHash,
      creator_nickname: creatorNickname,
      auto_category: autoCategory
    })

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(body.password, 10)

    // 🆕 データ構造の準備（新旧対応）
    const title = body.title_primary || body.title
    const description = body.description_primary || body.description

    // 🆕 バイリンガル対応データベース保存
    const fragmentData = {
      // バイリンガルフィールド（新規）
      title_primary: body.title_primary || title,
      title_secondary: body.title_secondary || null,
      description_primary: body.description_primary || description,
      description_secondary: body.description_secondary || null,
      primary_language: body.primary_language || 'en',
      
      // 創作者情報（新規）
      creator_hash: creatorHash,
      creator_nickname: creatorNickname,
      
      // カテゴリ情報（新規）
      category: autoCategory,
      
      // 既存フィールド
      code: body.code,
      prompt: body.prompt || null,
      password_hash: passwordHash,
      thumbnail_url: body.thumbnail_url || null,
      type: body.type || autoCategory, // 既存互換性
      is_published: true,
      has_params: false,
      params_config: null,
      
      // 🔄 既存システム互換性フィールド
      title: title, // 既存コンポーネント用
      description: description || null // 既存コンポーネント用
    }

    console.log('💾 Saving fragment with data:', {
      title_primary: fragmentData.title_primary,
      title: fragmentData.title,
      creator_nickname: fragmentData.creator_nickname,
      category: fragmentData.category,
      primary_language: fragmentData.primary_language
    })

    // データベースに保存
    const { data, error } = await supabase
      .from('fragments')
      .insert([fragmentData])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    console.log('✅ Fragment created successfully:', {
      id: data.id,
      display_number: data.display_number,
      title_primary: data.title_primary,
      creator_nickname: data.creator_nickname
    })

    return NextResponse.json({ fragment: data }, { status: 201 })
  } catch (error) {
    console.error('Failed to create fragment:', error)
    return NextResponse.json(
      { error: 'Failed to create fragment' },
      { status: 500 }
    )
  }
}