import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Portfolio, Project, ServiceArea, Media } from '@/payload-types'
import Link from 'next/link'

import { PageHero } from '../components/ui/PageHero'
import { PortfolioContent } from './components/PortfolioContent'
import { PortfolioCTA } from './components/PortfolioCTA'
import { FooterSection } from '../components/sections/FooterSection'
import SEOContentBlock from '../components/ui/SEOContentBlock'
import RichText from '@/components/RichText'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export default async function PortfolioPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch portfolio global data
  const portfolioData = (await getCachedGlobal('portfolio', 2)()) as Portfolio

  // Fetch initial projects + all projects + service areas in parallel
  const [projectsData, allProjectsData, serviceAreasData] = await Promise.all([
    // First batch for infinite scroll display
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 9,
      sort: 'portfolioPosition',
    }),
    // All projects (title + slug only) for crawlable index
    payload.find({
      collection: 'projects',
      depth: 0,
      limit: 1000,
      sort: 'portfolioPosition',
      select: { title: true, slug: true },
    }),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const projects = projectsData.docs as Project[]
  const allProjects = allProjectsData.docs as Pick<Project, 'id' | 'title' | 'slug'>[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const totalProjects = projectsData.totalDocs

  // Get hero image URL
  const heroImage = portfolioData?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Portfolio', url: `${siteUrl}/portfolio` },
        ]}
      />
      {/* Hero Section */}
      <PageHero
        title={portfolioData?.hero?.title || 'Our Portfolio'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Portfolio', href: '/portfolio', isActive: true },
        ]}
      />

      {/* Portfolio Content */}
      <PortfolioContent
        initialProjects={projects}
        totalProjects={totalProjects}
        introText={portfolioData?.introText}
      />

      {/* All Projects Index — server-rendered for full crawlability */}
      {allProjects.length > 9 && (
        <section className="w-full bg-[#f7f9fb] border-t border-gray-100 py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="text-sm font-semibold text-[#48515c] uppercase tracking-widest mb-5">
              Browse All Projects ({allProjects.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
              {allProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="text-sm text-[#48515c] hover:text-primary transition-colors duration-200 line-clamp-1"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <PortfolioCTA />

      {/* SEO Content Block */}
      {(portfolioData as any).seoContent && (
        <SEOContentBlock>
          <RichText data={(portfolioData as any).seoContent} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const portfolioData = (await getCachedGlobal('portfolio', 2)()) as Portfolio
  const seo = portfolioData?.seoDetails

  return {
    title: seo?.metaTitle || 'Portfolio | Desperately Seeking',
    description:
      seo?.metaDescription ||
      'Explore our portfolio of stunning interior design projects. From residential to commercial spaces, see how Desperately Seeking transforms spaces across Bangladesh.',
    alternates: { canonical: '/portfolio' },
  }
}

export const revalidate = 60
