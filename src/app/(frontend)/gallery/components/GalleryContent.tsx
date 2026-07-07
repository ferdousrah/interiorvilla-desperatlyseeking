'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, X } from 'lucide-react'

export type GalleryPhoto = {
  id: string
  url: string
  fullUrl: string
  alt: string
  title: string
  link: string | null
  category: string
}

export type GalleryVideo = {
  id: string
  videoUrl: string
  title: string
  link: string | null
  category: string
}

const PAGE_SIZE = 24

const getYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '')
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

/** Title that becomes a link when the item has one. */
function ItemTitle({
  title,
  link,
  className,
}: {
  title: string
  link: string | null
  className: string
}) {
  if (!link) return <span className={className}>{title}</span>
  const isInternal = link.startsWith('/')
  if (isInternal) {
    return (
      <Link href={link} className={`${className} hover:text-primary transition-colors`}>
        {title}
      </Link>
    )
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:text-primary transition-colors`}
    >
      {title}
    </a>
  )
}

export default function GalleryContent({
  photos,
  videos,
  categories,
}: {
  photos: GalleryPhoto[]
  videos: GalleryVideo[]
  categories: string[]
}) {
  const [tab, setTab] = useState<'photos' | 'videos'>('photos')
  const [category, setCategory] = useState<string>('All')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const filteredPhotos = useMemo(
    () => (category === 'All' ? photos : photos.filter((p) => p.category === category)),
    [photos, category],
  )
  const filteredVideos = useMemo(
    () => (category === 'All' ? videos : videos.filter((v) => v.category === category)),
    [videos, category],
  )

  const switchTab = (t: 'photos' | 'videos') => {
    setTab(t)
    setVisible(PAGE_SIZE)
  }
  const switchCategory = (c: string) => {
    setCategory(c)
    setVisible(PAGE_SIZE)
  }

  return (
    <section className="w-full py-10 md:py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(
            [
              ['photos', `Photos (${photos.length})`],
              ['videos', `Videos (${videos.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 [font-family:'Fahkwang',Helvetica] ${
                tab === key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-[#f7f9fb] text-[#48515c] hover:bg-primary/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => switchCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                category === c
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-[#626161] hover:border-primary/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ---- Photos grid ---- */}
        {tab === 'photos' && (
          <>
            {filteredPhotos.length === 0 ? (
              <p className="text-center text-[#626161] py-12">
                No photos in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredPhotos.slice(0, visible).map((photo) => (
                  <figure key={photo.id} className="group">
                    <button
                      type="button"
                      onClick={() => setLightbox(photo)}
                      className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 block"
                      aria-label={`View photo: ${photo.title}`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                    </button>
                    <figcaption className="mt-2 px-0.5">
                      <ItemTitle
                        title={photo.title}
                        link={photo.link}
                        className="text-sm font-semibold text-[#01190c] line-clamp-1 [font-family:'Fahkwang',Helvetica]"
                      />
                      <div className="text-xs text-[#626161] mt-0.5">{photo.category}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
            {filteredPhotos.length > visible && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-8 py-3 rounded-full border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Load More ({filteredPhotos.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* ---- Videos grid ---- */}
        {tab === 'videos' && (
          <>
            {filteredVideos.length === 0 ? (
              <p className="text-center text-[#626161] py-12">
                No videos in this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredVideos.slice(0, visible).map((video) => {
                  const ytId = getYouTubeId(video.videoUrl)
                  const isPlaying = playingVideo === video.id
                  return (
                    <div
                      key={video.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {isPlaying && ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (ytId) setPlayingVideo(video.id)
                              else window.open(video.videoUrl, '_blank', 'noopener,noreferrer')
                            }}
                            className="group absolute inset-0 w-full h-full"
                            aria-label={`Play video: ${video.title}`}
                          >
                            {ytId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                                alt={video.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1529] to-[#1f2e4d]" />
                            )}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                                <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <ItemTitle
                          title={video.title}
                          link={video.link}
                          className="text-sm font-semibold text-[#01190c] line-clamp-1 [font-family:'Fahkwang',Helvetica]"
                        />
                        <div className="text-xs text-[#626161] mt-0.5">{video.category}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {filteredVideos.length > visible && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-8 py-3 rounded-full border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Load More ({filteredVideos.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${lightbox.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.fullUrl}
            alt={lightbox.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ItemTitle
              title={lightbox.link ? `${lightbox.title} →` : lightbox.title}
              link={lightbox.link}
              className="text-white text-sm font-semibold"
            />
          </div>
          <button
            type="button"
            aria-label="Close photo preview"
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-7 h-7" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
