import { revalidatePath, revalidateTag } from 'next/cache'
import { LLMS_CACHE_TAG } from './llmsCacheTag'

/**
 * `revalidatePath`/`revalidateTag` only work inside a Next.js request scope.
 * When a collection hook runs OUTSIDE a request — a CLI script, a seed, a
 * migration, or a cron job — they throw "Invariant: static generation store
 * missing", which would abort an otherwise-valid DB write. These wrappers
 * swallow that specific case so the write succeeds; ISR (the per-route
 * revalidate window) or the next deploy refreshes the routes instead.
 */
function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    if (type) revalidatePath(path, type)
    else revalidatePath(path)
  } catch {
    /* no request scope (script/cron) — skip */
  }
}

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag)
  } catch {
    /* no request scope (script/cron) — skip */
  }
}

/**
 * Shared revalidation helpers for Payload collection afterChange/afterDelete
 * hooks. Each helper invalidates exactly the public URLs that depend on the
 * mutated document, plus the relevant aggregate caches (sitemap, llms.txt).
 *
 * Why both paths AND tags?
 *   - revalidatePath: invalidates the static HTML for that route
 *   - revalidateTag: invalidates unstable_cache() entries that drive
 *     aggregated views (sitemap, llms.txt, related-posts widgets, etc.)
 */

const SITE_LEVEL_TAGS = [LLMS_CACHE_TAG, 'sitemap']

/** Revalidate the right paths after a blog-post document changes. */
export function revalidateBlogPost(
  doc: { slug?: string | null } | undefined,
  previousDoc?: { slug?: string | null },
): void {
  const slugs = new Set<string>()
  if (doc?.slug) slugs.add(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    slugs.add(previousDoc.slug)
  }
  for (const slug of slugs) safeRevalidatePath(`/blog/${slug}`)
  safeRevalidatePath('/blog')
  safeRevalidatePath('/')
  safeRevalidatePath('/sitemap.xml')
  safeRevalidatePath('/sitemap')
  for (const tag of SITE_LEVEL_TAGS) safeRevalidateTag(tag)
}

/** Revalidate the right paths after a project document changes. */
export function revalidateProject(
  doc: { slug?: string | null; featuredOnHome?: boolean | null } | undefined,
  previousDoc?: { slug?: string | null },
): void {
  const slugs = new Set<string>()
  if (doc?.slug) slugs.add(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    slugs.add(previousDoc.slug)
  }
  for (const slug of slugs) safeRevalidatePath(`/portfolio/${slug}`)
  safeRevalidatePath('/portfolio')
  safeRevalidatePath('/')
  safeRevalidatePath('/sitemap.xml')
  safeRevalidatePath('/image-sitemap.xml')
  safeRevalidatePath('/sitemap')
  for (const tag of SITE_LEVEL_TAGS) safeRevalidateTag(tag)
}

/** Revalidate the right paths after a service document changes. */
export function revalidateService(
  doc: { slug?: string | null } | undefined,
  previousDoc?: { slug?: string | null },
): void {
  const slugs = new Set<string>()
  if (doc?.slug) slugs.add(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    slugs.add(previousDoc.slug)
  }
  for (const slug of slugs) safeRevalidatePath(`/services/${slug}`)
  safeRevalidatePath('/services')
  safeRevalidatePath('/')
  safeRevalidatePath('/sitemap.xml')
  safeRevalidatePath('/sitemap')
  for (const tag of SITE_LEVEL_TAGS) safeRevalidateTag(tag)
}

/** Revalidate the right paths after a service-area document changes. */
export function revalidateServiceArea(
  doc: { slug?: string | null } | undefined,
  previousDoc?: { slug?: string | null },
): void {
  const slugs = new Set<string>()
  if (doc?.slug) slugs.add(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    slugs.add(previousDoc.slug)
  }
  for (const slug of slugs) safeRevalidatePath(`/service-areas/${slug}`)
  safeRevalidatePath('/service-areas')
  // Footer uses serviceAreas — every page that includes the footer
  // gets stale when an area is added/renamed.
  safeRevalidatePath('/', 'layout')
  safeRevalidatePath('/sitemap.xml')
  safeRevalidatePath('/sitemap')
  for (const tag of SITE_LEVEL_TAGS) safeRevalidateTag(tag)
}
