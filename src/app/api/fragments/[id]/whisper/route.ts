import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15対応: paramsをawaitする
    const { id: fragmentId } = await params
    
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'コメント内容が必要です' },
        { status: 400 }
      )
    }

    if (content.length > 30) {
      return NextResponse.json(
        { error: 'コメントは30文字以内で入力してください' },
        { status: 400 }
      )
    }

    // IPアドレスのハッシュ化（匿名性の確保）
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const ipHash = Buffer.from(ip).toString('base64').substring(0, 10)

    // Whisperを追加
    const { data, error } = await supabase
      .from('whispers')
      .insert({
        fragment_id: fragmentId,
        content: content.trim(),
        ip_hash: ipHash
      })
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      whisper: data?.[0] 
    })

  } catch (error) {
    console.error('Whisper error:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}