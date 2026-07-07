import { NextRequest, NextResponse } from 'next/server'

/**
 * URL path lowercase-normalization middleware.
 *
 * Why this exists:
 *   Next.js next.config.js redirects use path-to-regexp matching which is
 *   case-insensitive by default. That means a redirect with a capital-letter
 *   source (e.g. `/service-areas/interior-design-in-Coxs-bazar`) ALSO fires
 *   on the lowercase URL, creating an infinite redirect loop.
 *
 *   To handle capital-letter URLs cleanly, we lower-case the pathname here
 *   in middleware (which runs AFTER next.config redirects). If we detect any
 *   uppercase character in the pathname, we 308 to the lowercase version.
 *   All slugs in the DB are lowercase, so this resolves to the working page.
 *
 *   Bonus: works for every URL site-wide, not just the Coxs-bazar case.
 *
 * Carve-outs (matcher below):
 *   - `/_next/*` — Next.js static assets, never touch
 *   - `/api/*`   — API routes (some may be case-sensitive, e.g. file names)
 *   - `/admin/*` — Payload admin UI
 *   - Files with extensions (`/foo.xml`, `/sitemap.xml`, etc.)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const lowered = pathname.toLowerCase()
  if (pathname === lowered) {
    return NextResponse.next()
  }
  const url = request.nextUrl.clone()
  url.pathname = lowered
  // 308 = permanent redirect that preserves the HTTP method.
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: [
    /**
     * Run on all paths EXCEPT:
     *   - /_next/static     (static assets)
     *   - /_next/image      (image optimizer)
     *   - /api              (API routes)
     *   - /admin            (Payload admin)
     *   - paths containing a "." (likely files)
     */
    '/((?!_next/static|_next/image|api|admin|.*\\.).*)',
  ],
}
