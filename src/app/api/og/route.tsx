import { ImageResponse } from 'next/og'

// Edge runtime is fastest for ImageResponse and the rendering logic here is
// pure JSX → SVG → PNG with no Node-only APIs.
export const runtime = 'edge'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

const BRAND_PRIMARY = '#5A9A35' // green
const BRAND_SECONDARY = '#EE5428' // orange
const BRAND_DARK = '#01190c'

/**
 * Dynamic Open Graph image generator.
 *
 *   /api/og?title=Cost%20Estimator&subtitle=Get%20an%20instant%20estimate
 *
 * Returns a 1200×630 PNG with:
 *   - dark green branded background
 *   - small "Desperately Seeking" eyebrow
 *   - large page title
 *   - smaller subtitle
 *   - footer: domain + tag
 *
 * Used as a fallback when a page doesn't supply a featured image. Pages with
 * a meaningful featured image (blog posts, projects, services) still pass
 * their own image through mergeOpenGraph and skip this endpoint.
 *
 * Cached forever — the generated image is fully deterministic given the
 * (title, subtitle) query parameters.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const rawTitle = searchParams.get('title') ?? 'Desperately Seeking'
  const rawSubtitle =
    searchParams.get('subtitle') ??
    'Best Interior Design Firm in Bangladesh'

  // Defensive: cap lengths so a hostile/very long URL can't blow up the layout.
  const title = rawTitle.slice(0, 110)
  const subtitle = rawSubtitle.slice(0, 160)

  // Adapt title font size to length so very long titles still fit.
  const titleFontSize =
    title.length > 80 ? 52 : title.length > 50 ? 64 : 76

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${BRAND_DARK} 0%, #0a1208 100%)`,
          padding: '64px 72px',
          position: 'relative',
          fontFamily:
            'Georgia, "Times New Roman", "Liberation Serif", serif',
        }}
      >
        {/* Decorative corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '320px',
            height: '320px',
            background: `radial-gradient(circle at top right, ${BRAND_PRIMARY}33 0%, transparent 70%)`,
          }}
        />

        {/* Eyebrow rule + label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '3px',
              background: BRAND_PRIMARY,
              marginRight: '16px',
            }}
          />
          <span
            style={{
              color: BRAND_PRIMARY,
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            }}
          >
            Desperately Seeking
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: 'white',
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: '900px',
            marginBottom: '28px',
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: '26px',
              fontWeight: 400,
              maxWidth: '900px',
              lineHeight: 1.4,
              fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Footer row */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '72px',
            right: '72px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '22px',
              fontWeight: 500,
            }}
          >
            desperatelyseeking.xyz
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              borderRadius: '999px',
              background: BRAND_SECONDARY,
              color: 'white',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}
          >
            BANGLADESH
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        // OG image is fully deterministic for a given (title, subtitle) pair —
        // safe to cache aggressively at the CDN.
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000',
      },
    },
  )
}
