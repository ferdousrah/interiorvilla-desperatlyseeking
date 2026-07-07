import type { Metadata } from 'next'
import slugify from 'slugify'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Service, Project, Media, ServiceArea, ProjectCategory } from '@/payload-types'

import { PageHero } from '../../components/ui/PageHero'
import { ServiceSchema, BreadcrumbSchema } from '../../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { maybeRedirectByPath } from '@/utilities/slugRedirect'
import { ServiceIntroSection } from './components/ServiceIntroSection'
import { ServiceApproachSection } from './components/ServiceApproachSection'
import { ServiceProjectsSection } from './components/ServiceProjectsSection'
import { ServiceCTASection } from './components/ServiceCTASection'
import { FooterSection } from '../../components/sections/FooterSection'
import SEOContentBlock from '../../components/ui/SEOContentBlock'
import RichText from '@/components/RichText'

interface ServicePageProps {
  params: Promise<{ slug: string[] }>
}

async function getService(slugArray: string[]): Promise<Service | null> {
  const payload = await getPayload({ config: configPromise })

  // Join the slug array to form the full slug
  // e.g., ['residential', 'apartment-interior-design'] => 'residential/apartment-interior-design'
  // or ['residential-interior'] => 'residential-interior'
  const fullSlug = slugArray.join('/')

  const result = await payload.find({
    collection: 'services',
    where: {
      slug: { equals: fullSlug },
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] || null
}

// Determine service type from slug for project filtering
function getServiceType(slug: string[]): 'residential' | 'commercial' | 'architectural' | null {
  const firstSlug = slug[0]?.toLowerCase() || ''

  if (firstSlug.includes('residential')) return 'residential'
  if (firstSlug.includes('commercial')) return 'commercial'
  if (firstSlug.includes('architectural')) return 'architectural'

  return null
}

// Fetch the projects to show in "Recent Projects" for a service page.
//
// Sub-service pages (e.g. /services/commercial-interior/dental-chamber-...)
// must show ONLY topically-relevant projects. We match the project category
// whose slugified title equals the service's last slug segment — both derive
// from the same naming, so "Dental Chamber Interior Design" → the category
// slug "dental-chamber-interior-design" matches the service slug segment.
// If no category matches (or it has no projects), return [] so the section is
// hidden — never fall back to a broad list, which would surface the same
// irrelevant projects on every page.
//
// Parent landing pages (e.g. /services/commercial-interior) legitimately show
// a broad set, filtered by the isResidential/isCommercial/isArchitectural flag.
async function getProjectsForService(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string[],
): Promise<Project[]> {
  const isSubService = slug.length > 1

  if (isSubService) {
    const lastSegment = slug[slug.length - 1]
    const categories = await payload.find({
      collection: 'project-categories',
      depth: 0,
      limit: 200,
    })
    const match = (categories.docs as ProjectCategory[]).find(
      (c) => slugify(c.title || '', { lower: true, strict: true }) === lastSegment,
    )
    if (!match) return []

    const projectsResult = await payload.find({
      collection: 'projects',
      where: { category: { equals: match.id } },
      depth: 2,
      limit: 10,
      sort: 'portfolioPosition',
    })
    return projectsResult.docs as Project[]
  }

  // Parent service landing page → broad set by service-type flag.
  const serviceType = getServiceType(slug)
  if (!serviceType) return []

  const whereClause: Record<string, any> = {}
  if (serviceType === 'residential') whereClause.isResidential = { equals: true }
  else if (serviceType === 'commercial') whereClause.isCommercial = { equals: true }
  else if (serviceType === 'architectural') whereClause.isArchitectural = { equals: true }

  const projectsResult = await payload.find({
    collection: 'projects',
    where: whereClause,
    depth: 2,
    limit: 10,
    sort: 'portfolioPosition',
  })
  return projectsResult.docs as Project[]
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const service = await getService(slug)

  if (!service) {
    await maybeRedirectByPath(payload, `/services/${slug.join('/')}`)
    notFound()
  }

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Get hero image URL
  const heroImage = service.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  // Topically-relevant projects for this service's "Recent Projects" section.
  const projects = await getProjectsForService(payload, slug)

  // Build breadcrumbs based on slug depth
  const breadcrumbs: Array<{ label: string; href: string; isActive?: boolean }> = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
  ]

  // Add parent service breadcrumb if this is a nested service
  if (slug.length > 1 && slug[0]) {
    breadcrumbs.push({
      label: slug[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      href: `/services/${slug[0]}`,
    })
  }

  breadcrumbs.push({
    label: service.title,
    href: `/services/${slug.join('/')}`,
    isActive: true,
  })

  const siteUrl = getSiteUrl()
  const fullHeroImage = heroImageUrl.startsWith('http')
    ? heroImageUrl
    : `${siteUrl}${heroImageUrl}`

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <ServiceSchema
        name={service.title}
        description={service.shortDescription || `Professional ${service.title.toLowerCase()} services by Desperately Seeking.`}
        url={`${siteUrl}/services/${slug.join('/')}`}
        image={fullHeroImage}
        provider="Desperately Seeking"
        areaServed="Bangladesh"
      />
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({
          name: b.label,
          url: b.href.startsWith('http') ? b.href : `${siteUrl}${b.href}`,
        }))}
      />
      {/* Hero Section */}
      <PageHero
        title={service.hero?.title || service.title}
        bgImage={heroImageUrl}
        breadcrumbs={breadcrumbs}
      />

      {/* Intro Section (tagline / H2) */}
      <ServiceIntroSection data={service.introSection} />

      {/* Main SEO content block — high up (right after the intro) for content
          prominence. Its "Read More" opens a modal (fixed overlay) rather than
          expanding inline, so it adds no page height and can't disturb the
          pinned Recent Projects section below. */}
      {(service as any).seoContent && (
        <SEOContentBlock>
          <RichText data={(service as any).seoContent} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Approach Section */}
      <ServiceApproachSection data={service.ourApproach} />

      {/* Recent Projects — only when there are topically-relevant projects;
          otherwise the section is hidden rather than showing irrelevant ones. */}
      {projects.length > 0 && (
        <ServiceProjectsSection
          sectionDescription={service.recentProjects?.sectionDescription}
          projects={projects}
          colorCode={service.ColorCode}
          serviceTitle={service.title}
        />
      )}

      {/* CTA Section — closing action at the end of the page */}
      <ServiceCTASection serviceTitle={service.title} colorCode={service.ColorCode} />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    return {
      title: 'Service Not Found | Desperately Seeking',
    }
  }

  const seo = service.seoDetails

  // Per-page OG image: hero image → fallback to default
  const heroImg = service.hero?.heroImage as Media | null
  const ogImageUrl = heroImg?.sizes?.large?.url || heroImg?.url || null
  const siteUrl = getSiteUrl()
  const absoluteOgImage = ogImageUrl
    ? ogImageUrl.startsWith('http')
      ? ogImageUrl
      : `${siteUrl}${ogImageUrl}`
    : undefined

  return {
    title: seo?.metaTitle || `${service.title} | Desperately Seeking`,
    description:
      seo?.metaDescription ||
      service.shortDescription ||
      `Professional ${service.title.toLowerCase()} services by Desperately Seeking. Transform your space with our expert interior design solutions.`,
    alternates: { canonical: `/services/${slug.join('/')}` },
    openGraph: mergeOpenGraph({
      title: seo?.metaTitle || `${service.title} | Desperately Seeking`,
      description: seo?.metaDescription || service.shortDescription || undefined,
      url: `/services/${slug.join('/')}`,
      ...(absoluteOgImage && {
        images: [{ url: absoluteOgImage, alt: heroImg?.alt || service.title }],
      }),
    }),
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const services = await payload.find({
    collection: 'services',
    limit: 100,
    depth: 0,
  })

  return services.docs.map((service) => ({
    slug: service.slug.split('/'),
  }))
}

export const revalidate = 60
export const dynamicParams = true
