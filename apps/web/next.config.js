/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nynus/ui"],
  // Đảm bảo các transpilePackages bao gồm tất cả các package nội bộ cần sử dụng
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Chỉ định app directory trong src
  distDir: '.next',
  experimental: {
    // Đặt thư mục gốc cho ứng dụng là src
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  // Thêm cấu hình webpack để chỉ định đường dẫn chính xác
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  // Thêm cấu hình env từ next.config.mjs
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;