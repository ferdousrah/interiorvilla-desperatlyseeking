import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  // Cast needed: with @react-three/fiber's JSX augmentation in the type
  // graph, the union of all element types collapses `children` to `never`
  // (even via React.ElementType). Runtime behavior is unchanged.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (htmlElement || Fragment) as any

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
    </Tag>
  )
}
