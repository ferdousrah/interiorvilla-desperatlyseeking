import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/utilities/getSiteUrl'

const SITE_URL = getSiteUrl()

// Cache the dynamic XML output for 60 seconds. The collection afterChange
// hooks also call revalidatePath('/sitemap.xml') so updates appear immediately
// after content edits in the admin.
export const revalidate = 60

/**
 * Pick the most recent updatedAt from a list of docs. Used to give the
 * collection-index pages a meaningful lastmod (e.g. /blog should reflect
 * the most recently updated blog post, not the build time).
 */
function maxUpdatedAt(
  docs: { updatedAt?: string | null }[],
  fallback: Date,
): Date {
  let latest = 0
  for (const d of docs) {
    if (!d?.updatedAt) continue
    const t = new Date(d.updatedAt).getTime()
    if (Number.isFinite(t) && t > latest) latest = t
  }
  return latest > 0 ? new Date(latest) : fallback
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [
    blogPostsResult,
    projectsResult,
    serviceAreasResult,
    servicesResult,
    teamMembersResult,
    homeGlobal,
    aboutGlobal,
    contactGlobal,
  ] = await Promise.all([
    payload.find({
      collection: 'blog-posts',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'projects',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'service-areas',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'services',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'team-members',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload
      .findGlobal({ slug: 'home', depth: 0, select: { updatedAt: true } as never })
      .catch(() => null),
    payload
      .findGlobal({ slug: 'about', depth: 0, select: { updatedAt: true } as never })
      .catch(() => null),
    payload
      .findGlobal({ slug: 'contact', depth: 0, select: { updatedAt: true } as never })
      .catch(() => null),
  ])

  const now = new Date()
  const homeUpdated = homeGlobal?.updatedAt
    ? new Date(homeGlobal.updatedAt)
    : now
  const aboutUpdated = aboutGlobal?.updatedAt
    ? new Date(aboutGlobal.updatedAt)
    : now
  const contactUpdated = contactGlobal?.updatedAt
    ? new Date(contactGlobal.updatedAt)
    : now

  // Index-page lastmods reflect the most recently updated child document.
  const blogIndexLastMod = maxUpdatedAt(blogPostsResult.docs, now)
  const portfolioIndexLastMod = maxUpdatedAt(projectsResult.docs, now)
  const serviceAreasIndexLastMod = maxUpdatedAt(serviceAreasResult.docs, now)
  const servicesIndexLastMod = maxUpdatedAt(servicesResult.docs, now)

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: homeUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: aboutUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: servicesIndexLastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: portfolioIndexLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: blogIndexLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: contactUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/service-areas`,
      lastModified: serviceAreasIndexLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/book-appointment`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/cost-estimator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/message-from-ceo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/our-designers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/client-success-stories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: portfolioIndexLastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sitemap`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ]

  const blogPages: MetadataRoute.Sitemap = blogPostsResult.docs
    .filter((post) => Boolean(post?.slug))
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  const portfolioPages: MetadataRoute.Sitemap = projectsResult.docs
    .filter((project) => Boolean(project?.slug))
    .map((project) => ({
      url: `${SITE_URL}/portfolio/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const serviceAreaPages: MetadataRoute.Sitemap = serviceAreasResult.docs
    .filter((area) => Boolean(area?.slug))
    .map((area) => ({
      url: `${SITE_URL}/service-areas/${area.slug}`,
      lastModified: area.updatedAt ? new Date(area.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  // The `slug` on a service IS the full path (e.g. "residential-interior" or
  // "commercial-interior/restaurant-and-cafe-interior-design") — services use
  // the catch-all route /services/[...slug].
  const servicePages: MetadataRoute.Sitemap = servicesResult.docs
    .filter((service) => Boolean(service?.slug))
    .map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const teamMemberPages: MetadataRoute.Sitemap = teamMembersResult.docs
    .filter((m) => Boolean((m as { slug?: string })?.slug))
    .map((m) => ({
      url: `${SITE_URL}/our-designers/${(m as { slug: string }).slug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [
    ...staticPages,
    ...servicePages,
    ...portfolioPages,
    ...serviceAreaPages,
    ...teamMemberPages,
    ...blogPages,
  ]
}
