'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import type { Office } from '@/payload-types'

interface ContactInfoCardsProps {
  activeOffice: Office | null
}

export const ContactInfoCards = ({ activeOffice }: ContactInfoCardsProps) => {
  const cards = [
    {
      icon: MapPin,
      title: 'Head Office',
      content: activeOffice?.address || '18/10-A, Block-F, Ring Road,\nMohammadpur, Dhaka-1207.',
    },
    {
      icon: Phone,
      title: 'Have Any Question',
      content: activeOffice?.phone || '+88 01748981590',
      href: `tel:${activeOffice?.phone || '+8801748981590'}`,
    },
    {
      icon: Mail,
      title: 'Email Address',
      content: activeOffice?.email || 'info@desperatelyseeking.xyz',
      href: `mailto:${activeOffice?.email || 'info@desperatelyseeking.xyz'}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <card.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[#01190c] mb-2">{card.title}</h3>
          {card.href ? (
            <a
              href={card.href}
              className="text-[#626161] text-sm hover:text-primary transition-colors duration-300 whitespace-pre-line"
            >
              {card.content}
            </a>
          ) : (
            <p className="text-[#626161] text-sm whitespace-pre-line">{card.content}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
