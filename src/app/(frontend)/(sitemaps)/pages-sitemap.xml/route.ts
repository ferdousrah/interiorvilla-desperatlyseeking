import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    // Use the public site URL for sitemap (not the CMS URL)
    const SITE_URL =
      process.env.PAYLOAD_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://desperatelyseeking.xyz'

    const dateFallback = new Date().toISOString()

    // Fetch all collections in parallel
    const [pagesResult, blogPostsResult, projectsResult, serviceAreasResult, servicesResult] =
      await Promise.all([
        // Pages
        payload.find({
          collection: 'pages',
          overrideAccess: false,
          draft: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          where: { _status: { equals: 'published' } },
          select: { slug: true, updatedAt: true },
        }),
        // Blog Posts
        payload.find({
          collection: 'blog-posts',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          select: { slug: true, updatedAt: true },
        }),
        // Projects
        payload.find({
          collection: 'projects',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          select: { slug: true, updatedAt: true },
        }),
        // Service Areas
        payload.find({
          collection: 'service-areas',
          overrideAccess: false,
          depth: 0,
          limit: 1000,
          pagination: false,
          select: { slug: true, updatedAt: true },
        }),
        // Services (categories)
        payload.find({
          collection: 'categories',
          overrideAccess: false,
          depth: 1,
          limit: 1000,
          pagination: false,
          select: { slug: true, pslug: true, updatedAt: true },
        }),
      ])

    // Static pages
    const staticPages = [
      { loc: `${SITE_URL}/`, lastmod: dateFallback, priority: 1.0 },
      { loc: `${SITE_URL}/about`, lastmod: dateFallback, priority: 0.8 },
      { loc: `${SITE_URL}/contact`, lastmod: dateFallback, priority: 0.8 },
      { loc: `${SITE_URL}/portfolio`, lastmod: dateFallback, priority: 0.9 },
      { loc: `${SITE_URL}/blog`, lastmod: dateFallback, priority: 0.8 },
      { loc: `${SITE_URL}/services`, lastmod: dateFallback, priority: 0.9 },
      { loc: `${SITE_URL}/service-areas`, lastmod: dateFallback, priority: 0.8 },
      { loc: `${SITE_URL}/faq`, lastmod: dateFallback, priority: 0.6 },
      { loc: `${SITE_URL}/book-appointment`, lastmod: dateFallback, priority: 0.7 },
    ]

    // Pages from CMS
    const pagesSitemap = pagesResult.docs
      .filter((page) => Boolean(page?.slug) && page.slug !== 'home')
      .map((page) => ({
        loc: `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || dateFallback,
        priority: 0.7,
      }))

    // Blog posts
    const blogSitemap = blogPostsResult.docs
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        loc: `${SITE_URL}/blog/${post.slug}`,
        lastmod: post.updatedAt || dateFallback,
        priority: 0.7,
      }))

    // Projects (portfolio)
    const projectsSitemap = projectsResult.docs
      .filter((project) => Boolean(project?.slug))
      .map((project) => ({
        loc: `${SITE_URL}/portfolio/${project.slug}`,
        lastmod: project.updatedAt || dateFallback,
        priority: 0.8,
      }))

    // Service Areas
    const serviceAreasSitemap = serviceAreasResult.docs
      .filter((area) => Boolean(area?.slug))
      .map((area) => ({
        loc: `${SITE_URL}/service-areas/${area.slug}`,
        lastmod: area.updatedAt || dateFallback,
        priority: 0.7,
      }))

    // Services (categories with parent slug)
    const servicesSitemap = servicesResult.docs
      .filter((service) => Boolean(service?.slug))
      .map((service) => {
        const parentSlug = (service as any).pslug || 'services'
        return {
          loc: `${SITE_URL}/services/${parentSlug}/${service.slug}`,
          lastmod: service.updatedAt || dateFallback,
          priority: 0.8,
        }
      })

    return [
      ...staticPages,
      ...pagesSitemap,
      ...blogSitemap,
      ...projectsSitemap,
      ...serviceAreasSitemap,
      ...servicesSitemap,
    ]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
    revalidate: 3600, // Revalidate every hour
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
