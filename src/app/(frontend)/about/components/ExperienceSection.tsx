'use client'

import React, { useEffect, useRef } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import type { About } from '@/payload-types'

interface ExperienceSectionProps {
  data?: About['introSection']
  children?: React.ReactNode
}

export const ExperienceSection = ({ data, children }: ExperienceSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)

  const experienceHeadingRef = useRef<HTMLHeadingElement>(null)
  const experienceHeadingWrapperRef = useRef<HTMLDivElement>(null)
  const projectsCountRef = useRef<HTMLDivElement>(null)
  const corporateCountRef = useRef<HTMLDivElement>(null)

  // Heading hover animation
  useEffect(() => {
    if (!experienceHeadingRef.current || !experienceHeadingWrapperRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const splitText = new SplitText(experienceHeadingRef.current!, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const wrapper = experienceHeadingWrapperRef.current!

        const handleMouseMove = (e: MouseEvent) => {
          const rect = wrapper.getBoundingClientRect()
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

        wrapper.addEventListener('mousemove', handleMouseMove)
        wrapper.addEventListener('mouseleave', handleMouseLeave)

        cleanup = () => {
          splitText.revert()
          wrapper.removeEventListener('mousemove', handleMouseMove)
          wrapper.removeEventListener('mouseleave', handleMouseLeave)
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  // Column and button animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Left column animation
        if (leftColumnRef.current) {
          const elements = leftColumnRef.current.children
          gsap.fromTo(
            elements,
            { opacity: 0, x: -60, y: 30 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 1.2,
              stagger: 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: leftColumnRef.current,
                start: 'top 85%',
                end: 'top 55%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }

        // Right column animation
        if (rightColumnRef.current) {
          const cards = rightColumnRef.current.children
          gsap.fromTo(
            cards,
            { opacity: 0, x: 60, y: 30, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 1.2,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: rightColumnRef.current,
                start: 'top 85%',
                end: 'top 55%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === sectionRef.current ||
                trigger.trigger === leftColumnRef.current ||
                trigger.trigger === rightColumnRef.current) {
              trigger.kill()
            }
          })
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  // Numeric counters
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        const animateCount = (ref: HTMLDivElement | null, endValue: number, delay = 0) => {
          if (!ref) return
          const obj = { value: 0 }
          gsap.to(obj, {
            value: endValue,
            duration: 2,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref,
              start: 'top 85%',
              once: true,
            },
            onUpdate: () => {
              ref.textContent = `${Math.round(obj.value).toLocaleString()}+`
            },
          })
        }

        // Get values from data or use defaults
        const stats = data?.stats || []
        const projectsValue = parseInt(stats[0]?.value || '1000', 10)
        const corporateValue = parseInt(stats[1]?.value || '100', 10)

        animateCount(projectsCountRef.current, projectsValue)
        animateCount(corporateCountRef.current, corporateValue, 0.2)

        cleanup = () => {
          // Only kill ScrollTrigger instances for counter elements
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === projectsCountRef.current ||
                trigger.trigger === corporateCountRef.current) {
              trigger.kill()
            }
          })
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [data?.stats])

  const stats = data?.stats || []
  const projectsLabel = stats[0]?.label || 'Projects Completed'
  const corporateLabel = stats[1]?.label || 'Corporate Served'

  return (
    <section ref={sectionRef} className="w-full pt-16 md:pt-20 pb-16 md:pb-20 bg-white relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-8 xl:gap-12 items-start">
          {/* Left Column - Title, Description, Stats */}
          <div ref={leftColumnRef} className="space-y-6">
            <div
              ref={experienceHeadingWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2
                ref={experienceHeadingRef}
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#01190c] leading-tight"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
              >
                {data?.sectionTitle || 'Experience Desperately Seeking: Where Design Meets Lifestyle'}
              </h2>
            </div>

            <p className="text-base text-[#626161] leading-relaxed text-justify" suppressHydrationWarning>
              {data?.description || 'Desperately Seeking is one of the best interior companies in Bangladesh — a full-service interior design firm with over 9 years of experience and 700+ successfully completed projects across Dhaka and beyond. Founded by Md Ashikur Rahman, we have grown from a small design studio into a trusted turnkey interior company that handles everything from initial design concept to final handover under one roof. As a premium interior designer in Bangladesh, we specialize in residential interior design, commercial interior design, and architectural consultancy. Our portfolio spans modern apartment interiors in Gulshan and Uttara, corporate office designs in Tejgaon and Motijheel, restaurant and café interiors in Dhanmondi, and luxury duplex house transformations across Dhaka. We serve as both a creative design partner and a reliable interior contractor in Dhaka — giving our clients the convenience of a single team managing their entire project.'}
            </p>

            {/* Statistics Cards */}
            <div ref={rightColumnRef} className="grid grid-cols-2 gap-4 pt-2">
              <Card
                className="backdrop-blur-md bg-white/30 border border-[#000]/20 rounded-[5px] p-5 md:p-6 text-center h-full transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_20px_#00bfa6] hover:border-[#00bfa6]/50"
                style={{ backgroundColor: '#EBF8F7' }}
              >
                <CardContent className="p-0 space-y-3">
                  <div
                    ref={projectsCountRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#01190c]"
                  >
                    0+
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-[#01190c]">{projectsLabel}</h3>
                  {/*<div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: '#AAEBEB' }}
                  >
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>*/}
                </CardContent>
              </Card>

              <Card
                className="backdrop-blur-md bg-white/30 border border-[#000]/20 rounded-[5px] p-5 md:p-6 text-center h-full transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_20px_#ffd700] hover:border-[#ffd700]/50"
                style={{ backgroundColor: '#FEFCEC' }}
              >
                <CardContent className="p-0 space-y-3">
                  <div
                    ref={corporateCountRef}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#01190c]"
                  >
                    0+
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-[#01190c]">{corporateLabel}</h3>
                  {/*<div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: '#EFE058' }}
                  >
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>*/}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Google Reviews Widget (passed as children) */}
          {children && (
            <div className="flex justify-center xl:justify-end xl:sticky xl:top-24">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
