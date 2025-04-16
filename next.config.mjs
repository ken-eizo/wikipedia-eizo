/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のESLintチェックを一時的に無効化
  },
};

export default nextConfig;
