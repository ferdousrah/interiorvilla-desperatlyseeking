'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { User, Calendar, Clock } from 'lucide-react'
import type { BlogPost, BlogCategory, Media } from '@/payload-types'

interface BlogDetailContentProps {
  post: BlogPost
  categories: BlogCategory[]
  latestPosts: BlogPost[]
}

// Helper to render Lexical content
const renderLexicalContent = (content: BlogPost['fullContent']) => {
  if (!content || !content.root) return null

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    // Text node
    if (node.type === 'text') {
      let text: React.ReactNode = node.text

      // Apply formatting (Lexical format bitmask)
      if (node.format) {
        if (node.format & 1) text = <strong key={index}>{text}</strong> // Bold
        if (node.format & 2) text = <em key={index}>{text}</em> // Italic
        if (node.format & 4) text = <del key={index}>{text}</del> // Strikethrough
        if (node.format & 8) text = <u key={index}>{text}</u> // Underline
        if (node.format & 16)
          text = (
            <code key={index} className="px-1.5 py-0.5 rounded bg-[#f1f3f5] text-[#01190c] text-[0.9em] font-mono">
              {text}
            </code>
          ) // Inline code
        if (node.format & 32) text = <sub key={index}>{text}</sub> // Subscript
        if (node.format & 64) text = <sup key={index}>{text}</sup> // Superscript
      }

      return text
    }

    // Paragraph
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="text-[#626161] leading-relaxed mb-4 [font-family:'Fahkwang',Helvetica]">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </p>
      )
    }

    // Headings
    if (node.type === 'heading') {
      const tag = node.tag?.replace('h', '') || '2'
      const headingClasses: Record<string, string> = {
        h1: 'text-2xl sm:text-3xl font-bold mb-4',
        h2: 'text-xl sm:text-2xl font-bold mb-3',
        h3: 'text-lg sm:text-xl font-semibold mb-3',
        h4: 'text-base sm:text-lg font-semibold mb-2',
        h5: 'text-sm sm:text-base font-semibold mb-2',
        h6: 'text-xs sm:text-sm font-semibold mb-2',
      }
      const className = `${headingClasses[`h${tag}`] || headingClasses.h2} text-[#01190c] [font-family:'Fahkwang',Helvetica]`
      const children = node.children?.map((child: any, i: number) => renderNode(child, i))

      switch (tag) {
        case '1':
          // Demote h1 in CMS content to h2 — the page's canonical h1 is the
          // post title rendered by PageHero. Avoids multiple h1s per page.
          return <h2 key={index} className={className}>{children}</h2>
        case '3':
          return <h3 key={index} className={className}>{children}</h3>
        case '4':
          return <h4 key={index} className={className}>{children}</h4>
        case '5':
          return <h5 key={index} className={className}>{children}</h5>
        case '6':
          return <h6 key={index} className={className}>{children}</h6>
        default:
          return <h2 key={index} className={className}>{children}</h2>
      }
    }

    // Quote/Blockquote
    if (node.type === 'quote') {
      return (
        <blockquote key={index} className="border-l-4 border-primary bg-[#f7f9fb] pl-4 py-3 my-4 italic text-[#48515c] [font-family:'Fahkwang',Helvetica]">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </blockquote>
      )
    }

    // Lists
    if (node.type === 'list') {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      const listClasses = node.listType === 'number'
        ? 'list-decimal list-inside mb-4 space-y-2'
        : 'list-disc list-inside mb-4 space-y-2'
      return (
        <ListTag key={index} className={`${listClasses} text-[#626161] [font-family:'Fahkwang',Helvetica]`}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </ListTag>
      )
    }

    // List item
    if (node.type === 'listitem') {
      return (
        <li key={index}>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </li>
      )
    }

    // Link (Payload CMS Lexical structure uses node.fields for link properties)
    if (node.type === 'link' || node.type === 'autolink') {
      // Handle both direct properties and fields-based properties (Payload CMS Lexical)
      const url = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab || node.newTab
      const linkType = node.fields?.linkType || 'custom'

      // For internal links, construct the URL from the document reference
      let href = url
      if (linkType === 'internal' && node.fields?.doc?.value) {
        const doc = node.fields.doc.value
        const relationTo = node.fields.doc.relationTo
        if (relationTo === 'blog-posts') {
          href = `/blog/${doc.slug || doc}`
        } else if (relationTo === 'projects') {
          href = `/project/${doc.slug || doc}`
        } else if (relationTo === 'pages') {
          href = `/${doc.slug || doc}`
        } else {
          href = `/${doc.slug || doc}`
        }
      }

      return (
        <a
          key={index}
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
          className="text-primary hover:text-secondary underline transition-colors"
        >
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </a>
      )
    }

    // Image/Upload
    if (node.type === 'upload') {
      const imageUrl = node.value?.sizes?.large?.url || node.value?.url || ''
      const alt = node.value?.alt || ''
      const width = node.value?.sizes?.large?.width || node.value?.width || 800
      const height = node.value?.sizes?.large?.height || node.value?.height || 600
      return (
        <div key={index} className="my-6">
          <Image src={imageUrl} alt={alt} width={width} height={height} className="w-full rounded-lg" sizes="(max-width: 768px) 100vw, 800px" />
        </div>
      )
    }

    // Horizontal rule
    if (node.type === 'horizontalrule') {
      return <hr key={index} className="my-6 border-gray-200" />
    }

    // Table
    if (node.type === 'table') {
      return (
        <div key={index} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm [font-family:'Fahkwang',Helvetica] text-[#48515c]">
            <tbody>
              {node.children?.map((row: any, i: number) => renderNode(row, i))}
            </tbody>
          </table>
        </div>
      )
    }

    // Table row
    if (node.type === 'tablerow') {
      return (
        <tr key={index} className="border-b border-gray-200 last:border-b-0">
          {node.children?.map((cell: any, i: number) => renderNode(cell, i))}
        </tr>
      )
    }

    // Table cell (header cell when headerState > 0)
    if (node.type === 'tablecell') {
      const isHeader = Boolean(node.headerState && node.headerState > 0)
      const Tag = isHeader ? 'th' : 'td'
      return (
        <Tag
          key={index}
          colSpan={node.colSpan || undefined}
          rowSpan={node.rowSpan || undefined}
          className={`border border-gray-200 px-3 py-2 align-top text-left [&_p]:mb-0 ${
            isHeader ? 'bg-[#f7f9fb] font-semibold text-[#01190c]' : ''
          }`}
        >
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </Tag>
      )
    }

    // Default: render children
    if (node.children) {
      return node.children.map((child: any, i: number) => renderNode(child, i))
    }

    return null
  }

  return content.root.children?.map((node: any, i: number) => renderNode(node, i))
}

