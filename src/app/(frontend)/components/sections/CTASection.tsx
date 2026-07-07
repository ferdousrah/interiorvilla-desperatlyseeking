'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

export const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    const checkFonts = async () => {
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready
        }
        setFontsReady(true)
      } catch {
        setTimeout(() => setFontsReady(true), 1000)
      }
    }
    checkFonts()
  }, [])

  // GSAP scroll animations
  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        const cleanupTriggers: any[] = []

        // Heading animation
        if (headingRef.current) {
          const headingAnim = gsap.fromTo(
            headingRef.current,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headingRef.current,
                start: 'top 85%',
                end: 'top 55%',
                toggleActions: 'play none none reverse',
              },
            }
          )
          if (headingAnim.scrollTrigger) cleanupTriggers.push(headingAnim.scrollTrigger)
        }

        // Description animation
        if (descriptionRef.current) {
          const descAnim = gsap.fromTo(
            descriptionRef.current,
            { opacity: 0, y: 30, filter: 'blur(5px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: descriptionRef.current,
                start: 'top 85%',
                end: 'top 65%',
                toggleActions: 'play none none reverse',
              },
            }
          )
          if (descAnim.scrollTrigger) cleanupTriggers.push(descAnim.scrollTrigger)
        }

        // Content animation
        if (contentRef.current) {
          const contentAnim = gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 80, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.5,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contentRef.current,
                start: 'top 85%',
                end: 'top 55%',
                toggleActions: 'play none none reverse',
              },
            }
          )
          if (contentAnim.scrollTrigger) cleanupTriggers.push(contentAnim.scrollTrigger)
        }

        cleanup = () => {
          cleanupTriggers.forEach((trigger) => trigger?.kill())
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  // SplitText hover animation for heading
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current || !fontsReady) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const split = new SplitText(headingRef.current!, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const wrapper = headingWrapperRef.current!

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

        cleanup = () => {
          wrapper.removeEventListener('mousemove', onMove)
          wrapper.removeEventListener('mouseleave', onLeave)
          split.revert()
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [fontsReady])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#f7f9fb] rounded-t-[20px] py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <motion.div ref={contentRef} className="w-full max-w-3xl text-center">
            <div
              ref={headingWrapperRef}
              className="cursor-default flex justify-center"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
              <motion.h2
                ref={headingRef}
                className="text-2xl sm:text-3xl md:text-[40px] font-medium text-[#01190c] mb-6"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0)',
                }}
              >
                Ready to <span className="text-secondary">Transform</span> Your Space?
              </motion.h2>
            </div>

            <motion.p
              ref={descriptionRef}
              className="text-sm sm:text-base md:text-lg text-[#626161] leading-relaxed mb-8 md:mb-12 mx-auto px-2"
            >
              Whether you&apos;re renovating, building from scratch, or simply looking to refresh
              your space, our team is ready to bring your vision to life.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/book-appointment">
                <Button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 md:px-12 md:py-5 lg:px-16 lg:py-7 rounded-full text-base md:text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto">
                  Book an Appointment
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-2 border-[#01190c] text-[#01190c] hover:bg-[#01190c] hover:text-white px-8 py-4 md:px-12 md:py-5 lg:px-16 lg:py-7 rounded-full text-base md:text-lg font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
