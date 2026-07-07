'use client'

import React, { useEffect, useRef } from 'react'
import type { Service } from '@/payload-types'
import RichText from '@/components/RichText'

interface ServiceIntroSectionProps {
  data?: Service['introSection']
}

export const ServiceIntroSection = ({ data }: ServiceIntroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)

  // Scroll animation for content
  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              end: 'top 55%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === contentRef.current ||
                trigger.trigger === sectionRef.current) {
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

  // Heading hover animation with SplitText
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
    <section ref={sectionRef} className="w-full pt-16 md:pt-20 pb-6 md:pb-8 bg-white relative z-10">
      <div className="container mx-auto px-4 w-full">
        <div ref={contentRef} className="text-center">
          {/* Animated Heading */}
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default w-full flex justify-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8 leading-tight text-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              {data?.sectionTitle || 'Transforming Your Home Into a Sanctuary of Style and Comfort.'}
            </h2>
          </div>

          {/* Description */}
          {data?.description ? (
            <div className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed  w-full mx-auto text-justify">
              <RichText data={data.description as any} enableGutter={false} />
            </div>
          ) : (
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-3xl mx-auto text-center">
              We specialize in creating personalized residential interiors that reflect your unique taste and lifestyle. Our designs blend comfort, style, and functionality to transform your living spaces into beautiful, harmonious environments.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
