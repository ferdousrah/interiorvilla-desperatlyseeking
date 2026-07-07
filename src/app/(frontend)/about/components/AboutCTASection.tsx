'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

export const AboutCTASection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Content animation
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        )

        ScrollTrigger.refresh()

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === sectionRef.current ||
                trigger.trigger === contentRef.current) {
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

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const splitText = new SplitText(headingRef.current!, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const wrapper = headingWrapperRef.current!

        const handleMouseMove = (e: MouseEvent) => {
          const rect = wrapper.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          gsap.to(splitText.chars, {
            duration: 0.5,
            y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
            x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
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
      } catch {
        // SplitText not available
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  return (
    <section ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
        <div ref={contentRef}>
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#01190c] mb-6 text-center"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
            >
              Ready to <span className="text-secondary">Transform</span> Your Space?
            </h2>
          </div>
          <p
            ref={descriptionRef}
            className="text-sm sm:text-base md:text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12 text-center"
          >
            Whether you&apos;re renovating, building from scratch, or simply looking to refresh your
            space, our team is ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/book-appointment"
              className="bg-[#132A13] hover:bg-primary-hover text-white px-8 py-4 sm:px-12 sm:py-5 md:px-[62px] md:py-[30px] rounded-[46px] text-base md:text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Book an Appointment
            </Link>

            <Link
              href="/contact"
              className="border-2 border-[#01190c] text-[#01190c] hover:bg-[#01190c] hover:text-white px-8 py-4 sm:px-12 sm:py-5 md:px-[62px] md:py-[30px] rounded-[46px] text-base md:text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
