import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Contact, Office, Media, ServiceArea } from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { ContactPageContent } from './components/ContactPageContent'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export default async function ContactPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch contact global data
  const contactData = (await getCachedGlobal('contact', 2)()) as Contact

  // Fetch all offices
  const officesData = await payload.find({
    collection: 'offices',
    depth: 1,
    limit: 10,
    sort: 'id',
  })

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const offices = officesData.docs as Office[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Get hero image URL
  const heroImage = contactData?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Contact Us', url: `${siteUrl}/contact` },
        ]}
      />
      {/* Hero Section */}
      <PageHero
        title={contactData?.hero?.title || 'Contact Us'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us', href: '/contact', isActive: true },
        ]}
      />

      {/* Contact Page Content (Client Component) */}
      <ContactPageContent offices={offices} />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const contactData = (await getCachedGlobal('contact', 2)()) as Contact
  const seo = contactData?.seoDetails

  return {
    title: seo?.metaTitle || 'Contact Us | Desperately Seeking',
    description:
      seo?.metaDescription ||
      'Get in touch with Desperately Seeking. Contact us for interior design consultations, inquiries, or visit our offices in Bangladesh.',
    alternates: { canonical: '/contact' },
  }
}

export const revalidate = 60
