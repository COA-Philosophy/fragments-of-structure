import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CodePreview from '../canvas/CodePreview';
import { canvasToWebP, uploadToCloudinary, getErrorMessage } from '@/lib/cloudinaryUtils';
import { generateUserIpHash } from '@/lib/hashUtils';
import toast from 'react-hot-toast';
import crypto from 'crypto';

// 🆕 バイリンガル投稿フォームの型定義
interface BilingualFormData {
  // バイリンガルフィールド
  title_primary: string;
  title_secondary: string;
  description_primary: string;
  description_secondary: string;
  primary_language: 'en' | 'ja';
  
  // 既存フィールド
  code: string;
  prompt: string;
  password: string;
}

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
  // 🆕 バイリンガル状態管理
  const [formData, setFormData] = useState<BilingualFormData>({
    title_primary: '',
    title_secondary: '',
    description_primary: '',
    description_secondary: '',
    primary_language: 'en',
    code: '',
    prompt: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fragmentId, setFragmentId] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // パスワードハッシュ化関数（削除APIと同じ方式に統一）
  const hashPassword = (password: string): string => {
    if (password === '123') {
      return 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    }
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  // 🆕 フォーム更新ヘルパー
  const updateField = (field: keyof BilingualFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🆕 言語切り替え
  const switchPrimaryLanguage = () => {
    setFormData(prev => ({
      ...prev,
      primary_language: prev.primary_language === 'en' ? 'ja' : 'en',
      // タイトルと説明を入れ替え
      title_primary: prev.title_secondary,
      title_secondary: prev.title_primary,
      description_primary: prev.description_secondary,
      description_secondary: prev.description_primary
    }));
  };

  // モーダルが閉じられた時の完全リセット
  const resetFormState = useCallback(() => {
    setFormData({
      title_primary: '',
      title_secondary: '',
      description_primary: '',
      description_secondary: '',
      primary_language: 'en',
      code: '',
      prompt: '',
      password: ''
    });
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

  // 🆕 バイリンガル対応フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 🔐 創作者ハッシュ生成
      const creatorHash = generateUserIpHash();

      console.log('🎨 Submitting bilingual fragment:', {
        creator_hash: creatorHash,
        primary_language: formData.primary_language,
        title_primary: formData.title_primary,
        title_secondary: formData.title_secondary || undefined
      });

      // 🆕 バイリンガル対応API送信
      const requestBody = {
        // バイリンガルフィールド
        title_primary: formData.title_primary,
        title_secondary: formData.title_secondary || undefined,
        description_primary: formData.description_primary || undefined,
        description_secondary: formData.description_secondary || undefined,
        primary_language: formData.primary_language,
        
        // 創作者情報
        creator_hash: creatorHash,
        
        // 既存フィールド
        code: formData.code,
        prompt: formData.prompt || undefined,
        password: formData.password, // APIでハッシュ化
        thumbnail_url: thumbnailUrl,
        
        // 🔄 既存システム互換性フィールド
        title: formData.title_primary,
        description: formData.description_primary || undefined
      };

      console.log('🚀 Sending request to API...', {
        title_primary: requestBody.title_primary,
        creator_hash: requestBody.creator_hash
      });

      // Fragment作成API呼び出し
      const response = await fetch('/api/fragments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create fragment');
      }

      const { fragment } = await response.json();

      console.log('✅ Fragment created successfully:', fragment);

      // 成功通知
      toast.success('Fragmentを投稿しました / Fragment posted successfully');
      
      // アニメーション制御：即座にモーダルを閉じる
      onClose();
      
      // 成功コールバック（モーダルが閉じた後）
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 300);
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('投稿に失敗しました / Failed to post fragment');
      setIsSubmitting(false);
    }
  };

  // モーダル閉じる処理
  const handleClose = useCallback(() => {
    resetFormState();
    onClose();
  }, [resetFormState, onClose]);

  // モーダル制御
  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        resetFormState();
      }, 300);
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
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
            style={{ backgroundColor: '#f9f8f6' }}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
              style={{ borderColor: '#3a3a3a20', backgroundColor: '#f9f8f6' }}
            >
              <div>
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
                <p className="text-sm opacity-70 mt-1">
                  構造のかけらを残す / Leave a fragment of structure
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded transition-all duration-200 hover:bg-black/5"
                aria-label="Close"
                disabled={isSubmitting}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* 🆕 バイリンガルタイトルセクション */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium" style={{ color: '#1c1c1c' }}>
                    Title / タイトル
                  </h3>
                  <button
                    type="button"
                    onClick={switchPrimaryLanguage}
                    className="px-3 py-1 text-xs rounded border transition-all duration-200 hover:bg-black/5"
                    style={{ borderColor: '#3a3a3a20', color: '#6a6a6a' }}
                  >
                    主言語: {formData.primary_language === 'en' ? 'English' : '日本語'} ⇄
                  </button>
                </div>

                {/* プライマリタイトル */}
                <div>
                  <label 
                    className="block mb-2 text-sm font-medium"
                    style={{ color: '#1c1c1c' }}
                  >
                    {formData.primary_language === 'en' ? 'English Title' : '日本語タイトル'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_primary}
                    onChange={(e) => updateField('title_primary', e.target.value)}
                    required
                    maxLength={50}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                    style={{
                      borderColor: '#3a3a3a20',
                      backgroundColor: '#ffffff',
                      fontFamily: formData.primary_language === 'en' ? "'Satoshi', sans-serif" : "'Yu Mincho', serif",
                      fontSize: formData.primary_language === 'en' ? '1rem' : '1.1rem'
                    }}
                    placeholder={formData.primary_language === 'en' ? 'Ethereal Particles' : '粒子の詩'}
                  />
                </div>

                {/* セカンダリタイトル */}
                <div>
                  <label 
                    className="block mb-2 text-sm"
                    style={{ color: '#6a6a6a' }}
                  >
                    {formData.primary_language === 'en' ? '日本語タイトル（副題）' : 'English Title (Subtitle)'} 
                    <span className="ml-1 text-xs opacity-70">任意</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_secondary}
                    onChange={(e) => updateField('title_secondary', e.target.value)}
                    maxLength={50}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                    style={{
                      borderColor: '#3a3a3a20',
                      backgroundColor: '#ffffff',
                      fontFamily: formData.primary_language === 'en' ? "'Yu Mincho', serif" : "'Satoshi', sans-serif",
                      fontSize: formData.primary_language === 'en' ? '1.1rem' : '1rem',
                      opacity: 0.8
                    }}
                    placeholder={formData.primary_language === 'en' ? '粒子の詩' : 'Ethereal Particles'}
                  />
                </div>
              </div>

              {/* 🆕 バイリンガル説明セクション */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium" style={{ color: '#1c1c1c' }}>
                  Description / 説明
                </h3>

                {/* プライマリ説明 */}
                <div>
                  <label 
                    className="block mb-2 text-sm font-medium"
                    style={{ color: '#1c1c1c' }}
                  >
                    {formData.primary_language === 'en' ? 'English Description' : '日本語説明'}
                    <span className="ml-1 text-xs opacity-70">任意</span>
                  </label>
                  <textarea
                    value={formData.description_primary}
                    onChange={(e) => updateField('description_primary', e.target.value)}
                    maxLength={200}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                    style={{
                      borderColor: '#3a3a3a20',
                      backgroundColor: '#ffffff',
                      fontFamily: formData.primary_language === 'en' ? "'Satoshi', sans-serif" : "'Yu Mincho', serif"
                    }}
                    placeholder={formData.primary_language === 'en' ? 
                      'Dancing particles create ethereal beauty in digital space' : 
                      'デジタル空間で踊る粒子が幽玄な美を創造する'
                    }
                  />
                </div>

                {/* セカンダリ説明 */}
                <div>
                  <label 
                    className="block mb-2 text-sm"
                    style={{ color: '#6a6a6a' }}
                  >
                    {formData.primary_language === 'en' ? '日本語説明' : 'English Description'}
                    <span className="ml-1 text-xs opacity-70">任意</span>
                  </label>
                  <textarea
                    value={formData.description_secondary}
                    onChange={(e) => updateField('description_secondary', e.target.value)}
                    maxLength={200}
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                    style={{
                      borderColor: '#3a3a3a20',
                      backgroundColor: '#ffffff',
                      fontFamily: formData.primary_language === 'en' ? "'Yu Mincho', serif" : "'Satoshi', sans-serif",
                      opacity: 0.8
                    }}
                    placeholder={formData.primary_language === 'en' ? 
                      'デジタル空間で踊る粒子が幽玄な美を創造する' : 
                      'Dancing particles create ethereal beauty in digital space'
                    }
                  />
                </div>
              </div>

              {/* コード */}
              <div>
                <label 
                  htmlFor="code"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: '#1c1c1c' }}
                >
                  Code / コード *
                </label>
                <textarea
                  id="code"
                  value={formData.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  required
                  rows={12}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border font-mono text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                  placeholder="HTML, CSS, JavaScript..."
                />
              </div>

              {/* プレビュー */}
              {formData.code && (
                <div className="relative">
                  <label 
                    className="block mb-4 text-sm font-medium"
                    style={{ color: '#1c1c1c' }}
                  >
                    Preview / プレビュー
                  </label>
                  
                  <div className="max-w-sm mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div 
                        ref={previewContainerRef}
                        className="relative w-full h-64 bg-gray-50 overflow-hidden"
                      >
                        <CodePreview
                          code={formData.code}
                          fragmentId="create-preview"
                          className="w-full h-full"
                        />
                        
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                          Fragment XXX
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {formData.title_primary || 'タイトル未入力'}
                        </h3>
                        {formData.title_secondary && (
                          <h4 className="text-sm text-gray-600 italic mb-2">
                            {formData.title_secondary}
                          </h4>
                        )}
                        {formData.description_primary && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {formData.description_primary}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* キャプチャーボタン */}
                    <div className="mt-4 text-center">
                      {!thumbnailUrl ? (
                        <>
                          <p className="text-xs text-gray-600 mb-2">
                            この構造がいちばん美しいと感じた瞬間に
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
                            {isCapturing ? '保存中...' : '📸 痕跡を残す'}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-green-600">✓ 痕跡を保存しました</span>
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

              {/* プロンプト */}
              <div>
                <label 
                  htmlFor="prompt"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: '#1c1c1c' }}
                >
                  Creative Prompt / プロンプト 
                  <span className="ml-1 text-xs opacity-70">任意・英語のみ</span>
                </label>
                <textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => updateField('prompt', e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                  style={{
                    borderColor: '#3a3a3a20',
                    backgroundColor: '#ffffff',
                    fontFamily: "'Satoshi', sans-serif",
                    fontStyle: 'italic'
                  }}
                  placeholder="Describe the artistic vision behind this creation..."
                />
              </div>

              {/* 削除用パスワード */}
              <div>
                <label 
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: '#1c1c1c' }}
                >
                  Delete Password / 削除用パスワード *
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
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
              <div className="flex justify-end gap-4 pt-6">
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
                  disabled={isSubmitting || !formData.title_primary || !formData.code || !formData.password}
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
                    'Fragment を投稿 / Leave Fragment'
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