import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const CeoMessage: GlobalConfig = {
  slug: 'ceo-message',
  label: 'Message from CEO',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_ceo-message')
        revalidatePath('/message-from-ceo')
      },
    ],
  },
  admin: {
    description: 'Content for the public "Message from CEO" page at /message-from-ceo.',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Message from the CEO' },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'ceoName', type: 'text', defaultValue: 'Md Ashikur Rahman' },
    { name: 'ceoTitle', type: 'text', defaultValue: 'Founder & CEO, Desperately Seeking' },
    {
      name: 'stats',
      label: 'Credentials / Stats',
      type: 'array',
      admin: {
        description:
          'Small stat highlights shown under the CEO photo (e.g. 9+ Years of Experience). 2–3 work best.',
      },
      defaultValue: [
        { value: '9+', label: 'Years of Experience' },
        { value: '700+', label: 'Projects Delivered' },
        { value: '5.0', label: 'Google Rating' },
      ],
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'ceoPhoto',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Portrait photo shown beside the message.' },
    },
    {
      name: 'quote',
      type: 'textarea',
      admin: { description: 'Short pull-quote highlighted at the top of the message.' },
    },
    {
      name: 'message',
      type: 'richText',
      editor: seoContentLexical,
      admin: { description: 'The full CEO message. Supports headings, bold, lists, etc.' },
    },
    {
      name: 'signatureImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional signature image shown below the message.' },
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

export default CeoMessage
