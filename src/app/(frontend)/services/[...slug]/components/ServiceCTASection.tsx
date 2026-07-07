'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

interface ServiceCTASectionProps {
  serviceTitle: string
  colorCode?: string
}

export const ServiceCTASection = ({ colorCode }: ServiceCTASectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll animation
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
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === sectionRef.current) {
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

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          ref={sectionRef}
          className="relative overflow-hidden rounded-[40px] py-20 md:py-28"
          style={{
            backgroundImage: 'url(/cta-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Content */}
          <div ref={contentRef} className="relative z-10 text-center px-6 md:px-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium [font-family:'Fahkwang',Helvetica] mb-12 leading-tight"
              style={{ color: '#2D2D2D' }}
            >
              Ready to transform your space?
            </h2>

            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg [font-family:'Fahkwang',Helvetica]"
              style={{
                backgroundColor: colorCode || '#EE5428',
              }}
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
