/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic config for build testing
  poweredByHeader: false,
  output: 'standalone',

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig