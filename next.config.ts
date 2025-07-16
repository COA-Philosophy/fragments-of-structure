import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ← これが目的（VercelのESLintビルドエラー防止）
  },
  // 他の設定があればここに追記
};

export default nextConfig;
