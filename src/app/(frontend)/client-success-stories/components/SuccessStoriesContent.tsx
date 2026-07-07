'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, Star } from 'lucide-react'

export type VideoStory = {
  id: string | number
  title: string
  details?: string | null
  coverUrl: string | null
  coverAlt: string
  videoUrl: string
}

export type WrittenReview = {
  id: string | number
  reviewerName: string
  reviewerPhoto: string | null
  rating: number
  text: string
  date: string | null
}

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

/** Video testimonial card: cover + play → swaps to a YouTube embed in place. */
function VideoCard({ story }: { story: VideoStory }) {
  const [playing, setPlaying] = useState(false)
  const ytId = getYouTubeId(story.videoUrl)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="relative aspect-video bg-gray-900">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={story.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (ytId) setPlaying(true)
              else window.open(story.videoUrl, '_blank', 'noopener,noreferrer')
            }}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Play video: ${story.title}`}
          >
            {story.coverUrl ? (
              <Image
                src={story.coverUrl}
                alt={story.coverAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1529] to-[#1f2e4d]" />
            )}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-[#01190c] [font-family:'Fahkwang',Helvetica]">
          {story.title}
        </h3>
        {story.details && (
          <p className="text-sm text-[#626161] leading-relaxed mt-1.5 line-clamp-3">
            {story.details}
          </p>
        )}
      </div>
    </div>
  )
}

export default function SuccessStoriesContent({
  videos,
  reviews,
  videosTitle,
  reviewsTitle,
}: {
  videos: VideoStory[]
  reviews: WrittenReview[]
  videosTitle: string
  reviewsTitle: string
}) {
  return (
    <>
      {videos.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-10 [font-family:'Fahkwang',Helvetica]">
              <span className="text-[#0d1529]">{videosTitle.split(' ')[0]}</span>{' '}
              <span className="text-secondary">
                {videosTitle.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {videos.map((story) => (
                <VideoCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="w-full py-12 md:py-16 bg-[#f7f9fb]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-10 [font-family:'Fahkwang',Helvetica]">
              <span className="text-[#0d1529]">{reviewsTitle.split(' ')[0]}</span>{' '}
              <span className="text-secondary">
                {reviewsTitle.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-3" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating ? 'text-amber-400' : 'text-gray-200'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#48515c] leading-relaxed flex-1">
                    {r.text}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                    {r.reviewerPhoto ? (
                      <Image
                        src={r.reviewerPhoto}
                        alt={r.reviewerName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {r.reviewerName.charAt(0)}
                      </span>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-[#01190c]">
                        {r.reviewerName}
                      </div>
                      {r.date && (
                        <div className="text-xs text-[#626161]">{r.date}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
