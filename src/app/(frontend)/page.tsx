import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Home, Project, Testimonial, BlogPost, ServiceArea } from '@/payload-types'

import { HeroSection } from './components/sections/HeroSection'
import { FeaturedWorksHeader } from './components/sections/FeaturedWorksHeader'
import { FeaturedWorksSection } from './components/sections/FeaturedWorksSection'
import { AboutSection } from './components/sections/AboutSection'
import { ServicesSection } from './components/sections/ServicesSection'
import { OurProcessSection } from './components/sections/OurProcessSection'
import { TestimonialSection } from './components/sections/TestimonialSection'
import { BlogSection } from './components/sections/BlogSection'
import { CTASection } from './components/sections/CTASection'
import HomeFAQSection from './components/sections/HomeFAQSection'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import SEOContentBlock from './components/ui/SEOContentBlock'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { FooterSection } from './components/sections/FooterSection'
import { AggregateRatingSchema } from './components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'


export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch all data in parallel for better performance
  // Reduced depth to minimize payload size and query time
  const [homeData, sliderData, projectsData, testimonialsData, blogPostsData, serviceAreasData] =
    await Promise.all([
      // Home global data
      getCachedGlobal('home', 2)() as Promise<Home>,
      // Slider data for hero section - only need image
      payload.find({
        collection: 'slider',
        depth: 1,
        limit: 5,
      }),
      // Featured projects - reduced depth
      payload.find({
        collection: 'projects',
        where: {
          featuredOnHome: {
            equals: true,
          },
        },
        sort: 'position',
        depth: 1,
        limit: 8,
      }),
      // Testimonials - reduced depth
      payload.find({
        collection: 'testimonials',
        depth: 1,
        limit: 6,
      }),
      // Latest blog posts - reduced depth
      payload.find({
        collection: 'blog-posts',
        sort: '-publishedDate',
        depth: 1,
        // 1 featured + 6 slider cards (3 slides × 2)
        limit: 7,
      }),
      // Service areas for footer - minimal depth
      payload.find({
        collection: 'service-areas',
        depth: 0,
        limit: 200,
        select: { areaName: true, slug: true },
      }),
    ])

  // Pass the data to sections
  const slides = sliderData.docs || []
  const projects = projectsData.docs as Project[]
  const testimonials = testimonialsData.docs as Testimonial[]
  const blogPosts = blogPostsData.docs as BlogPost[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  const siteUrl = getSiteUrl()
  const aggRating = homeData?.googleReviews?.overallRating
  const aggCount = homeData?.googleReviews?.totalReviews

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden">
      {aggRating && aggCount ? (
        <AggregateRatingSchema
          siteUrl={siteUrl}
          ratingValue={aggRating}
          reviewCount={aggCount}
        />
      ) : null}
      {/* Hero Section */}
      <HeroSection slides={slides} />

      {/* Featured Works Header */}
      <FeaturedWorksHeader
        title={homeData?.featuredWorks?.sectionTitle || 'Our Featured Works'}
        subtitle={
          homeData?.featuredWorks?.sectionDescription ||
          'Explore our showcase of exceptional interior design projects that reflect our commitment to quality, creativity, and client satisfaction.'
        }
      />

      {/* Featured Works/Projects Section */}
      <FeaturedWorksSection projects={projects} />

      {/* About Section */}
      <AboutSection data={homeData?.aboutSection} />

      {/* Services Section */}
      <ServicesSection />

      {/* Our Process Section */}
      <OurProcessSection />

      {/* Testimonial Section */}
      <TestimonialSection testimonials={testimonials} />

      {/* Blog Section */}
      <BlogSection posts={blogPosts} />      

      {/* FAQ Section */}
      <HomeFAQSection data={homeData?.faqSection} />

      {/* CTA Section */}
      <CTASection />

      {/* SEO Content Block */}
      {homeData?.seoContent && (
        <SEOContentBlock>
          <RichText data={homeData.seoContent as DefaultTypedEditorState} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

// Revalidate page every 60 seconds for better caching
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const homeData = (await getCachedGlobal('home', 2)()) as Home
  const seo = homeData?.seoDetails

  const title = seo?.metaTitle || 'Best Interior Design Company in Bangladesh | Desperately Seeking'
  const description =
    seo?.metaDescription ||
    'Transform your space with Desperately Seeking. Professional interior design services for residential and commercial spaces in Bangladesh.'

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: mergeOpenGraph({
      title,
      description,
      url: '/',
    }),
  }
}
