'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'

interface PerformanceImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  sizes?: string
  style?: React.CSSProperties
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fill?: boolean
}

// Simple blur placeholder for dynamic images
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

export const PerformanceImage: React.FC<PerformanceImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  loading,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.webp',
  sizes = '100vw',
  style,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fill = true,
}) => {
  // Ensure we never have an empty src
  const validSrc = src && src.trim() !== '' ? src : fallbackSrc
  const [imageSrc, setImageSrc] = useState(validSrc)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
      onError?.()
    }
  }, [imageSrc, fallbackSrc, onError])

  // Generate blur placeholder if not provided
  const blurPlaceholder = blurDataURL || `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`

  if (hasError) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          Image failed to load
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill && !width && !height}
        width={!fill || width ? width : undefined}
        height={!fill || height ? height : undefined}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : loading || 'lazy'}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? blurPlaceholder : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className="object-cover"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
