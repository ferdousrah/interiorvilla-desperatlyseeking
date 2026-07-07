import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'

// If your uploads live elsewhere, change this:
const UPLOAD_DIR = path.join(process.cwd(), 'media') // ← adjust if needed
const PUBLIC_URL_PREFIX = '/media' // Payload serves uploads here

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'small',
        width: 600,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'medium',
        width: 900,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'large',
        width: 1400,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'xlarge',
        width: 1920,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'blur',
        width: 20,
        height: 20,
        position: 'centre',
        // ✅ This is the correct way now
        formatOptions: {
          format: 'webp',
        }, // ensures webp output
        withoutEnlargement: true,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true,
      },
    ],
  },

  //upload: true, // keep simple, rely on project defaults
  // 👇 Access rules
  access: {
    // Anyone (no login) can read media + hit file endpoints
    read: () => true,

    // Only logged-in users can create/update/delete
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      localized: false,
      admin: { description: 'Short, descriptive alt text for accessibility & SEO' },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      required: false,
    },
  ],

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data?.alt && typeof data?.filename === 'string' && data.filename.length > 0) {
          const base = data.filename.replace(/\.[^.]+$/, '')
          const cleaned = base
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          if (cleaned) {
            data.alt = cleaned
              .split(' ')
              .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
              .join(' ')
          }
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        // Helper to fix old CMS URLs - converts to relative paths
        const fixOldUrl = (url: string | undefined): string | undefined => {
          if (!url) return url
          // Replace old CMS domain to make URLs relative
          return url
            .replace('https://cms.desperatelyseeking.xyz', '')
            .replace('http://cms.desperatelyseeking.xyz', '')
        }

        try {
          const base = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://desperatelyseeking.xyz'

          // Fix main URL
          if ((doc as any)?.url) {
            const fixedUrl = fixOldUrl((doc as any).url as string) || ''
            if ((doc as any)?.updatedAt) {
              const u = new URL(fixedUrl, base)
              u.searchParams.set('v', String(new Date((doc as any).updatedAt as string).getTime()))
              ;(doc as any).url = u.pathname + u.search
            } else {
              ;(doc as any).url = fixedUrl
            }
          }

          // Fix thumbnail URL
          if ((doc as any)?.thumbnailURL) {
            ;(doc as any).thumbnailURL = fixOldUrl((doc as any).thumbnailURL)
          }

          // Fix sizes URLs
          if ((doc as any)?.sizes) {
            for (const sizeName of Object.keys((doc as any).sizes)) {
              const sizeData = (doc as any).sizes[sizeName]
              if (sizeData?.url) {
                sizeData.url = fixOldUrl(sizeData.url)
              }
            }
          }

          // DEV convenience: when MEDIA_BASE_URL is set (e.g. local dev
          // pointing at the production DB without the uploaded files on
          // disk), serve media straight from that host instead of the
          // local filesystem. Leave UNSET in production.
          const mediaBase = process.env.MEDIA_BASE_URL?.replace(/\/$/, '')
          if (mediaBase) {
            const prefix = (u: string | undefined): string | undefined =>
              u && u.startsWith('/') ? `${mediaBase}${u}` : u
            if ((doc as any)?.url) (doc as any).url = prefix((doc as any).url)
            if ((doc as any)?.thumbnailURL)
              (doc as any).thumbnailURL = prefix((doc as any).thumbnailURL)
            if ((doc as any)?.sizes) {
              for (const sizeName of Object.keys((doc as any).sizes)) {
                const sizeData = (doc as any).sizes[sizeName]
                if (sizeData?.url) sizeData.url = prefix(sizeData.url)
              }
            }
          }
        } catch {
          /* ignore */
        }
        return doc
      },
    ],
  },
}
