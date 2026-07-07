import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Blog, BlogPost, ServiceArea, Media } from '@/payload-types'
import Link from 'next/link'

import { PageHero } from '../components/ui/PageHero'
import { BlogContent } from './components/BlogContent'
import { BlogCTA } from './components/BlogCTA'
import { FooterSection } from '../components/sections/FooterSection'
import SEOContentBlock from '../components/ui/SEOContentBlock'
import RichText from '@/components/RichText'
import { BreadcrumbSchema } from '../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch blog global data
  const blogData = (await getCachedGlobal('blog', 2)()) as Blog

  // Fetch initial blog posts (first batch for infinite scroll) + all posts in parallel
  const [postsData, allPostsData, serviceAreasData] = await Promise.all([
    payload.find({
      collection: 'blog-posts',
      depth: 1,
      limit: 6,
      sort: '-publishedDate',
    }),
    // Fetch all posts (title + slug only) for the crawlable index
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
      limit: 200,
      select: { areaName: true, slug: true },
    }),
  ])

  const posts = postsData.docs as BlogPost[]
  const allPosts = allPostsData.docs as Pick<BlogPost, 'id' | 'title' | 'slug'>[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]
  const totalPosts = postsData.totalDocs

  // Get hero image URL
  const heroImage = blogData?.hero?.heroImage as Media | null
  const heroImageUrl = heroImage?.sizes?.large?.url || heroImage?.url || '/image.webp'

  const siteUrl = getSiteUrl()

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Blog', url: `${siteUrl}/blog` },
        ]}
      />
      {/* Hero Section */}
      <PageHero
        title={blogData?.hero?.title || 'Blog'}
        bgImage={heroImageUrl}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog', isActive: true },
        ]}
      />

      {/* Blog Content */}
      <BlogContent
        initialPosts={posts}
        totalPosts={totalPosts}
        introText={blogData?.introText}
      />

      {/* All Articles Index — server-rendered for full crawlability */}
      {allPosts.length > 6 && (
        <section className="w-full bg-[#f7f9fb] border-t border-gray-100 py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="text-sm font-semibold text-[#48515c] uppercase tracking-widest mb-5">
              Browse All Articles ({allPosts.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
              {allPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-[#48515c] hover:text-primary transition-colors duration-200 line-clamp-1"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <BlogCTA />

      {/* SEO Content Block */}
      {(blogData as any).seoContent && (
        <SEOContentBlock>
          <RichText data={(blogData as any).seoContent} enableGutter={false} />
        </SEOContentBlock>
      )}

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const blogData = (await getCachedGlobal('blog', 2)()) as Blog
  const seo = blogData?.seoDetails

  return {
    title: seo?.metaTitle || 'Blog | Desperately Seeking',
    description:
      seo?.metaDescription ||
      'Read our latest blog posts about interior design trends, tips, and inspiration. Stay updated with Desperately Seeking.',
    alternates: { canonical: '/blog' },
  }
}

export const revalidate = 60
