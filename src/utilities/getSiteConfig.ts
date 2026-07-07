import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { siteConfig as staticDefaults } from '@/config/site'

/** Resolved site config: same shape as the static `siteConfig`, widened to plain strings. */
export type ResolvedSiteConfig = {
  name: string
  url: string
  tagline: string
  contact: { phone: string; whatsapp: string; email: string }
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
    full: string
  }
  geo: { latitude: number; longitude: number }
  hasMap: string
  social: {
    facebook: string
    instagram: string
    linkedin: string
    youtube: string
    pinterest: string
  }
  business: {
    openingHours: string
    priceRange: string
    areaServed: string
    description: string
  }
}

const pick = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback

/**
 * Admin-editable site config. Reads the "Site Settings" global from Payload
 * and merges it over the static defaults in `src/config/site.ts`, so every
 * field can be changed from the admin panel without a deploy. Cached with the
 * `global_site-settings` tag and revalidated by the global's afterChange hook.
 *
 * Server-side only (uses the Payload local API). Client components should
 * receive these values via props from a server component.
 */
export const getSiteConfig = unstable_cache(
  async (): Promise<ResolvedSiteConfig> => {
    let settings: Record<string, any> | null = null
    try {
      const payload = await getPayload({ config: configPromise })
      settings = (await payload.findGlobal({ slug: 'site-settings' as any })) as Record<
        string,
        any
      > | null
    } catch {
      // DB unreachable or global not created yet — fall back to static config.
    }

    const d = staticDefaults
    if (!settings) return structuredClone(d) as ResolvedSiteConfig

    return {
      name: pick(settings.brand?.name, d.name),
      url: d.url,
      contact: {
        phone: pick(settings.contact?.phone, d.contact.phone),
        whatsapp: pick(settings.contact?.whatsapp, d.contact.whatsapp),
        email: pick(settings.contact?.email, d.contact.email),
      },
      address: {
        streetAddress: pick(settings.address?.streetAddress, d.address.streetAddress),
        addressLocality: pick(settings.address?.addressLocality, d.address.addressLocality),
        addressRegion: pick(settings.address?.addressRegion, d.address.addressRegion),
        postalCode: pick(settings.address?.postalCode, d.address.postalCode),
        addressCountry: pick(settings.address?.addressCountry, d.address.addressCountry),
        full: pick(settings.address?.full, d.address.full),
      },
      geo: {
        latitude: typeof settings.geo?.latitude === 'number' ? settings.geo.latitude : d.geo.latitude,
        longitude:
          typeof settings.geo?.longitude === 'number' ? settings.geo.longitude : d.geo.longitude,
      },
      hasMap: pick(settings.geo?.hasMap, d.hasMap),
      social: {
        facebook: pick(settings.social?.facebook, d.social.facebook),
        instagram: pick(settings.social?.instagram, d.social.instagram),
        linkedin: pick(settings.social?.linkedin, d.social.linkedin),
        youtube: pick(settings.social?.youtube, d.social.youtube),
        pinterest: pick(settings.social?.pinterest, d.social.pinterest),
      },
      business: {
        openingHours: pick(settings.business?.openingHours, d.business.openingHours),
        priceRange: pick(settings.business?.priceRange, d.business.priceRange),
        areaServed: pick(settings.business?.areaServed, d.business.areaServed),
        description: pick(settings.brand?.description, d.business.description),
      },
      tagline: pick(settings.brand?.tagline, d.tagline),
    }
  },
  ['site-config'],
  { tags: ['global_site-settings'] },
)
