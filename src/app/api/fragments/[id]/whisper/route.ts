import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// コメント取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fragmentId = params.id

    const { data, error } = await supabase
      .from('whispers')
      .select('id, content, created_at')
      .eq('fragment_id', fragmentId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error

    return NextResponse.json({ whispers: data || [] })
  } catch (error) {
    console.error('Get whispers error:', error)
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// コメント投稿
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json()
    const fragmentId = params.id

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'コメントを入力してください' },
        { status: 400 }
      )
    }

    if (content.length > 30) {
      return NextResponse.json(
        { error: 'コメントは30文字以内で入力してください' },
        { status: 400 }
      )
    }

    // IPアドレスをハッシュ化
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    // コメントを追加
    const { data, error } = await supabase
      .from('whispers')
      .insert({
        fragment_id: fragmentId,
        content: content.trim(),
        ip_hash: ipHash
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      whisper: {
        id: data.id,
        content: data.content,
        created_at: data.created_at
      }
    })

  } catch (error) {
    console.error('Post whisper error:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}