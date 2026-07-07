import Script from 'next/script'
import { siteConfig } from '@/config/site'

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  image?: string
  description: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: { latitude: number; longitude: number }
  contactPoint: {
    telephone: string
    email: string
  }
  sameAs: string[]
  hasMap?: string
  priceRange?: string
  areaServed?: string
}

export function OrganizationSchema({
  name,
  url,
  logo,
  image,
  description,
  address,
  geo,
  contactPoint,
  sameAs,
  hasMap,
  priceRange,
  areaServed,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#business`,
    name,
    alternateName: 'DesperatelySeeking',
    url,
    logo,
    image: image || logo,
    description,
    telephone: contactPoint.telephone,
    email: contactPoint.email,
    ...(priceRange && { priceRange }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactPoint.telephone,
      email: contactPoint.email,
      contactType: 'customer service',
      availableLanguage: ['English', 'Bengali'],
    },
    areaServed: { '@type': 'Country', name: areaServed || 'Bangladesh' },
    sameAs,
    ...(hasMap && { hasMap }),
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface WebsiteSchemaProps {
  name: string
  url: string
  description: string
}

export function WebsiteSchema({ name, url, description }: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ArticleSchemaProps {
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified: string
  author: string
  url: string
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Desperately Seeking',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://desperatelyseeking.xyz'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface AggregateRatingSchemaProps {
  /** Domain (e.g. https://desperatelyseeking.xyz) — used to anchor @id to the business node */
  siteUrl: string
  /** Average rating, 1.0 to 5.0 */
  ratingValue: number
  /** Total number of reviews */
  reviewCount: number
  /** Optional: a few featured reviews to inline (Google may show in rich results) */
  reviews?: Array<{
    author: string
    ratingValue: number
    text: string
    datePublished?: string
  }>
}

/**
 * Emits AggregateRating + (optionally) Review nodes attached to the
 * existing LocalBusiness/Organization @id at `${siteUrl}/#business`.
 * That id matches OrganizationSchema's @id, so Google merges them into one
 * entity and shows star ratings + review snippets in search results.
 */
export function AggregateRatingSchema({
  siteUrl,
  ratingValue,
  reviewCount,
  reviews,
}: AggregateRatingSchemaProps) {
  if (!ratingValue || !reviewCount) return null

  const businessId = `${siteUrl}/#business`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessId,
    // name + address repeated here (same values as OrganizationSchema, which
    // shares this @id) so this node is self-valid. Google merges by @id, but
    // validators (e.g. SEMrush) check each node in isolation and flag a
    // LocalBusiness missing name/address.
    name: siteConfig.name,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  }

  if (reviews && reviews.length > 0) {
    schema.review = reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.text,
      ...(r.datePublished && { datePublished: r.datePublished }),
    }))
  }

  return (
    <Script
      id="aggregate-rating-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceSchemaProps {
  name: string
  description: string
  url: string
  image?: string
  provider: string
  areaServed: string
}

export function ServiceSchema({
  name,
  description,
  url,
  image,
  provider,
  areaServed,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    image,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${siteConfig.url}/#business`,
      name: provider,
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteConfig.address.streetAddress,
        addressLocality: siteConfig.address.addressLocality,
        addressRegion: siteConfig.address.addressRegion,
        postalCode: siteConfig.address.postalCode,
        addressCountry: siteConfig.address.addressCountry,
      },
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
    serviceType: name,
  }

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
