import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Media } from '@/payload-types'
import { getSiteUrl } from '@/utilities/getSiteUrl'

// Cache the generated XML for 6 hours; revalidates on demand via tag if needed.
export const revalidate = 21600

const escapeXml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const absoluteUrl = (siteUrl: string, url: string | undefined | null): string | null => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const mediaToImage = (
  siteUrl: string,
  media: number | Media | null | undefined,
  fallbackTitle: string,
): { loc: string; title: string; caption?: string } | null => {
  if (!media || typeof media !== 'object') return null
  const loc =
    absoluteUrl(siteUrl, media.sizes?.large?.url) ??
    absoluteUrl(siteUrl, media.url)
  if (!loc) return null
  return {
    loc,
    title: media.alt || fallbackTitle,
    caption: media.alt || undefined,
  }
}

export async function GET() {
  const siteUrl = getSiteUrl()
  let entries: {
    pageUrl: string
    images: { loc: string; title: string; caption?: string }[]
  }[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    const [projectsRes, blogPostsRes] = await Promise.all([
      payload.find({
        collection: 'projects',
        depth: 2,
        limit: 1000,
        select: {
          slug: true,
          title: true,
          featuredImage: true,
          gallery: true,
        },
      }),
      payload.find({
        collection: 'blog-posts',
        depth: 1,
        limit: 1000,
        select: { slug: true, title: true, featuredImage: true },
      }),
    ])

    // Project pages: featured image + gallery photos
    for (const p of projectsRes.docs) {
      const slug = (p as { slug?: string }).slug
      const title = (p as { title?: string }).title ?? ''
      if (!slug) continue
      const pageUrl = `${siteUrl}/portfolio/${slug}`
      const images: { loc: string; title: string; caption?: string }[] = []

      const featured = mediaToImage(
        siteUrl,
        (p as { featuredImage?: number | Media | null }).featuredImage,
        title,
      )
      if (featured) images.push(featured)

      const gallery = (p as { gallery?: { photos?: { image?: number | Media | null }[] | null } }).gallery
      const galleryPhotos = gallery?.photos ?? []
      for (const photo of galleryPhotos) {
        const img = mediaToImage(siteUrl, photo?.image, title)
        if (img && !images.some((i) => i.loc === img.loc)) images.push(img)
      }

      if (images.length > 0) entries.push({ pageUrl, images })
    }

    // Blog posts: featured image only
    for (const b of blogPostsRes.docs) {
      const slug = (b as { slug?: string }).slug
      const title = (b as { title?: string }).title ?? ''
      if (!slug) continue
      const pageUrl = `${siteUrl}/blog/${slug}`
      const featured = mediaToImage(
        siteUrl,
        (b as { featuredImage?: number | Media | null }).featuredImage,
        title,
      )
      if (featured) entries.push({ pageUrl, images: [featured] })
    }
  } catch (err) {
    console.error('[image-sitemap] failed to build', err)
    entries = []
  }

  const xmlEntries = entries
    .map((entry) => {
      const images = entry.images
        .map(
          (img) =>
            `    <image:image>\n      <image:loc>${escapeXml(img.loc)}</image:loc>\n      <image:title>${escapeXml(img.title)}</image:title>${
              img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''
            }\n    </image:image>`,
        )
        .join('\n')
      return `  <url>\n    <loc>${escapeXml(entry.pageUrl)}</loc>\n${images}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400',
    },
  })
}
