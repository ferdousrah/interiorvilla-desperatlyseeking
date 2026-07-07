'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { User, Clock, Calendar } from 'lucide-react'
import type { BlogPost, Media, BlogCategory } from '@/payload-types'

interface BlogContentProps {
  initialPosts: BlogPost[]
  totalPosts: number
  introText?: string | null
}

export const BlogContent = ({
  initialPosts,
  totalPosts,
  introText,
}: BlogContentProps) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts)
  const [page, setPage] = useState(1)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingWrapperRef = useRef<HTMLDivElement>(null)
  const headingSplitRef = useRef<any>(null)

  // GSAP SplitText hover animation
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const initHeadingAnimation = async () => {
      if (!headingRef.current || !headingWrapperRef.current) return

      try {
        const { default: gsap } = await import('gsap')
        const { SplitText } = await import('gsap/SplitText')
        gsap.registerPlugin(SplitText)

        if (!headingSplitRef.current) {
          const split = new SplitText(headingRef.current, { type: 'chars,words' })
          headingSplitRef.current = split
          const wrapper = headingWrapperRef.current

          const move = (e: MouseEvent) => {
            const rect = wrapper.getBoundingClientRect()
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

          const leave = () => {
            gsap.to(split.chars, {
              duration: 1,
              y: 0,
              x: 0,
              rotationY: 0,
              rotationX: 0,
              ease: 'elastic.out(1,0.3)',
              stagger: { amount: 0.3, from: 'center' },
            })
          }

          wrapper.addEventListener('mousemove', move)
          wrapper.addEventListener('mouseleave', leave)

          cleanup = () => {
            wrapper.removeEventListener('mousemove', move)
            wrapper.removeEventListener('mouseleave', leave)
            split.revert()
            headingSplitRef.current = null
          }
        }
      } catch (err) {
        console.error('GSAP SplitText animation failed:', err)
      }
    }

    initHeadingAnimation()

    return () => cleanup?.()
  }, [])

  // Fetch more posts
  const loadMorePosts = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return

    isFetchingRef.current = true
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: '6',
      })

      const response = await fetch(`/api/blog-feed?${params}`)
      const data = await response.json()

      if (data.docs && data.docs.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const unique = data.docs.filter((p: BlogPost) => !existingIds.has(p.id))
          return [...prev, ...unique]
        })
        setPage((prev) => prev + 1)
        setHasMore(data.hasNextPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [hasMore, page])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !isLoading) {
          loadMorePosts()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadMorePosts, hasMore, isLoading])

  const getPostImage = (post: BlogPost): string => {
    const featuredImage = post.featuredImage as Media | null
    return featuredImage?.sizes?.medium?.url || featuredImage?.url || '/placeholder.webp'
  }

  const getCategoryName = (post: BlogPost): string => {
    const category = post.category as BlogCategory | null
    return category?.title || 'Interior Design'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      {/* Intro Section */}
      <section className="w-full pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 bg-white relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Latest Insights Label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1 h-4 bg-primary rounded-full" />
              <span className="text-xs sm:text-sm font-semibold text-[#01190c] uppercase tracking-wider [font-family:'Fahkwang',Helvetica]">
                Latest Insights
              </span>
              <span className="w-1 h-4 bg-primary rounded-full" />
            </div>

            <div ref={headingWrapperRef} className="perspective-[1000px] cursor-default">
              <h2
                ref={headingRef}
                className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#01190c] mb-3 sm:mb-4 [font-family:'Fahkwang',Helvetica]"
                style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
              >
                Get Interesting Insights into{' '}
                <span className="text-secondary">Interior Designs</span>
              </h2>
            </div>
            <p className="text-[#626161] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]">
              {introText ||
                'Discover the latest trends, tips, and inspiration for creating beautiful spaces that reflect your unique style.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="w-full py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: (index % 6) * 0.1 }}
                  className="group h-full"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-col h-full bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                    aria-label={`Read article: ${post.title}`}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                      <Image
                        src={getPostImage(post)}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        loading={index < 4 ? 'eager' : 'lazy'}
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                        <span className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 bg-primary text-white text-[10px] sm:text-xs font-medium rounded-full">
                          {getCategoryName(post)}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow p-4 sm:p-5 md:p-6">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#626161] mb-2 sm:mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Admin
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          5 min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatDate(post.publishedDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#01190c] mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 [font-family:'Fahkwang',Helvetica]">
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#626161] line-clamp-3 mb-3 sm:mb-4 flex-grow [font-family:'Fahkwang',Helvetica]">
                        {post.shortDescription || 'Read more about this topic...'}
                      </p>

                      {/* Read Article Link */}
                      <span className="inline-flex items-center text-xs sm:text-sm font-medium text-primary group-hover:text-secondary transition-colors duration-300 [font-family:'Fahkwang',Helvetica] mt-auto">
                        Read Full Article
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[#626161] text-sm sm:text-base [font-family:'Fahkwang',Helvetica]">Loading more posts...</span>
              </div>
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-10" />

          {/* End message */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-[#626161] text-sm sm:text-base [font-family:'Fahkwang',Helvetica]">You&apos;ve reached the end of our blog posts</p>
            </div>
          )}

          {/* Empty state */}
          {posts.length === 0 && !isLoading && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-[#626161] text-base sm:text-lg [font-family:'Fahkwang',Helvetica]">No blog posts found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
