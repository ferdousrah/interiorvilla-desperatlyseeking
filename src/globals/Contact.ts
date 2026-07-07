import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const Contact: GlobalConfig = {
  slug: 'contact',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_contact')
        revalidatePath('/contact')
      },
    ],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'textarea' },
      ],
    },
    {
      name: 'introText',
      type: 'textarea',
    },
    {
      name: 'offices',
      type: 'relationship',
      relationTo: 'offices',
      hasMany: true,
    },
    {
      name: 'seoDetails',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', validate: validateMetaTitle },
        { name: 'metaDescription', type: 'textarea', validate: validateMetaDescription },
        { name: 'metaKey', type: 'text' },
        {
          name: 'seoStructuredData',
          label: 'Custom JSON-LD',
          type: 'textarea',
          admin: {
            description: 'Paste valid JSON for structured data',
          },
        },
      ],
    },
  ],
}

export default Contact
