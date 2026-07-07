import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { ServiceArea } from '@/payload-types'
import type { CostEstimatorSettings } from '@/types/cost-estimator'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import CostEstimatorWizard from './components/CostEstimatorWizard'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

const DEFAULT_SETTINGS: CostEstimatorSettings = {
  heroTitle: 'Calculate Your Dream Space Cost Instantly',
  heroSubtitle:
    'Get an approximate cost for your interior design project in just a few steps.',
  welcomeButtonLabel: 'Get Started',
  finalButtonLabel: 'Show Me Total Cost',
  disclaimer:
    'These are indicative estimates based on Bangladesh market rates. Actual pricing depends on materials, scope, finishes, and site conditions.',
  resultTitle: 'Here is your estimated cost',
  resultSubtitle:
    "Thanks! We've also sent these details to our team — they'll be in touch within one business day with a detailed quote.",
  standardLow: 1500,
  standardHigh: 2500,
  premiumLow: 3000,
  premiumHigh: 4500,
  signatureLow: 5000,
  signatureHigh: 8000,
  cityMultiplierDhakaPrime: 1.1,
  cityMultiplierDhakaOther: 1.0,
  cityMultiplierChittagong: 0.95,
  cityMultiplierSylhet: 0.9,
  cityMultiplierOther: 0.85,
  projectTypeMultiplierResidential: 1.0,
  projectTypeMultiplierSingleRoom: 1.0,
  projectTypeMultiplierOffice: 1.1,
  projectTypeMultiplierCommercial: 1.15,
  sftLivingRoom: 200,
  sftKitchen: 80,
  sftBedroom: 140,
  sftBathroom: 50,
  sftDining: 120,
  sftFoyer: 60,
  sftFamilyLiving: 150,
  sftStudy: 100,
  addOns: [],
  packageStandard: {
    title: 'Standard',
    description:
      "A range of essential home interior solutions that's perfect for all your needs.",
    image: null,
    features: [
      { feature: 'Affordable pricing' },
      { feature: 'Convenient designs' },
      { feature: 'Basic accessories' },
    ],
  },
  packagePremium: {
    title: 'Premium',
    description:
      'Superior home interior solutions that will take your interiors to the next level.',
    image: null,
    features: [
      { feature: 'Mid-range pricing' },
      { feature: 'Premium designs' },
      { feature: 'Wide range of accessories' },
    ],
  },
  packageSignature: {
    title: 'Signature',
    description:
      'Super premium solutions that will take your home to the premium level.',
    image: null,
    features: [
      { feature: 'High-range pricing' },
      { feature: 'State-of-art designs' },
      { feature: 'Rich range of accessories' },
    ],
  },
  faqs: [],
  metaTitle: 'Interior Design Cost Estimator Bangladesh | Desperately Seeking',
  metaDescription:
    'Calculate the cost of your interior design project in Bangladesh. Free instant estimate for residential, commercial, and office spaces.',
}

const getCachedSettings = unstable_cache(
  async (): Promise<CostEstimatorSettings> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const settings = await payload.findGlobal({
        slug: 'cost-estimator-settings',
        depth: 2, // resolve package images
      })
      return {
        ...DEFAULT_SETTINGS,
        ...(settings as unknown as Partial<CostEstimatorSettings>),
      }
    } catch (err) {
      console.warn(
        '[cost-estimator] settings global unavailable, using defaults',
        err,
      )
      return DEFAULT_SETTINGS
    }
  },
  ['cost-estimator-settings'],
  { tags: ['global_cost-estimator-settings'] },
)

export default async function CostEstimatorPage() {
  const payload = await getPayload({ config: configPromise })

  const [settings, serviceAreasData] = await Promise.all([
    getCachedSettings(),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  const heroTitle = settings.heroTitle || 'Calculate Your Dream Space Cost Instantly'
  const heroSubtitle =
    settings.heroSubtitle ||
    'Get an approximate cost for your interior design project in just a few steps.'

  const faqs = (settings.faqs ?? []).filter((f) => f.question && f.answer)
  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to estimate interior design cost in Bangladesh',
    description:
      'A step-by-step guide to estimating the cost of interior design for residential, commercial, and office projects in Bangladesh.',
    step: [
      { '@type': 'HowToStep', name: 'Choose project type', text: 'Pick whether you are designing a full home, single room, office, or commercial space.' },
      { '@type': 'HowToStep', name: 'Tell us about the project', text: 'Select your city and current project status.' },
      { '@type': 'HowToStep', name: 'Add rooms or area', text: 'Count the rooms (residential) or enter total square feet (commercial).' },
      { '@type': 'HowToStep', name: 'Pick add-ons', text: 'Choose extras like wooden ceilings, custom carpentry, lighting, and more.' },
      { '@type': 'HowToStep', name: 'Pick a package', text: 'Standard, Premium, or Signature — each maps to a different per-sft price range.' },
      { '@type': 'HowToStep', name: 'Get the estimate', text: 'Provide your contact details and we will show your final estimate plus follow up with a detailed quote.' },
    ],
  }

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Cost Estimator', url: `${siteUrl}/cost-estimator` },
        ]}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <PageHero
        title={heroTitle}
        bgImage="/image.webp"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cost Estimator', href: '/cost-estimator', isActive: true },
        ]}
      />

      {/* Intro */}
      <section className="w-full bg-white pt-10 md:pt-14 pb-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="text-[#626161] text-base md:text-lg leading-relaxed [font-family:'Fahkwang',Helvetica] whitespace-pre-line">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section className="w-full bg-[#f7f9fb] py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CostEstimatorWizard settings={settings} />
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="w-full bg-white py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2
              className="text-2xl md:text-3xl font-bold text-[#01190c] mb-8 text-center"
              style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="rounded-xl border border-gray-100 bg-[#f7f9fb] px-5 py-4 group"
                >
                  <summary className="cursor-pointer text-sm sm:text-base font-semibold text-[#01190c] list-none flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-primary/20 flex items-center justify-center transition-transform group-open:rotate-180">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-3 text-sm sm:text-base text-[#626161] leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings()
  return {
    title: settings.metaTitle || 'Interior Design Cost Estimator Bangladesh | Desperately Seeking',
    description:
      settings.metaDescription ||
      'Calculate the cost of your interior design project in Bangladesh. Free instant estimate for residential, commercial, and office spaces.',
    alternates: { canonical: '/cost-estimator' },
  }
}

export const revalidate = 60
