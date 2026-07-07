'use client'

import React, { useState } from 'react'
import type { Office } from '@/payload-types'
import { OfficeTabs } from './OfficeTabs'
import { ContactInfoCards } from './ContactInfoCards'
import { ContactForm } from './ContactForm'
import { GoogleMapSection } from './GoogleMapSection'

interface ContactPageContentProps {
  offices: Office[]
}

export const ContactPageContent = ({ offices }: ContactPageContentProps) => {
  const [activeOffice, setActiveOffice] = useState<Office | null>(
    offices.length > 0 ? offices[offices.length - 1] ?? null : null // Default to last office (Head Office)
  )

  return (
    <>
      {/* Office Tabs Section */}
      <section className="w-full py-6 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <OfficeTabs
            offices={offices}
            activeOffice={activeOffice}
            onSelectOffice={setActiveOffice}
          />
        </div>
      </section>

      {/* Contact Info Cards Section */}
      <section className="w-full py-12 md:py-16 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ContactInfoCards activeOffice={activeOffice} />
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ContactForm offices={offices} />
        </div>
      </section>

      {/* Google Map Section */}
      <GoogleMapSection office={activeOffice} />
    </>
  )
}
