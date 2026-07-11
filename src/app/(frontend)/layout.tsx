import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Playfair_Display, Fahkwang } from 'next/font/google'
import React from 'react'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const fahkwang = Fahkwang({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-fahkwang',
  display: 'swap',
})

import { AdminBar } from '@/components/AdminBar'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import { FloatingButtons } from './components/FloatingButtons'
import { OrganizationSchema, WebsiteSchema } from './components/JsonLd'
import { getSiteConfig } from '@/utilities/getSiteConfig'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  // Admin-editable branding (Site Settings global), falls back to static config
  const siteConfig = await getSiteConfig()
  // Make relative media URLs absolute for JSON-LD consumers
  const absoluteUrl = (path: string) =>
    path.startsWith('http') ? path : `${siteConfig.url}${path}`
  const logoUrl = siteConfig.logoUrl
    ? absoluteUrl(siteConfig.logoUrl)
    : `${siteConfig.url}/logo.png`

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, playfairDisplay.variable, fahkwang.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        {/* Favicons — admin-uploaded favicon (Site Settings) wins over static files */}
        {siteConfig.faviconUrl ? (
          <link href={siteConfig.faviconUrl} rel="icon" />
        ) : (
          <>
            <link href="/favicon.ico" rel="icon" sizes="32x32" />
            <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          </>
        )}
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* JSON-LD Structured Data for SEO */}
        <OrganizationSchema
          name={siteConfig.name}
          url={siteConfig.url}
          logo={logoUrl}
          image={`${siteConfig.url}/og-image.webp`}
          description={siteConfig.business.description}
          address={siteConfig.address}
          geo={siteConfig.geo}
          contactPoint={{
            telephone: siteConfig.contact.phone,
            email: siteConfig.contact.email,
          }}
          sameAs={[
            siteConfig.social.facebook,
            siteConfig.social.instagram,
            siteConfig.social.linkedin,
            siteConfig.social.youtube,
            siteConfig.social.pinterest,
          ]}
          hasMap={siteConfig.hasMap}
          priceRange={siteConfig.business.priceRange}
          areaServed={siteConfig.business.areaServed}
        />
        <WebsiteSchema
          name={siteConfig.name}
          url={siteConfig.url}
          description={siteConfig.business.description}
        />
        {/* Skip to main content — WCAG 2.4.1. Visually hidden by default,
            visible when focused via Tab key for keyboard/screen-reader users. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <FloatingButtons />
        </Providers>
        {/* GA4 — loads after page is interactive, does not block LCP */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga4-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {/* Ahrefs Analytics */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="FS4t49Pm/7A4nc6yUaNS1A"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  // Admin-editable branding (Site Settings global), falls back to static config
  const site = await getSiteConfig()

  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: `${site.name} | ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: site.business.description,
    icons: {
      icon: site.faviconUrl
        ? [{ url: site.faviconUrl }]
        : [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
          ],
    },
    openGraph: mergeOpenGraph({
      siteName: site.name,
      title: `${site.name} | ${site.tagline}`,
      description: site.business.description,
    }),
    twitter: {
      card: 'summary_large_image',
      creator: '@desperatelyseeking',
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      },
    }),
  }
}
