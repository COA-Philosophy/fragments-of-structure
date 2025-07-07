// src/types/fragment.ts
// Fragments of Structure - コードアート表現のための型定義システム

/**
 * 📊 表示方式の種類
 * 4段階自動切替表示方式に対応
 */
export type DisplayMethod = 
  | 'react-canvas'    // React内部でCanvas描画（軽量・安全）
  | 'react-svg'       // React内部でSVG描画（軽量・安全）
  | 'iframe-standard' // iframe隔離実行（標準的なライブラリ）
  | 'iframe-heavy'    // iframe隔離実行（p5.js、Three.js等）
  | 'restricted'      // 制限モード実行（危険要素含有）
  | 'thumbnail-only'; // サムネイル表示のみ（実行失敗時）

/**
 * 🛡️ セキュリティレベル
 * 6段階統合アプローチに対応
 */
export type SecurityLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 🎨 コードアートの種類
 * Canvas表現ガイドラインに基づく分類
 */
export type ArtType = 
  | 'css-animation'   // CSS アニメーション
  | 'canvas-2d'       // Canvas 2D描画
  | 'canvas-webgl'    // WebGL/Three.js
  | 'svg-graphic'     // SVGグラフィック
  | 'particle-system' // パーティクルシステム
  | 'mathematical'    // 数学的パターン
  | 'generative'      // ジェネラティブアート
  | 'interactive'     // インタラクティブ
  | 'minimal'         // ミニマル構造
  | 'other';          // その他

/**
 * 🖼️ サムネイル情報
 * Cloudinary統合によるサムネイル管理
 */
export interface ThumbnailInfo {
  id: string;
  fragment_id: string;
  cloudinary_url: string;     // Cloudinary secure_url
  cloudinary_public_id: string; // Cloudinary public_id
  file_size: number;          // ファイルサイズ（バイト）
  capture_timestamp: string;  // キャプチャ時刻
}

/**
 * ✨ 共鳴（いいね）情報
 */
export interface Resonance {
  id: string;
  fragment_id: string;
  ip_hash: string;            // プライバシー保護のためハッシュ化
  created_at: string;
}

/**
 * 🌙 音のない声（コメント）情報
 */
export interface Whisper {
  id: string;
  fragment_id: string;
  content: string;            // 最大30文字の一言コメント
  ip_hash: string;            // プライバシー保護のためハッシュ化  
  created_at: string;
}

/**
 * 🏗️ メインのFragment型定義
 * データベース設計に基づく完全な構造
 */
export interface Fragment {
  // 基本情報
  id: string;
  display_number: number;     // Fragment 001形式の表示番号
  title: string;              // 最大50文字
  code: string;               // HTML/CSS/JavaScript
  prompt?: string;            // AI生成時のプロンプト（任意）
  description?: string;       // 最大200文字の説明（任意）
  
  // 表示・セキュリティ情報
  display_method: DisplayMethod;    // 自動判定された表示方式
  security_level: SecurityLevel;    // セキュリティレベル
  art_type: ArtType;               // アートの種類
  
  // サムネイル情報
  thumbnail_url?: string;     // Cloudinary画像URL
  thumbnail_info?: ThumbnailInfo; // 詳細なサムネイル情報
  
  // Fork関係
  forked_from?: string;       // 元となったFragment ID
  fork_count: number;         // このFragmentからForkされた数
  
  // マジックコメント機能
  has_params: boolean;        // パラメータの有無
  params_config?: {           // パラメータ設定情報
    [key: string]: {
      type: 'number' | 'color' | 'boolean' | 'select';
      label: string;
      default: any;
      min?: number;
      max?: number;
      step?: number;
      options?: string[];
    };
  };
  
  // セキュリティ情報
  password_hash: string;      // 削除用パスワード（ハッシュ化）
  
  // 統計情報
  resonance_count: number;    // 共鳴（いいね）数
  whisper_count: number;      // コメント数
  view_count: number;         // 閲覧数（内部用）
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
}

/**
 * 📋 ギャラリー表示用の軽量Fragment型
 * 一覧表示時のパフォーマンス最適化
 */
export interface FragmentSummary {
  id: string;
  display_number: number;
  title: string;
  thumbnail_url?: string;
  display_method: DisplayMethod;
  art_type: ArtType;
  resonance_count: number;
  whisper_count: number;
  created_at: string;
}

/**
 * 🎭 投稿フォーム用の型
 */
export interface FragmentSubmission {
  title: string;
  code: string;
  prompt?: string;
  description?: string;
  password: string;           // 平文パスワード（送信用）
}

/**
 * 🔍 検索・フィルター用の型
 */
export interface FragmentFilters {
  art_type?: ArtType;
  display_method?: DisplayMethod;
  has_thumbnail?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
}

/**
 * 📊 パフォーマンス分析用の型
 * 軽量化チェック機能で使用
 */
export interface PerformanceAnalysis {
  score: number;              // 0-100 (低いほど重い)
  warnings: PerformanceWarning[];
  estimated_load: 'light' | 'medium' | 'heavy';
  optimization_suggestions: string[];
}

export interface PerformanceWarning {
  type: 'particles' | 'loops' | 'memory' | 'rendering';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  line_number?: number;
}

/**
 * 🌐 API レスポンス用の型
 */
export interface FragmentListResponse {
  fragments: FragmentSummary[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface FragmentDetailResponse {
  fragment: Fragment;
  resonances?: Resonance[];
  whispers?: Whisper[];
}

/**
 * 🎨 Canvas描画設定の型
 * レンダリングエンジン用
 */
export interface CanvasConfig {
  width: number;
  height: number;
  background: string;
  quality: number;            // 0.0 - 1.0
  animation: boolean;
  fps_limit: number;
}

/**
 * 🔧 デフォルト値定数
 */
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 800,
  height: 600,
  background: '#f9f8f6',
  quality: 1.0,
  animation: true,
  fps_limit: 60
};

export const DISPLAY_METHOD_PRIORITY: DisplayMethod[] = [
  'react-canvas',
  'react-svg', 
  'iframe-standard',
  'iframe-heavy',
  'restricted',
  'thumbnail-only'
];

/**
 * 🏷️ アート種別の日本語表示名
 */
export const ART_TYPE_LABELS: Record<ArtType, string> = {
  'css-animation': 'CSS アニメーション',
  'canvas-2d': 'Canvas 2D',
  'canvas-webgl': 'WebGL・3D',
  'svg-graphic': 'SVG グラフィック',
  'particle-system': 'パーティクル',
  'mathematical': '数学的パターン',
  'generative': 'ジェネラティブ',
  'interactive': 'インタラクティブ',
  'minimal': 'ミニマル',
  'other': 'その他'
};

/**
 * 🛡️ セキュリティレベルの説明
 */
export const SECURITY_LEVEL_DESCRIPTIONS: Record<SecurityLevel, string> = {
  0: 'React内部直接実行 (SVG, 軽量Canvas)',
  1: '制限付きiframe (標準的なHTML/CSS/JS)',
  2: 'WebWorker隔離実行 (計算集約的コード)',
  3: 'プロキシ経由実行 (外部API必要コード)',
  4: '仮想実行環境 (高リスクコード)',
  5: '静的解析のみ (実行不可コード)'
};