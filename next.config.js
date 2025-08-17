/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic config for build testing
  poweredByHeader: false,
  output: 'standalone',

  // Disable static optimization for all pages
  experimental: {
    appDir: true,
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig