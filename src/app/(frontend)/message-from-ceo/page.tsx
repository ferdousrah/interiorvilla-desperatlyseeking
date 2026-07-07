import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { CeoMessage, Media, ServiceArea } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import Image from 'next/image'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import RichText from '@/components/RichText'

export default async function MessageFromCeoPage() {
  const payload = await getPayload({ config: configPromise })

  const [data, serviceAreasData] = await Promise.all([
    (getCachedGlobal('ceo-message', 2)() as Promise<CeoMessage>).catch(
      () => null as unknown as CeoMessage,
    ),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const siteUrl = getSiteUrl()

  const heroImage = data?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'
  const ceoPhoto = data?.ceoPhoto as Media | null
  const ceoPhotoUrl = ceoPhoto?.sizes?.medium?.url || ceoPhoto?.url || null
  const signature = data?.signatureImage as Media | null
  const signatureUrl = signature?.url || null

  const ceoName = data?.ceoName || 'Md Ashikur Rahman'
  const ceoTitle = data?.ceoTitle || 'Founder & CEO, Desperately Seeking'
  const stats = (data?.stats ?? []).filter((s) => s.value && s.label)

  // Person schema for the CEO — EEAT signal
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: ceoName,
    jobTitle: ceoTitle,
    worksFor: { '@id': `${siteUrl}/#business` },
    ...(ceoPhotoUrl && {
      image: ceoPhotoUrl.startsWith('http') ? ceoPhotoUrl : `${siteUrl}${ceoPhotoUrl}`,
    }),
    url: `${siteUrl}/message-from-ceo`,
  }

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Message from CEO', url: `${siteUrl}/message-from-ceo` },
        ]}
      />

      <PageHero
        title={data?.hero?.title || 'Message from the CEO'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Message from CEO', href: '/message-from-ceo', isActive: true },
        ]}
      />

      {/* ───── Hero pull-quote ───── */}
      {data?.quote && (
        <section className="w-full bg-white pt-14 md:pt-20 pb-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <span
              aria-hidden="true"
              className="block text-primary/20 text-7xl md:text-8xl leading-none font-serif select-none mb-2"
            >
              &ldquo;
            </span>
            <p className="text-2xl md:text-3xl lg:text-[34px] leading-snug text-[#01190c] font-medium [font-family:'Fahkwang',Helvetica] -mt-6 md:-mt-10">
              {data.quote}
            </p>
            <div className="mx-auto mt-7 flex items-center justify-center gap-3">
              <span className="w-10 h-px bg-primary/40" />
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-10 h-px bg-primary/40" />
            </div>
          </div>
        </section>
      )}

      {/* ───── Body: photo card + message ───── */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Photo card (sticky) */}
            <div className="lg:w-[340px] shrink-0">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden bg-white">
                  {ceoPhotoUrl ? (
                    <div className="group relative w-full aspect-[4/5] overflow-hidden">
                      <Image
                        src={ceoPhotoUrl}
                        alt={ceoName}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 1024px) 100vw, 340px"
                        priority
                      />
                      {/* subtle bottom gradient for name legibility if needed */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/5] bg-gray-100" />
                  )}

                  <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica]">
                      {ceoName}
                    </h2>
                    <p className="text-sm text-primary font-medium mt-1">{ceoTitle}</p>

                    {stats.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2">
                        {stats.slice(0, 3).map((s, i) => (
                          <div key={i}>
                            <div className="text-xl md:text-2xl font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica]">
                              {s.value}
                            </div>
                            <div className="text-[10px] sm:text-xs text-[#626161] leading-tight mt-0.5">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0 max-w-2xl">
              {data?.message ? (
                <div
                  className="prose prose-base max-w-none text-[#48515c]
                    prose-headings:text-[#01190c] prose-headings:[font-family:'Fahkwang',Helvetica]
                    prose-strong:text-[#01190c] prose-a:text-primary
                    [font-family:'Fahkwang',Helvetica] leading-relaxed
                    [&_p]:!text-left [&_div]:!text-left [&_p]:mb-5"
                >
                  <RichText
                    data={data.message as DefaultTypedEditorState}
                    enableGutter={false}
                    enableProse={false}
                  />
                </div>
              ) : (
                <p className="text-[#626161] leading-relaxed">
                  The CEO&apos;s message will appear here once added from the admin panel
                  (Globals → Message from CEO).
                </p>
              )}

              {/* Signature card */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                {signatureUrl && (
                  <Image
                    src={signatureUrl}
                    alt={`${ceoName} signature`}
                    width={180}
                    height={70}
                    className="object-contain mb-3"
                  />
                )}
                <div className="text-lg font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica]">
                  {ceoName}
                </div>
                <div className="text-sm text-[#626161]">{ceoTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const data = (await (getCachedGlobal('ceo-message', 1)() as Promise<CeoMessage>).catch(
    () => null as unknown as CeoMessage,
  ))
  const seo = data?.seoDetails
  const title = seo?.metaTitle || 'Message from the CEO | Desperately Seeking'
  const description =
    seo?.metaDescription ||
    'A personal message from the Founder & CEO of Desperately Seeking — our story, our values, and our promise to every client in Bangladesh.'
  return {
    title,
    description,
    alternates: { canonical: '/message-from-ceo' },
    openGraph: mergeOpenGraph({ title, description, url: '/message-from-ceo' }),
  }
}

export const revalidate = 60
