/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dkp/types'],
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
