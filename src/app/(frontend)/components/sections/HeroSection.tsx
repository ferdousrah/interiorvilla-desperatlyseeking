'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { PerformanceImage } from '../ui/PerformanceImage'
import type { Media, Slider } from '@/payload-types'

interface HeroSectionProps {
  slides?: Slider[]
}

export const HeroSection = ({ slides = [] }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [direction, setDirection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Transform slides data
  const slideItems = slides.map((slide, i) => {
    const sliderData = slide.slider
    const image = sliderData?.image as Media | undefined
    // Use xlarge (1920px) for hero - full width display
    const imageUrl = image?.sizes?.xlarge?.url || image?.sizes?.large?.url || image?.url || '/home-hero.jpg'
    return {
      id: slide.id,
      src: imageUrl,
      alt: image?.alt || sliderData?.title || 'Hero slide',
      title: sliderData?.title || '',
      subtitle: sliderData?.subtitle || '',
      isFirst: i === 0,
      ctaButton1: sliderData?.ctaButton1?.label ? sliderData.ctaButton1 : null,
      ctaButton2: sliderData?.ctaButton2?.label ? sliderData.ctaButton2 : null,
    }
  })

  // Set loaded state
  useEffect(() => {
    if (slideItems.length > 0) {
      setIsLoaded(true)
    }
  }, [slideItems.length])

  // Autoplay
  useEffect(() => {
    if (!isPlaying || slideItems.length <= 1) return

    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % slideItems.length)
    }, 6000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, slideItems.length])

  // GSAP text animation - deferred to reduce TBT
  useEffect(() => {
    if (!titleRef.current || !isLoaded) return

    let cleanup: (() => void) | undefined
    let timeoutId: ReturnType<typeof setTimeout>

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const split = new SplitText(titleRef.current!, { type: 'chars' })

        gsap.fromTo(
          split.chars,
          { y: 50, opacity: 0, filter: 'blur(6px)', rotateX: 25 },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            rotateX: 0,
            duration: 1,
            stagger: 0.035,
            ease: 'power3.out',
          }
        )

        cleanup = () => split.revert()
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    // Defer animation to after paint to reduce TBT
    timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        initAnimation()
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      cleanup?.()
    }
  }, [currentIndex, isLoaded])

  const goToPrevious = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + slideItems.length) % slideItems.length)
  }, [slideItems.length])

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % slideItems.length)
  }, [slideItems.length])

  const togglePlayPause = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  // Animation variants
  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      opacity: 1,
      scale: 1,
      zIndex: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.95,
      zIndex: 0,
    }),
  }

  if (slideItems.length === 0) {
    return (
      <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] bg-gray-900 animate-pulse" />
    )
  }

  const currentSlide = slideItems[currentIndex]!

  return (
    <section
      className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] overflow-hidden"
      role="region"
      aria-label="Hero image slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goToPrevious()
        if (e.key === 'ArrowRight') goToNext()
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial={isLoaded ? 'enter' : 'center'}
          animate="center"
          exit="exit"
          transition={{ duration: isLoaded ? 1 : 0, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <PerformanceImage
            src={currentSlide.src}
            alt={currentSlide.alt}
            priority={true}
            loading="eager"
            sizes="100vw"
            quality={85}
            className="w-full h-full object-cover object-center"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

          {/* Text Content */}
          <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="text-white max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {currentSlide.title && (
                currentSlide.isFirst ? (
                  <h1
                    ref={titleRef}
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
                    style={{
                      fontFamily: 'var(--font-fahkwang), sans-serif',
                      textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {currentSlide.title}
                  </h1>
                ) : (
                  <h2
                    ref={titleRef}
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
                    style={{
                      fontFamily: 'var(--font-fahkwang), sans-serif',
                      textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {currentSlide.title}
                  </h2>
                )
              )}
              {currentSlide.subtitle && (
                <motion.p
                  key={`subtitle-${currentSlide.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90"
                  style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}
                >
                  {currentSlide.subtitle}
                </motion.p>
              )}
              {(currentSlide.ctaButton1 || currentSlide.ctaButton2) && (
                <motion.div
                  key={`cta-${currentSlide.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex flex-wrap gap-3 mt-4 sm:mt-6"
                >
                  {currentSlide.ctaButton1?.label && currentSlide.ctaButton1?.url && (
                    <a
                      href={currentSlide.ctaButton1.url}
                      className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors duration-300 text-xs sm:text-sm"
                    >
                      {currentSlide.ctaButton1.label}
                    </a>
                  )}
                  {currentSlide.ctaButton2?.label && currentSlide.ctaButton2?.url && (
                    <a
                      href={currentSlide.ctaButton2.url}
                      className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-md border border-white/50 hover:bg-white/20 transition-colors duration-300 text-xs sm:text-sm"
                    >
                      {currentSlide.ctaButton2.label}
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slideItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white p-1.5 sm:p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" aria-hidden="true" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white p-1.5 sm:p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white transition-all duration-300"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Dot Indicator (top right like original) */}
      {slideItems.length > 1 && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <div className="w-3 h-3 rounded-full bg-white/80" />
        </div>
      )}
    </section>
  )
}
