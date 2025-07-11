import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15対応: paramsをawaitする
    const { id: fragmentId } = await params

    // IPアドレスのハッシュ化（重複防止）
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const ipHash = Buffer.from(ip).toString('base64').substring(0, 10)

    // 既に共鳴済みかチェック
    const { data: existingResonance } = await supabase
      .from('resonances')
      .select('id')
      .eq('fragment_id', fragmentId)
      .eq('ip_hash', ipHash)
      .single()

    if (existingResonance) {
      return NextResponse.json(
        { error: '既に共鳴済みです' },
        { status: 409 }
      )
    }

    // 新しい共鳴を追加
    const { data, error } = await supabase
      .from('resonances')
      .insert({
        fragment_id: fragmentId,
        ip_hash: ipHash
      })
      .select()

    if (error) throw error

    // 共鳴数を取得
    const { data: resonanceCount } = await supabase
      .from('resonances')
      .select('id')
      .eq('fragment_id', fragmentId)

    return NextResponse.json({ 
      success: true,
      resonance: data?.[0],
      count: resonanceCount?.length || 0
    })

  } catch (error) {
    console.error('Resonance error:', error)
    return NextResponse.json(
      { error: '共鳴に失敗しました' },
      { status: 500 }
    )
  }
}