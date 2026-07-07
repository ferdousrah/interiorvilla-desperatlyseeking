'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Media } from '@/payload-types'

interface ProjectGalleryProps {
  photos: { image: Media | number | null; id?: string | null }[]
  videos?: { videoUrl?: string | null; id?: string | null }[]
  plans?: { image: Media | number | null; id?: string | null }[]
  projectTitle?: string
}

type TabType = 'photos' | 'videos' | 'plans'

type PhotoItem = {
  id: string | number
  type: 'photo' | 'plan'
  alt: string
  full: string
  thumb: string
}

type VideoItem = {
  id: string
  videoUrl: string
  title: string
}

const getYouTubeId = (url?: string) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.replace('/', '')
    if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2] || ''
    if (urlObj.pathname.startsWith('/embed/')) return urlObj.pathname.split('/')[2] || ''
    return urlObj.searchParams.get('v') || ''
  } catch {
    return ''
  }
}

export const ProjectGallery = ({ photos, videos, plans, projectTitle }: ProjectGalleryProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('photos')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)

  const getImageUrl = (image: Media | number | null): string => {
    if (!image || typeof image === 'number') return '/placeholder.webp'
    return image.sizes?.medium?.url || image.sizes?.large?.url || image.url || '/placeholder.webp'
  }

  const getLargeImageUrl = (image: Media | number | null): string => {
    if (!image || typeof image === 'number') return '/placeholder.webp'
    return image.sizes?.large?.url || image.url || '/placeholder.webp'
  }

  // Map photos to PhotoItem format
  const photoItems: PhotoItem[] = (photos || []).map((p, i) => {
    const img = p.image as Media
    return {
      id: p.id || `photo-${i}`,
      type: 'photo' as const,
      alt: img?.alt || projectTitle || 'Photo',
      full: getLargeImageUrl(p.image as Media),
      thumb: getImageUrl(p.image as Media),
    }
  })

  // Map plans to PhotoItem format
  const planItems: PhotoItem[] = (plans || []).map((p, i) => {
    const img = p.image as Media
    return {
      id: p.id || `plan-${i}`,
      type: 'plan' as const,
      alt: img?.alt || projectTitle || 'Plan',
      full: getLargeImageUrl(p.image as Media),
      thumb: getImageUrl(p.image as Media),
    }
  })

  // Map videos to VideoItem format
  const videoItems: VideoItem[] = (videos || [])
    .filter((v) => v.videoUrl)
    .map((v, i) => {
      const id = getYouTubeId(v.videoUrl || '')
      return {
        id: id || v.id || `video-${i}`,
        videoUrl: v.videoUrl || '',
        title: projectTitle || 'Video',
      }
    })

  const hasPhotos = photoItems.length > 0
  const hasVideos = videoItems.length > 0
  const hasPlans = planItems.length > 0

  if (!hasPhotos && !hasVideos && !hasPlans) return null

  const tabs: { id: TabType; label: string }[] = [
    { id: 'photos', label: `Photos (${photoItems.length})` },
    { id: 'videos', label: `Videos (${videoItems.length})` },
    { id: 'plans', label: `Plans (${planItems.length})` },
  ]

  const renderThumb = (item: PhotoItem, idx: number) => (
    <a
      key={item.id}
      href={item.full}
      onClick={(e) => {
        e.preventDefault()
        setSelectedImage(item.full)
      }}
      className="block w-full cursor-pointer group"
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl">
        <Image
          src={item.thumb}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading={idx < 3 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover Zoom Icon */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 z-20"
          style={{
            opacity: hoveredId === item.id ? 1 : 0,
            transform: hoveredId === item.id ? 'scale(1)' : 'scale(0.9)',
          }}
        >
          <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/20">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Gradient with Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
          <h4 className="text-white font-medium text-sm [font-family:'Fahkwang',Helvetica] truncate">
            {item.alt}
          </h4>
        </div>
      </div>
    </a>
  )

  const renderVideo = (v: VideoItem) => {
    const id = v.id || getYouTubeId(v.videoUrl)
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''

    return (
      <a
        key={v.id}
        href={v.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full cursor-pointer group"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl">
          {thumb && (
            <Image
              src={thumb}
              alt={v.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    )
  }

  const currentItems =
    activeTab === 'photos' ? photoItems : activeTab === 'plans' ? planItems : videoItems

  return (
    <section className="w-full py-12 sm:py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2"
          >
            Project Gallery
          </motion.h2>
          {projectTitle && (
            <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">{projectTitle}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 sm:mb-12 md:mb-16 overflow-x-auto px-2">
          <div className="relative bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg border border-gray-100 inline-flex space-x-1 sm:space-x-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-3 sm:px-5 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 rounded-lg sm:rounded-xl z-10 whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-transparent text-[#626161] hover:text-[#01190c] hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 min-h-[200px] sm:min-h-[300px]"
          >
            {activeTab === 'videos'
              ? (currentItems as VideoItem[]).map(renderVideo)
              : (currentItems as PhotoItem[]).map((it, idx) => renderThumb(it, idx))}
          </motion.div>
        </AnimatePresence>

        {/* Empty States */}
        {activeTab === 'photos' && photoItems.length === 0 && (
          <div className="w-full py-16 text-center text-[#626161] min-h-[200px] flex items-center justify-center">
            No photos found.
          </div>
        )}
        {activeTab === 'videos' && videoItems.length === 0 && (
          <div className="w-full py-16 text-center text-[#626161] min-h-[200px] flex items-center justify-center">
            No videos found.
          </div>
        )}
        {activeTab === 'plans' && planItems.length === 0 && (
          <div className="w-full py-16 text-center text-[#626161] min-h-[200px] flex items-center justify-center">
            No floor plans found.
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              type="button"
              aria-label="Close image preview"
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
