import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { BlogPost, BlogCategory, Media, ServiceArea } from '@/payload-types'

import { PageHero } from '../../components/ui/PageHero'
import { BlogDetailContent } from './components/BlogDetailContent'
import { BlogCTA } from '../components/BlogCTA'
import { FooterSection } from '../../components/sections/FooterSection'
import { ArticleSchema, BreadcrumbSchema } from '../../components/JsonLd'
import { getSiteUrl } from '@/utilities/getSiteUrl'
import { maybeRedirectByPath } from '@/utilities/slugRedirect'

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: { equals: slug },
    },
    depth: 1,
    limit: 1,
  })

  return result.docs[0] || null
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const post = await getBlogPost(slug)

  if (!post) {
    await maybeRedirectByPath(payload, `/blog/${slug}`)
    notFound()
  }

  // Fetch categories for sidebar
  const categoriesData = await payload.find({
    collection: 'blog-categories',
    depth: 1,
    limit: 100,
  })

  // Fetch latest posts for sidebar
  const latestPostsData = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 5,
    sort: '-publishedDate',
    where: {
      id: { not_equals: post.id },
    },
  })

  // Fetch service areas for footer
  const serviceAreasData = await payload.find({
    collection: 'service-areas',
    depth: 0,
    limit: 200,
    select: { areaName: true, slug: true },
  })

  const categories = categoriesData.docs as BlogCategory[]
  const latestPosts = latestPostsData.docs as BlogPost[]
  const serviceAreas = serviceAreasData.docs as ServiceArea[]

  // Get featured image URL
  const featuredImage = post.featuredImage as Media | null
  const featuredImageUrl = featuredImage?.sizes?.large?.url || featuredImage?.url || '/image.webp'

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, href: `/blog/${slug}`, isActive: true },
  ]

  const siteUrl = getSiteUrl()
  const fullImageUrl = featuredImageUrl.startsWith('http')
    ? featuredImageUrl
    : `${siteUrl}${featuredImageUrl}`
  const canonicalUrl = `${siteUrl}/blog/${slug}`
  const publishedIso = post.publishedDate
    ? new Date(post.publishedDate).toISOString()
    : new Date().toISOString()
  const modifiedIso = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : publishedIso

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      <ArticleSchema
        headline={post.title}
        description={
          post.seoDetails?.metaDescription ||
          post.shortDescription ||
          `Read ${post.title} on the Desperately Seeking blog.`
        }
        image={fullImageUrl}
        datePublished={publishedIso}
        dateModified={modifiedIso}
        author="Desperately Seeking"
        url={canonicalUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `${siteUrl}/` },
          { name: 'Blog', url: `${siteUrl}/blog` },
          { name: post.title, url: canonicalUrl },
        ]}
      />

      {/* Hero Section */}
      <PageHero title={post.title} bgImage={featuredImageUrl} breadcrumbs={breadcrumbs} />

      {/* Blog Detail Content */}
      <BlogDetailContent
        post={post}
        categories={categories}
        latestPosts={latestPosts}
      />

      {/* CTA Section */}
      <BlogCTA />

      {/* Footer Section */}
      <FooterSection serviceAreas={serviceAreas} />
    </main>
  )
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found | Desperately Seeking',
    }
  }

  const seo = post.seoDetails

  // Per-page OG image: featuredImage (large size) → fallback to default
  const featuredImg = post.featuredImage as Media | null
  const ogImageUrl =
    featuredImg?.sizes?.large?.url || featuredImg?.url || null
  const siteUrl = getSiteUrl()
  const absoluteOgImage = ogImageUrl
    ? ogImageUrl.startsWith('http')
      ? ogImageUrl
      : `${siteUrl}${ogImageUrl}`
    : undefined

  return {
    title: seo?.metaTitle || `${post.title} | Desperately Seeking Blog`,
    description:
      seo?.metaDescription ||
      post.shortDescription ||
      `Read ${post.title} - a blog post by Desperately Seeking about interior design.`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: mergeOpenGraph({
      type: 'article',
      title: seo?.metaTitle || `${post.title} | Desperately Seeking Blog`,
      description: seo?.metaDescription || post.shortDescription || undefined,
      url: `/blog/${post.slug}`,
      ...(absoluteOgImage && {
        images: [
          {
            url: absoluteOgImage,
            alt: featuredImg?.alt || post.title,
          },
        ],
      }),
      ...(post.publishedDate && {
        publishedTime: new Date(post.publishedDate).toISOString(),
      }),
    }),
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'blog-posts',
    limit: 100,
    depth: 0,
  })

  return posts.docs
    .filter((post) => post.slug)
    .map((post) => ({
      slug: post.slug!,
    }))
}

export const revalidate = 60
export const dynamicParams = true
