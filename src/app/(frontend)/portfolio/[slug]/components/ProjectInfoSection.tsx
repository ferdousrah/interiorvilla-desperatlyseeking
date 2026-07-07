'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Project } from '@/payload-types'

interface ProjectInfoSectionProps {
  project: Project
  /** Matched service-area page for this project's location (internal link). */
  areaLink?: { name: string; slug: string } | null
}

export const ProjectInfoSection = ({ project, areaLink }: ProjectInfoSectionProps) => {
  const year = project.year || '—'
  const sqft = project.size || '—'
  const location = project.location || '—'
  const client = project.client || '—'

  const infoItems = [
    { label: 'Year', value: year, href: null as string | null },
    { label: 'Square Footage', value: sqft, href: null as string | null },
    {
      label: 'Location',
      value: location,
      href: areaLink ? `/service-areas/${areaLink.slug}` : null,
    },
    { label: 'Client', value: client, href: null as string | null },
  ]

  return (
    <section className="w-full py-6 sm:py-8 md:py-12 bg-white -mt-4 sm:-mt-6 md:-mt-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-12 lg:gap-16 mb-4 sm:mb-6 md:mb-8">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
              className="text-center md:text-left"
            >
              <h3 className="text-sm sm:text-base font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2 sm:mb-4 uppercase tracking-wider">
                {item.label}
              </h3>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm sm:text-base [font-family:'Fahkwang',Helvetica] text-primary hover:underline underline-offset-2"
                >
                  {item.value}
                </Link>
              ) : (
                <p className="text-sm sm:text-base [font-family:'Fahkwang',Helvetica] text-[#626161]">
                  {item.value}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {areaLink && (
          <p className="text-sm sm:text-base text-[#626161] [font-family:'Fahkwang',Helvetica]">
            Explore our{' '}
            <Link
              href={`/service-areas/${areaLink.slug}`}
              className="text-primary font-medium hover:underline underline-offset-2"
            >
              interior design services in {areaLink.name}
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  )
}
