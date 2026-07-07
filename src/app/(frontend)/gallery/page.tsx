import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import dynamic from 'next/dynamic'
import type {
  GalleryPage,
  GalleryItem,
  GalleryCategory,
  Project,
  ProjectCategory,
  Media,
  ServiceArea,
} from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { GalleryPhoto, GalleryVideo } from './components/GalleryContent'

const GalleryContent = dynamic(() => import('./components/GalleryContent'))

/**
 * Gallery data source:
 *   PRIMARY — admin-curated Gallery Items, organised by Gallery Categories
 *   (Collections → Gallery Items / Gallery Categories). Each item has a
 *   title, photo or video, category, optional link, and position.
 *
 *   FALLBACK — if no Gallery Items exist yet, photos/videos are pulled
 *   automatically from project galleries so the page is never empty.
 */
export default async function GalleryPageRoute() {
  const payload = await getPayload({ config: configPromise })

  const [data, itemsData, categoriesData, serviceAreasData] = await Promise.all([
    (getCachedGlobal('gallery-page', 2)() as Promise<GalleryPage>).catch(
      () => null as unknown as GalleryPage,
    ),
    payload
      .find({ collection: 'gallery-items', depth: 2, limit: 1000, sort: 'position' })
      .catch(() => ({ docs: [] as GalleryItem[] })),
    payload
      .find({ collection: 'gallery-categories', depth: 0, limit: 100, sort: 'position' })
      .catch(() => ({ docs: [] as GalleryCategory[] })),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const items = itemsData.docs as GalleryItem[]
  const galleryCategories = categoriesData.docs as GalleryCategory[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const siteUrl = getSiteUrl()

  const heroImage = data?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  const photos: GalleryPhoto[] = []
  const videos: GalleryVideo[] = []
  let categories: string[] = []

  if (items.length > 0) {
    // ---- PRIMARY: admin-curated gallery items ----
    const usedCategories = new Set<string>()

    for (const item of items) {
      const cat = item.category as GalleryCategory | number | null
      const categoryTitle =
        cat && typeof cat === 'object' ? cat.title : 'Other'
      usedCategories.add(categoryTitle)

      if (item.mediaType === 'photo') {
        const img = item.image as Media | null
        if (!img || typeof img === 'number') continue
        const thumb = img.sizes?.small?.url || img.sizes?.medium?.url || img.url
        const full = img.sizes?.large?.url || img.url
        if (!thumb || !full) continue
        photos.push({
          id: `gi-${item.id}`,
          url: thumb,
          fullUrl: full,
          alt: img.alt || item.title,
          title: item.title,
          link: item.link || null,
          category: categoryTitle,
        })
      } else if (item.mediaType === 'video' && item.videoUrl) {
        videos.push({
          id: `gi-${item.id}`,
          videoUrl: item.videoUrl,
          title: item.title,
          link: item.link || null,
          category: categoryTitle,
        })
      }
    }

    // Filter tabs: admin-defined order, only categories that have items
    categories = galleryCategories
      .map((c) => c.title)
      .filter((t) => usedCategories.has(t))
    // Any used category not in the collection list (edge case) goes last
    for (const t of usedCategories) {
      if (!categories.includes(t)) categories.push(t)
    }
  } else {
    // ---- FALLBACK: derive from project galleries ----
    // Wrapped: this is a heavy depth:2 query; a remote-DB blip during build
    // prerender shouldn't crash the whole page — degrade to empty instead.
    const projectsData = await payload
      .find({
        collection: 'projects',
        depth: 2,
        limit: 300,
        sort: 'portfolioPosition',
        select: { title: true, slug: true, category: true, gallery: true },
      })
      .catch(() => ({ docs: [] as Project[] }))
    const projects = projectsData.docs as Project[]
    const categorySet = new Set<string>()

    for (const project of projects) {
      const projectSlug = project.slug
      if (!projectSlug) continue
      const category =
        (project.category as ProjectCategory | null)?.title || 'Other'

      const galleryPhotos = project.gallery?.photos ?? []
      galleryPhotos.forEach((p, i) => {
        const img = p.image as Media | null
        if (!img || typeof img === 'number') return
        const thumb = img.sizes?.small?.url || img.sizes?.medium?.url || img.url
        const full = img.sizes?.large?.url || img.url
        if (!thumb || !full) return
        categorySet.add(category)
        photos.push({
          id: `${project.id}-p${i}`,
          url: thumb,
          fullUrl: full,
          alt: img.alt || `${project.title} — photo ${i + 1}`,
          title: project.title,
          link: `/portfolio/${projectSlug}`,
          category,
        })
      })

      const galleryVideos = project.gallery?.videos ?? []
      galleryVideos.forEach((v, i) => {
        if (!v.videoUrl) return
        categorySet.add(category)
        videos.push({
          id: `${project.id}-v${i}`,
          videoUrl: v.videoUrl,
          title: project.title,
          link: `/portfolio/${projectSlug}`,
          category,
        })
      })
    }

    categories = Array.from(categorySet).sort()
  }

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Gallery', url: `${siteUrl}/gallery` },
        ]}
      />

      <PageHero
        title={data?.hero?.title || 'Gallery'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Gallery', href: '/gallery', isActive: true },
        ]}
      />

      {data?.introText && (
        <section className="w-full pt-10 md:pt-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <p className="text-[#626161] text-base md:text-lg leading-relaxed [font-family:'Fahkwang',Helvetica]">
              {data.introText}
            </p>
          </div>
        </section>
      )}

      {photos.length === 0 && videos.length === 0 ? (
        <section className="w-full py-16 bg-white">
          <p className="text-center text-[#626161]">
            Gallery items will appear here — create categories (Collections →
            Gallery Categories) and add photos/videos (Collections → Gallery
            Items) from the admin panel.
          </p>
        </section>
      ) : (
        <GalleryContent photos={photos} videos={videos} categories={categories} />
      )}

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const data = (await (getCachedGlobal('gallery-page', 1)() as Promise<GalleryPage>).catch(
    () => null as unknown as GalleryPage,
  ))
  const seo = data?.seoDetails
  const title = seo?.metaTitle || 'Project Gallery — Photos & Videos | Desperately Seeking'
  const description =
    seo?.metaDescription ||
    'Browse photos and videos from Desperately Seeking completed projects across Bangladesh — residential, commercial, and office interiors by category.'
  return {
    title,
    description,
    alternates: { canonical: '/gallery' },
    openGraph: mergeOpenGraph({ title, description, url: '/gallery' }),
  }
}

export const revalidate = 60
