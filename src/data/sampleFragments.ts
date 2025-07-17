// src/data/sampleFragments.ts
// Fragments of Structure - サンプルコードアートデータ
// 🎯 型安全性確保済み - @ts-nocheck削除完了

import { Fragment, FragmentSummary } from '@/types/fragment';

/**
 * 🎨 開発用サンプルFragmentデータ
 * 要件定義書の世界観に基づいた多様なコードアート表現
 * ✅ 完全型安全 - TypeScript型チェック有効
 */
export const sampleFragments: Fragment[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    display_number: 1,
    title: '粒子の軌跡',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f9f8f6; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    const particles = [];
    for(let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        opacity: Math.random()
      });
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(249, 248, 246, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.fillStyle = \`rgba(28, 28, 28, \${p.opacity})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`,
    description: '時間の中を漂う、無数の小さな存在たち',
    display_method: 'react-canvas',
    security_level: 0,
    art_type: 'particle-system',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_001.webp',
    forked_from: undefined,
    fork_count: 3,
    has_params: false,
    password_hash: 'hashed_password_001',
    resonance_count: 12,
    whisper_count: 3,
    view_count: 47,
    type: 'canvas',
    is_published: true,
    created_at: '2025-07-01T10:30:00Z',
    updated_at: '2025-07-01T10:30:00Z'
  },
  
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    display_number: 2,
    title: '回転する静寂',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      background: #f9f8f6; 
      height: 100vh; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
    }
    .spinner {
      width: 200px;
      height: 200px;
      border: 2px solid #6a6a6a;
      border-top: 2px solid #1c1c1c;
      border-radius: 50%;
      animation: spin 3s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
</body>
</html>`,
    description: '時の流れを円環に閉じ込めた瞑想',
    display_method: 'react-svg',
    security_level: 0,
    art_type: 'css-animation',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_002.webp',
    forked_from: undefined,
    fork_count: 7,
    has_params: true,
    params_config: {
      speed: { type: 'number', label: '回転速度', default: 3, min: 0.5, max: 10, step: 0.5 },
      color: { type: 'color', label: '線の色', default: '#1c1c1c' }
    },
    password_hash: 'hashed_password_002',
    resonance_count: 23,
    whisper_count: 5,
    view_count: 89,
    type: 'css',
    is_published: true,
    created_at: '2025-07-02T14:15:00Z',
    updated_at: '2025-07-02T14:15:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    display_number: 3,
    title: '幾何学的夢想',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f9f8f6; }
    svg { display: block; margin: 50px auto; }
  </style>
</head>
<body>
  <svg width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6a6a6a" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#grid)" />
    
    <circle cx="200" cy="200" r="150" fill="none" stroke="#1c1c1c" stroke-width="2" opacity="0.7">
      <animateTransform attributeName="transform" type="rotate" 
                        values="0 200 200;360 200 200" dur="20s" repeatCount="indefinite"/>
    </circle>
    
    <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="#3a3a3a" stroke-width="1">
      <animateTransform attributeName="transform" type="rotate" 
                        values="0 200 200;-360 200 200" dur="15s" repeatCount="indefinite"/>
    </polygon>
    
    <circle cx="200" cy="200" r="3" fill="#d4af37"/>
  </svg>
</body>
</html>`,
    description: '永遠に回り続ける、秩序と混沌の境界',
    display_method: 'react-svg',
    security_level: 0,
    art_type: 'svg-graphic',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_003.webp',
    forked_from: undefined,
    fork_count: 15,
    has_params: false,
    password_hash: 'hashed_password_003',
    resonance_count: 34,
    whisper_count: 8,
    view_count: 156,
    type: 'svg',
    is_published: true,
    created_at: '2025-07-03T09:45:00Z',
    updated_at: '2025-07-03T09:45:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    display_number: 4,
    title: 'フィボナッチの詩',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f9f8f6; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    function drawSpiral() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth = 1;
      
      const time = Date.now() * 0.001;
      const scale = 50;
      
      ctx.beginPath();
      for (let i = 0; i < 300; i++) {
        const angle = i * 0.1 + time * 0.5;
        const radius = Math.sqrt(i) * 5;
        const fib = fibonacci(Math.floor(i / 10) % 10 + 1);
        const adjustedRadius = radius * (1 + Math.sin(time + fib) * 0.1);
        
        const x = centerX + Math.cos(angle) * adjustedRadius;
        const y = centerY + Math.sin(angle) * adjustedRadius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      requestAnimationFrame(drawSpiral);
    }
    
    drawSpiral();
  </script>
</body>
</html>`,
    description: '自然の法則が描く、無限への螺旋',
    display_method: 'react-canvas',
    security_level: 1,
    art_type: 'mathematical',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_004.webp',
    forked_from: undefined,
    fork_count: 21,
    has_params: true,
    params_config: {
      speed: { type: 'number', label: '回転速度', default: 0.5, min: 0.1, max: 2.0, step: 0.1 },
      density: { type: 'number', label: '線の密度', default: 300, min: 100, max: 500, step: 50 }
    },
    password_hash: 'hashed_password_004',
    resonance_count: 67,
    whisper_count: 12,
    view_count: 234,
    type: 'canvas',
    is_published: true,
    created_at: '2025-07-04T16:20:00Z',
    updated_at: '2025-07-04T16:20:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    display_number: 5,
    title: 'ミニマルの余白',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      margin: 0; 
      background: #f9f8f6; 
      height: 100vh; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      font-family: 'Zen Kurenaido', serif;
    }
    .container {
      text-align: center;
    }
    .line {
      width: 200px;
      height: 1px;
      background: #3a3a3a;
      margin: 40px auto;
      opacity: 0;
      animation: appear 3s ease-in-out infinite alternate;
    }
    .text {
      color: #6a6a6a;
      font-size: 14px;
      letter-spacing: 2px;
      opacity: 0;
      animation: appear 3s ease-in-out infinite alternate 1.5s;
    }
    @keyframes appear {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="line"></div>
    <div class="text">silence</div>
    <div class="line"></div>
  </div>
</body>
</html>`,
    description: '何も語らない中にある、すべての語り',
    display_method: 'react-svg',
    security_level: 0,
    art_type: 'minimal',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_005.webp',
    forked_from: undefined,
    fork_count: 9,
    has_params: false,
    password_hash: 'hashed_password_005',
    resonance_count: 45,
    whisper_count: 2,
    view_count: 78,
    type: 'css',
    is_published: true,
    created_at: '2025-07-05T11:30:00Z',
    updated_at: '2025-07-05T11:30:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    display_number: 6,
    title: '色彩の呼吸',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f9f8f6; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    function animate() {
      const time = Date.now() * 0.002;
      
      // グラデーション背景
      const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, 300
      );
      
      const hue1 = (time * 30) % 360;
      const hue2 = (time * 30 + 180) % 360;
      
      gradient.addColorStop(0, \`hsla(\${hue1}, 30%, 85%, 0.8)\`);
      gradient.addColorStop(1, \`hsla(\${hue2}, 20%, 90%, 0.3)\`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 呼吸する円
      const radius = 100 + Math.sin(time) * 50;
      ctx.fillStyle = \`hsla(\${(time * 60) % 360}, 40%, 70%, 0.6)\`;
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI * 2);
      ctx.fill();
      
      requestAnimationFrame(animate);
    }
    
    animate();
  </script>
</body>
</html>`,
    prompt: 'breathing colors that slowly shift like meditation',
    description: 'ゆっくりと変化する色彩が織りなす、瞑想の時間',
    display_method: 'react-canvas',
    security_level: 1,
    art_type: 'generative',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_006.webp',
    forked_from: undefined,
    fork_count: 18,
    has_params: true,
    params_config: {
      speed: { type: 'number', label: '変化速度', default: 2, min: 0.5, max: 5, step: 0.5 },
      saturation: { type: 'number', label: '彩度', default: 30, min: 10, max: 60, step: 5 }
    },
    password_hash: 'hashed_password_006',
    resonance_count: 52,
    whisper_count: 7,
    view_count: 142,
    type: 'canvas',
    is_published: true,
    created_at: '2025-07-06T13:45:00Z',
    updated_at: '2025-07-06T13:45:00Z'
  },

  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    display_number: 7,
    title: 'フラワー・オブ・ライフ',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #f9f8f6; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 60;
    
    function drawFlowerOfLife() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001;
      const circles = [];
      
      // 中心の円
      circles.push({ x: centerX, y: centerY });
      
      // 6つの周囲の円
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        circles.push({
          x: centerX + Math.cos(angle) * baseRadius,
          y: centerY + Math.sin(angle) * baseRadius
        });
      }
      
      // 外側の12の円
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const distance = baseRadius * Math.sqrt(3);
        circles.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance
        });
      }
      
      // 円を描画
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth = 1.5;
      
      circles.forEach((circle, index) => {
        const phase = time + index * 0.5;
        const alpha = 0.3 + 0.4 * Math.sin(phase);
        const radius = baseRadius + Math.sin(phase * 2) * 5;
        
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawFlowerOfLife);
    }
    
    drawFlowerOfLife();
  </script>
