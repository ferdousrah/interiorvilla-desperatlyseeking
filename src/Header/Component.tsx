import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteConfig } from '@/utilities/getSiteConfig'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  const [headerData, site] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<Header>,
    getSiteConfig(),
  ])

  return <HeaderClient data={headerData} siteName={site.name} logoUrl={site.logoUrl} />
}
