import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')
  const published = searchParams.get('published')

  try {
    let query = supabase
      .from('fragments')
      .select('*')
      .order('created_at', { ascending: false })

    // フィルタリング
    if (type) {
      query = query.eq('type', type)
    }
    
    // デフォルトは公開作品のみ表示（管理者以外）
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
    const { title, code, prompt, description, password, type = 'canvas' } = body

    // バリデーション
    if (!title || !code || !password) {
      return NextResponse.json(
        { error: 'Title, code, and password are required' },
        { status: 400 }
      )
    }

    if (title.length > 50) {
      return NextResponse.json(
        { error: 'Title must be 50 characters or less' },
        { status: 400 }
      )
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { error: 'Description must be 200 characters or less' },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(password, 10)

    // データベースに保存
    const { data, error } = await supabase
      .from('fragments')
      .insert([
        {
          title,
          code,
          prompt: prompt || null,
          description: description || null,
          password_hash: passwordHash,
          type,
          is_published: true,
          has_params: false,
          params_config: null
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ fragment: data }, { status: 201 })
  } catch (error) {
    console.error('Failed to create fragment:', error)
    return NextResponse.json(
      { error: 'Failed to create fragment' },
      { status: 500 }
    )
  }
}