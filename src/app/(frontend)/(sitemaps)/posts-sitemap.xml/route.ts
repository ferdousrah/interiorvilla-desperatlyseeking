import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    // Use the public site URL for sitemap (not the CMS URL)
    const SITE_URL =
      process.env.PAYLOAD_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://desperatelyseeking.xyz'

    // The 'posts' collection is not used in the frontend (legacy Payload template).
    // Return empty to prevent orphaned URLs in the sitemap.
    return []
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  // If no posts, return a valid empty sitemap XML
  if (!sitemap || sitemap.length === 0) {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  return getServerSideSitemap(sitemap)
}
