/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  env: {
    API_URL: 'http://localhost:5000',
  }
}

export default nextConfig; 