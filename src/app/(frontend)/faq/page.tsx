import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ServiceArea } from '@/payload-types'
import Link from 'next/link'

import { PageHero } from '../components/ui/PageHero'
import { FAQAccordion } from './components/FAQAccordion'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

// Default FAQ data - can be replaced with CMS data later
const defaultFAQs = [
  {
    category: 'General',
    question: 'What services does Desperately Seeking offer?',
    answer:
      'Desperately Seeking offers comprehensive interior design services including residential interior design, commercial interior design, architectural consultancy, space planning, furniture selection, color consultation, and project management. We handle projects of all sizes, from single room makeovers to complete home and office transformations.',
  },
  {
    category: 'General',
    question: 'Which areas do you serve in Bangladesh?',
    answer:
      'We primarily serve Dhaka and its surrounding areas, including Gulshan, Banani, Dhanmondi, Uttara, Bashundhara, and other major neighborhoods. We also take on projects in Chittagong, Sylhet, and other major cities across Bangladesh. Contact us to discuss your specific location.',
  },
  {
    category: 'Process',
    question: 'How does the design process work?',
    answer:
      'Our design process begins with an initial consultation where we understand your requirements, preferences, and budget. We then create concept designs and mood boards for your approval. Once the design is finalized, we handle procurement, project management, and installation. We keep you informed at every stage of the process.',
  },
  {
    category: 'Process',
    question: 'How long does a typical interior design project take?',
    answer:
      'Project timelines vary based on scope and complexity. A single room makeover might take 4-6 weeks, while a complete home interior can take 3-6 months. Commercial projects may take longer depending on the size. During our consultation, we will provide you with a detailed timeline specific to your project.',
  },
  {
    category: 'Pricing',
    question: 'What is your pricing structure?',
    answer:
      'Our pricing depends on the scope of work, design complexity, and materials chosen. We offer different packages to suit various budgets. After understanding your requirements during the initial consultation, we provide a detailed quote with transparent pricing. There are no hidden costs.',
  },
  {
    category: 'Pricing',
    question: 'Do you offer free consultations?',
    answer:
      'Yes, we offer a free initial consultation where we discuss your project ideas, understand your requirements, and provide preliminary advice. This helps both parties understand if we are the right fit for your project. Book your free consultation through our website or call us directly.',
  },
  {
    category: 'Materials',
    question: 'Do you provide furniture and materials?',
    answer:
      'Yes, we handle the complete procurement of furniture, fixtures, materials, and accessories for your project. We work with trusted suppliers and manufacturers to ensure quality products at competitive prices. You can also choose to purchase items independently if you prefer.',
  },
  {
    category: 'Materials',
    question: 'Can I choose my own furniture and materials?',
    answer:
      'Absolutely! We can work with furniture and materials you have already chosen or help you source items that match your vision and budget. Our designers can also provide guidance on what will work best for your space while respecting your preferences.',
  },
  {
    category: 'Project',
    question: 'Do you handle the construction and renovation work?',
    answer:
      'Yes, we provide end-to-end project management including civil work, electrical, plumbing, carpentry, painting, and all other construction-related tasks. Our experienced project managers ensure quality execution and timely completion.',
  },
  {
    category: 'Project',
    question: 'What happens if I am not satisfied with the design?',
    answer:
      'Client satisfaction is our priority. We work closely with you throughout the design process, incorporating your feedback at every stage. We offer revisions to ensure the final design meets your expectations. Our goal is to create spaces you will love.',
  },
  {
    category: 'Warranty',
    question: 'Do you offer any warranty on your work?',
    answer:
      'Yes, we provide warranties on our workmanship and the products we supply. The warranty period varies depending on the type of work and materials. Specific warranty details are included in your project contract.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started with Desperately Seeking?',
    answer:
      'Getting started is easy! Simply book a free consultation through our website, call us, or visit our office. During the consultation, we will discuss your requirements, show you our portfolio, and explain our process. From there, we will create a proposal tailored to your needs.',
  },
]

export default async function FAQPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Group FAQs by category
  const categories = [...new Set(defaultFAQs.map((faq) => faq.category))]

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'FAQ', url: `${siteUrl}/faq` },
        ]}
      />
      {/* Hero Section */}
      <PageHero
        title="Frequently Asked Questions"
        bgImage="/image.webp"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'FAQ', href: '/faq', isActive: true },
        ]}
      />

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#01190c] mb-6">
              Have <span className="text-secondary">Questions</span>?
            </h2>
            <p className="text-base md:text-lg text-[#626161] max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our interior design services, process, and
              pricing. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto">
            {categories.map((category) => (
              <div key={category} className="mb-10">
                <h3 className="text-xl font-semibold text-[#01190c] mb-6">{category}</h3>
                <FAQAccordion faqs={defaultFAQs.filter((faq) => faq.category === category)} />
              </div>
            ))}
          </div>

          {/* Still Have Questions CTA */}
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-md">
              <h3 className="text-xl md:text-2xl font-semibold text-[#01190c] mb-4">
                Still Have Questions?
              </h3>
              <p className="text-[#626161] mb-6">
                Our team is here to help. Reach out to us and we&apos;ll get back to you as soon as
                possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-[#132A13] hover:bg-primary-hover text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Contact Us
                </Link>
                <Link
                  href="/book-appointment"
                  className="border-2 border-[#01190c] text-[#01190c] hover:bg-[#01190c] hover:text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-105"
                >
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export const metadata: Metadata = {
  title: 'FAQ | Desperately Seeking',
  description:
    'Find answers to frequently asked questions about Desperately Seeking services, design process, pricing, and more.',
  alternates: { canonical: '/faq' },
}

export const revalidate = 60
