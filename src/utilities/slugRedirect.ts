import { permanentRedirect } from 'next/navigation'
import type { Payload, BasePayload } from 'payload'

type PayloadLike = Payload | BasePayload

/**
 * Upsert a 301 redirect into the `redirects` collection.
 *
 * Called from collection `beforeChange` hooks when a document's slug changes,
 * so any visitor or external link hitting the old URL gets a 301 to the new
 * one — automatically, with no developer action.
 *
 * Edge cases handled:
 *   - if from === to, no redirect is written (no-op)
 *   - if a redirect with `from = newPath` already exists, it's deleted
 *     (the new path is now a real page; can't redirect away from it)
 *   - if a redirect with `from = oldPath` already exists, its target is
 *     updated to the new path (chain compression: A→B then B→C becomes
 *     A→C, preventing redirect chains)
 */
export async function upsertSlugRedirect(
  payload: PayloadLike,
  fromPath: string,
  toPath: string,
): Promise<void> {
  if (!fromPath || !toPath || fromPath === toPath) return

  try {
    // 1. If the NEW path is itself the `from` of an existing redirect,
    //    delete that redirect — the new path is now a real page.
    const conflicting = await payload.find({
      collection: 'redirects',
      where: { from: { equals: toPath } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    if (conflicting.docs[0]?.id != null) {
      await payload.delete({
        collection: 'redirects',
        id: conflicting.docs[0].id,
      })
    }

    // 2. If a redirect with from=oldPath already exists, update it.
    //    Otherwise, create a new one.
    const existing = await payload.find({
      collection: 'redirects',
      where: { from: { equals: fromPath } },
      limit: 1,
      depth: 0,
      pagination: false,
    })

    if (existing.docs[0]?.id != null) {
      await payload.update({
        collection: 'redirects',
        id: existing.docs[0].id,
        data: {
          to: { type: 'custom', url: toPath },
        } as never,
      })
    } else {
      await payload.create({
        collection: 'redirects',
        data: {
          from: fromPath,
          to: { type: 'custom', url: toPath },
        } as never,
      })
    }

    // 3. Compression: if any OTHER redirect targeted the OLD path, retarget
    //    to the new path (so chains A→B + B→C collapse to A→C).
    const chained = await payload.find({
      collection: 'redirects',
      where: { 'to.url': { equals: fromPath } } as never,
      limit: 100,
      depth: 0,
      pagination: false,
    })
    for (const r of chained.docs) {
      if (r?.id == null) continue
      await payload.update({
        collection: 'redirects',
        id: r.id,
        data: {
          to: { type: 'custom', url: toPath },
        } as never,
      })
    }
  } catch (err) {
    // Never let a redirect write failure block the underlying save.
    console.error('[slug-redirect] upsert failed', err)
  }
}

/**
 * Called from dynamic slug pages BEFORE notFound().
 *
 * If a redirect with `from = path` exists, throws permanentRedirect() →
 * Next.js serves a 308 to the redirect's target. Otherwise returns
 * normally and the caller proceeds to notFound().
 */
export async function maybeRedirectByPath(
  payload: PayloadLike,
  path: string,
): Promise<void> {
  try {
    const result = await payload.find({
      collection: 'redirects',
      where: { from: { equals: path } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    const target = (result.docs[0] as { to?: { url?: string } } | undefined)?.to
      ?.url
    if (target) {
      // Throws — caller code after this never runs.
      permanentRedirect(target)
    }
  } catch (err) {
    // permanentRedirect throws NEXT_REDIRECT — rethrow so Next.js can catch it.
    if (
      err instanceof Error &&
      (err.message === 'NEXT_REDIRECT' || err.message.includes('NEXT_REDIRECT'))
    ) {
      throw err
    }
    // Any other error: log and let caller continue to notFound().
    console.error('[slug-redirect] lookup failed', err)
  }
}
