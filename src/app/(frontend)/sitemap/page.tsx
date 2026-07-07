import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import {
  Compass,
  Briefcase,
  MapPin,
  BookOpen,
  FolderOpen,
  ArrowUpRight,
  ChevronRight,
  Users,
} from 'lucide-react'
import type {
  BlogPost,
  Project,
  Service,
  ServiceArea,
  TeamMember,
} from '@/payload-types'

import { PageHero } from '../components/ui/PageHero'
import { FooterSection } from '../components/sections/FooterSection'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export const metadata: Metadata = {
  title: 'Sitemap | Desperately Seeking',
  description:
    'Browse all pages on Desperately Seeking — services, portfolio projects, blog posts, and service areas across Bangladesh.',
  alternates: { canonical: '/sitemap' },
}

// 6-hour ISR — same cadence as the XML sitemaps.
export const revalidate = 21600

const STATIC_PAGES: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Message from CEO', href: '/message-from-ceo' },
  { label: 'Meet Our Team', href: '/our-designers' },
  { label: 'Client Success Stories', href: '/client-success-stories' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Services (overview)', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Service Areas', href: '/service-areas' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Cost Estimator', href: '/cost-estimator' },
  { label: 'Book Appointment', href: '/book-appointment' },
  { label: 'Contact Us', href: '/contact' },
]

