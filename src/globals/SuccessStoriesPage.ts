import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const SuccessStoriesPage: GlobalConfig = {
  slug: 'success-stories-page',
  label: 'Client Success Stories (Page)',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_success-stories-page')
        revalidatePath('/client-success-stories')
      },
    ],
  },
  admin: {
    description:
      'Page copy for /client-success-stories. Video testimonials are managed in the "Testimonials" collection; written reviews in "Google Reviews".',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Client Success Stories' },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'introText',
      type: 'textarea',
      defaultValue:
        'Real projects, real clients, real transformations — hear directly from the people whose spaces we have designed.',
    },
    {
      name: 'videosSectionTitle',
      type: 'text',
      defaultValue: 'Video Stories',
    },
    {
      name: 'reviewsSectionTitle',
      type: 'text',
      defaultValue: 'What Clients Say',
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

export default SuccessStoriesPage
