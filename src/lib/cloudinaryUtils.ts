/**
 * Cloudinary サムネイル処理ユーティリティ
 * Canvas to WebP変換とCloudinaryアップロード機能
 */

interface CanvasCaptureOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

/**
 * Canvasを高品質WebP画像に変換
 * @param canvas - キャプチャ対象のCanvas要素
 * @param options - 変換オプション
 * @returns WebP形式のBlob
 */
export async function canvasToWebP(
  canvas: HTMLCanvasElement,
  options: CanvasCaptureOptions = {}
): Promise<Blob> {
  const {
    quality = 0.9,      // 適度な圧縮
    maxWidth = 1200,    // 十分な解像度
    maxHeight = 900
  } = options;

  // アスペクト比を保持したリサイズ計算
  const aspectRatio = canvas.width / canvas.height;
  let targetWidth = canvas.width;
  let targetHeight = canvas.height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    if (aspectRatio > maxWidth / maxHeight) {
      targetWidth = maxWidth;
      targetHeight = maxWidth / aspectRatio;
    } else {
      targetHeight = maxHeight;
      targetWidth = maxHeight * aspectRatio;
    }
  }

  // 高品質リサイズ用の一時Canvas作成
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const ctx = tempCanvas.getContext('2d', { 
    alpha: true,
    desynchronized: true,
    willReadFrequently: false
  });

  if (!ctx) {
    throw new Error('Canvas context creation failed');
  }

  // アンチエイリアシング設定
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 透明背景を保持してリサイズ描画
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    tempCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('WebP conversion failed'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * CloudinaryにWebP画像をアップロード
 * @param blob - アップロードする画像のBlob
 * @param fragmentId - Fragment ID（ファイル名に使用）
 * @returns Cloudinaryのレスポンス
 */
export async function uploadToCloudinary(
  blob: Blob,
  fragmentId: string
): Promise<CloudinaryUploadResponse> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', uploadPreset);
  formData.append('public_id', `fragment_${fragmentId}`);
  formData.append('resource_type', 'image');
  
  // メタデータ追加
  formData.append('context', `fragment_id=${fragmentId}|created_at=${new Date().toISOString()}`);
  formData.append('tags', 'fragment,thumbnail,webp');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data as CloudinaryUploadResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload error: ${error.message}`);
    }
    throw new Error('Unknown upload error occurred');
  }
}

/**
 * Canvas要素の準備状態を確認
 * @param canvas - チェック対象のCanvas
 * @returns 描画内容があるかどうか
 */
export function isCanvasReady(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // 透明度を含む画像データをチェック
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 少なくとも1つの非透明ピクセルがあるかチェック
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) { // Alpha channel
      return true;
    }
  }

  return false;
}

/**
 * 美しいエラーメッセージの生成
 * @param error - エラーオブジェクト
 * @returns ユーザーフレンドリーなメッセージ
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return 'ネットワーク接続を確認してください / Please check your network connection';
    }
    if (error.message.includes('size')) {
      return '画像サイズが大きすぎます / Image size too large';
    }
    if (error.message.includes('format')) {
      return '画像形式がサポートされていません / Unsupported image format';
    }
  }
  
  return '予期しないエラーが発生しました / An unexpected error occurred';
}