import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15対応: paramsをawaitする
    const { id: fragmentId } = await params
    
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'パスワードが必要です' },
        { status: 400 }
      )
    }

    // Fragmentを取得してパスワードを確認
    const { data: fragment, error: fetchError } = await supabase
      .from('fragments')
      .select('password_hash')
      .eq('id', fragmentId)
      .single()

    if (fetchError || !fragment) {
      return NextResponse.json(
        { error: 'Fragmentが見つかりません' },
        { status: 404 }
      )
    }

    // bcryptでパスワード照合
    console.log('入力されたパスワード:', password)
    console.log('DBのハッシュ:', fragment.password_hash)

    const isPasswordValid = await bcrypt.compare(password, fragment.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      )
    }

    // Fragmentを削除（関連するresonancesとwhispersも自動的に削除される）
    const { error: deleteError } = await supabase
      .from('fragments')
      .delete()
      .eq('id', fragmentId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    )
  }
} 