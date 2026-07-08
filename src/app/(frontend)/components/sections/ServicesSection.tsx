'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardFooter } from '../ui/Card'
import { splitTitle } from '../ui/splitTitle'
import type { Media } from '@/payload-types'

interface ServicesSectionProps {
  data?: {
    sectionTitle?: string | null
    shortDescription?: string | null
    cards?:
      | {
          title: string
          description?: string | null
          link?: string | null
          icon?: number | Media | null
          videoUrl?: string | null
        }[]
      | null
  } | null
}

// Default service data — used when no cards are configured in the admin panel
const defaultServices = [
  {
    title: 'Residential Interior',
    icon: '/home.webp',
    description:
      'Expert home interior design in Dhaka — from luxury apartment makeovers and flat interior renovations to complete duplex house transformations. We create beautiful bedrooms, modern kitchens, functional living rooms, and cozy kids spaces tailored to your lifestyle and budget.',
    iconBg: '#f5fdfd',
    video: '/videos/residential.mp4',
    link: '/services/residential-interior',
    colorTheme: {
      primary: '#4F46E5',
      secondary: '#6366F1',
    },
  },
  {
    title: 'Commercial Interior',
    icon: '/create-a-svg-long-stroied-building-icon.webp',
    description:
      'Complete office interior design in Dhaka — corporate offices, IT workspaces, showrooms, restaurants, cafés, retail shops, clinics, gyms, and buying house offices. We create modern commercial interiors that boost productivity, attract customers, and reflect your brand identity across Bangladesh.',
    iconBg: '#f5fdfd',
    video: '/videos/commercial.mp4',
    link: '/services/commercial-interior',
    colorTheme: {
      primary: '#059669',
      secondary: '#10B981',
    },
  },
  {
    title: 'Architectural Consultancy',
    icon: '/create-a-svg-geometry-icon.webp',
    description:
      'Professional architectural consultancy and interior contractor services in Dhaka. From building plans and 3D visualization to structural design, renovation planning, and turnkey project execution — our architects guide your project from concept to completion.',
    iconBg: '#f5fdfd',
    video: '/videos/architecture.mp4',
    link: '/services/architectural-consultancy',
    colorTheme: {
      primary: '#DC2626',
      secondary: '#EF4444',
    },
  },
]

