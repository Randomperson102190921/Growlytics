/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Disable static optimization for pages that use Firebase
  experimental: {
    serverComponentsExternalPackages: ['firebase'],
  },
  // Removed optimizeCss as it requires critters dependency
  // experimental: {
  //   optimizeCss: true,
  // },
}

export default nextConfig
