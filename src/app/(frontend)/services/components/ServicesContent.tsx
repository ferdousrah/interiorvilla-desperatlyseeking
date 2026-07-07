'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Home, Building2, Compass } from 'lucide-react'

interface Subcategory {
  title: string
  slug: string
  description: string
}

interface ServiceCategory {
  id: string
  title: string
  slug: string
  description: string
  colorCode: string
  bgColor: string
  subcategories: Subcategory[]
}

interface ServicesContentProps {
  categories: ServiceCategory[]
}

// Icon mapping for each category
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  residential: Home,
  commercial: Building2,
  architectural: Compass,
}

export const ServicesContent = ({ categories }: ServicesContentProps) => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Animate category sections
        const categorySections = sectionRef.current?.querySelectorAll('.category-section')
        categorySections?.forEach((section) => {
          gsap.fromTo(
            section,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          )
        })

        ScrollTrigger.refresh()

        cleanup = () => {
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-white relative z-10">
      {/* Intro Section */}
      <div className="w-full pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
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
                What We Offer
              </span>
              <span className="w-1 h-4 bg-primary rounded-full" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#01190c] mb-4 [font-family:'Fahkwang',Helvetica]">
              Comprehensive <span className="text-secondary">Interior Design</span> Services
            </h2>
            <p className="text-[#626161] text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]">
              From residential spaces to commercial establishments, we offer end-to-end interior
              design solutions tailored to your unique needs and vision.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Sections */}
      {categories.map((category, categoryIndex) => {
        const IconComponent = categoryIcons[category.id] || Home

        return (
          <div
            key={category.id}
            className="category-section py-12 sm:py-16 md:py-20"
            style={{ backgroundColor: categoryIndex % 2 === 0 ? '#ffffff' : '#f7f9fb' }}
          >
            <div className="container mx-auto px-4 max-w-6xl">
              {/* Category Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 sm:mb-12">
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: category.bgColor }}
                  >
                    <IconComponent
                      className="w-7 h-7 sm:w-8 sm:h-8"
                      style={{ color: category.colorCode }}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#01190c] mb-2 [font-family:'Fahkwang',Helvetica]">
                      {category.title}
                    </h3>
                    <p className="text-[#626161] text-sm sm:text-base max-w-xl [font-family:'Fahkwang',Helvetica]">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* View Category Link */}
                <Link
                  href={`/services/${category.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 [font-family:'Fahkwang',Helvetica]"
                  style={{
                    backgroundColor: category.colorCode,
                    color: '#ffffff',
                  }}
                >
                  Explore {category.title.split(' ')[0]}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Subcategory Cards */}
              {category.subcategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {category.subcategories.map((sub, index) => (
                    <motion.div
                      key={sub.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link
                        href={`/services/${sub.slug}`}
                        className="group block bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: category.colorCode,
                        }}
                      >
                        <h4 className="text-base sm:text-lg font-semibold text-[#01190c] mb-2 group-hover:text-primary transition-colors [font-family:'Fahkwang',Helvetica]">
                          {sub.title}
                        </h4>
                        <p className="text-[#626161] text-sm mb-4 line-clamp-2 [font-family:'Fahkwang',Helvetica]">
                          {sub.description}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium transition-all duration-300 group-hover:gap-2 [font-family:'Fahkwang',Helvetica]"
                          style={{ color: category.colorCode }}
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* For categories without subcategories (like Architectural Consultancy) */
                <div
                  className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center"
                  style={{ backgroundColor: category.bgColor }}
                >
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${category.colorCode}20` }}
                  >
                    <IconComponent
                      className="w-10 h-10 sm:w-12 sm:h-12"
                      style={{ color: category.colorCode }}
                    />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-[#01190c] mb-3 [font-family:'Fahkwang',Helvetica]">
                    Expert Architectural Guidance
                  </h4>
                  <p className="text-[#626161] text-sm sm:text-base max-w-lg mx-auto mb-6 [font-family:'Fahkwang',Helvetica]">
                    Our architectural consultancy provides comprehensive guidance from initial
                    concept development to final project completion. We help you navigate building
                    codes, optimize spatial planning, and bring your architectural vision to life.
                  </p>
                  <Link
                    href={`/services/${category.slug}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 [font-family:'Fahkwang',Helvetica]"
                    style={{
                      backgroundColor: category.colorCode,
                      color: '#ffffff',
                    }}
                  >
                    Get Consultation
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}