export const ServicesSection = ({ data }: ServicesSectionProps) => {
  const { primary: titlePrimary, highlight: titleHighlight } = splitTitle(
    data?.sectionTitle || 'Services We Offer',
  )
  const sectionDescription =
    data?.shortDescription ||
    "From consultation to installation, we handle all your interior design needs, whether it's your home, office, or a large-scale project."

  // Map admin-configured cards over the built-in defaults (per-index fallback
  // for icon/video/colors so partial data still renders nicely)
  const services =
    data?.cards && data.cards.length > 0
      ? data.cards.map((card, i) => {
          const fallback = defaultServices[i % defaultServices.length]!
          const iconUrl =
            card.icon && typeof card.icon === 'object' && card.icon.url ? card.icon.url : fallback.icon
          return {
            title: card.title || fallback.title,
            icon: iconUrl,
            description: card.description || fallback.description,
            iconBg: fallback.iconBg,
            video: card.videoUrl || fallback.video,
            link: card.link || fallback.link,
            colorTheme: fallback.colorTheme,
          }
        })
      : defaultServices

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)

  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // GSAP animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(ScrollTrigger, SplitText)

        const cleanupTriggers: any[] = []

        // Header entrance animation
        if (headerRef.current) {
          const headerEntrance = gsap.fromTo(
            headerRef.current,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headerRef.current,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
              },
            }
          )
          if (headerEntrance.scrollTrigger) cleanupTriggers.push(headerEntrance.scrollTrigger)
        }

        // Heading SplitText animation
        if (headingRef.current && headingWrapperRef.current) {
          const split = new SplitText(headingRef.current, {
            type: 'chars,words',
            charsClass: 'char',
            wordsClass: 'word',
          })

          const wrap = headingWrapperRef.current
          const onMove = (e: MouseEvent) => {
            const rect = wrap.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = (e.clientY - rect.top) / rect.height
            gsap.to(split.chars, {
              duration: 0.5,
              y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
              x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
              rotationY: (x - 0.5) * 20,
              rotationX: (y - 0.5) * -20,
              ease: 'power2.out',
              stagger: { amount: 0.3, from: 'center' },
            })
          }

          const onLeave = () => {
            gsap.to(split.chars, {
              duration: 1,
              y: 0,
              x: 0,
              rotationY: 0,
              rotationX: 0,
              ease: 'elastic.out(1, 0.3)',
              stagger: { amount: 0.3, from: 'center' },
            })
          }

          wrap.addEventListener('mousemove', onMove)
          wrap.addEventListener('mouseleave', onLeave)

          cleanupTriggers.push(() => {
            wrap.removeEventListener('mousemove', onMove)
            wrap.removeEventListener('mouseleave', onLeave)
            split.revert()
          })
        }

        // Card animations
        cardRefs.current.forEach((card, index) => {
          if (!card) return

          const cardEntrance = gsap.fromTo(
            card,
            { opacity: 0, y: 80, rotationX: -15, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              scale: 1,
              duration: 1,
              ease: 'power3.out',
              delay: index * 0.2,
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 60%',
                toggleActions: 'play none none reverse',
              },
            }
          )
          if (cardEntrance.scrollTrigger) cleanupTriggers.push(cardEntrance.scrollTrigger)

          const cardParallax = gsap.to(card, {
            yPercent: -5 - index * 3,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1 + index * 0.2,
              invalidateOnRefresh: true,
            },
          })
          if (cardParallax.scrollTrigger) cleanupTriggers.push(cardParallax.scrollTrigger)
        })

        cleanup = () => {
          cleanupTriggers.forEach((trigger) => {
            if (typeof trigger === 'function') trigger()
            else if (trigger?.kill) trigger.kill()
          })
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  // Video playback management
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true
        video.playsInline = true
        video.volume = 0
      }
    })
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index !== hoveredCard && !video.paused) {
          video.pause()
          video.currentTime = 0
        }
      }
    })

    if (hoveredCard !== null) {
      const videoToPlay = videoRefs.current[hoveredCard]
      if (videoToPlay) {
        const attemptPlay = () => {
          videoToPlay.muted = true
          videoToPlay.volume = 0
          videoToPlay.currentTime = 0
          videoToPlay.play().catch(() => {
            setTimeout(() => {
              videoToPlay.muted = true
              videoToPlay.play().catch(() => {})
            }, 100)
          })
        }

        if (videoToPlay.readyState === 0) {
          videoToPlay.load()
        }

        if (videoToPlay.readyState >= 2) {
          attemptPlay()
        } else {
          videoToPlay.addEventListener('canplay', attemptPlay, { once: true })
        }
      }
    }
  }, [hoveredCard])

  const handleCardHover = (index: number, isHovering: boolean) => {
    setHoveredCard(isHovering ? index : null)
  }

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col items-start py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{
        backgroundColor: hoveredCard !== null ? 'transparent' : '#ffffff',
        transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Section Background Videos */}
      <div className="absolute inset-0 w-full h-full">
        {services.map((service, index) => (
          <video
            key={index}
            ref={(el) => { videoRefs.current[index] = el }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: hoveredCard === index ? 1 : 0,
              transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
              transition:
                'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }}
            muted
            playsInline
            loop
            preload="none"
          >
            <source src={service.video} type="video/mp4" />
          </video>
        ))}

        {/* Dark Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: hoveredCard !== null ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
            opacity: hoveredCard !== null ? 1 : 0,
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Glassmorphism Effect */}
        <div
          className="absolute inset-0"
          style={{
            background: hoveredCard !== null ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
            backdropFilter: hoveredCard !== null ? 'blur(2px)' : 'none',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="flex flex-col items-center text-center mb-12 md:mb-24 mt-5 px-4"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <div
            ref={headingWrapperRef}
            className="cursor-default"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d', marginTop: '0px' }}
          >
            <h2
              ref={headingRef}
              className="font-medium text-2xl sm:text-3xl md:text-[40px] text-center tracking-[0] leading-tight md:leading-[62px] mb-4 md:mb-2"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              <span
                className="transition-colors duration-1000"
                style={{
                  color: hoveredCard !== null ? '#ffffff' : '#0d1529',
                }}
              >
                {titlePrimary}{' '}
              </span>
              <span
                className="transition-colors duration-1000"
                style={{
                  color: hoveredCard !== null ? '#ffffff' : '#EE5428',
                }}
              >
                {titleHighlight}
              </span>
            </h2>
          </div>

          <p
            className="text-sm md:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed will-change-transform px-8 transition-colors duration-1000"
            style={{
              color: hoveredCard !== null ? '#ffffff' : '#626161',
            }}
          >
            {sectionDescription}
          </p>
        </div>

        {/* Service Cards */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0 relative z-10 will-change-transform items-start"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',
            overflow: 'visible',
          }}
        >
          {services.map((service, index) => {
            const isHovered = hoveredCard === index

            return (
              <div
                key={index}
                ref={(el) => { cardRefs.current[index] = el }}
                className="will-change-transform flex"
                style={{
                  transformOrigin: 'center top',
                  backfaceVisibility: 'hidden',
                  transform: 'translate3d(0, 0, 0)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
              >
                <Card
                  className="rounded-[20px] overflow-hidden relative group w-full border-none"
                  style={{
                    height: isHovered ? '550px' : '360px',
                    backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.25)' : '#f6f8fa',
                    backdropFilter: isHovered ? 'blur(10px)' : 'none',
                    boxShadow: isHovered
                      ? '0 30px 60px -12px rgba(0, 0, 0, 0.4)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transformOrigin: 'center top',
                    transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(0) scale(1.02)' : 'translateY(0) scale(1)',
                  }}
                >
                  <CardContent className="p-6 sm:p-8 md:p-11 pt-6 sm:pt-8 md:pt-11 relative z-10 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="flex gap-6 mb-8 flex-shrink-0">
                      <div
                        className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[82px] md:h-[82px] rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.15)' : service.iconBg,
                          border: isHovered
                            ? '2px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid #000000',
                          transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: isHovered ? 'blur(8px)' : 'none',
                        }}
                      >
                        <img
                          src={service.icon}
                          alt={`${service.title} icon`}
                          className="w-11 h-[37px] object-contain"
                        />
                      </div>
                      <div className="mt-[6px] flex-1">
                        <h3
                          className="font-medium text-xl leading-9"
                          style={{
                            color: isHovered ? '#ffffff' : '#010212',
                            transition: 'color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
                          }}
                        >
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8 flex-shrink-0">
                      <p
                        className={`opacity-80 font-normal text-sm leading-8 ${!isHovered ? 'line-clamp-4' : ''}`}
                        style={{
                          color: isHovered ? 'rgba(255, 255, 255, 0.95)' : '#000000',
                          transition: 'color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          textShadow: isHovered ? '0 1px 6px rgba(0, 0, 0, 0.3)' : 'none',
                        }}
                      >
                        {service.description}
                      </p>
                    </div>

                    {/* Expanded content on hover */}
                    <div
                      className="overflow-hidden flex-1 flex flex-col"
                      style={{
                        maxHeight: isHovered ? '400px' : '0px',
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(-30px)',
                        transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <div className="mt-auto">
                        <Link href={service.link}>
                          <Button
                            className="rounded-full px-8 py-4 w-full text-base font-medium group relative overflow-hidden"
                            style={{
                              backgroundColor: `${service.colorTheme.primary}15`,
                              border: `2px solid ${service.colorTheme.primary}40`,
                              color: '#ffffff',
                              backdropFilter: 'blur(8px)',
                              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                              textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <span className="font-medium relative z-10">Explore Service</span>
                            <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer - only visible when not hovered */}
                  <CardFooter
                    className="p-0 relative z-10 mt-auto"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      height: isHovered ? '0px' : '49px',
                      overflow: 'hidden',
                      transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Link href={service.link} className="w-full" aria-label={`Learn more about ${service.title}`}>
                      <div className="w-full h-[49px] bg-primary flex items-center justify-center transition-all duration-300 hover:bg-primary/90 group">
                        <Button
                          variant="ghost"
                          className="font-semibold text-base text-white hover:text-white transition-all duration-300"
                        >
                          Learn about {service.title}
                          <ArrowRightIcon className="ml-2 w-[22px] h-[22px] transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grid Background with Parallax */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          opacity: hoveredCard !== null ? 0 : 1,
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Vertical lines */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`vline-${index}`}
            className="absolute top-6 bottom-6 w-px bg-gray-200 opacity-30"
            style={{ left: `${(index + 1) * 7.8}%` }}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`hline-${index}`}
            className="absolute left-0 right-0 h-px bg-gray-200 opacity-30"
            style={{ top: `${(index + 1) * 140 + 26}px` }}
          />
        ))}
      </div>

      {/* Floating decorative elements */}
      <div
        className="absolute top-20 left-10 w-4 h-4 rounded-full opacity-20"
        style={{
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#75BF44',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <div
        className="absolute bottom-32 right-16 w-6 h-6 rounded-full opacity-15"
        style={{
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#EE5428',
          animationDelay: '1s',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full opacity-25"
        style={{
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#75BF44',
          animationDelay: '2s',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </section>
  )
}
