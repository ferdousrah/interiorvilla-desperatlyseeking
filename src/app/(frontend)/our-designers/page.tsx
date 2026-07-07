import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { DesignersPage, TeamMember, Media, ServiceArea } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default async function OurDesignersPage() {
  const payload = await getPayload({ config: configPromise })

  const [data, teamData, serviceAreasData] = await Promise.all([
    (getCachedGlobal('designers-page', 2)() as Promise<DesignersPage>).catch(
      () => null as unknown as DesignersPage,
    ),
    payload.find({ collection: 'team-members', depth: 1, limit: 100 }),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  // Reverse the default order so leadership (added first… shown last by
  // default) appears at the top — CEO first, then the rest.
  const team = (teamData.docs as TeamMember[]).slice().reverse()
  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const siteUrl = getSiteUrl()

  const heroImage = data?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  // Person schema per designer — EEAT signal
  const teamSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Desperately Seeking Team',
    itemListElement: team.map((m, i) => {
      const photo = m.photo as Media | null
      const photoUrl = photo?.sizes?.medium?.url || photo?.url || null
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Person',
          name: m.name,
          ...(m.designation && { jobTitle: m.designation }),
          worksFor: { '@id': `${siteUrl}/#business` },
          ...(photoUrl && {
            image: photoUrl.startsWith('http') ? photoUrl : `${siteUrl}${photoUrl}`,
          }),
        },
      }
    }),
  }

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Meet Our Team', url: `${siteUrl}/our-designers` },
        ]}
      />

      <PageHero
        title={data?.hero?.title || 'Meet Our Team'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meet Our Team', href: '/our-designers', isActive: true },
        ]}
      />

      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {data?.introText && (
            <p className="text-[#626161] text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto mb-12 [font-family:'Fahkwang',Helvetica]">
              {data.introText}
            </p>
          )}

          {team.length === 0 ? (
            <p className="text-center text-[#626161] py-12">
              Our designers will appear here soon — add them in the admin panel
              (Collections → Team Members).
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {team.map((member) => {
                const photo = member.photo as Media | null
                const photoUrl =
                  photo?.sizes?.medium?.url || photo?.url || '/placeholder.webp'
                const hasBioPage = Boolean(member.slug)
                const CardInner = (
                  <>
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      <Image
                        src={photoUrl}
                        alt={photo?.alt || member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica] group-hover:text-primary transition-colors">
                        {member.name}
                      </h2>
                      {member.designation && (
                        <p className="text-sm text-primary font-medium mt-0.5">
                          {member.designation}
                        </p>
                      )}
                      {member.licenseNumber && (
                        <p className="text-xs text-[#626161] mt-1.5">
                          License: {member.licenseNumber}
                        </p>
                      )}
                      {hasBioPage && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E75227] mt-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:gap-2 transition-all duration-300">
                          View Profile
                          <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </div>
                  </>
                )

                const cardClass =
                  'group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100'

                return hasBioPage ? (
                  <Link
                    key={member.id}
                    href={`/our-designers/${member.slug}`}
                    className={cardClass}
                    aria-label={`View profile: ${member.name}`}
                  >
                    {CardInner}
                  </Link>
                ) : (
                  <div key={member.id} className={cardClass}>
                    {CardInner}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const data = (await (getCachedGlobal('designers-page', 1)() as Promise<DesignersPage>).catch(
    () => null as unknown as DesignersPage,
  ))
  const seo = data?.seoDetails
  const title = seo?.metaTitle || 'Meet Our Team | Desperately Seeking'
  const description =
    seo?.metaDescription ||
    'Meet the architects, interior designers, and project managers behind Desperately Seeking — the creative team transforming spaces across Bangladesh.'
  return {
    title,
    description,
    alternates: { canonical: '/our-designers' },
    openGraph: mergeOpenGraph({ title, description, url: '/our-designers' }),
  }
}

export const revalidate = 60
