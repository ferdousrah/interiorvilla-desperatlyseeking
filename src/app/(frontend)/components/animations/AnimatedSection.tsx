'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedSectionProps {
  children: React.ReactNode
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
  delay?: number
  duration?: number
  className?: string
}

export function AnimatedSection({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.8,
  className = '',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Set initial state based on animation type
    const initialState: gsap.TweenVars = { opacity: 0 }
    const animateState: gsap.TweenVars = { opacity: 1, duration, delay }

    switch (animation) {
      case 'fadeInUp':
        initialState.y = 50
        animateState.y = 0
        break
      case 'fadeInLeft':
        initialState.x = -50
        animateState.x = 0
        break
      case 'fadeInRight':
        initialState.x = 50
        animateState.x = 0
        break
      case 'scaleIn':
        initialState.scale = 0.9
        animateState.scale = 1
        break
    }

    gsap.set(element, initialState)

    const ctx = gsap.context(() => {
      gsap.to(element, {
        ...animateState,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [animation, delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
