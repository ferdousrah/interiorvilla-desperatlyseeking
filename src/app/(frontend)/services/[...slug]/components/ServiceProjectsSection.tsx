'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Project, Media, ProjectCategory } from '@/payload-types'
import { stripFormatting } from '@/utilities/formattedText'

// Fallback color palette for cards
const palette = ['#2D3142', '#3A3F55', '#424861', '#4A516D', '#535A79']

interface ServiceProjectsSectionProps {
  sectionDescription?: string | null
  projects: Project[]
  colorCode?: string
  serviceTitle?: string
}

export const ServiceProjectsSection = ({
  sectionDescription,
  projects,
  colorCode,
  serviceTitle,
}: ServiceProjectsSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  // Show up to 5 real projects (stacked-card animation). When there are none
  // the parent page hides this section entirely (see the early return below).
  const displayProjects = (projects ?? []).slice(0, 5)

  const getProjectImage = (project: Project): string => {
    const featuredImage = project.featuredImage
    if (typeof featuredImage === 'string') return featuredImage
    const mediaImage = featuredImage as Media | null
    return mediaImage?.sizes?.large?.url || mediaImage?.url || '/placeholder.webp'
  }

  // Per-project category chip (e.g. "Dental Chamber Interior Design"). Replaces
  // the old behaviour of stamping the long page/service title on every card.
  const getCategoryLabel = (project: Project): string => {
    const cat = project.category
    return cat && typeof cat === 'object' && (cat as ProjectCategory).title
      ? (cat as ProjectCategory).title
      : 'Interior Design'
  }


  // Heading hover animation
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return

    let cleanup: (() => void) | undefined

    const initHoverAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const splitText = new SplitText(headingRef.current, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const handleMouseMove = (e: MouseEvent) => {
          if (!headingWrapperRef.current) return
          const rect = headingWrapperRef.current.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          gsap.to(splitText.chars, {
            duration: 0.5,
            y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
            x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
            rotationY: (x - 0.5) * 20,
            rotationX: (y - 0.5) * -20,
            ease: 'power2.out',
            stagger: { amount: 0.3, from: 'center' },
          })
        }

        const handleMouseLeave = () => {
          gsap.to(splitText.chars, {
            duration: 1,
            y: 0,
            x: 0,
            rotationY: 0,
            rotationX: 0,
            ease: 'elastic.out(1, 0.3)',
            stagger: { amount: 0.3, from: 'center' },
          })
        }

        headingWrapperRef.current?.addEventListener('mousemove', handleMouseMove)
        headingWrapperRef.current?.addEventListener('mouseleave', handleMouseLeave)

        cleanup = () => {
          splitText.revert()
          headingWrapperRef.current?.removeEventListener('mousemove', handleMouseMove)
          headingWrapperRef.current?.removeEventListener('mouseleave', handleMouseLeave)
        }
      } catch (err) {
        console.error('GSAP SplitText animation failed:', err)
      }
    }

    initHoverAnimation()
    return () => cleanup?.()
  }, [])

  // Card stacking animation - matching home page FeaturedWorksSection exactly
  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || displayProjects.length === 0) return

    let ctx: any
    let lastIndex = -1

    const initGSAP = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

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
            end: () => `+=${displayProjects.length * 400}vh`,
            pin: true,
            pinSpacing: true,
            scrub: 8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: -1,
            onUpdate: (self) => {
              const progress = self.progress
              const total = displayProjects.length
              const activeIndex = Math.min(Math.floor(progress * total), total - 1)

              if (activeIndex !== lastIndex) {
                lastIndex = activeIndex
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

                // Stack gap - negative so earlier cards end up higher (showing rounded tops above)
                const stackGap = 3
                // Earlier cards (lower index) should end at negative Y (higher on screen)
                // Last card ends at Y = 0
                const finalY = (index - (total - 1)) * stackGap
                const startY = index === 0 ? 0 : 100
                const yPos =
                  index === 0 && progress <= 1 / total ? 0 : startY + eased * (finalY - startY)

                // Scale: older cards (lower index) are SMALLER, newer cards (higher index) are LARGER
                // Card 0 (oldest) = 0.88, Card N (newest) = 1.0
                const scaleRange = 0.12
                const finalScale = total > 1 ? 0.88 + (index / (total - 1)) * scaleRange : 1
                const scale = 0.85 + eased * (finalScale - 0.85)

                gsap.set(card, { y: `${yPos}vh`, scale, force3D: true })
              })
            },
          })

          setTimeout(() => ScrollTrigger.refresh(), 100)
        }, sectionRef)
      } catch (err) {
        console.error('GSAP init failed:', err)
      }
    }

    // Small delay to ensure DOM is ready after client-side navigation
    const timer = setTimeout(() => {
      initGSAP()
    }, 50)

    return () => {
      clearTimeout(timer)
      ctx?.revert()
    }
  }, [displayProjects])

  // No relevant projects → render nothing (parent also guards). Placed after
  // all hooks to respect the rules of hooks.
  if (displayProjects.length === 0) return null

  return (
    <>
      {/* Header Section */}
      <section className="w-full pt-16 md:pt-20 lg:pt-24 pb-0 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center w-full">
            <div
              ref={headingWrapperRef}
              className="perspective-[1000px] cursor-default w-full flex justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2
                ref={headingRef}
                className="[font-family:'Fahkwang',Helvetica] font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[0] leading-tight mb-6"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
              >
                <span className="text-[#0d1529]">Recent </span>
                <span style={{ color: colorCode || '#EE5428' }}>Projects</span>
              </h2>
            </div>

            <p
              ref={subtitleRef}
              className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-3xl mx-auto text-center"
            >
              {sectionDescription ||
                `Explore our showcase of exceptional ${serviceTitle || 'interior design'} projects that enhance productivity and reflect brand excellence.`}
            </p>
          </div>
        </div>
      </section>

      {/* Stacked Cards Section */}
      <section
        ref={sectionRef}
        className="w-full min-h-screen overflow-hidden relative bg-white"
        style={{ zIndex: 2 }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-screen flex items-center justify-center pt-16 md:pt-20"
        >
          {displayProjects.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
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
              {/* Main Card */}
              <Link
                href={`/portfolio/${project.slug || project.id}`}
                className="w-[90%] overflow-hidden relative mx-auto cursor-pointer block max-w-full sm:max-w-[600px] lg:max-w-[1200px] h-[70vh] sm:h-[60vh] lg:h-[80vh] min-h-[500px] sm:min-h-[600px]"
                style={{
                  background: (project as any).color || palette[index % palette.length],
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  borderRadius: '40px',
                  boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Content side */}
                  <div className="w-full lg:w-2/5 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 flex-shrink-0">
                    <div className="mb-3 md:mb-4">
                      <span
                        className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-[#2D2D2D] [font-family:'Fahkwang',Helvetica]"
                        style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                      >
                        {getCategoryLabel(project)}
                      </span>
                    </div>

                    <h3
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight [font-family:'Fahkwang',Helvetica]"
                      style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}
                    >
                      {project.title}
                    </h3>

                    {project.shortDescription && (
                      <p
                        className="text-sm sm:text-base text-white/90 mb-4 md:mb-6 leading-relaxed line-clamp-4 [font-family:'Fahkwang',Helvetica]"
                        style={{ textShadow: '0 1px 6px rgba(255, 255, 255, 0.2)' }}
                      >
                        {stripFormatting(project.shortDescription)}
                      </p>
                    )}

                    <span
                      className="group inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-fit relative overflow-hidden [font-family:'Fahkwang',Helvetica]"
                      style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <span className="mr-2 text-xs sm:text-sm">View Project</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>

                    {/* Desktop project number */}
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:left-8 lg:left-10 lg:block hidden">
                      <div className="text-4xl sm:text-6xl font-bold opacity-20 text-white [font-family:'Fahkwang',Helvetica]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>

                  {/* Image side */}
                  <div className="w-full lg:w-3/5 relative overflow-hidden flex-1 pointer-events-none">
                    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 lg:p-10">
                      <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                        <img
                          src={getProjectImage(project)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Mobile project number */}
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:hidden">
                      <div className="text-2xl sm:text-3xl font-bold opacity-30 text-white [font-family:'Fahkwang',Helvetica]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Explore All Projects Section */}
      <section className="w-full py-8 md:py-12 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-white text-sm sm:text-base font-semibold bg-black hover:bg-gray-800 transition-all duration-500 hover:scale-105 border border-gray-700 [font-family:'Fahkwang',Helvetica]"
              style={{
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2)',
                minWidth: '180px',
              }}
            >
              <span>Explore All Projects</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
