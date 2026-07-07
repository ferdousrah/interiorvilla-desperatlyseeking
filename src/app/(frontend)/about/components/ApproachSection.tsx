'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import type { About, Media } from '@/payload-types'

// Unique gradient background tones per card
const bgColors = [
  'from-[#fff7e6] to-[#ffe9cc]',
  'from-[#e6f7ff] to-[#ccf2ff]',
  'from-[#f0f5ff] to-[#d6e4ff]',
  'from-[#f6ffed] to-[#d9f7be]',
]

// Default approaches if none provided
const defaultApproaches = [
  {
    icon: '🔍',
    title: 'Discovery & Planning',
    description:
      'We begin by understanding your needs, preferences, and lifestyle to create a tailored design plan.',
  },
  {
    icon: '🎨',
    title: 'Design Development',
    description:
      'Our team develops detailed designs, including material selections, layouts, and 3D visualizations.',
  },
  {
    icon: '🔨',
    title: 'Execution & Management',
    description:
      'We manage all aspects of the project, from sourcing materials to overseeing construction and installation.',
  },
  {
    icon: '✨',
    title: 'Final Touches',
    description:
      'We add the finishing touches to bring your vision to life, ensuring every detail is perfect.',
  },
]

interface ApproachSectionProps {
  data?: About['ourApproach']
}

export const ApproachSection = ({ data }: ApproachSectionProps) => {
  // Build approaches from data or use defaults
  const approaches =
    data?.approaches && data.approaches.length > 0
      ? data.approaches.map((a) => ({
          icon: (a.icon as Media)?.url || '🎨',
          title: a.title || '',
          description: a.description || '',
        }))
      : defaultApproaches

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#01190c] mb-6"
          >
            Our <span className="text-secondary">Approach</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-base text-[#626161] max-w-5xl mx-auto leading-relaxed"
          >
            {data?.description ||
              'At Desperately Seeking, we believe that your home should be a reflection of your unique personality and lifestyle. We are a leading interior design firm in Bangladesh, passionate about creating spaces that are not only beautiful but also functional, comfortable, and inspiring.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            >
              <Card
                aria-label={`Approach step: ${approach.title}`}
                className={`group relative overflow-hidden rounded-[12px] p-2 md:p-4 h-full cursor-pointer bg-gradient-to-br ${bgColors[index % bgColors.length]} transition-all duration-500 ease-out shadow-md border-none hover:scale-[1.02] hover:shadow-lg`}
              >
                <CardContent className="p-0 relative z-10">
                  <div className="text-4xl mb-4 transition-all duration-500 group-hover:scale-110">
                    {approach.icon.startsWith('/') || approach.icon.startsWith('http') ? (
                      <img
                        src={approach.icon}
                        alt={approach.title}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      approach.icon
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-[#01190c] mb-4 text-left transition-all duration-500">
                    {approach.title}
                  </h3>
                  <p className="text-[#626161] text-sm md:text-base leading-relaxed transition-all duration-500">
                    {approach.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
