'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Project, Media } from '@/payload-types'
import { FormattedText } from '@/utilities/formattedText'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = React.useState(50)
  const [isDragging, setIsDragging] = React.useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) updateSliderPosition(e.clientX)
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    if (e.touches[0]) {
      updateSliderPosition(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    if (e.touches[0]) updateSliderPosition(e.touches[0].clientX)
  }

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const position = ((clientX - rect.left) / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, position)))
  }

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[12px] sm:rounded-[20px] cursor-ew-resize select-none h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px]"
    >
      {/* After Image (background) */}
      <Image
        src={afterImage}
        alt="After"
        fill
        className="object-cover"
        draggable={false}
        sizes="(max-width: 768px) 100vw, 900px"
      />

      {/* Before Image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt="Before"
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>

      {/* Slider Line + Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
          aria-hidden="true"
        >
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
      >
        {afterLabel}
      </div>

      {/* Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-md text-xs transition-opacity duration-200">
        Drag to compare
      </div>
    </div>
  )
}

interface BeforeAfterSectionProps {
  project: Project
}

// Helper to extract plain text from Payload lexical content
const lexicalToPlain = (details: unknown): string => {
  try {
    if (typeof details === 'string') return details
    const root = (details as { root?: { children?: unknown[] } })?.root ?? details
    const lines: string[] = []
    const walk = (n: unknown) => {
      if (!n) return
      if (Array.isArray(n)) return n.forEach(walk)
      if (typeof n === 'object') {
        const node = n as { type?: string; text?: string; children?: unknown[] }
        if (node.type === 'text' && typeof node.text === 'string') lines.push(node.text)
        if (node.children) walk(node.children)
      }
    }
    walk((root as { children?: unknown[] })?.children ?? root)
    return lines.join(' ').replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}

// Helper to get media URL
const getMediaUrl = (media: Media | number | null | undefined): string => {
  if (!media || typeof media === 'number') return ''
  return media.sizes?.large?.url || media.sizes?.medium?.url || media.url || ''
}

export const BeforeAfterSection = ({ project }: BeforeAfterSectionProps) => {
  // Get before/after images
  const beforeAfterImages = project.beforeAfterImages || []
  const hasBeforeAfter = beforeAfterImages.length >= 2

  let beforeImage = ''
  let afterImage = ''

  if (hasBeforeAfter) {
    const first = beforeAfterImages[0]
    const second = beforeAfterImages[1]
    beforeImage = getMediaUrl(first?.image as Media)
    afterImage = getMediaUrl(second?.image as Media)
  }

  // Decide which description to render: rich `details` if it has content,
  // otherwise fall back to the plain `shortDescription` (with markdown markers).
  const detailsHasContent = lexicalToPlain(project.details).trim().length > 0
  const fallbackShort = !detailsHasContent ? project.shortDescription || '' : ''

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-white relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Before/After Slider */}
        {hasBeforeAfter && beforeImage && afterImage && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-12 md:mb-16"
          >
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeLabel="BEFORE"
              afterLabel="AFTER"
            />
          </motion.div>
        )}

        {/* Description */}
        {detailsHasContent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="prose prose-base max-w-none [font-family:'Fahkwang',Helvetica] text-[#626161] prose-headings:[font-family:'Fahkwang',Helvetica] prose-headings:text-[#01190c] prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-[#626161] prose-p:leading-relaxed prose-strong:text-[#01190c] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-[#626161] prose-ol:text-[#626161] prose-li:text-[#626161] prose-blockquote:text-[#626161] prose-blockquote:border-primary"
          >
            <RichText
              data={project.details as DefaultTypedEditorState}
              enableGutter={false}
              enableProse={false}
            />
          </motion.div>
        )}
        {!detailsHasContent && fallbackShort && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed text-justify whitespace-pre-line">
              <FormattedText text={fallbackShort} />
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
