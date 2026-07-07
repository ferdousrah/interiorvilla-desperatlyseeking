'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const BlogCTA = () => {
  return (
    <section className="w-full py-10 sm:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[#fce8de] rounded-2xl sm:rounded-3xl py-10 sm:py-16 md:py-20 px-5 sm:px-8 md:px-12 text-center relative overflow-hidden"
        >
          {/* Bottom-left decorative shape */}
          <div className="absolute -left-6 -bottom-6 sm:-left-8 sm:-bottom-8 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64">
            <div className="w-full h-full bg-[#f5d4c4] rounded-full opacity-70" />
          </div>

          {/* Top-right decorative shape */}
          <div className="absolute -right-8 -top-8 sm:-right-12 sm:-top-12 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56">
            <div className="w-full h-full bg-[#f5d4c4] rounded-full opacity-70" />
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#01190c] mb-6 sm:mb-8 relative z-10 [font-family:'Fahkwang',Helvetica]">
            Ready to transform your space?
          </h2>

          <Link
            href="/contact"
            className="inline-block bg-secondary hover:bg-secondary/90 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg relative z-10 [font-family:'Fahkwang',Helvetica]"
          >
            Book an Appointment
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
