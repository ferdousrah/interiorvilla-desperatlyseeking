'use client'

import React, { useEffect, useRef } from 'react'
import type { Service } from '@/payload-types'

// Background colors for approach cards (matching original design)
const bgColors = ['#FFFEF3', '#F8FFFF', '#F6EFEF']

// Default approaches when no CMS data
const defaultApproaches = [
  {
    id: '1',
    title: 'Discovery & Concept',
    description:
      'We Start By Understanding Your Lifestyle And Vision To Create A Personalized Design.',
  },
  {
    id: '2',
    title: 'Design & Material Selection',
    description:
      'We Craft A Personalized Design And Choose Sustainable, Premium Materials To Make It A Reality.',
  },
  {
    id: '3',
    title: 'Execution & Finishing Touches',
    description:
      'Our team handles every detail, delivering a seamless transformation into a beautiful, functional space.',
  },
]

interface ServiceApproachSectionProps {
  data?: Service['ourApproach']
}

export const ServiceApproachSection = ({ data }: ServiceApproachSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)

  // Use CMS data if available, otherwise use defaults
  const approaches = data?.approaches && data.approaches.length > 0 ? data.approaches : defaultApproaches

  // Scroll animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Heading animation - smooth and quick
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: headingRef.current,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        // Steps animation - smooth entrance
        if (stepsContainerRef.current) {
          const steps = stepsContainerRef.current.querySelectorAll('.approach-card')
          gsap.fromTo(
            steps,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: stepsContainerRef.current,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === sectionRef.current ||
                trigger.trigger === stepsContainerRef.current) {
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

  return (
    <section ref={sectionRef} className="w-full py-20 md:py-32 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 w-full">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default w-full flex justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6 text-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              Our Approach
            </h2>
          </div>
          <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-2xl mx-auto text-center">
            {data?.description || 'A Clear Path to Your Dream Interior'}
          </p>
        </div>

        {/* Single responsive render — the 3 steps appear ONCE in the DOM
            (flex column on mobile, row with arrows on desktop). Previously a
            separate desktop + mobile layout both rendered, duplicating every
            step's H3 for crawlers. */}
        <div
          ref={stepsContainerRef}
          className="relative flex flex-col md:flex-row justify-center items-center md:items-stretch gap-10 md:gap-0"
        >
          {approaches.slice(0, 3).map((approach, index) => (
            <React.Fragment key={approach.id || index}>
              {/* Approach Card */}
              <div
                className="approach-card relative border-2 border-[#E5E5E5] rounded-3xl md:rounded-2xl text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-primary/30 flex flex-col justify-center group w-[340px] max-w-full h-[350px] md:h-[400px] px-[25px] py-[30px] md:px-[30px] md:py-[40px]"
                style={{ backgroundColor: bgColors[index % bgColors.length] }}
              >
                {/* Step Number Circle with dotted border */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div
                    className="absolute inset-0 border-2 border-dashed border-[#CCCCCC] rounded-full transition-colors group-hover:border-[#D74C25] group-hover:animate-spin"
                    style={{ animationDuration: '3s' }}
                  />
                  <div className="absolute inset-2 bg-white border-2 border-[#333333] rounded-full flex items-center justify-center">
                    <span className="text-[#333333] font-bold [font-family:'Fahkwang',Helvetica] text-lg">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 leading-tight">
                  {approach.title}
                </h3>

                {/* Description */}
                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed">
                  {approach.description}
                </p>
              </div>

              {/* Connector between cards (decorative) */}
              {index < Math.min(approaches.length, 3) - 1 && (
                <>
                  {/* Desktop horizontal arrow */}
                  <div
                    className="hidden md:flex items-center flex-shrink-0"
                    style={{
                      alignItems: index === 0 ? 'flex-start' : 'flex-end',
                      paddingTop: index === 0 ? '60px' : '0',
                      paddingBottom: index === 1 ? '60px' : '0',
                    }}
                  >
                    <img
                      src={index === 0 ? '/approach-arrow-one.svg' : '/approach-arrow-two.svg'}
                      alt=""
                      aria-hidden="true"
                      className="object-contain"
                      style={{ width: '118.47px', height: 'auto' }}
                    />
                  </div>
                  {/* Mobile down chevron */}
                  <div className="flex md:hidden justify-center">
                    <div className="w-10 h-10 border-2 border-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
