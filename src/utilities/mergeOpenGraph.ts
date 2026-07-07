import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { siteConfig } from '@/config/site'

// Static fallbacks — the live values are admin-editable via the
// "Site Settings" global (see getSiteConfig); these cover the rest.
const SITE_NAME = siteConfig.name
const DEFAULT_TITLE = `${siteConfig.name} | ${siteConfig.tagline}`
const DEFAULT_DESCRIPTION = siteConfig.business.description
const DEFAULT_SUBTITLE = siteConfig.tagline

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: DEFAULT_DESCRIPTION,
  siteName: SITE_NAME,
  title: DEFAULT_TITLE,
}

/**
 * Build a dynamic OG image URL pointing at /api/og.
 * The image is generated on the edge from the supplied title/subtitle.
 */
function buildDynamicOgImageUrl(
  title: string,
  subtitle?: string,
): { url: string; width: number; height: number; alt: string } {
  const base = getServerSideURL()
  const params = new URLSearchParams({ title })
  if (subtitle) params.set('subtitle', subtitle)
  return {
    url: `${base}/api/og?${params.toString()}`,
    width: 1200,
    height: 630,
    alt: title,
  }
}

/**
 * Merge a per-page OpenGraph object with sensible defaults.
 *
 *   - If the caller passes `images`, those are used (e.g. blog post
 *     featuredImage, project featuredImage, service hero).
 *   - Otherwise, a dynamic OG image is generated from the page's
 *     `title` (and optional `description`) at /api/og.
 *   - This means EVERY page gets a meaningful OG image — no more
 *     pages defaulting to the same `og-image.webp`.
 */
export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  const merged: Metadata['openGraph'] = {
    ...defaultOpenGraph,
    ...og,
  }

  // If caller provided images, use them as-is.
  if (og?.images) {
    merged.images = og.images
    return merged
  }

  // Otherwise, generate a dynamic OG image based on the merged title.
  const title =
    typeof merged.title === 'string'
      ? merged.title
      : DEFAULT_TITLE

  // Use description as subtitle when we have one (truncate to 120 chars to
  // keep the OG image typography readable).
  const description =
    typeof merged.description === 'string'
      ? merged.description.length > 120
        ? `${merged.description.slice(0, 117).trim()}…`
        : merged.description
      : DEFAULT_SUBTITLE

  merged.images = [buildDynamicOgImageUrl(title, description)]
  return merged
}
