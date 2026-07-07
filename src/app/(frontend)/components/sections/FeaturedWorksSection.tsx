'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PerformanceImage } from '../ui/PerformanceImage'
import type { Project, Media, Category } from '@/payload-types'
import { stripFormatting } from '@/utilities/formattedText'

interface FeaturedWorksSectionProps {
  projects?: Project[]
}

export const FeaturedWorksSection = ({ projects = [] }: FeaturedWorksSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  // Transform projects to usable format
  const projectItems = useMemo(() => {
    return projects.map((project, i) => {
      const media = project.featuredImage as Media | undefined
      const category = project.category as Category | undefined

      // Use medium size (900px) for better performance - displayed at ~720px max
      const imageUrl = media?.sizes?.medium?.url || media?.sizes?.large?.url || media?.url || '/placeholder.webp'
      const blurUrl = media?.sizes?.blur?.url

      return {
        id: project.id,
        title: project.title || `Project ${i + 1}`,
        slug: project.slug || '',
        description: stripFormatting(project.shortDescription),
        category: category?.title || 'Project',
        categorySlug: category?.slug || 'project',
        parentSlug: (category as any)?.pslug || 'services',
        image: imageUrl,
        imageAlt: media?.alt || project.title || 'Project image',
        color: (project as any).color || '#6db53e',
        blurDataURL: blurUrl,
      }
    })
  }, [projects])

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth)
      }, 150)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Memoized card sizes
  const cardSizes = useMemo(() => {
    return projectItems.map((_, index) => ({
      maxWidth:
        windowWidth < 640
          ? '100%'
          : windowWidth < 1024
          ? '600px'
          : `${1200 + index * 40}px`,
      height: windowWidth < 640 ? '70vh' : windowWidth < 1024 ? '60vh' : '80vh',
      minHeight: windowWidth < 640 ? '500px' : '600px',
    }))
  }, [projectItems.length, windowWidth])

  // GSAP scroll animation
  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || projectItems.length === 0) return

    let ctx: any
    let lastIndex = -1

    const initGSAP = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        const { ScrollToPlugin } = await import('gsap/ScrollToPlugin')
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

        // Only kill ScrollTrigger instances for THIS section (not all triggers)
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === sectionRef.current) {
            trigger.kill()
          }
        })

        ctx = gsap.context(() => {
          const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
          if (cards.length === 0) return

          cards.forEach((card, index) => {
            gsap.set(card, {
              x: 0,
              y: index === 0 ? 0 : `${80 + index * 10}vh`,
              scale: 1,
              opacity: 1,
              zIndex: 100 + index,
              transformOrigin: 'center center',
              willChange: 'transform',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            })
          })

          ScrollTrigger.create({
            trigger: sectionRef.current!,
            start: 'top top',
            end: () => `+=${projectItems.length * 400}vh`,
            pin: true,
            pinSpacing: true,
            scrub: 8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: -1,
            onUpdate: (self) => {
              const progress = self.progress
              const total = projectItems.length
              const activeIndex = Math.min(Math.floor(progress * total), total - 1)

              if (activeIndex !== lastIndex) {
                lastIndex = activeIndex
                setCurrentIndex(activeIndex)
              }

              cards.forEach((card, index) => {
                gsap.set(card, { zIndex: 100 + index })
                const segment = 1 / total
                const cardStart = index * segment
                const cardEnd = (index + 1) * segment

                let moveProgress = 0
                if (progress >= cardStart && progress <= cardEnd) {
                  moveProgress = (progress - cardStart) / segment
                } else if (progress > cardEnd) {
                  moveProgress = 1
                }

                const eased =
                  moveProgress < 0.5
                    ? 2 * moveProgress * moveProgress
                    : 1 - Math.pow(-2 * moveProgress + 2, 3) / 2

                const stackGap = 2
                const finalY = index * stackGap
                const startY = index === 0 ? 0 : 100
                const yPos =
                  index === 0 && progress <= 1 / total ? 0 : startY + eased * (finalY - startY)

                gsap.set(card, { y: `${yPos}vh`, scale: 0.92 + eased * 0.08, force3D: true })
              })
            },
          })

          setTimeout(() => ScrollTrigger.refresh(), 100)
        }, sectionRef)
      } catch (err) {
        console.error('GSAP init failed:', err)
      }
    }

    // Delay to ensure DOM is ready after client-side navigation
    const timer = setTimeout(() => {
      initGSAP()
    }, 100)

    return () => {
      clearTimeout(timer)
      ctx?.revert()
    }
  }, [projectItems])

  if (projectItems.length === 0) {
    return (
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          No featured projects available.
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="w-full min-h-screen overflow-hidden relative bg-white"
        style={{ zIndex: 2 }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-screen flex items-center justify-center pt-16 md:pt-20"
        >
          {projectItems.map((project, index) => {
            const sizes = cardSizes[index] || { maxWidth: '100%', height: '80vh', minHeight: '500px' }

            return (
              <div
                key={project.id}
                ref={(el) => { cardRefs.current[index] = el }}
                className="absolute flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-6"
                style={{
                  zIndex: 100 + index,
                  willChange: 'transform',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                }}
              >
                <div
                  className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mx-auto"
                  style={{
                    width: '90%',
                    maxWidth: sizes.maxWidth,
                    height: sizes.height,
                    minHeight: sizes.minHeight,
                    background: project.color,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                  }}
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Content Side */}
                    <div className="w-full lg:w-2/5 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 flex-shrink-0">
                      <div className="mb-3 md:mb-4">
                        <Link
                          href={`/services/${project.parentSlug}/${project.categorySlug}`}
                          className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-green-800 bg-white/90"
                        >
                          {project.category}
                        </Link>
                      </div>

                      <h3
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight"
                        style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}
                      >
                        {project.title}
                      </h3>

                      <p
                        className="text-sm sm:text-base md:text-base text-white mb-4 md:mb-6 leading-relaxed"
                        style={{ textShadow: '0 1px 6px rgba(255, 255, 255, 0.2)' }}
                      >
                        {project.description}
                      </p>

                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="group inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-fit relative overflow-hidden"
                        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                        <span className="mr-2 text-xs sm:text-sm">View Project</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>

                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:left-8 lg:left-10 lg:block hidden">
                        <div className="text-4xl sm:text-6xl font-bold opacity-20 text-white">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>

                    {/* Image Side */}
                    <div className="w-full lg:w-3/5 relative overflow-hidden flex-1 pointer-events-none">
                      <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 lg:p-10">
                        <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                          <PerformanceImage
                            src={project.image}
                            alt={project.imageAlt}
                            className="w-full h-full object-cover"
                            loading={index < 2 ? 'eager' : 'lazy'}
                            priority={index === 0}
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 720px"
                            quality={70}
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:hidden">
                        <div className="text-2xl sm:text-3xl font-bold opacity-30 text-white">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Explore All Projects Button */}
      <section className="w-full py-16 md:py-20 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 text-center relative z-5">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-white text-sm sm:text-base font-semibold bg-black hover:bg-gray-800 transition-all duration-500 hover:scale-105 border border-gray-700"
              style={{
                boxShadow: '0 15px 50px rgba(0,0,0,0.3), 0 0 30px rgba(0,0,0,0.2)',
                minWidth: '180px',
              }}
            >
              <span className="font-medium">Explore All Projects</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
