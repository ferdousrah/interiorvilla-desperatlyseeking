import { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: {
    singular: 'Gallery Item',
    plural: 'Gallery Items',
  },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    description:
      'Photos and videos shown on the public /gallery page, organised by Gallery Category. Each item can optionally link to a page (e.g. a portfolio project).',
    defaultColumns: ['title', 'mediaType', 'category', 'position', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'gallery-categories',
      required: true,
    },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      defaultValue: 'photo',
      options: [
        { label: 'Photo', value: 'photo' },
        { label: 'Video', value: 'video' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'photo',
        description: 'The photo to display.',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: { mediaType?: string } }) => {
        if (siblingData?.mediaType === 'photo' && !value) {
          return 'Image is required for photo items'
        }
        return true
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
        description: 'YouTube video URL (e.g. https://youtu.be/...).',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: { mediaType?: string } }) => {
        if (siblingData?.mediaType === 'video' && !value) {
          return 'Video URL is required for video items'
        }
        return true
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description:
          'Optional. Where the item title links to — internal path (e.g. /portfolio/some-project) or full URL.',
      },
    },
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Display order within the gallery. Lower numbers appear first.',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath('/gallery')],
    afterDelete: [() => revalidatePath('/gallery')],
  },
}

export default GalleryItems
