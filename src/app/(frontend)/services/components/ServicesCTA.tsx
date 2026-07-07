'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const ServicesCTA = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl sm:rounded-[40px] py-16 sm:py-20 md:py-28 px-6 sm:px-12"
          style={{
            backgroundImage: 'url(/cta-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Content */}
          <div className="relative z-10 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium [font-family:'Fahkwang',Helvetica] mb-6 sm:mb-8 leading-tight text-[#2D2D2D]">
              Ready to transform your space?
            </h2>
            <p className="text-[#626161] text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 [font-family:'Fahkwang',Helvetica]">
              Let our expert designers bring your vision to life. Book a free consultation today and
              take the first step towards your dream interior.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-appointment"
                className="inline-flex items-center justify-center bg-secondary hover:bg-secondary/90 text-white px-8 sm:px-10 py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg [font-family:'Fahkwang',Helvetica]"
              >
                Book an Appointment
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white px-8 sm:px-10 py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 [font-family:'Fahkwang',Helvetica]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
