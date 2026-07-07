'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FeaturedWorksHeaderProps {
  title?: string
  subtitle?: string
}

export const FeaturedWorksHeader = ({
  title = 'Our Featured Works',
  subtitle = 'Explore our showcase of exceptional interior design projects that reflect our commitment to quality, creativity, and client satisfaction.',
}: FeaturedWorksHeaderProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Entrance animations
  useEffect(() => {
    if (!sectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  // GSAP animations when visible
  useEffect(() => {
    if (!isVisible || !headingRef.current || !subtitleRef.current) return

    // Heading animation with characters
    const heading = headingRef.current
    const chars = heading.querySelectorAll('.char')

    gsap.set(chars, {
      opacity: 0,
      y: 100,
      rotateX: -90,
      transformOrigin: '50% 50% -50px',
    })

    gsap.to(chars, {
      duration: 1.5,
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: {
        amount: 1.2,
        from: 'start',
      },
      ease: 'power4.out',
      delay: 0.3,
    })

    // Subtitle animation
    gsap.fromTo(
      subtitleRef.current,
      {
        opacity: 0,
        y: 50,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.8,
        ease: 'power3.out',
        delay: 1.0,
      }
    )
  }, [isVisible])

  // Hover animation for heading
  useEffect(() => {
    if (!headingWrapperRef.current || !headingRef.current) return

    const wrapper = headingWrapperRef.current
    const chars = headingRef.current.querySelectorAll('.char')

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      gsap.to(chars, {
        duration: 0.5,
        y: (_i, _target, targets) => {
          const i = Array.from(targets).indexOf(_target)
          return (y - 0.5) * 15 * Math.sin((i + 1) * 0.5)
        },
        x: (_i, _target, targets) => {
          const i = Array.from(targets).indexOf(_target)
          return (x - 0.5) * 15 * Math.cos((i + 1) * 0.5)
        },
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: 'power2.out',
        stagger: {
          amount: 0.3,
          from: 'center',
        },
      })
    }

    const handleMouseLeave = () => {
      gsap.to(chars, {
        duration: 1,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: 'elastic.out(1, 0.3)',
        stagger: {
          amount: 0.3,
          from: 'center',
        },
      })
    }

    wrapper.addEventListener('mousemove', handleMouseMove)
    wrapper.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove)
      wrapper.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Split text into characters for animation
  const splitIntoChars = (text: string, className: string = '') => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className={`char inline-block ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <section
      ref={sectionRef}
      className="w-full pt-16 md:pt-20 lg:pt-24 pb-0 bg-white relative overflow-hidden"
    >
      {/* Background decorative elements — static (no pulse) to avoid
          continuous repaints; two orbs are enough for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.08] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-300/[0.06] rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '120px 120px',
            }}
          />
        </div>

        {/* Noise overlay */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full opacity-[0.15]"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(0,0,0,0.015) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(0,0,0,0.018) 0%, transparent 50%)
              `,
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div
          ref={headingWrapperRef}
          className="cursor-default"
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          <h2
            ref={headingRef}
            className="font-medium text-2xl sm:text-3xl md:text-[40px] text-center tracking-[0] leading-tight mb-6"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(0)',
            }}
          >
            {splitIntoChars('Our ', 'text-[#0d1529]')}
            {splitIntoChars('Featured ', 'text-[#0d1529]')}
            {splitIntoChars('Works', 'text-secondary')}
          </h2>
        </div>

        <p
          ref={subtitleRef}
          className="text-sm md:text-base lg:text-lg text-[#626161] max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed opacity-0"
        >
          {subtitle}
        </p>
      </div>
    </section>
  )
}
