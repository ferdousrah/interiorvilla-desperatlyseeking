'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '../ui/Card'
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider'
import type { Home, Media } from '@/payload-types'

interface AboutSectionProps {
  data?: Home['aboutSection']
}

// Default features if none provided
const defaultFeatures = [
  {
    id: '01',
    title: 'Flexible Budget & Taste',
    description: 'Your style, your budget, our flexible designs.',
  },
  {
    id: '02',
    title: 'On-time Delivery',
    description: 'Delivering your dream space, precisely on schedule, every time.',
  },
  {
    id: '03',
    title: '700+ Happy Customers',
    description: 'Proudly serving 700+ happy customers with exceptional design.',
  },
]

export const AboutSection = ({ data }: AboutSectionProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const featuresCardRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const featureHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const featureHeadingWrapperRefs = useRef<(HTMLDivElement | null)[]>([])

  // Derive images and features from data
  const { beforeUrl, afterUrl, beforeAlt, afterAlt, features, bg } = useMemo(() => {
    const list = Array.isArray(data?.beforeAfterImages) ? data!.beforeAfterImages : []

    const beforeImg = list[0]?.image as Media | null | undefined
    const afterImg = list[1]?.image as Media | null | undefined

    // Use large size (1400px) for before/after slider
    const beforeUrl = beforeImg?.sizes?.large?.url || beforeImg?.sizes?.medium?.url || beforeImg?.url || '/placeholder.webp'
    const afterUrl = afterImg?.sizes?.large?.url || afterImg?.sizes?.medium?.url || afterImg?.url || '/placeholder.webp'

    const beforeAlt = beforeImg?.alt || 'Interior design before'
    const afterAlt = afterImg?.alt || 'Interior design after'

    const features =
      (data?.highlights ?? []).map((h, idx) => ({
        id: String(idx + 1).padStart(2, '0'),
        title: h.text || '',
        description: h.desc || '',
      })) || []

    const bg =
      data?.backgroundColor && data.backgroundColor.trim() ? data.backgroundColor : '#f7f9fb'

    return { beforeUrl, afterUrl, beforeAlt, afterAlt, features, bg }
  }, [data])

  const displayFeatures = features.length > 0 ? features : defaultFeatures

  // GSAP animations for heading
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(SplitText, ScrollTrigger)

        const split = new SplitText(headingRef.current!, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.set(split.chars, { opacity: 0, y: 100, rotateX: -90, transformOrigin: '50% 50% -50px' })
        tl.to(split.chars, {
          duration: 1.2,
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: { amount: 1, from: 'start' },
          ease: 'power4.out',
        })

        // Hover animation
        const wrap = headingWrapperRef.current
        const onMove = (e: MouseEvent) => {
          if (!wrap) return
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

        wrap?.addEventListener('mousemove', onMove)
        wrap?.addEventListener('mouseleave', onLeave)

        cleanup = () => {
          wrap?.removeEventListener('mousemove', onMove)
          wrap?.removeEventListener('mouseleave', onLeave)
          split.revert()
          ScrollTrigger.getAll().forEach((t) => t.kill())
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [data?.sectionTitle])

  // Description fade animation and parallax
  useEffect(() => {
    if (!descriptionRef.current || !sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Description fade
        gsap.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 50, filter: 'blur(10px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: descriptionRef.current,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Image container parallax
        if (imageContainerRef.current) {
          gsap.to(imageContainerRef.current, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: imageContainerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          })
        }

        // Features card parallax
        if (featuresCardRef.current) {
          gsap.to(featuresCardRef.current, {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
        }

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

  // Feature headings hover animation
  useEffect(() => {
    if (displayFeatures.length === 0) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const cleanups: Array<() => void> = []

        featureHeadingRefs.current.forEach((heading, index) => {
          if (!heading) return
          const split = new SplitText(heading, { type: 'chars,words', charsClass: 'char', wordsClass: 'word' })
          const wrapper = featureHeadingWrapperRefs.current[index]
          if (!wrapper) return

          const onMove = (e: MouseEvent) => {
            const rect = wrapper.getBoundingClientRect()
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

          wrapper.addEventListener('mousemove', onMove)
          wrapper.addEventListener('mouseleave', onLeave)

          cleanups.push(() => {
            wrapper.removeEventListener('mousemove', onMove)
            wrapper.removeEventListener('mouseleave', onLeave)
            split.revert()
          })
        })

        cleanup = () => cleanups.forEach((fn) => fn())
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [displayFeatures.length])

  return (
    <section
      ref={sectionRef}
      className="relative w-full rounded-t-[20px] py-12 md:py-20 lg:py-28 overflow-hidden"
      style={{ zIndex: 4, backgroundColor: bg }}
    >
      <div className="container mx-auto max-w-[1276px] px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <div
              ref={headingWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2
                ref={headingRef}
                className="font-medium text-[#01190c] text-2xl md:text-3xl lg:text-[40px] tracking-[-1.00px] leading-tight lg:leading-[49.9px] mb-12"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
              >
                {data?.sectionTitle || 'Elevating Interiors with Passion and Purpose'}
              </h2>
            </div>

            <div className="relative mt-[100px]">
              <div
                ref={imageContainerRef}
                className="relative overflow-hidden rounded-md"
                style={{ position: 'relative', zIndex: 5 }}
              >
                {beforeUrl && afterUrl ? (
                  <BeforeAfterSlider
                    beforeImage={beforeUrl}
                    afterImage={afterUrl}
                    altBefore={beforeAlt}
                    altAfter={afterAlt}
                  />
                ) : (
                  <div className="aspect-[704/521] w-full max-w-[730px] bg-gray-100 rounded-md" />
                )}
              </div>

              {/* Experience badge */}
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-10 lg:right-8 w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] z-10 cursor-pointer transition-transform duration-500 ease-out hover:scale-110 group">
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30" />
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-secondary/30 group-hover:bg-secondary" />
                <img
                  className="absolute w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] top-0 left-0 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
                  alt=""
                  aria-hidden="true"
                  src="/ellipse-141.svg"
                  style={{ transform: 'none' }}
                />
                <div className="absolute w-[80px] md:w-[90px] lg:w-[105px] top-[75px] md:top-[85px] lg:top-[95px] left-[30px] md:left-[35px] lg:left-[29px] font-normal text-primary text-sm md:text-base text-center leading-[20px] md:leading-[24px] transition-all duration-500 ease-out group-hover:scale-105">
                  <span className="font-medium">
                    YEARS
                    <br />
                    EXPERIENCED
                  </span>
                </div>
                <div className="absolute w-[60px] md:w-[70px] lg:w-[78px] top-[45px] md:top-[50px] lg:top-[56px] left-[40px] md:left-[45px] lg:left-[46px] font-bold text-primary text-2xl md:text-3xl lg:text-4xl text-center leading-[30px] md:leading-[35px] lg:leading-[40px] whitespace-nowrap transition-all duration-500 ease-out group-hover:scale-110">
                  9+
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <p
              ref={descriptionRef}
              className="font-normal text-[#626161] text-sm leading-[26.6px] mb-10 md:mb-10 pb-4 md:pb-6"
            >
              {data?.shortDescription ||
                'We are a full-service interior design studio dedicated to creating beautifully curated spaces that reflect your unique style and needs.'}
            </p>

            <Card
              ref={featuresCardRef}
              className="w-full bg-white rounded-[15px] border-none shadow-none will-change-transform"
              style={{
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                transform: 'translate3d(0,0,0)',
              }}
            >
              <CardContent className="p-6 md:p-8 lg:p-10 space-y-7 md:space-y-8">
                {displayFeatures.map((feature, index) => (
                  <div key={feature.id + feature.title} className="flex items-start gap-4 md:gap-6 lg:gap-8">
                    <div className="flex-shrink-0 w-[50px] h-[47px] md:w-[60px] md:h-[57px] bg-primary rounded-[11px] flex items-center justify-center">
                      <div className="font-bold text-[#01190c] text-xl">{feature.id}</div>
                    </div>
                    <div className="space-y-1">
                      <div
                        ref={(el) => { featureHeadingWrapperRefs.current[index] = el }}
                        className="perspective-[1000px] cursor-default"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <h3
                          ref={(el) => { featureHeadingRefs.current[index] = el }}
                          className="font-semibold text-black text-xl tracking-[-1.00px] leading-[42.3px]"
                          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
                        >
                          {feature.title}
                        </h3>
                      </div>
                      {feature.description && (
                        <p className="font-normal text-[#6c6c6c] text-sm leading-[26.6px]">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
