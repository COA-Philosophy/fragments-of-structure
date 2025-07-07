// src/utils/codeAnalyzer.ts

export type CodeType = 'canvas' | 'svg' | 'css' | 'p5js' | 'threejs' | 'unknown';

export interface CodeAnalysis {
  type: CodeType;
  hasExternalLibraries: boolean;
  libraries: string[];
  isLightweight: boolean;
}

export function analyzeCode(code: string): CodeAnalysis {
  // コードを小文字に変換して検索しやすくする
  const lowerCode = code.toLowerCase();
  
  // 検出用のパターン
  const patterns = {
    canvas: /<canvas|getcontext\(['"]2d['"]\)/i,
    svg: /<svg|createElementNS.*svg/i,
    css: /@keyframes|animation:|transition:/i,
    p5js: /p5\.js|createcanvas|setup\(\)|draw\(\)/i,
    threejs: /three\.js|three\.min\.js|new THREE\./i,
  };
  
  // ライブラリの検出
  const libraries: string[] = [];
  if (patterns.p5js.test(code)) libraries.push('p5.js');
  if (patterns.threejs.test(code)) libraries.push('three.js');
  if (code.includes('d3.js') || code.includes('d3.min.js')) libraries.push('d3.js');
  
  // タイプの判定（優先順位順）
  let type: CodeType = 'unknown';
  if (patterns.threejs.test(code)) {
    type = 'threejs';
  } else if (patterns.p5js.test(code)) {
    type = 'p5js';
  } else if (patterns.canvas.test(code)) {
    type = 'canvas';
  } else if (patterns.svg.test(code)) {
    type = 'svg';
  } else if (patterns.css.test(code)) {
    type = 'css';
  }
  
  // 軽量かどうかの判定
  const isLightweight = type === 'canvas' || type === 'svg' || type === 'css';
  
  return {
    type,
    hasExternalLibraries: libraries.length > 0,
    libraries,
    isLightweight
  };
}