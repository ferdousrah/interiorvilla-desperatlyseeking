/**
 * Script to fix media URLs in the database
 * Changes cms.desperatelyseeking.xyz to desperatelyseeking.xyz
 *
 * Run with: npx tsx scripts/fix-media-urls.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const OLD_DOMAIN = 'cms.desperatelyseeking.xyz'
const NEW_DOMAIN = 'desperatelyseeking.xyz'

async function fixMediaUrls() {
  console.log('Starting media URL fix...')
  console.log(`Replacing: ${OLD_DOMAIN} -> ${NEW_DOMAIN}`)

  const payload = await getPayload({ config })

  // Get all media items
  const media = await payload.find({
    collection: 'media',
    limit: 10000,
    pagination: false,
  })

  console.log(`Found ${media.docs.length} media items`)

  let updatedCount = 0

  for (const item of media.docs) {
    let needsUpdate = false
    const updates: Record<string, any> = {}

    // Check and fix main URL
    if (item.url && item.url.includes(OLD_DOMAIN)) {
      updates.url = item.url.replace(OLD_DOMAIN, NEW_DOMAIN)
      needsUpdate = true
    }

    // Check and fix thumbnail URL
    if (item.thumbnailURL && item.thumbnailURL.includes(OLD_DOMAIN)) {
      updates.thumbnailURL = item.thumbnailURL.replace(OLD_DOMAIN, NEW_DOMAIN)
      needsUpdate = true
    }

    // Check and fix sizes
    if (item.sizes) {
      const newSizes: Record<string, any> = {}
      for (const [sizeName, sizeData] of Object.entries(item.sizes as Record<string, any>)) {
        if (sizeData && typeof sizeData === 'object') {
          if (sizeData.url && sizeData.url.includes(OLD_DOMAIN)) {
            newSizes[sizeName] = {
              ...sizeData,
              url: sizeData.url.replace(OLD_DOMAIN, NEW_DOMAIN),
            }
            needsUpdate = true
          }
        }
      }
      if (Object.keys(newSizes).length > 0) {
        updates.sizes = { ...item.sizes, ...newSizes }
      }
    }

    if (needsUpdate) {
      try {
        await payload.update({
          collection: 'media',
          id: item.id,
          data: updates,
        })
        updatedCount++
        console.log(`Updated: ${item.filename || item.id}`)
      } catch (error) {
        console.error(`Failed to update ${item.id}:`, error)
      }
    }
  }

  console.log(`\nDone! Updated ${updatedCount} media items.`)
  process.exit(0)
}

fixMediaUrls().catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})
