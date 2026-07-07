import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getGoogleReviews } from '@/utilities/getGoogleReviews'
import type { About, Home, TeamMember, Media, ServiceArea, GoogleReview } from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { ExperienceSection } from './components/ExperienceSection'
import GoogleReviewsWidget from './components/GoogleReviewsWidget'
import { ApproachSection } from './components/ApproachSection'
import { MissionVisionSection } from './components/MissionVisionSection'
import { TeamSection } from './components/TeamSection'
import { AboutCTASection } from './components/AboutCTASection'
import { FooterSection } from '../components/sections/FooterSection'
import SEOContentBlock from '../components/ui/SEOContentBlock'
import RichText from '@/components/RichText'
import { BreadcrumbSchema, AggregateRatingSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch all data in parallel
  const [aboutData, homeData, teamMembersData, serviceAreasData, googleApiReviews, cmsReviewsData] =
    await Promise.all([
      getCachedGlobal('about', 2)() as Promise<About>,
      getCachedGlobal('home', 2)() as Promise<Home>,
      payload.find({ collection: 'team-members', depth: 1, limit: 50 }),
      payload.find({ collection: 'service-areas', depth: 0, limit: 200, select: { areaName: true, slug: true } }),
      getGoogleReviews(),
      payload.find({ collection: 'google-reviews', sort: 'position', depth: 1, limit: 200 }),
    ])

  const teamMembers = teamMembersData.docs as TeamMember[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Build unified reviews list.
  // The Google Places API only ever returns up to 5 (newest) reviews — a hard
  // Google limit. To show ALL reviews, add them in the admin "Google Reviews"
  // collection; they are merged in here. A dedup key (author + text start)
  // prevents the same review appearing twice when a CMS entry duplicates one
  // of the 5 live API reviews.
  const reviewItems: { id: string | number; authorName: string; authorPhoto: string; rating: number; text: string; relativeTime: string }[] = []
  const seenReviews = new Set<string>()
  const reviewKey = (name: string, text: string) =>
    `${(name || '').trim().toLowerCase()}|${(text || '').trim().toLowerCase().slice(0, 60)}`

  if (googleApiReviews?.reviews) {
    for (const r of googleApiReviews.reviews) {
      const key = reviewKey(r.authorName, r.text)
      if (seenReviews.has(key)) continue
      seenReviews.add(key)
      reviewItems.push({
        id: `google-${r.time}`,
        authorName: r.authorName,
        authorPhoto: r.authorPhoto,
        rating: r.rating,
        text: r.text,
        relativeTime: r.relativeTime,
      })
    }
  }

  const cmsReviews = cmsReviewsData.docs as GoogleReview[]
  for (const r of cmsReviews) {
    const key = reviewKey(r.reviewerName, r.reviewText)
    if (seenReviews.has(key)) continue
    seenReviews.add(key)
    const photo = r.reviewerPhoto as Media | undefined
    reviewItems.push({
      id: `cms-${r.id}`,
      authorName: r.reviewerName,
      authorPhoto: photo?.url || '',
      rating: r.rating,
      text: r.reviewText,
      relativeTime: r.reviewDate
        ? new Date(r.reviewDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '',
    })
  }

  const overallRating = googleApiReviews?.overallRating || homeData?.googleReviews?.overallRating || null
  const totalReviews = googleApiReviews?.totalReviews || homeData?.googleReviews?.totalReviews || null

  // Get hero image URL
  const heroImage = aboutData?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  const siteUrl = getSiteUrl()

  // Reviews emitted into the AggregateRating JSON-LD (what GSC counts as
  // "Review snippets"). Include every substantive 4★+ review — both the live
  // Google API ones and any added in the admin "Google Reviews" collection —
  // so GSC counts all of them, not just 5. Capped at 50 to keep the markup
  // a sane size.
  const featuredReviews = reviewItems
    .filter((r) => r.rating >= 4 && r.text && r.text.length > 40)
    .slice(0, 50)
    .map((r) => ({
      author: r.authorName,
      ratingValue: r.rating,
      text: r.text,
    }))

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'About Us', url: `${siteUrl}/about` },
        ]}
      />
      {overallRating && totalReviews && (
        <AggregateRatingSchema
          siteUrl={siteUrl}
          ratingValue={overallRating}
          reviewCount={totalReviews}
          reviews={featuredReviews}
        />
      )}
      {/* Hero Section */}
      <PageHero
        title={aboutData?.hero?.title || 'About Desperately Seeking — Best Interior Design Firm in Bangladesh'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about', isActive: true },
        ]}
      />

      {/* Experience Section + Google Reviews */}
      <ExperienceSection data={aboutData?.introSection}>
        <GoogleReviewsWidget
          reviews={reviewItems}
          overallRating={overallRating}
          totalReviews={totalReviews}
          googleReviewUrl={homeData?.googleReviews?.googleReviewUrl}
          businessName="Desperately Seeking"
          businessAddress="Dhaka, Bangladesh"
        />
      </ExperienceSection>

      {/* Approach Section */}
      <ApproachSection data={aboutData?.ourApproach} />

      {/* Mission & Vision Section */}
      <MissionVisionSection data={aboutData?.missionVision} />

      {/* Team Section */}
      <TeamSection data={aboutData?.teamSection} teamMembers={teamMembers} />

      {/* CTA Section */}
      <AboutCTASection />

      {/* SEO Content Block */}
      {(aboutData as any).seoContent && (
        <SEOContentBlock>
          <RichText data={(aboutData as any).seoContent} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutData = (await getCachedGlobal('about', 2)()) as About
  const seo = aboutData?.seoDetails

  return {
    title: seo?.metaTitle || 'About Desperately Seeking | Best Interior Firm in Bangladesh',
    description:
      seo?.metaDescription ||
      'Learn about Desperately Seeking — a premium interior design firm in Dhaka with 9+ years experience and 700+ completed projects. Trusted turnkey interior company for homes, offices & commercial spaces across Bangladesh.',
    alternates: { canonical: '/about' },
  }
}

// 60-second time-based ISR. On-demand revalidation via Payload hooks
// (see src/globals/About.ts afterChange) updates this page within seconds
// of any content change in the admin.
export const revalidate = 60