export default async function SitemapPage() {
  const payload = await getPayload({ config: configPromise })

  const [services, projects, blogPosts, serviceAreas, teamMembers] = await Promise.all([
    payload.find({
      collection: 'services',
      depth: 0,
      limit: 200,
      sort: 'title',
      select: { title: true, slug: true },
    }),
    payload.find({
      collection: 'projects',
      depth: 0,
      limit: 1000,
      sort: 'portfolioPosition',
      select: { title: true, slug: true },
    }),
    payload.find({
      collection: 'blog-posts',
      depth: 0,
      limit: 1000,
      sort: '-publishedDate',
      select: { title: true, slug: true },
    }),
    payload.find({
      collection: 'service-areas',
      depth: 0,
      limit: 500,
      sort: 'areaName',
      select: { areaName: true, slug: true },
    }),
    payload.find({
      collection: 'team-members',
      depth: 0,
      limit: 200,
      sort: 'position',
      select: { name: true, slug: true },
    }),
  ])

  const serviceList = services.docs as Pick<Service, 'title' | 'slug'>[]
  const projectList = projects.docs as Pick<Project, 'title' | 'slug'>[]
  const blogList = blogPosts.docs as Pick<BlogPost, 'title' | 'slug'>[]
  const areaList = serviceAreas.docs as Pick<
    ServiceArea,
    'areaName' | 'slug'
  >[]
  const serviceAreasForFooter = serviceAreas.docs as ServiceArea[]
  const teamList = (teamMembers.docs as Pick<TeamMember, 'name' | 'slug'>[]).filter(
    (m) => Boolean(m.slug),
  )

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen [font-family:'Fahkwang',Helvetica]">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Sitemap', url: `${siteUrl}/sitemap` },
        ]}
      />

      <PageHero
        title="Sitemap"
        bgImage="/image.webp"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sitemap', href: '/sitemap', isActive: true },
        ]}
      />

      <section className="w-full py-12 md:py-16 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <p className="text-[#626161] text-base leading-relaxed mb-10 max-w-3xl">
            All pages on the Desperately Seeking website organised by section. If
            you can&apos;t find what you&apos;re looking for, try the{' '}
            <Link href="/contact" className="text-primary underline hover:text-primary/80">
              contact page
            </Link>{' '}
            or the{' '}
            <Link href="/cost-estimator" className="text-primary underline hover:text-primary/80">
              cost estimator
            </Link>
            .
          </p>

          <div className="flex flex-col gap-6">
            {/* ---- Main Pages — pill-card grid ---- */}
            <SectionCard
              icon={<Compass className="w-5 h-5" />}
              iconBg="bg-primary/10 text-primary"
              title="Main Pages"
              count={STATIC_PAGES.length}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {STATIC_PAGES.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="group flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#f7f9fb] border border-transparent text-sm text-[#48515c] font-medium hover:border-primary/25 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                  >
                    <span className="line-clamp-1">{p.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </SectionCard>

            {/* ---- Services + Blog side by side ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard
                icon={<Briefcase className="w-5 h-5" />}
                iconBg="bg-secondary/10 text-secondary"
                title="Services"
                count={serviceList.length}
              >
                <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                  {serviceList.map((s) =>
                    s.slug ? (
                      <ListLink
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        label={s.title || s.slug}
                      />
                    ) : null,
                  )}
                </ul>
              </SectionCard>

              <SectionCard
                icon={<BookOpen className="w-5 h-5" />}
                iconBg="bg-[#6366F1]/10 text-[#6366F1]"
                title="Blog Posts"
                count={blogList.length}
              >
                <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                  {blogList.map((b) =>
                    b.slug ? (
                      <ListLink
                        key={b.slug}
                        href={`/blog/${b.slug}`}
                        label={b.title || b.slug}
                      />
                    ) : null,
                  )}
                </ul>
              </SectionCard>
            </div>

            {/* ---- Service Areas — compact chip cloud ---- */}
            <SectionCard
              icon={<MapPin className="w-5 h-5" />}
              iconBg="bg-emerald-500/10 text-emerald-600"
              title="Service Areas"
              count={areaList.length}
            >
              <div className="flex flex-wrap gap-2">
                {areaList.map((a) =>
                  a.slug ? (
                    <Link
                      key={a.slug}
                      href={`/service-areas/${a.slug}`}
                      className="px-3.5 py-1.5 rounded-full bg-[#f7f9fb] border border-gray-100 text-xs text-[#48515c] font-medium hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                    >
                      {a.areaName || a.slug}
                    </Link>
                  ) : null,
                )}
              </div>
            </SectionCard>

            {/* ---- Team Members — bio pages ---- */}
            {teamList.length > 0 && (
              <SectionCard
                icon={<Users className="w-5 h-5" />}
                iconBg="bg-rose-500/10 text-rose-600"
                title="Our Team"
                count={teamList.length}
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0.5 list-none m-0 p-0">
                  {teamList.map((m) => (
                    <ListLink
                      key={m.slug}
                      href={`/our-designers/${m.slug}`}
                      label={m.name}
                    />
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* ---- Portfolio Projects — 3-column ---- */}
            <SectionCard
              icon={<FolderOpen className="w-5 h-5" />}
              iconBg="bg-amber-500/10 text-amber-600"
              title="Portfolio Projects"
              count={projectList.length}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0.5 list-none m-0 p-0">
                {projectList.map((p) =>
                  p.slug ? (
                    <ListLink
                      key={p.slug}
                      href={`/portfolio/${p.slug}`}
                      label={p.title || p.slug}
                    />
                  ) : null,
                )}
              </ul>
            </SectionCard>
          </div>

          <p className="text-xs text-[#626161] mt-10 text-center">
            Looking for the machine-readable sitemap? Use{' '}
            <a href="/sitemap.xml" className="text-primary underline" rel="nofollow">
              /sitemap.xml
            </a>{' '}
            or{' '}
            <a href="/image-sitemap.xml" className="text-primary underline" rel="nofollow">
              /image-sitemap.xml
            </a>
            .
          </p>
        </div>
      </section>

      <FooterSection serviceAreas={serviceAreasForFooter} />
    </main>
  )
}

/** White card with icon header + count badge. */
function SectionCard({
  icon,
  iconBg,
  title,
  count,
  children,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2 className="text-lg md:text-xl font-semibold text-[#01190c]">{title}</h2>
        <span className="ml-auto px-3 py-1 rounded-full bg-[#f7f9fb] text-xs font-semibold text-[#626161]">
          {count}
        </span>
      </div>
      {children}
    </div>
  )
}

/** Chevron list link with hover slide. */
function ListLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-1.5 py-1.5 text-sm text-[#48515c] hover:text-primary transition-colors duration-200"
      >
        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        <span className="line-clamp-1">{label}</span>
      </Link>
    </li>
  )
}
