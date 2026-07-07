'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { Office } from '@/payload-types'

interface OfficeTabsProps {
  offices: Office[]
  activeOffice: Office | null
  onSelectOffice: (office: Office) => void
}

export const OfficeTabs = ({ offices, activeOffice, onSelectOffice }: OfficeTabsProps) => {
  if (!offices || offices.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex justify-center gap-2"
    >
      {offices.map((office) => (
        <button
          key={office.id}
          onClick={() => onSelectOffice(office)}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            activeOffice?.id === office.id
              ? 'bg-primary text-white'
              : 'bg-white text-[#626161] border border-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          {office.title}
        </button>
      ))}
    </motion.div>
  )
}
