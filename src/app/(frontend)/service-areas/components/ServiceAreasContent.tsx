'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import type { ServiceArea } from '@/payload-types'

interface ServiceAreasContentProps {
  serviceAreas: ServiceArea[]
}

export const ServiceAreasContent = ({ serviceAreas }: ServiceAreasContentProps) => {
  return (
    <>
      {/* Intro Section */}
      <section className="w-full pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 bg-white relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1 h-4 bg-primary rounded-full" />
              <span className="text-xs sm:text-sm font-semibold text-[#01190c] uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Where We Serve
              </span>
              <span className="w-1 h-4 bg-primary rounded-full" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#01190c] mb-3 sm:mb-4 [font-family:'Fahkwang',Helvetica]">
              Our <span className="text-secondary">Service Areas</span>
            </h2>
            <p className="text-[#626161] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]">
              Desperately Seeking provides premium interior design services across multiple locations.
              Find your nearest service area and let us transform your space.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section className="w-full py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {serviceAreas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/service-areas/${area.slug}`}
                  className="group block bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Card Header with Icon */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white [font-family:'Fahkwang',Helvetica]">
                          {area.areaName}
                        </h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-6">
                    <p className="text-sm text-[#626161] mb-4 [font-family:'Fahkwang',Helvetica]">
                      Premium interior design services in {area.areaName}. Residential & commercial projects.
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors duration-300 [font-family:'Fahkwang',Helvetica]">
                      Explore Services
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty state */}
          {serviceAreas.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#626161] text-base sm:text-lg [font-family:'Fahkwang',Helvetica]">
                No service areas found.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-8 sm:py-12 md:py-16 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#01190c] mb-3 [font-family:'Fahkwang',Helvetica]">
              Why Choose Desperately Seeking?
            </h2>
            <p className="text-[#626161] text-sm sm:text-base max-w-2xl mx-auto [font-family:'Fahkwang',Helvetica]">
              We bring expertise and creativity to every location we serve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: 'Local Expertise',
                description: 'Deep understanding of regional design preferences and requirements.',
              },
              {
                title: 'Quality Materials',
                description: 'Access to premium materials and furnishings in all service areas.',
              },
              {
                title: 'Expert Team',
                description: 'Skilled designers and craftsmen available across all locations.',
              },
              {
                title: 'On-Time Delivery',
                description: 'Commitment to completing projects within agreed timelines.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-[#01190c] mb-2 [font-family:'Fahkwang',Helvetica]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