</body>
</html>`,
    description: '生命の花、永遠の幾何学が奏でる神聖な調和',
    display_method: 'react-canvas',
    security_level: 0,
    art_type: 'mathematical',
    thumbnail_url: 'https://res.cloudinary.com/fragments/image/upload/v1/fragments/thumbnails/fragment_007.webp',
    forked_from: undefined,
    fork_count: 31,
    has_params: false,
    password_hash: 'hashed_password_007',
    resonance_count: 89,
    whisper_count: 15,
    view_count: 312,
    type: 'canvas',
    is_published: true,
    created_at: '2025-07-07T08:15:00Z',
    updated_at: '2025-07-07T08:15:00Z'
  }
];

/**
 * 📋 ギャラリー表示用の軽量データ
 * パフォーマンス最適化のため、必要最小限の情報のみ
 * ✅ 完全型安全 - FragmentSummary型準拠
 */
export const sampleFragmentSummaries: FragmentSummary[] = sampleFragments.map(fragment => ({
  id: fragment.id,
  display_number: fragment.display_number,
  title: fragment.title,
  thumbnail_url: fragment.thumbnail_url,
  display_method: fragment.display_method,
  art_type: fragment.art_type,
  resonance_count: fragment.resonance_count || 0,  // 型安全性確保
  whisper_count: fragment.whisper_count || 0,      // 型安全性確保
  created_at: fragment.created_at
}));

/**
 * 🔍 開発用ユーティリティ関数
 * ✅ 完全型安全 - 型推論による安全な関数実装
 */
export const getFragmentById = (id: string): Fragment | undefined => {
  return sampleFragments.find(fragment => fragment.id === id);
};

export const getFragmentsByArtType = (artType: string): Fragment[] => {
  return sampleFragments.filter(fragment => fragment.art_type === artType);
};

export const getLatestFragments = (count: number = 5): Fragment[] => {
  return [...sampleFragments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, count);
};

export const getPopularFragments = (count: number = 5): Fragment[] => {
  return [...sampleFragments]
    .sort((a, b) => (b.resonance_count || 0) - (a.resonance_count || 0))  // 型安全性確保
    .slice(0, count);
};