// 安全なコード実行環境を提供するユーティリティ（最終版）

interface ExecutionResult {
  success: boolean
  error?: string
}

// HTMLコードからCanvasコードを実行する
export function executeCanvasCode(htmlCode: string, targetCanvas: HTMLCanvasElement): ExecutionResult {
  try {
    // HTMLを解析
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, 'text/html')
    
    // scriptタグのコードを抽出
    const scripts = doc.querySelectorAll('script')
    let scriptCode = ''
    
    scripts.forEach(script => {
      if (!script.src && script.textContent) {
        scriptCode += script.textContent + '\n'
      }
    })
    
    if (!scriptCode.trim()) {
      return { success: false, error: 'スクリプトが見つかりません' }
    }
    
    // canvas要素のサイズを設定
    const sourceCanvas = doc.querySelector('canvas')
    if (sourceCanvas) {
      const width = sourceCanvas.getAttribute('width')
      const height = sourceCanvas.getAttribute('height')
      if (width) targetCanvas.width = parseInt(width)
      if (height) targetCanvas.height = parseInt(height)
    }
    
    // コンテキストを取得
    const ctx = targetCanvas.getContext('2d')
    if (!ctx) {
      return { success: false, error: '2D contextを取得できません' }
    }
    
    // ユニークなIDを生成（変数名の衝突を避けるため）
    const uniqueId = `_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // コードの前処理：変数名を置換してスコープの問題を回避
    const processedCode = scriptCode
      // const canvas = ... の宣言を削除
      .replace(/(?:const|let|var)\s+canvas\s*=\s*document\.getElementById\s*\([^)]+\)\s*;?/g, '')
      .replace(/(?:const|let|var)\s+canvas\s*=\s*document\.querySelector\s*\([^)]+\)\s*;?/g, '')
      // const ctx = ... の宣言を削除
      .replace(/(?:const|let|var)\s+ctx\s*=\s*canvas\.getContext\s*\([^)]+\)\s*;?/g, '')
      // 残りのcanvasへの参照を置換
      .replace(/document\.getElementById\s*\(\s*['"`]canvas['"`]\s*\)/g, `canvas${uniqueId}`)
      .replace(/document\.querySelector\s*\(\s*['"`]#?canvas['"`]\s*\)/g, `canvas${uniqueId}`)
    
    // 実行環境を準備（即時関数でラップ）
    const wrappedCode = `
      (function() {
        'use strict';
        
        // ローカルスコープで変数を定義
        const canvas${uniqueId} = arguments[0];
        const canvas = canvas${uniqueId};
        const ctx = canvas.getContext('2d');
        
        // よく使われる変数を事前定義
        let animationId = null;
        let particles = [];
        let time = 0;
        let frame = 0;
        
        // Math関数のショートカット
        const { PI, sin, cos, tan, sqrt, abs, min, max, floor, ceil, round, random } = Math;
        
        // DOM操作のセーフガード
        const safeGetElement = (id) => {
          if (id === 'canvas') return canvas;
          // その他の要素へのアクセスは無視
          return {
            textContent: '',
            innerHTML: '',
            style: {},
            appendChild: () => {},
            removeChild: () => {},
            addEventListener: () => {},
            removeEventListener: () => {}
          };
        };
        
        // document.getElementByIdを一時的にオーバーライド
        const originalGetElementById = document.getElementById;
        document.getElementById = function(id) {
          return safeGetElement(id);
        };
        
        try {
          // 元のコードを実行
          ${processedCode}
        } catch (e) {
          console.error('[Canvas Execution Error]', e);
          // エラーが発生してもcanvasの描画は継続
          if (!e.message.includes('textContent')) {
            throw e;
          }
        } finally {
          // 元の関数を復元
          document.getElementById = originalGetElementById;
        }
      })(arguments[0]);
    `
    
    // コードを実行
    const executeFunction = new Function(wrappedCode)
    executeFunction(targetCanvas)
    
    return { success: true }
    
  } catch (error) {
    console.error('Canvas execution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

// コードタイプを判定
export function analyzeCodeType(code: string): string {
  const lowerCode = code.toLowerCase()
  
  // Three.jsの検出
  if (lowerCode.includes('three.') || lowerCode.includes('three.js')) {
    return 'three'
  }
  
  // WebGL/GLSLの検出
  if (lowerCode.includes('webgl') || lowerCode.includes('gl_position')) {
    return 'glsl'
  }
  
  // SVGの検出
  if (lowerCode.includes('<svg') && !lowerCode.includes('<canvas')) {
    return 'svg'
  }
  
  // CSSアニメーションの検出
  if (lowerCode.includes('@keyframes') && !lowerCode.includes('<canvas')) {
    return 'css'
  }
  
  // デフォルトはcanvas
  return 'canvas'
}