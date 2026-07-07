import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Heavy pages (image-sitemap, service-area pages) query the remote DB at
  // build-time prerender. The default 60s per-page timeout is too tight when
  // the DB is slow/distant, causing flaky "took more than 60 seconds" build
  // failures. 180s gives ample headroom.
  staticPageGenerationTimeout: 180,
  // Tree-shake heavy barrel-export packages so dev-mode webpack doesn't
  // hit "Cannot read properties of undefined (reading 'call')" on chunk
  // factory load. Especially needed for lucide-react which exports
  // hundreds of icons from its main entry.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'react-icons'],
  },
  eslint: {
    // Allow production builds to complete despite ESLint warnings
    ignoreDuringBuilds: true,
  },
  images: {
    // AVIF first (better compression than WebP, supported by all modern
    // browsers + Googlebot since 2024). Next.js will serve AVIF when the
    // requesting browser supports it and fall back to WebP otherwise.
    formats: ['image/avif', 'image/webp'],
    // Restrict variants to bound the on-disk image cache. Each unique
    // (src, width, quality, format) combination writes a file under
    // .next/cache/images, so narrowing these prevents unbounded growth
    // under traffic spikes (mitigates GHSA-3x4c-7xq6-9pq8).
    qualities: [70, 75, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images on disk for 30 days before re-optimization.
    // Longer = fewer cache rewrites under load.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Production media host — used when MEDIA_BASE_URL points local dev
      // at the live server's uploads (files not synced to local disk).
      { hostname: 'desperatelyseeking.xyz', protocol: 'https' },
      { hostname: 'www.desperatelyseeking.xyz', protocol: 'https' },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  async headers() {
    return [
      {
        // Security headers — applied to all routes
        source: '/(.*)',
        headers: [
          {
            // HSTS — forces HTTPS for 2 years, includes subdomains
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Prevent clickjacking
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Control referrer information sent with requests
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache media files for 1 year
        source: '/api/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js image optimization
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
