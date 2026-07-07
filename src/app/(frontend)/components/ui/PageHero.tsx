'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
  isActive?: boolean
}

interface PageHeroProps {
  title: string
  bgImage: string
  breadcrumbs: Breadcrumb[]
}

export const PageHero: React.FC<PageHeroProps> = ({ title, bgImage, breadcrumbs }) => {
  // Note: BreadcrumbList JSON-LD is emitted at the page level (BreadcrumbSchema
  // from JsonLd.tsx) so URLs are absolute and built from getSiteUrl(). Don't
  // duplicate the schema here.

  // Drop the current-page (active) crumb from the VISIBLE breadcrumb when its
  // label is long (e.g. blog post / project titles) — the H1 right above
  // already shows the full title, so repeating it here is redundant + heavy.
  // Short active crumbs (e.g. "Residential Interior") stay for "you are here"
  // context. The BreadcrumbList JSON-LD keeps the full trail regardless.
  const LONG_LABEL_THRESHOLD = 40
  const visibleBreadcrumbs = breadcrumbs.filter((bc) => {
    if (bc.isActive && (bc.label?.length ?? 0) > LONG_LABEL_THRESHOLD) return false
    return true
  })

  const heroImageRef = useRef<HTMLImageElement>(null)
  const heroContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroImageRef.current || !heroContainerRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Parallax effect - move image up as user scrolls down
        gsap.to(heroImageRef.current, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        })

        // Scale effect - zoom out slightly as user scrolls
        gsap.fromTo(
          heroImageRef.current,
          { scale: 1.15 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: heroContainerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        )

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
    <div
      ref={heroContainerRef}
      className="w-full h-[35vh] md:h-[45vh] lg:h-[55vh] relative overflow-hidden"
    >
      {/* Background Image — this is the LCP element on detail/landing pages */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          ref={heroImageRef}
          className="w-full h-[120%] object-cover will-change-transform"
          alt={title}
          src={bgImage}
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0) scale(1.15)',
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left text-white max-w-5xl">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold [font-family:'Fahkwang',Helvetica] mb-4 sm:mb-6 leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 38px)', lineHeight: '1.1' }}
            >
              {title}
            </motion.h1>

            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center flex-wrap space-x-2"
            >
              {visibleBreadcrumbs.map((bc, index) => (
                <React.Fragment key={index}>
                  {bc.href && !bc.isActive ? (
                    <Link
                      href={bc.href}
                      className="text-white/80 hover:text-white transition-colors duration-300 [font-family:'Fahkwang',Helvetica] text-sm sm:text-base"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span
                      className={`[font-family:'Fahkwang',Helvetica] text-sm sm:text-base ${
                        bc.isActive ? 'text-primary font-medium' : 'text-white font-medium'
                      }`}
                    >
                      {bc.label}
                    </span>
                  )}
                  {index < visibleBreadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
