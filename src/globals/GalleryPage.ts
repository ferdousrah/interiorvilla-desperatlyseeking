import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  label: 'Gallery (Page)',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_gallery-page')
        revalidatePath('/gallery')
      },
    ],
  },
  admin: {
    description:
      'Page copy for /gallery. Photos and videos are pulled automatically from the galleries of all Projects, grouped by Project Category.',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Gallery' },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'introText',
      type: 'textarea',
      defaultValue:
        'Browse photos and videos from our completed projects — filter by category to find the style you love.',
    },
    {
      name: 'seoDetails',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', validate: validateMetaTitle },
        { name: 'metaDescription', type: 'textarea', validate: validateMetaDescription },
      ],
    },
  ],
}

export default GalleryPage
