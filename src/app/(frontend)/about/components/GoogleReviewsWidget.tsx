import React from 'react'

interface ReviewItem {
  id: string | number
  authorName: string
  authorPhoto: string
  rating: number
  text: string
  relativeTime: string
}

interface GoogleReviewsWidgetProps {
  reviews?: ReviewItem[]
  overallRating?: number | null
  totalReviews?: number | null
  googleReviewUrl?: string | null
  businessName?: string
  businessAddress?: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`w-4 h-4 ${
            star <= Math.round(rating) ? 'fill-[#e7711b] text-[#e7711b]' : 'fill-gray-300 text-gray-300'
          }`}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  )
}

function OverallStarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`w-5 h-5 ${
            star <= Math.round(rating) ? 'fill-[#e7711b] text-[#e7711b]' : 'fill-gray-300 text-gray-300'
          }`}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  )
}

const AVATAR_COLORS = [
  '#4285F4', '#EA4335', '#34A853', '#FBBC05',
  '#7B1FA2', '#E91E63', '#00ACC1', '#FF7043',
]

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 1)
}

export default function GoogleReviewsWidget({
  reviews = [],
  overallRating,
  totalReviews,
  googleReviewUrl,
  businessName = 'Desperately Seeking',
  businessAddress = 'Dhaka, Bangladesh',
}: GoogleReviewsWidgetProps) {
  if (reviews.length === 0) return null

  const displayRating = overallRating ?? 5.0
  const displayTotal = totalReviews ?? reviews.length

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-md w-full">
      {/* Google Reviews Heading */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-base font-semibold text-[#01190c]">Reviews</span>
        </div>
      </div>

      {/* Header: Business Info */}
      <div className="px-4 py-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{businessName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{businessAddress}</p>
          </div>
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#1a73e8] text-white text-xs font-medium px-3 py-2 rounded hover:bg-[#1557b0] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Write a review
            </a>
          )}
        </div>

        {/* Overall Rating */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-medium text-[#e7711b]">{displayRating.toFixed(1)}</span>
          <OverallStarRating rating={displayRating} />
          <span className="text-sm text-gray-500 ml-1">{displayTotal} reviews</span>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Sort indicator */}
      <div className="px-4 py-1.5 flex justify-end">
        <span className="text-xs text-gray-500">Sort by: <span className="text-gray-700 font-medium">Most relevant</span></span>
      </div>

      <div className="border-t border-gray-100" />

      {/* Reviews List */}
      <div className="max-h-[400px] overflow-y-auto">
        {reviews.map((review, idx) => (
          <div key={review.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
            {/* Author Row */}
            <div className="flex items-center gap-2.5 mb-1.5">
              {review.authorPhoto ? (
                <img
                  src={review.authorPhoto}
                  alt={review.authorName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  {getInitials(review.authorName)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{review.authorName}</p>
                <p className="text-xs text-gray-400">1 review</p>
              </div>
            </div>

            {/* Stars + Time */}
            <div className="flex items-center gap-2 mb-1.5">
              <StarRating rating={review.rating} />
              {review.relativeTime && (
                <span className="text-xs text-gray-400">{review.relativeTime}</span>
              )}
            </div>

            {/* Review Text */}
            <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-2">
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-default">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 10 20 15 15 20" />
                  <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                </svg>
                Reply
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-default">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                Helpful?
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: View All */}
      {googleReviewUrl && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-[#1a73e8] font-medium hover:underline"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            View all reviews on Google
          </a>
        </div>
      )}
    </div>
  )
}
