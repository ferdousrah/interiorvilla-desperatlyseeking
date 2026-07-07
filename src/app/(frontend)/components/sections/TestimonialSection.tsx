'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, PlayIcon } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import useEmblaCarousel from 'embla-carousel-react'
import type { Testimonial as TestimonialType, Media } from '@/payload-types'

interface TestimonialSectionProps {
  testimonials?: TestimonialType[]
}

// Convert YouTube links into embed format
const getYouTubeEmbedUrl = (url: string): string => {
  try {
    const yt = new URL(url)
    if (yt.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${yt.pathname.slice(1)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    }
    if (yt.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${yt.searchParams.get('v')}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    }
    return url
  } catch {
    return url
  }
}

export const TestimonialSection = ({ testimonials = [] }: TestimonialSectionProps) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [fancyboxLoaded, setFancyboxLoaded] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(max-width: 767px)': { slidesToScroll: 1 },
    },
  })

  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  // Transform testimonials data
  const items = testimonials
    .map((doc, i) => {
      const media = doc.coverImage as Media | undefined
      const title = doc.title || `Testimonial ${i + 1}`
      return {
        id: doc.id,
        title,
        description: doc.shortDetails || '',
        image: media?.url || '/placeholder.webp',
        alt: media?.alt || title,
        video: doc.videoUrl || '',
      }
    })
    .filter((t) => !!t.video)

  // Load Fancybox dynamically
  useEffect(() => {
    if (items.length === 0) return

    const loadFancybox = async () => {
      try {
        const FancyboxModule = await import('@fancyapps/ui')
        const Fancybox = FancyboxModule.Fancybox as any
        // @ts-expect-error - CSS import works at runtime
        await import('@fancyapps/ui/dist/fancybox/fancybox.css')

        Fancybox.destroy()
        Fancybox.bind("[data-fancybox='testimonial-videos']", {
          animated: true,
          showClass: 'fancybox-fadeIn',
          hideClass: 'fancybox-fadeOut',
          dragToClose: false,
          Toolbar: {
            display: {
              left: [],
              middle: [],
              right: ['zoom', 'slideshow', 'thumbs', 'download', 'close'],
            },
          },
          Iframe: {
            preload: true,
            attr: {
              allow:
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
              allowfullscreen: 'true',
            },
          },
        })
        setFancyboxLoaded(true)

        return () => {
          Fancybox.destroy()
        }
      } catch (err) {
        console.error('Failed to load Fancybox:', err)
      }
    }

    loadFancybox()
  }, [items.length])

  // GSAP animations
  useLayoutEffect(() => {
    if (!sectionRef.current) return

    let ctx: any

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(SplitText, ScrollTrigger)

        ctx = gsap.context(() => {
          if (headingRef.current) {
            const st = new SplitText(headingRef.current, {
              type: 'words,chars',
              charsClass: 'char',
              wordsClass: 'word',
            })
            gsap.fromTo(
              st.chars,
              { opacity: 0.2, y: 30, scale: 0.9, rotationY: -15 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationY: 0,
                duration: 1,
                stagger: { amount: 0.6, from: 'start' },
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: headingRef.current,
                  start: 'top 90%',
                  end: 'top 60%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }
        }, sectionRef)
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => ctx?.revert()
  }, [])

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  if (items.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      className="w-full flex items-start justify-center relative overflow-hidden bg-white py-16 md:py-20 lg:py-24"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px', zIndex: 1 }}
    >
      <div className="container mx-auto px-4 relative z-10 w-full" style={{ maxWidth: '1219px' }}>
        {/* Section Header */}
        <div className="text-center mb-16">
          <div ref={headingWrapperRef} className="perspective-[1000px] cursor-default">
            <h2
              ref={headingRef}
              className="font-medium text-2xl sm:text-3xl md:text-[40px] text-center leading-tight md:leading-[62px] mb-4 md:mb-2"
            >
              <span className="text-[#0d1529]">Client </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>
          <p
            ref={descriptionRef}
            className="text-sm sm:text-base md:text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed px-4 md:px-8"
          >
            We create spaces that inspire and reflect your unique lifestyle
          </p>
        </div>

        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="absolute -left-1 sm:left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20"
          >
            <ArrowLeft className="w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="absolute -right-1 sm:right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20"
          >
            <ArrowRight className="w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 md:gap-8">
              {items.map((t) => (
                <div
                  key={t.id}
                  data-card
                  className="relative flex-[0_0_260px] sm:flex-[0_0_280px] md:flex-[0_0_320px] lg:flex-[0_0_360px] transition-all duration-500 ease-in-out"
                  onMouseEnter={() => setHoveredCard(t.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform:
                      hoveredCard === t.id
                        ? 'scale(1.05) translateY(-8px)'
                        : 'scale(1) translateY(0)',
                    zIndex: hoveredCard === t.id ? 10 : 1,
                  }}
                >
                  <Card
                    className="group h-[400px] w-full rounded-2xl overflow-hidden border-2 border-primary/30 relative cursor-pointer"
                    style={{
                      boxShadow:
                        hoveredCard === t.id
                          ? '0 25px 50px -12px rgba(0,0,0,0.25)'
                          : '0 8px 32px rgba(0,0,0,0.12)',
                    }}
                  >
                    <CardContent className="flex items-center justify-center h-full p-0 relative">
                      {/* Image */}
                      <img
                        src={t.image || '/placeholder.webp'}
                        alt={t.alt}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/placeholder.webp'
                        }}
                      />

                      {/* Overlay */}
                      <div
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          background:
                            hoveredCard === t.id
                              ? 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(117,191,68,0.3) 100%)'
                              : 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 100%)',
                        }}
                      />

                      {/* Play button */}
                      <a
                        href={getYouTubeEmbedUrl(t.video)}
                        data-fancybox="testimonial-videos"
                        data-caption={t.title}
                        aria-label={`Play testimonial video: ${t.title || 'Client testimonial video'}`}
                        className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-3 border-white flex items-center justify-center transition-all duration-500 z-10 ${
                          hoveredCard === t.id ? 'bg-white scale-110' : 'bg-white/20 backdrop-blur-sm'
                        }`}
                      >
                        <span className="sr-only">
                          {`Play testimonial video: ${t.title || 'Client testimonial video'}`}
                        </span>
                        <PlayIcon
                          aria-hidden="true"
                          className={`w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 transition-all duration-500 ${
                            hoveredCard === t.id ? 'text-primary' : 'text-white'
                          }`}
                        />
                      </a>

                      {/* Text */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-lg md:text-xl font-semibold mb-2">{t.title}</h3>
                        <p className="text-sm md:text-base text-white/90">{t.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
