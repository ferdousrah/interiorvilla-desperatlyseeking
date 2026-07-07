import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import dynamic from 'next/dynamic'
import type {
  SuccessStoriesPage,
  Testimonial,
  GoogleReview,
  Media,
  ServiceArea,
} from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { siteConfig } from '@/config/site'
import type {
  VideoStory,
  WrittenReview,
} from './components/SuccessStoriesContent'

const SuccessStoriesContent = dynamic(
  () => import('./components/SuccessStoriesContent'),
)

export default async function ClientSuccessStoriesPage() {
  const payload = await getPayload({ config: configPromise })

  const [data, testimonialsData, reviewsData, serviceAreasData] = await Promise.all([
    (getCachedGlobal('success-stories-page', 2)() as Promise<SuccessStoriesPage>).catch(
      () => null as unknown as SuccessStoriesPage,
    ),
    payload.find({ collection: 'testimonials', depth: 1, limit: 50 }),
    payload.find({ collection: 'google-reviews', sort: 'position', depth: 1, limit: 30 }),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const siteUrl = getSiteUrl()

  const heroImage = data?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  // Video testimonials
  const videos: VideoStory[] = (testimonialsData.docs as Testimonial[])
    .filter((t) => Boolean(t.videoUrl))
    .map((t) => {
      const cover = t.coverImage as Media | null
      return {
        id: t.id,
        title: t.title,
        details: t.shortDetails,
        coverUrl: cover?.sizes?.medium?.url || cover?.url || null,
        coverAlt: cover?.alt || t.title,
        videoUrl: t.videoUrl as string,
      }
    })

  // Written reviews from the CMS Google Reviews collection
  const reviews: WrittenReview[] = (reviewsData.docs as GoogleReview[]).map((r) => {
    const photo = r.reviewerPhoto as Media | null
    return {
      id: r.id,
      reviewerName: r.reviewerName,
      reviewerPhoto: photo?.sizes?.thumbnail?.url || photo?.url || null,
      rating: r.rating,
      text: r.reviewText,
      date: r.reviewDate
        ? new Date(r.reviewDate).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : null,
    }
  })

  // Review schema for the written reviews (attached to the business entity)
  const reviewSchema =
    reviews.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
          '@id': `${siteUrl}/#business`,
          // name + address repeated here (same @id as the layout's
          // OrganizationSchema, which Google merges) so this node is valid in
          // isolation — validators like SEMrush flag a LocalBusiness missing
          // name/address.
          name: siteConfig.name,
          url: siteUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.address.streetAddress,
            addressLocality: siteConfig.address.addressLocality,
            addressRegion: siteConfig.address.addressRegion,
            postalCode: siteConfig.address.postalCode,
            addressCountry: siteConfig.address.addressCountry,
          },
          review: reviews.slice(0, 10).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.reviewerName },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.text,
          })),
        }
      : null

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Client Success Stories', url: `${siteUrl}/client-success-stories` },
        ]}
      />

      <PageHero
        title={data?.hero?.title || 'Client Success Stories'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          {
            label: 'Client Success Stories',
            href: '/client-success-stories',
            isActive: true,
          },
        ]}
      />

      {data?.introText && (
        <section className="w-full pt-10 md:pt-14 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <p className="text-[#626161] text-base md:text-lg leading-relaxed [font-family:'Fahkwang',Helvetica]">
              {data.introText}
            </p>
          </div>
        </section>
      )}

      {videos.length === 0 && reviews.length === 0 ? (
        <section className="w-full py-16 bg-white">
          <p className="text-center text-[#626161]">
            Success stories will appear here soon — add video testimonials
            (Collections → Testimonials) or reviews (Collections → Google Reviews)
            from the admin panel.
          </p>
        </section>
      ) : (
        <SuccessStoriesContent
          videos={videos}
          reviews={reviews}
          videosTitle={data?.videosSectionTitle || 'Video Stories'}
          reviewsTitle={data?.reviewsSectionTitle || 'What Clients Say'}
        />
      )}

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const data = (await (
    getCachedGlobal('success-stories-page', 1)() as Promise<SuccessStoriesPage>
  ).catch(() => null as unknown as SuccessStoriesPage))
  const seo = data?.seoDetails
  const title = seo?.metaTitle || 'Client Success Stories | Desperately Seeking'
  const description =
    seo?.metaDescription ||
    'Video testimonials and reviews from real Desperately Seeking clients across Bangladesh — see the transformations and hear their stories.'
  return {
    title,
    description,
    alternates: { canonical: '/client-success-stories' },
    openGraph: mergeOpenGraph({ title, description, url: '/client-success-stories' }),
  }
}

export const revalidate = 60