export const BlogDetailContent = ({
  post,
  categories,
  latestPosts,
}: BlogDetailContentProps) => {
  const featuredImage = post.featuredImage as Media | null
  const featuredImageUrl = featuredImage?.sizes?.large?.url || featuredImage?.url || ''
  const category = post.category as BlogCategory | null

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPostImage = (blogPost: BlogPost): string => {
    const img = blogPost.featuredImage as Media | null
    return img?.sizes?.small?.url || img?.url || '/placeholder.webp'
  }

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 bg-white relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-2/3"
          >
            {/* Featured Image */}
            {featuredImageUrl && (
              <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden relative h-[200px] sm:h-[300px] md:h-[400px]">
                <Image
                  src={featuredImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#626161] mb-4 sm:mb-6 [font-family:'Fahkwang',Helvetica]">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Admin
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                5 min read
              </span>
              {category && (
                <Link href={`/blog?category=${category.slug}`} className="flex items-center gap-1.5 text-primary hover:text-secondary transition-colors">
                  {category.title}
                </Link>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-sm sm:prose max-w-none mb-8">
              {post.fullContent ? (
                renderLexicalContent(post.fullContent)
              ) : post.shortDescription ? (
                <p className="text-[#626161] leading-relaxed [font-family:'Fahkwang',Helvetica]">
                  {post.shortDescription}
                </p>
              ) : null}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#01190c] [font-family:'Fahkwang',Helvetica]">Tags:</span>
                  {post.tags.map((tagItem) => (
                    <span
                      key={tagItem.id}
                      className="px-3 py-1 bg-[#f7f9fb] text-xs sm:text-sm text-[#626161] rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer [font-family:'Fahkwang',Helvetica]"
                    >
                      {tagItem.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/3"
          >
            {/* Categories */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#01190c] mb-4 uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Categories
              </h3>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog?category=${cat.slug}`}
                      className={`block px-4 py-3 rounded-lg text-sm transition-colors [font-family:'Fahkwang',Helvetica] ${
                        category?.id === cat.id
                          ? 'bg-primary text-white'
                          : 'text-[#626161] hover:text-primary'
                      }`}
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Latest Posts */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#01190c] mb-4 uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Latest Posts
              </h3>
              <ul className="space-y-4">
                {latestPosts.map((latestPost) => (
                  <li key={latestPost.id}>
                    <Link
                      href={`/blog/${latestPost.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden relative">
                        <Image
                          src={getPostImage(latestPost)}
                          alt={latestPost.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#01190c] line-clamp-2 group-hover:text-primary transition-colors [font-family:'Fahkwang',Helvetica]">
                          {latestPost.title}
                        </h4>
                        <p className="text-xs text-[#626161] mt-1 [font-family:'Fahkwang',Helvetica]">
                          {formatDate(latestPost.publishedDate)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Widget */}
            <div className="bg-[#1d1e24] rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 [font-family:'Fahkwang',Helvetica]">
                How Can We Help?
              </h3>
              <p className="text-sm text-gray-400 mb-5 [font-family:'Fahkwang',Helvetica]">
                Contact our experts for personalized interior design consultation
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 w-full [font-family:'Fahkwang',Helvetica]"
              >
                Start Consultation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
