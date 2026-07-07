import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Project, Media, ServiceArea } from '@/payload-types'

import { PageHero } from '../../components/ui/PageHero'
import { BeforeAfterSection } from './components/BeforeAfterSection'
import { ProjectGallery } from './components/ProjectGallery'
import { ProjectInfoSection } from './components/ProjectInfoSection'
import { CTASection } from './components/CTASection'
import { FooterSection } from '../../components/sections/FooterSection'
import { stripFormatting } from '@/utilities/formattedText'
import { BreadcrumbSchema } from '../../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { maybeRedirectByPath } from '@/utilities/slugRedirect'
import { matchServiceArea } from '@/utilities/matchServiceArea'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string): Promise<Project | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    where: {
      slug: { equals: slug },
    },
    depth: 1,
    limit: 1,
  })

  return result.docs[0] || null
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const project = await getProject(slug)

  if (!project) {
    // Slug may have been renamed — check the redirects collection before 404.
    await maybeRedirectByPath(payload, `/portfolio/${slug}`)
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

  // Contextual internal link: this project's location → its service-area page.
  const matchedArea = matchServiceArea(project.location, serviceAreas)
  const areaLink =
    matchedArea?.slug && matchedArea?.areaName
      ? { name: matchedArea.areaName, slug: matchedArea.slug }
      : null

  // Get featured image URL
  const featuredImage = project.featuredImage as Media | null
  const featuredImageUrl = featuredImage?.sizes?.large?.url || featuredImage?.url || '/image.webp'

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Project Details', href: `/portfolio/${slug}` },
    { label: project.title, href: `/portfolio/${slug}`, isActive: true },
  ]

  // Get gallery data - map to ensure proper types
  const photos = (project.gallery?.photos || []).map(p => ({
    image: p.image ?? null,
    id: p.id ?? null,
  })) as { image: Media | number | null; id?: string | null }[]
  const videos = project.gallery?.videos || []
  const plans = (project.gallery?.plans || []).map(p => ({
    image: p.image ?? null,
    id: p.id ?? null,
  })) as { image: Media | number | null; id?: string | null }[]

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
      <PageHero title={project.title} bgImage={featuredImageUrl} breadcrumbs={breadcrumbs} />

      {/* Before/After Section with Title and Description */}
      <BeforeAfterSection project={project} />

      {/* Project Gallery */}
      <ProjectGallery
        photos={photos}
        videos={videos}
        plans={plans}
        projectTitle={project.title}
      />

      {/* Project Info Section (Year, Square Footage, Location, Client) */}
      <ProjectInfoSection project={project} areaLink={areaLink} />

      {/* CTA Section */}
      <CTASection />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    return {
      title: 'Project Not Found | Desperately Seeking',
    }
  }

  const seo = project.seoDetails

  const plainShort = stripFormatting(project.shortDescription)

  // Per-page OG image: featuredImage → fallback to default
  const featuredImg = project.featuredImage as Media | null
  const ogImageUrl =
    featuredImg?.sizes?.large?.url || featuredImg?.url || null
  const siteUrl = getSiteUrl()
  const absoluteOgImage = ogImageUrl
    ? ogImageUrl.startsWith('http')
      ? ogImageUrl
      : `${siteUrl}${ogImageUrl}`
    : undefined

  return {
    title: seo?.metaTitle || `${project.title} | Desperately Seeking Portfolio`,
    description:
      seo?.metaDescription ||
      plainShort ||
      `Explore ${project.title} - a stunning interior design project by Desperately Seeking.`,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: mergeOpenGraph({
      title: seo?.metaTitle || `${project.title} | Desperately Seeking Portfolio`,
      description: seo?.metaDescription || plainShort || undefined,
      url: `/portfolio/${project.slug}`,
      ...(absoluteOgImage && {
        images: [
          {
            url: absoluteOgImage,
            alt: featuredImg?.alt || project.title,
          },
        ],
      }),
    }),
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    limit: 100,
    depth: 0,
  })

  return projects.docs
    .filter((project) => project.slug)
    .map((project) => ({
      slug: project.slug!,
    }))
}

export const revalidate = 60
export const dynamicParams = true
