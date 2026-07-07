'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const CTASection = () => {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20">
      <div className="w-full px-4 sm:px-6 md:px-16 lg:px-[15%] xl:px-[20%]">
        {/* Rounded Container with cta-bg.svg Background */}
        <div
          className="w-full relative overflow-hidden rounded-[20px] sm:rounded-[30px] md:rounded-[40px] py-12 sm:py-16 md:py-20"
          style={{
            backgroundImage: 'url(/cta-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#FDF5F0',
          }}
        >
          {/* Content - Centered */}
          <div className="relative z-10 text-center px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] mb-8 sm:mb-10 md:mb-12 leading-tight text-[#2D2D2D]">
                Ready to transform your space?
              </h2>

              <Link
                href="/contact"
                className="inline-block bg-secondary hover:bg-secondary-hover text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl [font-family:'Fahkwang',Helvetica] font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Book an Appointment
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
