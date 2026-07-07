import { CollectionConfig } from 'payload'
import { seoContentLexical } from '@/fields/seoContentLexical'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'
import { revalidateServiceArea } from '@/utilities/revalidateCollection'
import { upsertSlugRedirect } from '@/utilities/slugRedirect'

const ServiceArea: CollectionConfig = {
  slug: 'service-areas',
  access: { read: () => true },
  admin: {
    useAsTitle: 'areaName',
  },
  fields: [
    {
      name: 'areaName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'fullContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'googleEmbedCode',
      label: 'Google Map Embed Code',
      type: 'textarea',
      admin: {
        description: 'Paste Google Maps iframe embed code',
      },
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
            `/service-areas/${originalDoc.slug}`,
            `/service-areas/${data.slug}`,
          )
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) =>
        revalidateServiceArea(
          doc as { slug?: string | null },
          previousDoc as { slug?: string | null } | undefined,
        ),
    ],
    afterDelete: [
      ({ doc }) => revalidateServiceArea(doc as { slug?: string | null }),
    ],
  },
}

export default ServiceArea
