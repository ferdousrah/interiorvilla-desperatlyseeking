import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Service, ServiceArea } from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { ServicesContent } from './components/ServicesContent'
import { ServicesCTA } from './components/ServicesCTA'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export const metadata: Metadata = {
  title: 'Our Services | Desperately Seeking',
  description:
    'Explore our comprehensive interior design services including Residential Interior, Commercial Interior, and Architectural Consultancy. Transform your space with Desperately Seeking.',
  alternates: { canonical: '/services' },
}

// Default category configurations (color codes and descriptions)
const categoryConfig: Record<string, { colorCode: string; bgColor: string; description: string }> = {
  residential: {
    colorCode: '#75BF44',
    bgColor: '#F0F9E8',
    description: 'Transform your home into a sanctuary of style and comfort. Our residential interior design services create personalized spaces that reflect your unique lifestyle.',
  },
  commercial: {
    colorCode: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Create inspiring workspaces that boost productivity and reflect your brand identity. Our commercial interior solutions are designed for success.',
  },
  architectural: {
    colorCode: '#F59E0B',
    bgColor: '#FFFBEB',
    description: 'Expert architectural guidance from concept to completion. Our consultancy services help bring your vision to life with professional expertise.',
  },
}

// Helper to determine category type from slug
function getCategoryType(slug: string): string {
  if (slug.includes('residential')) return 'residential'
  if (slug.includes('commercial')) return 'commercial'
  if (slug.includes('architectural')) return 'architectural'
  return 'residential'
}

// Build service categories from CMS data
async function buildServiceCategories(services: Service[]) {
  // Separate parent services and sub-services
  const parentServices = services.filter(s => !s.slug.includes('/'))
  const subServices = services.filter(s => s.slug.includes('/'))

  // Build category structure
  const categories = parentServices.map(parent => {
    const categoryType = getCategoryType(parent.slug)
    const defaultConfig = { colorCode: '#75BF44', bgColor: '#F0F9E8', description: '' }
    const config = categoryConfig[categoryType] || defaultConfig

    // Find sub-services for this parent
    const subcategories = subServices
      .filter(sub => sub.slug.startsWith(parent.slug + '/'))
      .map(sub => ({
        title: sub.title,
        slug: sub.slug,
        description: sub.shortDescription || '',
      }))

    return {
      id: categoryType,
      title: parent.title,
      slug: parent.slug,
      description: parent.shortDescription || config.description,
      colorCode: parent.ColorCode || config.colorCode,
      bgColor: config.bgColor,
      subcategories,
    }
  })

  return categories
}

export default async function ServicesPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch all services from CMS
  const servicesData = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 100,
  })

  const services = servicesData.docs as Service[]

  // Build service categories from CMS data
  const serviceCategories = await buildServiceCategories(services)

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services', isActive: true },
  ]

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({
          name: b.label,
          url: `${siteUrl}${b.href}`,
        }))}
      />
      {/* Hero Section */}
      <PageHero title="Our Services" bgImage="/image.webp" breadcrumbs={breadcrumbs} />

      {/* Services Content */}
      <ServicesContent categories={serviceCategories} />

      {/* CTA Section */}
      <ServicesCTA />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export const revalidate = 60
