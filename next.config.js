/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  optimizeFonts: true,
  // GitHub Pages configuration - no basePath needed for custom domain (housegames.club)
  // Custom domains serve from root, so basePath should be empty
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

