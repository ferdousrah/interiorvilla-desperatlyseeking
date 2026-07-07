/**
 * Static fallback site configuration.
 *
 * IMPORTANT: The live values are admin-editable via the "Site Settings"
 * global in the Payload admin panel — server code should prefer
 * `getSiteConfig()` from '@/utilities/getSiteConfig', which merges the
 * admin-panel values over these defaults. This file is only the fallback
 * used when the DB is unreachable or a field is left empty in the admin.
 */

export const siteConfig = {
  name: 'Desperately Seeking',
  url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://desperatelyseeking.xyz',
  tagline: 'Build Your Dream',

  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+8801700000000',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+8801700000000',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@desperatelyseeking.xyz',
  },

  address: {
    streetAddress: 'Dhaka',
    addressLocality: 'Dhaka',
    addressRegion: 'Dhaka',
    postalCode: '1207',
    addressCountry: 'BD',
    full: 'Dhaka, Bangladesh',
  },

  geo: {
    latitude: 23.8103,
    longitude: 90.4125,
  },

  hasMap: 'https://maps.google.com/?q=Dhaka',

  social: {
    facebook: 'https://www.facebook.com/desperatelyseeking',
    instagram: 'https://www.instagram.com/desperatelyseeking',
    linkedin: 'https://www.linkedin.com/company/desperatelyseeking',
    youtube: 'https://www.youtube.com/@desperatelyseeking',
    pinterest: 'https://www.pinterest.com/desperatelyseeking',
  },

  business: {
    openingHours: 'Mo-Sa 10:00-19:00',
    priceRange: '$$',
    areaServed: 'Bangladesh',
    description: 'Desperately Seeking — discover our services, portfolio and stories.',
  },
} as const

export type SiteConfig = typeof siteConfig
