'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import type { Office } from '@/payload-types'

interface OfficeLocationsSectionProps {
  offices: Office[]
}

export const OfficeLocationsSection = ({ offices }: OfficeLocationsSectionProps) => {
  if (!offices || offices.length === 0) return null

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#01190c] mb-6"
          >
            Our <span className="text-secondary">Offices</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-base md:text-lg text-[#626161] max-w-3xl mx-auto leading-relaxed"
          >
            Visit us at any of our office locations or reach out through phone or email.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offices.map((office, index) => (
            <motion.div
              key={office.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-[#01190c] mb-4">{office.title}</h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-[#626161] text-sm md:text-base leading-relaxed">
                    {office.address}
                  </p>
                </div>

                {/* Phone */}
                {office.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${office.phone}`}
                      className="text-[#626161] text-sm md:text-base hover:text-primary transition-colors duration-300"
                    >
                      {office.phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {office.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <a
                      href={`mailto:${office.email}`}
                      className="text-[#626161] text-sm md:text-base hover:text-primary transition-colors duration-300"
                    >
                      {office.email}
                    </a>
                  </div>
                )}

                {/* View on Map Link */}
                {office.latitude && office.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${office.latitude},${office.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm mt-4 transition-colors duration-300"
                  >
                    View on Google Maps
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
