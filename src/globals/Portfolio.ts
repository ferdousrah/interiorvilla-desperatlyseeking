import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const Portfolio: GlobalConfig = {
  slug: 'portfolio',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_portfolio')
        revalidatePath('/portfolio')
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
  {
    name: 'seoContent',
    label: 'SEO Content Block',
    type: 'richText',
    editor: seoContentLexical,
    admin: {
      description:
        'Keyword-rich content shown at the bottom of the page in a collapsible "Read More" section. Helps Google understand what this page is about. Supports H1–H6, paragraphs, lists, blockquote, and more.',
    },
  },
  ],
}

export default Portfolio
