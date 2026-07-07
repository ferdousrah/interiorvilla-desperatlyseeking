import React from 'react'

interface ReviewItem {
  id: string | number
  authorName: string
  authorPhoto: string
  rating: number
  text: string
  relativeTime: string
}

interface GoogleReviewsSectionProps {
  reviews?: ReviewItem[]
  overallRating?: number | null
  totalReviews?: number | null
  googleReviewUrl?: string | null
  sectionTitle?: string | null
  shortDescription?: string | null
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`${sizeClass} ${
            star <= Math.round(rating) ? 'fill-[#FBBC05] text-[#FBBC05]' : 'fill-gray-200 text-gray-200'
          }`}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
]


export default function GoogleReviewsSection({
  reviews = [],
  overallRating,
  totalReviews,
  googleReviewUrl,
  sectionTitle,
  shortDescription,
}: GoogleReviewsSectionProps) {
  if (reviews.length === 0) return null

  const displayRating = overallRating ?? 5.0
  const displayTotal = totalReviews ?? reviews.length

  return (
    <>
      <section
        id="google-reviews-section"
        className="w-full flex items-start justify-center relative overflow-hidden bg-[#fafafa] pt-20 pb-16 md:pt-25 md:pb-20"
      >
        <div
          className="container mx-auto px-4 relative z-10 w-full"
          style={{ maxWidth: '1219px' }}
        >
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16" data-animate="slide-up">
            <h2 className="font-medium text-2xl sm:text-3xl md:text-[40px] text-center leading-tight md:leading-[62px] mb-4 md:mb-2">
              <span className="text-[#0d1529]">{sectionTitle || 'Google '}</span>
              <span className="text-secondary">{sectionTitle ? '' : 'Reviews'}</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed px-4 md:px-8">
              {shortDescription || 'See what our clients say about us on Google'}
            </p>
          </div>

          {/* Overall Rating Card */}
          <div className="flex justify-center mb-12 md:mb-14" data-animate="scale" data-delay="200">
            <div className="bg-white rounded-2xl shadow-lg px-8 py-6 md:px-12 md:py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border border-gray-100">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="28" height="28" className="inline-block">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-lg font-medium text-gray-700">Google Reviews</span>
              </div>
              <div className="h-px sm:h-12 w-full sm:w-px bg-gray-200" />
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl font-semibold text-[#0d1529]">
                  {displayRating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-1">
                  <StarRating rating={displayRating} size="lg" />
                  <span className="text-sm text-gray-500">
                    Based on {displayTotal} review{displayTotal !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Carousel with Arrows */}
          <div className="relative" data-animate="slide-up" data-delay="400">
            {/* Left Arrow */}
            <button
              data-scroll-prev
              aria-label="Previous review"
              className="absolute -left-1 sm:left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20 hover:border-primary/50 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7 text-primary">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              data-scroll-next
              aria-label="Next review"
              className="absolute -right-1 sm:right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20 hover:border-primary/50 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7 text-primary">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Review Cards */}
            <div
              data-review-scroll
              className="overflow-x-auto pb-4 mx-6 sm:mx-8 md:mx-10 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-5 md:gap-6 w-max">
                {reviews.map((review, idx) => (
                  <div
                    key={review.id}
                    className="w-[280px] sm:w-[320px] lg:w-[370px] flex-shrink-0 snap-start"
                    data-animate="slide-up"
                    data-delay={String(500 + idx * 100)}
                  >
                    <div className="bg-white rounded-2xl p-6 md:p-7 h-full shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 flex flex-col relative group hover:-translate-y-1">
                      {/* Google Icon */}
                      <div className="absolute top-5 right-5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3.5 mb-4">
                        {review.authorPhoto ? (
                          <img
                            src={review.authorPhoto}
                            alt={review.authorName}
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-gray-100 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                          >
                            {getInitials(review.authorName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0d1529] text-sm md:text-base truncate">
                            {review.authorName}
                          </h3>
                          {review.relativeTime && (
                            <span className="text-xs text-gray-400">{review.relativeTime}</span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={review.rating} />
                      </div>

                      {/* Review Text */}
                      <div className="flex-1">
                        <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                          {review.text.length > 200
                            ? `${review.text.slice(0, 200)}...`
                            : review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {googleReviewUrl && (
            <div className="flex justify-center mt-10 md:mt-14" data-animate="slide-up" data-delay="600">
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-white text-[#0d1529] font-medium px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" className="inline-block">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                View All on Google
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
