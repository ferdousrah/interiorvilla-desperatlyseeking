'use client'

import React from 'react'
import type { Office } from '@/payload-types'

interface GoogleMapSectionProps {
  office: Office | null
}

export const GoogleMapSection = ({ office }: GoogleMapSectionProps) => {
  // Generate map URL with marker from lat/lng
  const getMapSrc = (): string => {
    if (office?.latitude && office?.longitude) {
      // Use query-based embed to show marker at coordinates
      return `https://www.google.com/maps?q=${office.latitude},${office.longitude}&z=15&output=embed`
    }

    // Default: Mohammadpur, Dhaka - Desperately Seeking office location with marker
    return `https://www.google.com/maps?q=23.7646,90.3590&z=15&output=embed`
  }

  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <iframe
        src={getMapSrc()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map - ${office?.title || 'Desperately Seeking Office'}`}
      />
    </div>
  )
}
