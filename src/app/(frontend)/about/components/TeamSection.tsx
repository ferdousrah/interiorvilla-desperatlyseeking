'use client'

import React, { useEffect, useLayoutEffect, useRef } from 'react'
import type { About, TeamMember, Media } from '@/payload-types'

interface TeamSectionProps {
  data?: About['teamSection']
  teamMembers: TeamMember[]
}

export const TeamSection = ({ data, teamMembers }: TeamSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const teamGridRef = useRef<HTMLDivElement>(null)
  const teamWrapperRef = useRef<HTMLDivElement>(null)
  const autoScrollAnim = useRef<gsap.core.Tween | null>(null)

  // Scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        // Heading animation
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

        // Description animation
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

        // Card entrance animation
        if (teamGridRef.current && teamMembers.length > 0) {
          const cards = teamGridRef.current.querySelectorAll('.team-card')
          gsap.fromTo(
            cards,
            { opacity: 0, y: 60, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: teamGridRef.current,
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
                trigger.trigger === teamGridRef.current) {
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
  }, [teamMembers.length])

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

  // Infinite scroll animation on desktop
  useLayoutEffect(() => {
    const wrapper = teamWrapperRef.current
    if (!wrapper || teamMembers.length === 0) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')

        const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
        if (!isDesktop) return

        let animation: gsap.core.Tween | null = null

        const startLoop = () => {
          gsap.set(wrapper, { x: 0 })
          const loopWidth = wrapper.scrollWidth / 2
          animation = gsap.to(wrapper, {
            x: -loopWidth,
            ease: 'none',
            duration: 20,
            repeat: -1,
          })
          autoScrollAnim.current = animation
        }

        const timer = setTimeout(startLoop, 100)

        const onResize = () => {
          if (animation) {
            animation.kill()
            startLoop()
          }
        }
        window.addEventListener('resize', onResize)

        cleanup = () => {
          clearTimeout(timer)
          if (animation) animation.kill()
          autoScrollAnim.current = null
          window.removeEventListener('resize', onResize)
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [teamMembers.length])

  // Duplicate members for seamless loop
  const extendedTeamMembers = teamMembers.length > 0 ? [...teamMembers, ...teamMembers] : []

  // Get photo URL from team member
  const getPhotoUrl = (member: TeamMember): string => {
    if (member.photoUrl) return member.photoUrl
    if (member.photo && typeof member.photo === 'object') {
      return (member.photo as Media).url || '/placeholder.webp'
    }
    return '/placeholder.webp'
  }

  if (teamMembers.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="w-full py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Heading & description */}
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
              Meet Our <span className="text-secondary">Team</span>
            </h2>
          </div>
          <p ref={descriptionRef} className="text-sm sm:text-base md:text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed">
            {data?.description ||
              'Our team of talented professionals brings together diverse expertise and creative vision to deliver exceptional results.'}
          </p>
        </div>

        {/* Carousel container */}
        <div ref={teamGridRef} className="overflow-x-auto md:overflow-hidden">
          {/* Sliding wrapper */}
          <div
            ref={teamWrapperRef}
            className="flex flex-nowrap gap-8 md:gap-12 snap-x snap-mandatory md:snap-none"
          >
            {extendedTeamMembers.map((member, index) => {
              const hideOnMobile = index >= teamMembers.length
              const itemClasses = `${
                hideOnMobile ? 'hidden md:block' : ''
              } team-card snap-center shrink-0 w-64 md:w-72 text-center bg-white rounded-[10px] p-6 hover:shadow-lg transition-shadow duration-300`

              return (
                <div
                  key={`${member.id}-${index}`}
                  className={itemClasses}
                  onMouseEnter={() => {
                    autoScrollAnim.current?.pause()
                  }}
                  onMouseLeave={() => {
                    autoScrollAnim.current?.play()
                  }}
                >
                  <div className="relative mb-6 group">
                    <div className="w-48 h-48 md:w-56 md:h-56 mx-auto bg-gray-200 rounded-3xl overflow-hidden">
                      <img
                        src={getPhotoUrl(member)}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.webp'
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-[#01190c] mb-2">{member.name}</h3>

                  <p className="text-[#626161] text-sm md:text-base mb-1">{member.designation}</p>

                  {member.licenseNumber && (
                    <p className="text-[#626161] text-xs md:text-sm mb-3">{member.licenseNumber}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
