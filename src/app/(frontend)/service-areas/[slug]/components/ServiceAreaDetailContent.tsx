'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'
import type { ServiceArea } from '@/payload-types'
import { siteConfig } from '@/config/site'

interface ServiceAreaDetailContentProps {
  serviceArea: ServiceArea
  allServiceAreas: ServiceArea[]
}

// Helper to render Lexical content
const renderLexicalContent = (content: ServiceArea['fullContent']) => {
  if (!content || !content.root) return null

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null

    // Text node
    if (node.type === 'text') {
      let text: React.ReactNode = node.text

      // Apply formatting
      if (node.format) {
        if (node.format & 1) text = <strong key={index}>{text}</strong> // Bold
        if (node.format & 2) text = <em key={index}>{text}</em> // Italic
        if (node.format & 4) text = <del key={index}>{text}</del> // Strikethrough
        if (node.format & 8) text = <u key={index}>{text}</u> // Underline
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
          // Demote CMS h1 to h2 — page's canonical h1 is the area name in PageHero.
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

    // Link
    if (node.type === 'link' || node.type === 'autolink') {
      const url = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab || node.newTab

      return (
        <a
          key={index}
          href={url}
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
      const imageUrl = node.value?.url || ''
      const alt = node.value?.alt || ''
      return (
        <div key={index} className="my-6">
          <img src={imageUrl} alt={alt} className="w-full rounded-lg" />
        </div>
      )
    }

    // Horizontal rule
    if (node.type === 'horizontalrule') {
      return <hr key={index} className="my-6 border-gray-200" />
    }

    // Default: render children
    if (node.children) {
      return node.children.map((child: any, i: number) => renderNode(child, i))
    }

    return null
  }

  return content.root.children?.map((node: any, i: number) => renderNode(node, i))
}

export const ServiceAreaDetailContent = ({
  serviceArea,
  allServiceAreas,
}: ServiceAreaDetailContentProps) => {
  // Filter out current service area from sidebar list
  const otherServiceAreas = allServiceAreas.filter((area) => area.id !== serviceArea.id)

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
            {/* Content */}
            <div className="prose prose-sm sm:prose max-w-none mb-8">
              {serviceArea.fullContent ? (
                renderLexicalContent(serviceArea.fullContent)
              ) : (
                <div className="text-[#626161] leading-relaxed space-y-4 [font-family:'Fahkwang',Helvetica]">
                  <p>
                    Desperately Seeking provides premium interior design services in {serviceArea.areaName}.
                    Our team of experienced designers is dedicated to transforming spaces into beautiful,
                    functional environments that reflect your unique style and preferences.
                  </p>
                  <p>
                    Whether you&apos;re looking for residential interior design, commercial space
                    planning, or architectural consultancy, our {serviceArea.areaName} team is here to
                    help bring your vision to life.
                  </p>
                </div>
              )}
            </div>

            {/* Google Map */}
            {serviceArea.googleEmbedCode && (
              <div className="mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#01190c] mb-4 sm:mb-6 [font-family:'Fahkwang',Helvetica]">
                  Our Location in <span className="text-secondary">{serviceArea.areaName}</span>
                </h2>
                <div
                  className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden shadow-md"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(serviceArea.googleEmbedCode, {
                      ADD_TAGS: ['iframe'],
                      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'referrerpolicy'],
                    }),
                  }}
                />
              </div>
            )}

            {/* Services in this area */}
            <div className="bg-[#f7f9fb] rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[#01190c] mb-4 [font-family:'Fahkwang',Helvetica]">
                Services Available in {serviceArea.areaName}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Residential Interior Design',
                  'Commercial Interior Design',
                  'Office Space Planning',
                  'Kitchen & Bathroom Design',
                  'Furniture Selection',
                  'Color Consultation',
                ].map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/3"
          >
            {/* Other Service Areas */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#01190c] mb-4 uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Other Service Areas
              </h3>
              <ul className="space-y-1">
                {otherServiceAreas.slice(0, 8).map((area) => (
                  <li key={area.id}>
                    <Link
                      href={`/service-areas/${area.slug}`}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors [font-family:'Fahkwang',Helvetica] text-[#626161] hover:text-primary hover:bg-[#f7f9fb]"
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {area.areaName}
                    </Link>
                  </li>
                ))}
              </ul>
              {otherServiceAreas.length > 8 && (
                <Link
                  href="/service-areas"
                  className="block text-center mt-4 text-sm text-primary hover:text-secondary transition-colors [font-family:'Fahkwang',Helvetica]"
                >
                  View All Areas
                </Link>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-[#01190c] mb-4 uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Get in Touch
              </h3>
              <div className="space-y-3">
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="flex items-center gap-3 text-sm text-[#626161] hover:text-primary transition-colors [font-family:'Fahkwang',Helvetica]"
                >
                  <Phone className="w-4 h-4" />
                  {siteConfig.contact.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 text-sm text-[#626161] hover:text-primary transition-colors [font-family:'Fahkwang',Helvetica]"
                >
                  <Mail className="w-4 h-4" />
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>

            {/* CTA Widget */}
            <div className="bg-[#1d1e24] rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 [font-family:'Fahkwang',Helvetica]">
                Ready to Start?
              </h3>
              <p className="text-sm text-gray-400 mb-5 [font-family:'Fahkwang',Helvetica]">
                Book a free consultation for your {serviceArea.areaName} project
              </p>
              <Link
                href="/book-appointment"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 w-full [font-family:'Fahkwang',Helvetica]"
              >
                Book Consultation
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
