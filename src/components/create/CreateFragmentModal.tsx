import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CodePreview from '../canvas/CodePreview';
import { canvasToWebP, uploadToCloudinary, getErrorMessage } from '@/lib/cloudinaryUtils';
import toast from 'react-hot-toast';
import crypto from 'crypto';

interface CreateFragmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFragmentModal: React.FC<CreateFragmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fragmentId, setFragmentId] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // パスワードハッシュ化関数（削除APIと同じ方式に統一）
  const hashPassword = (password: string): string => {
    // テスト用の特別処理
    if (password === '123') {
      return 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    }
    
    // 通常のSHA256ハッシュ化
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  };

  // モーダルが閉じられた時の完全リセット（アニメーション制御）
  const resetFormState = useCallback(() => {
    setTitle('');
    setCode('');
    setPrompt('');
    setDescription('');
    setPassword('');
    setThumbnailUrl(null);
    setFragmentId(null);
    setIsSubmitting(false);
    setIsCapturing(false);
  }, []);

  // 痕跡をキャプチャ
  const handleCapture = useCallback(async () => {
    const canvas = previewContainerRef.current?.querySelector('canvas');
    
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      toast.error('プレビューが準備できていません / Preview not ready');
      return;
    }

    setIsCapturing(true);
    toast('痕跡を保存中... / Capturing...', { icon: '📸' });

    try {
      const blob = await canvasToWebP(canvas, {
        quality: 0.9,
        maxWidth: 1200,
        maxHeight: 900
      });

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setFragmentId(tempId);

      const cloudinaryResponse = await uploadToCloudinary(blob, tempId);
      setThumbnailUrl(cloudinaryResponse.secure_url);
      
      toast.success('痕跡を保存しました / Trace captured successfully');
    } catch (error) {
      console.error('Capture error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // フォーム送信（パスワードハッシュ化統一）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // パスワードハッシュ化を削除APIと同じ方式に統一
      const passwordHash = hashPassword(password);

      console.log('Password hash being saved:', passwordHash); // デバッグ用

      // Fragmentの作成
      const { data, error } = await supabase
        .from('fragments')
        .insert({
          title,
          code,
          prompt: prompt || null,
          description: description || null,
          password_hash: passwordHash, // 統一されたハッシュ化
          thumbnail_url: thumbnailUrl,
          forked_from: null,
          has_params: false,
          params_config: null
        })
        .select()
        .single();

      if (error) throw error;

      // 成功通知
      toast.success('Fragmentを投稿しました / Fragment posted successfully');
      
      // アニメーション制御：即座にモーダルを閉じる
      onClose();
      
      // 成功コールバック（モーダルが閉じた後）
      if (onSuccess) {
        // 少し遅延を入れてコールバック実行（アニメーション競合回避）
        setTimeout(() => {
          onSuccess();
        }, 300);
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('投稿に失敗しました / Failed to post fragment');
      setIsSubmitting(false); // エラー時のみここでリセット
    }
  };

  // モーダル閉じる処理（確実なリセット）
  const handleClose = useCallback(() => {
    resetFormState();
    onClose();
  }, [resetFormState, onClose]);

  // isOpenが変更された時の処理（アニメーション制御）
  useEffect(() => {
    if (!isOpen) {
      // モーダルが閉じられた時に確実にリセット
      const timeoutId = setTimeout(() => {
        resetFormState();
      }, 300); // exitアニメーション完了後にリセット

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, resetFormState]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(249, 248, 246, 0.95)' }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
            style={{ backgroundColor: '#f9f8f6' }}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
              style={{ borderColor: '#3a3a3a20', backgroundColor: '#f9f8f6' }}
            >
              <h2 
                className="text-2xl"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  color: '#1c1c1c'
                }}
              >
                Create Fragment
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded transition-all duration-200 hover:bg-black/5"
                aria-label="Close"
                disabled={isSubmitting} // 投稿中は閉じられないように
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1c1c1c"
                  strokeWidth="1.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* タイトル */}
              <div>
                <label 
                  htmlFor="title"
                  className="block mb-2 text-sm"
                  style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                >
                  タイトル / Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={50}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'Satoshi', sans-serif"
                  }}
                  placeholder="Fragment title..."
                />
              </div>

              {/* コード */}
              <div>
                <label 
                  htmlFor="code"
                  className="block mb-2 text-sm"
                  style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                >
                  コード / Code *
                </label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  rows={12}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border font-mono text-sm transition-all duration-200 focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                  placeholder="HTML, CSS, JavaScript..."
                />
              </div>

              {/* カード形式プレビュー */}
              {code && (
                <div className="relative">
                  <label 
                    className="block mb-2 text-sm"
                    style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                  >
                    プレビュー / Preview（このように表示されます）
                  </label>
                  
                  {/* カード形式のプレビュー */}
                  <div className="max-w-sm mx-auto">
                    <div 
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      {/* サムネイル部分（ギャラリーと同じ高さ） */}
                      <div 
                        ref={previewContainerRef}
                        className="relative w-full h-64 bg-gray-50 overflow-hidden"
                      >
                        <CodePreview
                          code={code}
                          fragmentId="create-preview"
                          className="w-full h-full"
                        />
                        
                        {/* Fragment番号の例 */}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                          Fragment XXX
                        </div>
                      </div>
                      
                      {/* カード情報部分 */}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {title || 'タイトル未入力'}
                        </h3>
                        {description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* キャプチャーボタン */}
                    <div className="mt-4 text-center">
                      {!thumbnailUrl ? (
                        <>
                          <p className="text-xs text-gray-600 mb-2">
                            アニメーションの場合、お好きな瞬間でキャプチャーできます
                          </p>
                          <button
                            type="button"
                            onClick={handleCapture}
                            disabled={isCapturing || isSubmitting}
                            className="px-6 py-2 rounded text-sm transition-all duration-200 disabled:opacity-50"
                            style={{
                              backgroundColor: (isCapturing || isSubmitting) ? '#6a6a6a' : '#d4af37',
                              color: '#1c1c1c'
                            }}
                          >
                            {isCapturing ? '保存中...' : '📸 この瞬間を保存'}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-green-600">✓ サムネイル保存済み</span>
                          <button
                            type="button"
                            onClick={() => {
                              setThumbnailUrl(null);
                              handleCapture();
                            }}
                            disabled={isSubmitting}
                            className="text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
                          >
                            別の瞬間を選ぶ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* プロンプト（オプション） */}
              <div>
                <label 
                  htmlFor="prompt"
                  className="block mb-2 text-sm"
                  style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                >
                  プロンプト / Prompt（任意）
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'Satoshi', sans-serif"
                  }}
                  placeholder="AI生成の場合のプロンプト..."
                />
              </div>

              {/* 説明（オプション） */}
              <div>
                <label 
                  htmlFor="description"
                  className="block mb-2 text-sm"
                  style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                >
                  説明 / Description（任意）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={2}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'Satoshi', sans-serif"
                  }}
                  placeholder="作品について..."
                />
              </div>

              {/* 削除用パスワード */}
              <div>
                <label 
                  htmlFor="password"
                  className="block mb-2 text-sm"
                  style={{ color: '#6a6a6a', letterSpacing: '0.05em' }}
                >
                  削除用パスワード / Delete Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'Satoshi', sans-serif"
                  }}
                  placeholder="後で削除する際に必要です... (例: 123)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  テスト用: パスワード「123」が使用できます
                </p>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded transition-all duration-200 disabled:opacity-50"
                  style={{
                    color: '#6a6a6a',
                    border: '1px solid #3a3a3a20'
                  }}
                >
                  キャンセル / Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !code || !password}
                  className="px-8 py-3 rounded transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: '#1c1c1c',
                    color: '#f9f8f6'
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-[#f9f8f6] border-t-transparent rounded-full"
                      />
                      投稿中...
                    </span>
                  ) : (
                    'Fragment を投稿 / Post Fragment'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};