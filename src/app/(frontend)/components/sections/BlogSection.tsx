'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { PerformanceImage } from '../ui/PerformanceImage'
import useEmblaCarousel from 'embla-carousel-react'
import type { BlogPost, Media } from '@/payload-types'
import { splitTitle } from '../ui/splitTitle'

interface BlogSectionProps {
  posts?: BlogPost[]
  data?: {
    sectionLabel?: string | null
    sectionTitle?: string | null
    viewAllLabel?: string | null
    viewAllUrl?: string | null
  } | null
}

export const BlogSection = ({ posts = [], data }: BlogSectionProps) => {
  const sectionLabel = data?.sectionLabel || 'BLOG'
  const { primary: titlePrimary, highlight: titleHighlight } = splitTitle(
    data?.sectionTitle || 'Latest Stories',
  )
  const viewAllLabel = data?.viewAllLabel || 'View All Blogs'
  const viewAllUrl = data?.viewAllUrl || '/blog'
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const isHovering = useRef(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // GSAP hover animation for heading
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return

    let cleanup: (() => void) | undefined

    const initAnimation = async () => {
      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        const split = new SplitText(headingRef.current!, { type: 'chars' })
        const wrapper = headingWrapperRef.current!

        let lastCall = 0
        const throttleMs = 33

        const handleMove = (e: MouseEvent) => {
          const now = Date.now()
          if (now - lastCall < throttleMs) return
          lastCall = now

          const rect = wrapper.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height

          gsap.to(split.chars, {
            duration: 0.4,
            y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
            x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
            rotationY: (x - 0.5) * 25,
            rotationX: (y - 0.5) * -25,
            ease: 'power2.out',
            stagger: { amount: 0.25, from: 'center' },
          })
        }

        const handleLeave = () => {
          gsap.to(split.chars, {
            duration: 1,
            y: 0,
            x: 0,
            rotationY: 0,
            rotationX: 0,
            ease: 'elastic.out(1, 0.4)',
            stagger: { amount: 0.2, from: 'center' },
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
  }, [])

  // Embla state sync
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // Autoplay — pause on hover
  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(() => {
      if (!isHovering.current) emblaApi.scrollNext()
    }, 4500)
    return () => clearInterval(interval)
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const getImageUrl = (image?: Media | number | null) => {
    if (!image || typeof image === 'number') return '/a-residential-interior-image.webp'
    // Prefer resized variants (same approach as the blog listing page) —
    // smaller files, and some originals are missing on disk while the
    // generated sizes exist.
    return (
      image.sizes?.medium?.url ||
      image.sizes?.large?.url ||
      image.url ||
      '/a-residential-interior-image.webp'
    )
  }

  if (posts.length === 0) return null

  const featured = posts[0]!
  const others = posts.slice(1)
  const featuredImage = featured.featuredImage as Media | undefined

  // Group secondary posts into pairs — each pair = one slider slide
  const pairs: BlogPost[][] = []
  for (let i = 0; i < others.length; i += 2) {
    pairs.push(others.slice(i, i + 2))
  }

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-20 lg:py-24 bg-[#f7f9fb] relative">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-10 md:mb-20">
          <div className="flex items-center justify-center mb-3">
            <div className="w-1 h-[25px] bg-primary rounded-sm" />
            <div className="mx-3 font-normal text-[#48515c] text-sm tracking-[0.9px]">{sectionLabel}</div>
            <div className="w-1 h-[25px] bg-primary rounded-sm" />
          </div>
          <div ref={headingWrapperRef} className="cursor-default perspective-[1000px]">
            <h2
              ref={headingRef}
              className="font-medium text-2xl sm:text-3xl md:text-[40px] text-center leading-tight md:leading-[62px] mb-4 md:mb-6"
            >
              <span className="text-[#0d1529]">{titlePrimary}</span>{' '}
              <span className="text-secondary">{titleHighlight}</span>
            </h2>
          </div>
        </div>

        {/* Featured Blog */}
        {featured && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
            <div className="lg:w-1/2">
              <Link
                href={`/blog/${featured.slug}`}
                className="group block relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 aspect-[16/10]"
                aria-label={`Read article: ${featured.title}`}
              >
                <PerformanceImage
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={featuredImage?.alt || featured.title}
                  src={getImageUrl(featured.featuredImage)}
                  loading="lazy"
                />
              </Link>
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="mb-3 text-xs text-[#48515c]">
                {featured.publishedDate
                  ? new Date(featured.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''}{' '}
                | 5 MIN READ
              </div>
              <Link href={`/blog/${featured.slug}`}>
                <h3 className="text-[#0d1529] text-xl sm:text-2xl md:text-[32px] leading-tight md:leading-[44px] mb-4 font-semibold hover:text-primary transition-colors">
                  {featured.title}
                </h3>
              </Link>
              <p className="text-[#48515c] text-sm leading-6 mb-6">{featured.shortDescription}</p>
              <Link href={`/blog/${featured.slug}`} aria-label={`Read article: ${featured.title}`}>
                <Button className="bg-primary rounded-full h-9 px-6 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary-hover">
                  <span className="font-bold text-white text-xs">Read Article</span>
                  <div className="w-[26px] h-[26px] bg-white rounded-full flex items-center justify-center">
                    <ArrowRightIcon className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Blog Slider — 2 posts per slide, autoplay */}
        {pairs.length > 0 && (
          <div
            onMouseEnter={() => { isHovering.current = true }}
            onMouseLeave={() => { isHovering.current = false }}
          >
            {/* Nav row */}
            <div className="flex items-center justify-end gap-2 mb-5">
              <button
                onClick={scrollPrev}
                aria-label="Previous posts"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next posts"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Embla viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
              {/* Each slide = one pair of 2 posts in a row */}
              <div className="flex">
                {pairs.map((pair, pairIdx) => (
                  <div
                    key={pairIdx}
                    className="flex-none w-full grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8"
                  >
                    {pair.map((post) => {
                      const cardImage = post.featuredImage as Media | undefined
                      return (
                        <Card
                          key={post.id}
                          className="group bg-white rounded-3xl border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col"
                        >
                          {/* Post image */}
                          <Link
                            href={`/blog/${post.slug}`}
                            className="block relative aspect-[16/9] overflow-hidden"
                            aria-label={`Read article: ${post.title}`}
                            tabIndex={-1}
                          >
                            <PerformanceImage
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              alt={cardImage?.alt || post.title}
                              src={getImageUrl(post.featuredImage)}
                              loading="lazy"
                            />
                          </Link>

                          <CardContent className="p-6 flex flex-col flex-1">
                            <div className="mb-3 text-xs text-[#48515c]">
                              {post.publishedDate
                                ? new Date(post.publishedDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''}{' '}
                              | 5 MIN READ
                            </div>
                            <Link href={`/blog/${post.slug}`}>
                              <h3 className="text-[#0d1529] text-lg md:text-xl mb-5 leading-snug hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                            </Link>
                            <Link
                              href={`/blog/${post.slug}`}
                              aria-label={`Read article: ${post.title}`}
                              className="mt-auto self-start"
                            >
                              <Button className="bg-primary rounded-full h-10 px-8 transition-all duration-300 hover:bg-primary-hover hover:scale-105">
                                <span className="font-bold text-white text-xs">Read Article</span>
                                <div className="w-[28px] h-[28px] bg-white rounded-full ml-3 flex items-center justify-center">
                                  <ArrowRightIcon className="h-5 w-5 text-primary" />
                                </div>
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            {pairs.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {pairs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedIndex === i ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View All Blogs */}
        <div className="flex justify-center mt-10 md:mt-12">
          <Link href={viewAllUrl} aria-label="View all blog posts">
            <Button className="bg-transparent border-2 border-primary rounded-full h-11 px-8 flex items-center gap-2 group transition-all duration-300 hover:bg-primary hover:scale-105 hover:shadow-lg">
              <span className="font-bold text-primary text-sm group-hover:text-white transition-colors duration-300">
                {viewAllLabel}
              </span>
              <div className="w-[28px] h-[28px] bg-primary rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white">
                <ArrowRightIcon className="h-4 w-4 text-white transition-colors duration-300 group-hover:text-primary" />
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
