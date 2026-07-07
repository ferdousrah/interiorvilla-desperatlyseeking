'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Project, Media, ProjectCategory } from '@/payload-types'

interface PortfolioContentProps {
  initialProjects: Project[]
  totalProjects: number
  introText?: string | null
}

export const PortfolioContent = ({
  initialProjects,
  totalProjects,
  introText,
}: PortfolioContentProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProjects.length < totalProjects)
  const [page, setPage] = useState(1)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'residential', label: 'Residential Interior' },
    { id: 'commercial', label: 'Commercial Interior' },
    { id: 'architectural', label: 'Architectural Consultancy' },
  ]

  // Fetch more projects
  const loadMoreProjects = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: '6',
        filter: activeFilter,
      })

      const response = await fetch(`/api/projects-feed?${params}`)
      const data = await response.json()

      if (data.docs && data.docs.length > 0) {
        setProjects((prev) => {
          // Deduplicate: only add projects that don't already exist
          const existingIds = new Set(prev.map((p) => p.id))
          const newProjects = data.docs.filter((p: Project) => !existingIds.has(p.id))
          return [...prev, ...newProjects]
        })
        setPage((prev) => prev + 1)
        setHasMore(data.hasNextPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more projects:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, activeFilter])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !isLoading) {
          loadMoreProjects()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreProjects, hasMore, isLoading])

  // Reset when filter changes
  const handleFilterChange = async (filterId: string) => {
    if (filterId === activeFilter) return

    setActiveFilter(filterId)
    setIsLoading(true)
    setPage(1)

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '6',
        filter: filterId,
      })

      const response = await fetch(`/api/projects-feed?${params}`)
      const data = await response.json()

      setProjects(data.docs || [])
      setHasMore(data.hasNextPage)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectImage = (project: Project): string => {
    const featuredImage = project.featuredImage as Media | null
    return featuredImage?.sizes?.medium?.url || featuredImage?.url || '/placeholder.webp'
  }

  const getCategoryName = (project: Project): string => {
    const category = project.category as ProjectCategory | null
    return category?.title || 'Interior Design'
  }

  return (
    <>
      {/* Intro Section with Title */}
      <section className="w-full pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#01190c] mb-3 sm:mb-4">
              Our <span className="text-secondary">Portfolio</span>
            </h2>
            <p className="text-[#626161] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {introText ||
                'Explore our diverse collection of interior design projects that showcase creativity, craftsmanship, and client satisfaction.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="w-full py-4 sm:py-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4"
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-[#f5f5f5] text-[#626161] hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects Grid - 2 columns equal height */}
      <section className="w-full py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={`${project.id}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                >
                  <Link
                    href={`/portfolio/${project.slug || project.id}`}
                    className="group block relative overflow-hidden rounded-xl sm:rounded-2xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getProjectImage(project)}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Hover overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Category Badge - shown on hover */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 bg-primary text-white text-[10px] sm:text-xs font-medium rounded-full">
                          {getCategoryName(project)}
                        </span>
                      </div>

                      {/* Title and location - shown on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-white text-base sm:text-xl md:text-2xl font-semibold mb-1">
                          {project.title}
                        </h3>
                        {project.location && (
                          <p className="text-white/90 text-xs sm:text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {project.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[#626161]">Loading more projects...</span>
              </div>
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-10" />

          {/* End message */}
          {!hasMore && projects.length > 0 && (
            <div className="text-center py-8">
              <p className="text-[#626161]">You&apos;ve seen all our projects</p>
            </div>
          )}

          {/* Empty state */}
          {projects.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-[#626161] text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
