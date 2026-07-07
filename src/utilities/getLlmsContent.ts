import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { LLMS_CACHE_TAG } from './llmsCacheTag'
import { stripFormatting } from './formattedText'

export { LLMS_CACHE_TAG }

export type LlmsService = {
  title: string
  slug: string
  shortDescription: string | null
}

export type LlmsServiceArea = {
  areaName: string
  slug: string
}

export type LlmsProject = {
  title: string
  slug: string
  category: string | null
  location: string | null
  year: string | null
  shortDescription: string | null
}

export type LlmsBlogPost = {
  title: string
  slug: string
  publishedDate: string | null
  shortDescription: string | null
  category: string | null
}

async function fetchLlmsContent() {
  const payload = await getPayload({ config: configPromise })

  const [servicesRes, serviceAreasRes, projectsRes, blogPostsRes] = await Promise.all([
    payload.find({
      collection: 'services',
      depth: 0,
      limit: 200,
      select: { title: true, slug: true, shortDescription: true },
    }),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 500,
      select: { areaName: true, slug: true },
    }),
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 500,
      sort: '-createdAt',
      select: {
        title: true,
        slug: true,
        category: true,
        location: true,
        year: true,
        shortDescription: true,
      },
    }),
    payload.find({
      collection: 'blog-posts',
      depth: 1,
      limit: 500,
      sort: '-publishedDate',
      select: {
        title: true,
        slug: true,
        publishedDate: true,
        shortDescription: true,
        category: true,
      },
    }),
  ])

  const services: LlmsService[] = servicesRes.docs.map((doc) => ({
    title: (doc as { title?: string }).title ?? '',
    slug: (doc as { slug?: string }).slug ?? '',
    shortDescription: (doc as { shortDescription?: string | null }).shortDescription ?? null,
  }))

  const serviceAreas: LlmsServiceArea[] = serviceAreasRes.docs.map((doc) => ({
    areaName: (doc as { areaName?: string }).areaName ?? '',
    slug: (doc as { slug?: string }).slug ?? '',
  }))

  const projects: LlmsProject[] = projectsRes.docs.map((doc) => {
    const d = doc as {
      title?: string
      slug?: string
      category?: { title?: string } | number | null
      location?: string | null
      year?: string | null
      shortDescription?: string | null
    }
    const category =
      d.category && typeof d.category === 'object' && d.category.title ? d.category.title : null
    return {
      title: d.title ?? '',
      slug: d.slug ?? '',
      category,
      location: d.location ?? null,
      year: d.year ?? null,
      shortDescription: d.shortDescription ? stripFormatting(d.shortDescription) : null,
    }
  })

  const blogPosts: LlmsBlogPost[] = blogPostsRes.docs.map((doc) => {
    const d = doc as {
      title?: string
      slug?: string
      publishedDate?: string | null
      shortDescription?: string | null
      category?: { title?: string } | number | null
    }
    const category =
      d.category && typeof d.category === 'object' && d.category.title ? d.category.title : null
    return {
      title: d.title ?? '',
      slug: d.slug ?? '',
      publishedDate: d.publishedDate ?? null,
      shortDescription: d.shortDescription ?? null,
      category,
    }
  })

  return { services, serviceAreas, projects, blogPosts }
}

export const getLlmsContent = unstable_cache(fetchLlmsContent, ['llms-content'], {
  tags: [LLMS_CACHE_TAG],
})
