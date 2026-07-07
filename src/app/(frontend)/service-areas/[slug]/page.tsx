import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceArea } from '@/payload-types'

import type { Project } from '@/payload-types'
import { PageHero } from '../../components/ui/PageHero'
import { ServiceAreaDetailContent } from './components/ServiceAreaDetailContent'
import { AreaProjects } from './components/AreaProjects'
import { ServiceAreasCTA } from '../components/ServiceAreasCTA'
import { matchServiceArea } from '@/utilities/matchServiceArea'
import { FooterSection } from '../../components/sections/FooterSection'
import SEOContentBlock from '../../components/ui/SEOContentBlock'
import RichText from '@/components/RichText'
import { BreadcrumbSchema } from '../../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { maybeRedirectByPath } from '@/utilities/slugRedirect'

interface ServiceAreaPageProps {
  params: Promise<{ slug: string }>
}

async function getServiceArea(slug: string): Promise<ServiceArea | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'service-areas',
    where: {
      slug: { equals: slug },
    },
    depth: 1,
    limit: 1,
  })

  return result.docs[0] || null
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const serviceArea = await getServiceArea(slug)

  if (!serviceArea) {
    await maybeRedirectByPath(payload, `/service-areas/${slug}`)
    notFound()
  }

  // Fetch all service areas for sidebar and footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    sort: 'areaName',
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Real portfolio projects located in this area → unique local content +
  // contextual internal links (area ↔ project) to help indexing.
  const projectsData = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 200,
    select: { title: true, slug: true, location: true, featuredImage: true },
  })
  const areaProjects = (projectsData.docs as Project[])
    .filter((p) => matchServiceArea(p.location, serviceAreas)?.slug === serviceArea.slug)
    .slice(0, 6)

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Service Areas', href: '/service-areas' },
    { label: serviceArea.areaName, href: `/service-areas/${slug}`, isActive: true },
  ]

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({
          name: b.label,
          url: b.href.startsWith('http') ? b.href : `${siteUrl}${b.href}`,
        }))}
      />
      {/* Hero Section */}
      <PageHero
        title={`Interior Design in ${serviceArea.areaName}`}
        bgImage="/image.webp"
        breadcrumbs={breadcrumbs}
      />

      {/* Service Area Detail Content */}
      <ServiceAreaDetailContent
        serviceArea={serviceArea}
        allServiceAreas={serviceAreas}
      />

      {/* Real projects located in this area (internal links + local proof) */}
      <AreaProjects areaName={serviceArea.areaName} projects={areaProjects} />

      {/* CTA Section */}
      <ServiceAreasCTA />

      {/* SEO Content Block */}
      {(serviceArea as any).seoContent && (
        <SEOContentBlock>
          <RichText data={(serviceArea as any).seoContent} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { slug } = await params
  const serviceArea = await getServiceArea(slug)

  if (!serviceArea) {
    return {
      title: 'Service Area Not Found | Desperately Seeking',
    }
  }

  const seo = serviceArea.seoDetails

  return {
    title: seo?.metaTitle || `Interior Design in ${serviceArea.areaName} | Desperately Seeking`,
    description:
      seo?.metaDescription ||
      `Professional interior design services in ${serviceArea.areaName}, Bangladesh. Residential & commercial interior design by Desperately Seeking.`,
    alternates: { canonical: `/service-areas/${serviceArea.slug}` },
    openGraph: mergeOpenGraph({
      title: seo?.metaTitle || `Interior Design in ${serviceArea.areaName} | Desperately Seeking`,
      description: seo?.metaDescription || undefined,
      url: `/service-areas/${serviceArea.slug}`,
    }),
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const serviceAreas = await payload.find({
    collection: 'service-areas',
    limit: 100,
    depth: 0,
  })

  return serviceAreas.docs.map((area) => ({
    slug: area.slug,
  }))
}

export const revalidate = 60
export const dynamicParams = true
