// src/collections/TeamMembers.ts
import type { CollectionConfig, PayloadRequest } from 'payload'
import { revalidatePath } from 'next/cache'
import slugify from 'slugify'
import { seoContentLexical } from '@/fields/seoContentLexical'

function absoluteFromReq(req: PayloadRequest, relPath: string): string {
  // Prefer serverURL if set (recommended)
  const serverURL = req?.payload?.config?.serverURL?.replace(/\/$/, '')
  if (serverURL) return `${serverURL}${relPath}`

  // Fall back to headers
  const host = req?.headers?.get('host') || ''
  const proto = (req?.headers?.get('x-forwarded-proto') || '').split(',')[0]?.trim() || 'https'
  return host ? `${proto}://${host}${relPath}` : relPath
}

const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  access: { read: () => true },
  admin: { useAsTitle: 'name' },
  defaultSort: 'position',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from the name. Used for the bio page URL (/our-designers/<slug>).',
      },
    },
    { name: 'designation', type: 'text' },
    { name: 'licenseNumber', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'photoUrl', type: 'text', admin: { readOnly: true } },
    {
      name: 'shortBio',
      type: 'textarea',
      admin: {
        description: 'One- or two-line summary shown on the team listing card and at the top of the bio page.',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      editor: seoContentLexical,
      admin: {
        description: 'Full bio shown on the member\'s individual page. Supports headings, bold, lists, links.',
      },
    },
    {
      name: 'specialties',
      type: 'array',
      admin: { description: 'Skill / focus tags shown as chips on the bio page.' },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      admin: { description: 'Optional LinkedIn profile URL (shown + used for Person schema sameAs).' },
    },
    {
      name: 'position',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Display order on the team page. Lower numbers appear first (CEO = 1).',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.name && !data?.slug) {
          data.slug =
            slugify(data.name, { lower: true, strict: true }) || `member-${Date.now()}`
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        revalidatePath('/our-designers')
        if ((doc as { slug?: string })?.slug) {
          revalidatePath(`/our-designers/${(doc as { slug?: string }).slug}`)
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidatePath('/our-designers')
        if ((doc as { slug?: string })?.slug) {
          revalidatePath(`/our-designers/${(doc as { slug?: string }).slug}`)
        }
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // depth>=1 case: photo is an object
        if (doc?.photo && typeof doc.photo === 'object' && (doc.photo as any).url) {
          doc.photoUrl = absoluteFromReq(req, (doc.photo as any).url)
          return doc
        }
        // depth=0 case: photo is an ID → look up media
        if (doc?.photo && (typeof doc.photo === 'string' || typeof doc.photo === 'number')) {
          try {
            const media = await req.payload.findByID({
              collection: 'media',
              id: doc.photo,
              depth: 0,
            })
            if (media?.url) doc.photoUrl = absoluteFromReq(req, media.url as string)
            // If your adapter doesn’t set .url, you can fallback to filename:
            // else if (media?.filename) doc.photoUrl = absoluteFromReq(req, `/media/${media.filename}`)
          } catch {
            /* ignore */
          }
        }
        return doc
      },
    ],
  },
}

export default TeamMembers
