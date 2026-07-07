'use client'

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Lightbulb, CheckCircle, Rocket, Heart } from 'lucide-react'

export const OurProcessSection = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<any>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const stepsDesktopRef = useRef<HTMLDivElement>(null)
  const stepsMobileRef = useRef<HTMLDivElement>(null)
  const diamondRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

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

  // Steps Data
  const steps = useMemo(
    () => [
      {
        id: 1,
        title: 'Chat and Talk',
        description:
          'We start with understanding your vision, needs, and preferences through detailed consultation and discovery sessions.',
        icon: <MessageCircle className="w-8 h-8" />,
        color: '#6366F1',
        bgColor: '#EEF2FF',
      },
      {
        id: 2,
        title: 'Design Development',
        description:
          'Our expert team creates detailed designs, stunning 3D visualizations, and carefully curated material selections.',
        icon: <Lightbulb className="w-8 h-8" />,
        color: '#06B6D4',
        bgColor: '#CFFAFE',
      },
      {
        id: 3,
        title: 'Confirm Your Order',
        description:
          'Review and approve the final design concepts, premium materials, detailed timeline, and comprehensive project specifications.',
        icon: <CheckCircle className="w-8 h-8" />,
        color: '#EF4444',
        bgColor: '#FEE2E2',
      },
      {
        id: 4,
        title: 'Deployment Process',
        description:
          'Professional installation and meticulous project management ensuring quality execution and timely delivery.',
        icon: <Rocket className="w-8 h-8" />,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      },
      {
        id: 5,
        title: "You'll be Happy",
        description:
          'Enjoy your beautifully transformed space that exceeds expectations and brings lasting joy and inspiration.',
        icon: <Heart className="w-8 h-8" />,
        color: '#8B5CF6',
        bgColor: '#F3E8FF',
      },
    ],
    []
  )

  // GSAP animations
  useLayoutEffect(() => {
    if (!sectionRef.current || prefersReducedMotion) return

    let ctx: any

    const initGSAP = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        if (headerRef.current) {
          gsap.fromTo(
            headerRef.current,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headerRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }

        if (stepsDesktopRef.current) {
          const items = stepsDesktopRef.current.querySelectorAll(':scope > div')
          gsap.fromTo(
            items,
            { opacity: 0, scale: 0.9, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.9,
              ease: 'back.out(1.6)',
              stagger: 0.15,
              scrollTrigger: {
                trigger: stepsDesktopRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }

        if (stepsMobileRef.current) {
          const cards = stepsMobileRef.current.querySelectorAll(':scope > div')
          gsap.fromTo(
            cards,
            { opacity: 0, scale: 0.95, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.12,
              scrollTrigger: {
                trigger: stepsMobileRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      }, sectionRef)

      requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    initGSAP()

    return () => ctx?.revert()
  }, [prefersReducedMotion])

  // SplitText animation for heading
  useEffect(() => {
    if (!headingRef.current || prefersReducedMotion || !fontsReady) return

    let cleanup: (() => void) | undefined

    const initSplitText = async () => {
      const { SplitText } = await import('gsap/SplitText')
      const { default: gsap } = await import('gsap')
      gsap.registerPlugin(SplitText)

      const headingEl = headingRef.current
      const wrapperEl = headingWrapperRef.current
      if (!headingEl || !wrapperEl) return

      const split = new SplitText(headingEl, { type: 'chars,words' })

      const onMove = (e: MouseEvent) => {
        const rect = wrapperEl.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        gsap.to(split.chars, {
          duration: 0.5,
          y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: 'power2.out',
          stagger: { amount: 0.3, from: 'center' },
        })
      }

      const onLeave = () => {
        gsap.to(split.chars, {
          duration: 1,
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          ease: 'elastic.out(1, 0.3)',
          stagger: { amount: 0.3, from: 'center' },
        })
      }

      wrapperEl.addEventListener('mousemove', onMove)
      wrapperEl.addEventListener('mouseleave', onLeave)

      cleanup = () => {
        wrapperEl.removeEventListener('mousemove', onMove)
        wrapperEl.removeEventListener('mouseleave', onLeave)
        split.revert()
      }
    }

    initSplitText()

    return () => cleanup?.()
  }, [fontsReady, prefersReducedMotion])

  // Tooltip placement
  const TOOLTIP_WIDTH = 256
  const GAP = 12
  const CLAMP = 12

  const computeAndSetTooltip = (stepId: number, intended: 'top' | 'bottom', color: string) => {
    const container = stepsDesktopRef.current
    const diamond = diamondRefs.current[stepId]
    if (!container || !diamond) return

    const cRect = container.getBoundingClientRect()
    const dRect = diamond.getBoundingClientRect()
    const centerX = dRect.left - cRect.left + dRect.width / 2

    let left = Math.round(centerX - TOOLTIP_WIDTH / 2)
    const minLeft = CLAMP
    const maxLeft = Math.max(CLAMP, cRect.width - TOOLTIP_WIDTH - CLAMP)
    left = Math.max(minLeft, Math.min(left, maxLeft))

    const caretOffset = Math.round(centerX - left)
    const placement: 'top' | 'bottom' = intended
    const top =
      placement === 'bottom'
        ? Math.round(dRect.bottom - cRect.top + GAP)
        : Math.round(dRect.top - cRect.top - GAP)

    setTooltipPos({ id: stepId, left, top, placement, color, width: TOOLTIP_WIDTH, caretOffset })
  }

  return (
    <section
      ref={sectionRef}
      className="w-full relative overflow-hidden py-16 md:py-20 lg:py-24 bg-[#f7f9fb]"
      style={{
        containIntrinsicSize: '1000px',
        contentVisibility: 'auto',
      }}
    >
      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div
            ref={headingWrapperRef}
            className="cursor-default perspective-[1000px]"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            <h2
              ref={headingRef}
              className="font-medium text-2xl sm:text-3xl md:text-[40px] leading-tight mb-4 md:mb-6 mt-5"
              style={{
                transform: 'translateZ(0)',
                transformStyle: 'preserve-3d',
              }}
            >
              <span className="text-[#0d1529]">Our </span>
              <span className="text-secondary">Process</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-[#626161] max-w-3xl mx-auto leading-relaxed px-4 md:px-0">
            Follow our proven 5-step journey that transforms your vision into extraordinary reality
          </p>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block relative">
          <div ref={stepsDesktopRef} className="relative grid grid-cols-5 gap-8 py-20 overflow-visible">
            {steps.map((step, index) => {
              const isBottomRow = index % 2 === 1
              const intended: 'top' | 'bottom' = isBottomRow ? 'top' : 'bottom'
              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col items-center ${isBottomRow ? 'mt-32' : 'mt-0'}`}
                >
                  {/* Diamond with pulse glow */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.3 }}
                    className="relative cursor-pointer group outline-none"
                    style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                    onMouseEnter={() => {
                      setHoveredStep(step.id)
                      computeAndSetTooltip(step.id, intended, step.color)
                    }}
                    onMouseLeave={() => {
                      setHoveredStep(null)
                      setTooltipPos(null)
                    }}
                  >
                    {/* Pulse glow layer */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: step.color,
                        filter: 'blur(25px)',
                        opacity: 0.3,
                        scale: 0.9,
                      }}
                      animate={
                        hoveredStep === step.id
                          ? { opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }
                          : { opacity: 0, scale: 0.9 }
                      }
                      transition={{ duration: 1.5, repeat: hoveredStep === step.id ? Infinity : 0 }}
                    />

                    {/* Diamond shape */}
                    <div
                      ref={(el) => { diamondRefs.current[step.id] = el }}
                      className="w-48 h-48 rotate-45 border-4 shadow-lg rounded-3xl transition-all duration-300 relative z-10"
                      style={{
                        backgroundColor: hoveredStep === step.id ? step.color : 'white',
                        borderColor: step.color,
                        boxShadow:
                          hoveredStep === step.id
                            ? `0 20px 40px ${step.color}40`
                            : '0 10px 30px rgba(0,0,0,0.1)',
                      }}
                    />

                    {/* Icon + Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none z-20">
                      <div
                        className="transition-all duration-300 mb-2"
                        style={{ color: hoveredStep === step.id ? 'white' : step.color }}
                      >
                        {step.icon}
                      </div>
                      <h3
                        className="text-lg font-bold text-center transition-all duration-300 leading-tight tracking-wider"
                        style={{ color: hoveredStep === step.id ? 'white' : '#01190c' }}
                      >
                        {step.title}
                      </h3>
                    </div>
                  </motion.button>
                </div>
              )
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {tooltipPos && hoveredStep === tooltipPos.id && (
                <motion.div
                  key="tooltip"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 rounded-2xl border bg-white shadow-xl p-4 pointer-events-auto"
                  style={{
                    left: tooltipPos.left,
                    top: tooltipPos.top,
                    transform: tooltipPos.placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
                    width: tooltipPos.width,
                    borderColor: tooltipPos.color,
                  }}
                >
                  <p className="text-sm text-[#374151]">
                    {steps.find((s) => s.id === tooltipPos.id)!.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden">
          <div ref={stepsMobileRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 cursor-pointer overflow-hidden"
                style={{ borderColor: step.color, willChange: 'transform, opacity' }}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className="absolute inset-0 rounded-3xl transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${step.bgColor} 0%, ${step.color}20 100%)`,
                    opacity: hoveredStep === step.id ? 1 : 0,
                  }}
                />
                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300"
                      style={{
                        backgroundColor: hoveredStep === step.id ? step.color : step.bgColor,
                        color: hoveredStep === step.id ? 'white' : step.color,
                      }}
                    >
                      {step.icon}
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: hoveredStep === step.id ? step.color : '#01190c' }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base text-[#626161] leading-relaxed text-center">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
