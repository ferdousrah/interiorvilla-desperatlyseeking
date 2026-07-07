interface GoogleReviewData {
  authorName: string
  authorPhoto: string
  rating: number
  text: string
  relativeTime: string
  time: number
}

interface GooglePlaceResult {
  overallRating: number
  totalReviews: number
  reviews: GoogleReviewData[]
}

// Cache to avoid hitting API on every request
let cachedResult: GooglePlaceResult | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function getGoogleReviews(): Promise<GooglePlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return null
  }

  // Return cached data if still fresh
  if (cachedResult && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedResult
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&reviews_sort=newest&language=en&key=${apiKey}`

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (data.status !== 'OK' || !data.result) {
      console.error('Google Places API error:', data.status, data.error_message)
      return cachedResult // Return stale cache if available
    }

    const result: GooglePlaceResult = {
      overallRating: data.result.rating ?? 0,
      totalReviews: data.result.user_ratings_total ?? 0,
      reviews: (data.result.reviews || []).map((r: any) => ({
        authorName: r.author_name || 'Anonymous',
        authorPhoto: r.profile_photo_url || '',
        rating: r.rating ?? 5,
        text: r.text || '',
        relativeTime: r.relative_time_description || '',
        time: r.time ?? 0,
      })),
    }

    // Update cache
    cachedResult = result
    cacheTimestamp = Date.now()

    return result
  } catch (err) {
    console.error('Failed to fetch Google reviews:', err)
    return cachedResult // Return stale cache on error
  }
}
