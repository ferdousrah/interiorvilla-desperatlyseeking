import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const DesignersPage: GlobalConfig = {
  slug: 'designers-page',
  label: 'Meet Our Team (Page)',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_designers-page')
        revalidatePath('/our-designers')
      },
    ],
  },
  admin: {
    description:
      'Page copy for /our-designers. The designers themselves are managed in the "Team Members" collection.',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Meet Our Team' },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'introText',
      type: 'textarea',
      defaultValue:
        'The creative minds behind every Desperately Seeking project — architects, interior designers, and project managers who turn your vision into reality.',
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

export default DesignersPage
