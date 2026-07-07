/**
 * Single source of truth for the public site URL.
 *
 * All sitemap, robots, JSON-LD, and SEO metadata code paths must read the
 * site URL from here so they cannot drift across env-var renamings.
 *
 * Resolution order:
 *   1. PAYLOAD_PUBLIC_SITE_URL  (preferred, explicit)
 *   2. NEXT_PUBLIC_SERVER_URL   (legacy fallback)
 *   3. VERCEL_PROJECT_PRODUCTION_URL (auto on Vercel)
 *   4. https://desperatelyseeking.xyz (production default)
 */
export function getSiteUrl(): string {
  if (process.env.PAYLOAD_PUBLIC_SITE_URL)
    return process.env.PAYLOAD_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.NEXT_PUBLIC_SERVER_URL)
    return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`
  return 'https://desperatelyseeking.xyz'
}

/** CommonJS-friendly export for next-sitemap.config.cjs and similar. */
export const SITE_URL = getSiteUrl()
