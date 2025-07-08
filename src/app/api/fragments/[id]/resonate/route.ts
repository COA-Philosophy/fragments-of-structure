import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fragmentId = params.id
    
    // IPアドレスをハッシュ化
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    // 既に共鳴しているかチェック
    const { data: existing } = await supabase
      .from('resonances')
      .select('id')
      .eq('fragment_id', fragmentId)
      .eq('ip_hash', ipHash)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: '既に共鳴しています' },
        { status: 400 }
      )
    }

    // 新しい共鳴を追加
    const { error: insertError } = await supabase
      .from('resonances')
      .insert({
        fragment_id: fragmentId,
        ip_hash: ipHash
      })

    if (insertError) throw insertError

    // 現在の共鳴数を取得
    const { count } = await supabase
      .from('resonances')
      .select('*', { count: 'exact', head: true })
      .eq('fragment_id', fragmentId)

    return NextResponse.json({ 
      success: true,
      count: count || 0
    })

  } catch (error) {
    console.error('Resonate error:', error)
    return NextResponse.json(
      { error: '共鳴の処理に失敗しました' },
      { status: 500 }
    )
  }
}