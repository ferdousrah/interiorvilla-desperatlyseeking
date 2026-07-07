import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { TeamMember, Media, ServiceArea } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Linkedin } from 'lucide-react'

import { PageHero } from '../../components/ui/PageHero'
import { FooterSection } from '../../components/sections/FooterSection'
import { BreadcrumbSchema } from '../../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import RichText from '@/components/RichText'

interface MemberPageProps {
  params: Promise<{ slug: string }>
}

async function getMember(slug: string): Promise<TeamMember | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team-members',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return (result.docs[0] as TeamMember) || null
}

export default async function TeamMemberPage({ params }: MemberPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const member = await getMember(slug)
  if (!member) notFound()

  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })
  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const siteUrl = getSiteUrl()

  const photo = member.photo as Media | null
  const photoUrl = photo?.sizes?.medium?.url || photo?.url || '/placeholder.webp'
  const fullPhoto = photoUrl.startsWith('http') ? photoUrl : `${siteUrl}${photoUrl}`
  const specialties = (member.specialties ?? []).filter((s) => s.tag)

  // Person schema — EEAT signal
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    ...(member.designation && { jobTitle: member.designation }),
    worksFor: { '@id': `${siteUrl}/#business` },
    image: fullPhoto,
    url: `${siteUrl}/our-designers/${member.slug}`,
    ...(member.shortBio && { description: member.shortBio }),
    ...(member.linkedinUrl && { sameAs: [member.linkedinUrl] }),
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
          { name: 'Meet Our Team', url: `${siteUrl}/our-designers` },
          { name: member.name, url: `${siteUrl}/our-designers/${member.slug}` },
        ]}
      />

      <PageHero
        title={member.name}
        bgImage="/image.webp"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meet Our Team', href: '/our-designers' },
          { label: member.name, href: `/our-designers/${member.slug}`, isActive: true },
        ]}
      />

      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Link
            href="/our-designers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#626161] hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to team
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Photo card */}
            <div className="lg:w-[340px] shrink-0">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden bg-white">
                  <div className="group relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src={photoUrl}
                      alt={photo?.alt || member.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(max-width: 1024px) 100vw, 340px"
                      priority
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
                  </div>
                  <div className="p-6 text-center">
                    <h1 className="text-xl font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica]">
                      {member.name}
                    </h1>
                    {member.designation && (
                      <p className="text-sm text-primary font-medium mt-1">
                        {member.designation}
                      </p>
                    )}
                    {member.licenseNumber && (
                      <p className="text-xs text-[#626161] mt-1.5">
                        License: {member.licenseNumber}
                      </p>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-[#01190c] hover:border-primary hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex-1 min-w-0 max-w-2xl">
              {member.shortBio && (
                <p className="text-lg md:text-xl text-[#01190c] leading-relaxed font-medium [font-family:'Fahkwang',Helvetica] mb-8">
                  {member.shortBio}
                </p>
              )}

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {specialties.map((s, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-xs font-medium text-primary"
                    >
                      {s.tag}
                    </span>
                  ))}
                </div>
              )}

              {member.bio ? (
                <div
                  className="prose prose-base max-w-none text-[#48515c]
                    prose-headings:text-[#01190c] prose-headings:[font-family:'Fahkwang',Helvetica]
                    prose-strong:text-[#01190c] prose-a:text-primary
                    [font-family:'Fahkwang',Helvetica] leading-relaxed
                    [&_p]:!text-left [&_p]:mb-5"
                >
                  <RichText
                    data={member.bio as DefaultTypedEditorState}
                    enableGutter={false}
                    enableProse={false}
                  />
                </div>
              ) : (
                !member.shortBio && (
                  <p className="text-[#626161] leading-relaxed">
                    A detailed bio for {member.name} will appear here once added in the
                    admin panel (Collections → Team Members → Bio).
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata({ params }: MemberPageProps): Promise<Metadata> {
  const { slug } = await params
  const member = await getMember(slug)
  if (!member) {
    return { title: 'Team Member Not Found | Desperately Seeking' }
  }

  const siteUrl = getSiteUrl()
  const photo = member.photo as Media | null
  const photoUrl = photo?.sizes?.large?.url || photo?.url || null
  const absImg = photoUrl
    ? photoUrl.startsWith('http')
      ? photoUrl
      : `${siteUrl}${photoUrl}`
    : undefined

  const roleLine = member.designation ? `${member.designation} at Desperately Seeking` : 'Desperately Seeking'
  const title = `${member.name} — ${member.designation || 'Our Team'} | Desperately Seeking`
  const description =
    member.shortBio || `Meet ${member.name}, ${roleLine}. Part of the team transforming spaces across Bangladesh.`

  return {
    title,
    description,
    alternates: { canonical: `/our-designers/${member.slug}` },
    openGraph: mergeOpenGraph({
      title,
      description,
      url: `/our-designers/${member.slug}`,
      ...(absImg && { images: [{ url: absImg, alt: member.name }] }),
    }),
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const members = await payload.find({
    collection: 'team-members',
    limit: 100,
    depth: 0,
    select: { slug: true },
  })
  return members.docs
    .filter((m) => Boolean((m as { slug?: string }).slug))
    .map((m) => ({ slug: (m as { slug: string }).slug }))
}

export const revalidate = 60
export const dynamicParams = true
