import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceArea } from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { BookAppointmentContent } from './components/BookAppointmentContent'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export default async function BookAppointmentPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Book Appointment', url: `${siteUrl}/book-appointment` },
        ]}
      />
      {/* Hero Section */}
      <PageHero
        title="Book an Appointment"
        bgImage="/image.webp"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Book Appointment', href: '/book-appointment', isActive: true },
        ]}
      />

      {/* Appointment Content Section */}
      <BookAppointmentContent />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Book an Appointment | Desperately Seeking',
  description:
    'Schedule a free consultation with Desperately Seeking. Our expert interior designers are ready to help you transform your space.',
  alternates: { canonical: '/book-appointment' },
}

export const revalidate = 60
