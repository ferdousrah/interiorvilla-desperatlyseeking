'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CopyrightIcon,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import type { ServiceArea } from '@/payload-types'
import { siteConfig } from '@/config/site'

interface FooterSectionProps {
  serviceAreas?: ServiceArea[]
}

export const FooterSection = ({ serviceAreas = [] }: FooterSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const footerHeadingRef = useRef<HTMLHeadingElement>(null)
  const footerHeadingWrapperRef = useRef<HTMLDivElement>(null)
  const leftContentRef = useRef<HTMLDivElement>(null)
  const footerMenusRef = useRef<HTMLDivElement>(null)
  const bottomSectionRef = useRef<HTMLDivElement>(null)

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

  // GSAP heading hover animation
  useEffect(() => {
    if (!footerHeadingRef.current || !footerHeadingWrapperRef.current || !fontsReady) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const split = new SplitText(footerHeadingRef.current!, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word',
        })

        const wrapper = footerHeadingWrapperRef.current!

        const handleMove = (e: MouseEvent) => {
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

        const handleLeave = () => {
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

        wrapper.addEventListener('mousemove', handleMove)
        wrapper.addEventListener('mouseleave', handleLeave)

        cleanup = () => {
          wrapper.removeEventListener('mousemove', handleMove)
          wrapper.removeEventListener('mouseleave', handleLeave)
          split.revert()
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [fontsReady])

  // GSAP scroll animations
  useEffect(() => {
    if (!sectionRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        const triggers: ScrollTrigger[] = []

        // Left content animation
        if (leftContentRef.current) {
          const children = leftContentRef.current.children
          const elementsToAnimate = Array.from(children).slice(1)

          if (elementsToAnimate.length > 0) {
            const anim = gsap.fromTo(
              elementsToAnimate,
              { opacity: 0, y: 60, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: leftContentRef.current,
                  start: 'top 95%',
                  end: 'top 60%',
                  toggleActions: 'play none none none',
                },
              },
            )
            if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
          }
        }

        // Footer menus animation
        if (footerMenusRef.current) {
          const menuColumns = footerMenusRef.current.children

          const anim = gsap.fromTo(
            menuColumns,
            { opacity: 0, y: 80, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.2,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: footerMenusRef.current,
                start: 'top 95%',
                end: 'top 60%',
                toggleActions: 'play none none none',
              },
            },
          )
          if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
        }

        // Bottom section animation
        if (bottomSectionRef.current) {
          const anim = gsap.fromTo(
            bottomSectionRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: bottomSectionRef.current,
                start: 'top 98%',
                end: 'top 75%',
                toggleActions: 'play none none none',
              },
            },
          )
          if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
        }

        cleanup = () => {
          triggers.forEach((trigger) => trigger.kill())
        }
      } catch (err) {
        console.error('GSAP animation failed:', err)
      }
    }

    initAnimation()

    return () => cleanup?.()
  }, [])

  const socialLinks = [
    {
      icon: Facebook,
      name: 'Facebook',
      color: '#1877F2',
      url: siteConfig.social.facebook,
    },
    {
      icon: Instagram,
      name: 'Instagram',
      color: '#E4405F',
      url: siteConfig.social.instagram,
    },
    {
      icon: Youtube,
      name: 'Youtube',
      color: '#FF0000',
      url: siteConfig.social.youtube,
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      color: '#0A66C2',
      url: siteConfig.social.linkedin,
    },
  ]

  return (
    <footer
      ref={sectionRef}
      className="w-full bg-[#1b1b1b] pt-12 pb-10 md:pt-20 md:pb-16 lg:pt-28 lg:pb-20 relative overflow-hidden z-20"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {/* Background decorative elements - green animated dots */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left green dot */}
        <div className="absolute top-16 left-8 w-10 h-10 bg-primary rounded-full opacity-60 animate-pulse" />
        {/* Top center green dot */}
        <div
          className="absolute top-48 left-1/4 w-8 h-8 bg-primary rounded-full opacity-50 animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        {/* Right side green dot */}
        <div
          className="absolute top-1/3 right-16 w-6 h-6 bg-primary rounded-full opacity-60 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        {/* Bottom center dot */}
        <div
          className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
        {/* Bottom left dot */}
        <div
          className="absolute bottom-40 left-1/4 w-6 h-6 bg-primary rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-10 md:mb-16 lg:mb-20">
          <div ref={leftContentRef} className="will-change-transform">
            <div
              ref={footerHeadingWrapperRef}
              className="cursor-default"
              style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
              <h2
                ref={footerHeadingRef}
                className="text-xl sm:text-2xl md:text-[32px] lg:text-[40px] leading-tight md:leading-[44px] lg:leading-[56px] font-medium text-white"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
              >
                Let&apos;s Work Together and <br />
                Create Something Extraordinary!
              </h2>
            </div>
          </div>
        </div>

        {/* Footer Menus Grid */}
        <div
          ref={footerMenusRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {/* Contact Us Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="font-medium text-white text-lg leading-[26px]">Contact Us</h4>
            <div className="w-full h-px bg-white/30 -mt-2" />

            <div className="flex flex-col items-start gap-3 w-full">
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-3 font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 group"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-3 font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 group"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </a>
              <div className="flex items-start gap-3 font-normal text-white text-sm leading-6">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {siteConfig.address.full}
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer relative overflow-hidden group transform-gpu transition-all duration-500 ease-out hover:scale-125 hover:-translate-y-2 flex items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm scale-110"
                        style={{ backgroundColor: social.color }}
                      />
                      <div
                        className="absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 ease-out"
                        style={{ borderColor: social.color }}
                      />
                      <IconComponent className="w-5 h-5 text-white transition-all duration-500 ease-out group-hover:rotate-12 group-hover:scale-110 relative z-10" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="font-medium text-white text-lg leading-[26px]">Quick Links</h4>
            <div className="w-full h-px bg-white/30 -mt-2" />

            <div className="flex flex-col items-start gap-3 w-full">
              <Link
                prefetch={false}
                href="/about"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                About Us
              </Link>
              <Link
                prefetch={false}
                href="/portfolio"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Portfolio
              </Link>
              <Link
                prefetch={false}
                href="/blog"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Blog
              </Link>
              <Link
                prefetch={false}
                href="/services/residential-interior"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Residential Interior
              </Link>
              <Link
                prefetch={false}
                href="/services/commercial-interior"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Commercial Interior
              </Link>
              <Link
                prefetch={false}
                href="/services/architectural-consultancy"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Architectural Consultancy
              </Link>
              <Link
                prefetch={false}
                href="/services"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                View All Services
              </Link>
            </div>
          </div>

          {/* Important Links Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="font-medium text-white text-lg leading-[26px]">Important Links</h4>
            <div className="w-full h-px bg-white/30 -mt-2" />

            <div className="flex flex-col items-start gap-3 w-full">
              <Link
                prefetch={false}
                href="/message-from-ceo"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Message from CEO
              </Link>
              <Link
                prefetch={false}
                href="/our-designers"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Meet Our Team
              </Link>
              <Link
                prefetch={false}
                href="/client-success-stories"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Client Success Stories
              </Link>
              <Link
                prefetch={false}
                href="/gallery"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Gallery
              </Link>
              <Link
                prefetch={false}
                href="/faq"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                FAQ
              </Link>
              <Link
                prefetch={false}
                href="/cost-estimator"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Cost Estimator
              </Link>
              <Link
                prefetch={false}
                href="/sitemap"
                className="font-normal text-white text-sm leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2"
              >
                Sitemap
              </Link>
            </div>
          </div>

          {/* Service Areas Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="font-medium text-white text-lg leading-[26px]">Service Areas</h4>
            <div className="w-full h-px bg-white/30 -mt-2" />

            <div className="relative w-full">
              <div className="w-full h-[200px] overflow-y-auto pr-2 service-areas-scroll">
                <div className="flex flex-wrap gap-2">
                  {[...serviceAreas].sort((a, b) => Number(a.id) - Number(b.id)).map((area) => (
                    <Link
                      prefetch={false}
                      key={area.id}
                      href={`/service-areas/${area.slug}`}
                      className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-normal transition-all duration-300 hover:bg-primary hover:border-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                    >
                      {area.areaName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              prefetch={false}
              href="/service-areas"
              className="text-primary text-sm font-medium transition-all duration-300 hover:text-primary/80 hover:translate-x-1 -mt-2"
            >
              View all areas →
            </Link>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-white/20 mb-8" />

        {/* Bottom Section */}
        <div
          ref={bottomSectionRef}
          className="flex flex-col sm:flex-row items-center justify-between py-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <CopyrightIcon className="w-4 h-4 text-white" />
              <div className="font-normal text-white text-sm leading-6">
                2026 Desperately Seeking. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background blur effects */}
      <div className="absolute w-[443px] h-[449px] right-0 top-20 bg-[#999999] blur-[294px] pointer-events-none" />
      <div className="absolute w-[443px] h-[449px] left-0 bottom-20 bg-[#999999] blur-[322px] pointer-events-none" />

      <style jsx global>{`
        /* Scrollbar hidden — the bottom fade + "View all areas" link signal
           that more content is available; the area is still scrollable. */
        .service-areas-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .service-areas-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </footer>
  )
}
