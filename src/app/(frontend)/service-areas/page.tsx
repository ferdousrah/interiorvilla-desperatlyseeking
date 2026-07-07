import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceArea } from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { ServiceAreasContent } from './components/ServiceAreasContent'
import { ServiceAreasCTA } from './components/ServiceAreasCTA'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export const metadata: Metadata = {
  title: 'Service Areas | Desperately Seeking',
  description:
    'Explore our interior design service areas across Bangladesh. Desperately Seeking provides premium residential and commercial interior design services.',
  alternates: { canonical: '/service-areas' },
}

export default async function ServiceAreasPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch all service areas
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    sort: 'areaName',
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Service Areas', href: '/service-areas', isActive: true },
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
      <PageHero
        title="Our Service Areas"
        bgImage="/image.webp"
        breadcrumbs={breadcrumbs}
      />

      {/* Service Areas Content */}
      <ServiceAreasContent serviceAreas={serviceAreas} />

      {/* CTA Section */}
      <ServiceAreasCTA />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export const revalidate = 60
