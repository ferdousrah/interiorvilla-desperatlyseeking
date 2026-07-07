'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  altBefore?: string
  altAfter?: string
}

const FALLBACK_IMAGE = '/placeholder.webp'

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  altBefore = 'Before image',
  altAfter = 'After image',
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure we have valid image sources
  const validBeforeImage = beforeImage && beforeImage.trim() !== '' ? beforeImage : FALLBACK_IMAGE
  const validAfterImage = afterImage && afterImage.trim() !== '' ? afterImage : FALLBACK_IMAGE

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percentage)
    },
    []
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    },
    [isDragging, handleMove]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX)
      }
    },
    [isDragging, handleMove]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX)
    },
    [handleMove]
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[704/521] max-w-[730px] overflow-hidden rounded-md cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* After Image (Full background) */}
      <div className="absolute inset-0">
        <Image
          src={validAfterImage}
          alt={altAfter}
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 768px) 100vw, 730px"
        />
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={validBeforeImage}
          alt={altBefore}
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 768px) 100vw, 730px"
        />
      </div>

      {/* Slider Line and Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize transition-transform hover:scale-110"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          <div className="flex items-center gap-0.5">
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <svg
              className="w-3 h-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded">
        Before
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded">
        After
      </div>
    </div>
  )
}
