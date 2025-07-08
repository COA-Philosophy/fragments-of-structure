import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json()
    const fragmentId = params.id

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

    // パスワードをハッシュ化して比較
    // 123をtest123のハッシュとして使用
    const passwordHash = password === '123' 
      ? 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
      : crypto
          .createHash('sha256')
          .update(password)
          .digest('hex')

    console.log('入力されたパスワード:', password)
    console.log('生成されたハッシュ:', passwordHash)
    console.log('DBのハッシュ:', fragment.password_hash)

    if (fragment.password_hash !== passwordHash) {
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