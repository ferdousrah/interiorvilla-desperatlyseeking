import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const About: GlobalConfig = {
  slug: 'about',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_about')
        revalidatePath('/about')
      },
    ],
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'textarea' },
      ],
    },
    {
      name: 'introSection',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'introVideo', type: 'text' },
        {
          name: 'stats',
          type: 'array',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'value', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'ourApproach',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'approaches',
          type: 'array',
          fields: [
            { name: 'icon', type: 'upload', relationTo: 'media' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'missionVision',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'missionContent', type: 'richText' },
        { name: 'visionContent', type: 'richText' },
      ],
    },
    {
      name: 'teamSection',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'teamMembers',
          type: 'relationship',
          relationTo: 'team-members',
          hasMany: true,
        },
      ],
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

export default About
