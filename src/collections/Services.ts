import { CollectionConfig } from 'payload'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'
import { revalidateService } from '@/utilities/revalidateCollection'
import { upsertSlugRedirect } from '@/utilities/slugRedirect'

const Services: CollectionConfig = {
  slug: 'services',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug (e.g., residential-interior)',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'introVideo',
      type: 'text',
      admin: {
        description: 'Optional video link or embed code',
      },
    },
    {
      name: 'ColorCode',
      type: 'text',
      required: true,
    },
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
      name: 'introSection',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'description', type: 'richText', editor: seoContentLexical },
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
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'recentProjects',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'sectionDescription', type: 'textarea' },
        {
          name: 'projects',
          type: 'relationship',
          relationTo: 'projects',
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
          name: 'ogImage',
          label: 'OG Image (Social Share Image)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image shown when page is shared on Facebook, WhatsApp, LinkedIn (1200x630px recommended)',
          },
        },
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
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'update' && originalDoc?.slug && data?.slug && originalDoc.slug !== data.slug) {
          await upsertSlugRedirect(
            req.payload,
            `/services/${originalDoc.slug}`,
            `/services/${data.slug}`,
          )
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) =>
        revalidateService(
          doc as { slug?: string | null },
          previousDoc as { slug?: string | null } | undefined,
        ),
    ],
    afterDelete: [
      ({ doc }) => revalidateService(doc as { slug?: string | null }),
    ],
  },
}

export default Services
