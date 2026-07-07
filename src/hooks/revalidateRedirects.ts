import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  try {
    revalidateTag('redirects')
  } catch {
    // Called outside a Next.js request scope (CLI script / seed / cron) —
    // revalidateTag only works within a request. Skip so the redirect write
    // still succeeds; ISR / next deploy refreshes the cached redirect list.
  }

  return doc
}
