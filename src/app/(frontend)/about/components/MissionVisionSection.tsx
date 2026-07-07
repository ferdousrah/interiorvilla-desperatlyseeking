'use client'

import React, { useEffect, useRef } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import type { About } from '@/payload-types'

interface MissionVisionSectionProps {
  data?: About['missionVision']
}

// Helper to extract text from rich text content
const extractTextFromRichText = (content: unknown): string => {
  if (!content) return ''
  if (typeof content === 'string') return content

  // Handle Lexical rich text format
  if (typeof content === 'object' && content !== null) {
    const obj = content as Record<string, unknown>
    if (obj.root && typeof obj.root === 'object') {
      const root = obj.root as Record<string, unknown>
      if (Array.isArray(root.children)) {
        return root.children
          .map((child: Record<string, unknown>) => {
            if (Array.isArray(child.children)) {
              return child.children
                .map((c: Record<string, unknown>) => c.text || '')
                .join('')
            }
            return child.text || ''
          })
          .join(' ')
      }
    }
  }

  return ''
}

export const MissionVisionSection = ({ data }: MissionVisionSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)

  // Scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        if (headingRef.current) {
          gsap.fromTo(
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
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        if (descriptionRef.current) {
          gsap.fromTo(
            descriptionRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: descriptionRef.current,
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        if (cardsContainerRef.current) {
          const cards = cardsContainerRef.current.children
          gsap.fromTo(
            cards,
            { opacity: 0, y: 60, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              stagger: 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: cardsContainerRef.current,
                start: 'top 96%',
                toggleActions: 'play none none none',
              },
            }
          )
        }

        ScrollTrigger.refresh()

        cleanup = () => {
          // Only kill ScrollTrigger instances for THIS section
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === sectionRef.current ||
                trigger.trigger === headingRef.current ||
                trigger.trigger === descriptionRef.current ||
                trigger.trigger === cardsContainerRef.current) {
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

  // Hover tilt effect handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = (-y / 20).toFixed(2)
    const rotateY = (x / 20).toFixed(2)
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`
  }

  const resetTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
  }

  const missionContent =
    extractTextFromRichText(data?.missionContent) ||
    'Our mission is to be the most trusted interior design company in Bangladesh by delivering exceptional design, transparent management, and lasting quality. We aim to make professional interior design accessible, affordable, and stress-free for homes, offices, and commercial spaces across the country.'

  const visionContent =
    extractTextFromRichText(data?.visionContent) ||
    'We envision Desperately Seeking as one of the most trusted interior firms in Bangladesh — a name families, entrepreneurs, and businesses rely on to transform their spaces. Our goal is to set new standards through innovative design, sustainable practices, and exceptional client satisfaction.'

  const contentItems = [
    { type: 'Mission', content: missionContent },
    { type: 'Vision', content: visionContent },
  ]

  return (
    <section ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#01190c] mb-6"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
            >
              Mission & <span className="text-secondary">Vision</span>
            </h2>
          </div>
          <p ref={descriptionRef} className="text-sm sm:text-base md:text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed">
            {data?.description ||
              'Guided by our core values, we strive to create spaces that inspire and transform everyday living.'}
          </p>
        </div>

        <div ref={cardsContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {contentItems.map((item, i) => (
            <Card
              key={item.type}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              className="text-white rounded-3xl p-8 md:p-12 h-full transition-all duration-700 ease-out cursor-pointer shadow-[0_25px_45px_rgba(254,240,236,0.35)] border-none"
              style={{ backgroundColor: '#01190c' }}
            >
              <CardContent className="p-0">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-6">
                    <svg className="w-8 h-8 text-[#01190c]" fill="currentColor" viewBox="0 0 20 20">
                      {i === 0 ? (
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <>
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Our {item.type}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
