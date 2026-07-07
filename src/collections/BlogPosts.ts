import { CollectionConfig } from 'payload'
import slugify from 'slugify'
import {
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'
import { revalidateBlogPost } from '@/utilities/revalidateCollection'
import { upsertSlugRedirect } from '@/utilities/slugRedirect'

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
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
      unique: true,
      admin: {
        description: 'Auto-generated from the title. You can override it manually.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'fullContent',
      type: 'richText',
      editor: lexicalEditor({
        // defaultFeatures already includes bold/italic/underline/strikethrough,
        // inline-code, sub/superscript, headings, ordered+unordered+check lists,
        // blockquote, links, uploads, horizontal-rule, align & indent. We add
        // the table feature (not in defaults) so the blog editor supports
        // everything Lexical offers.
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          EXPERIMENTAL_TableFeature(),
        ],
      }),
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'blog-categories',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
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
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data?.title || data?.slug) return data

        const base =
          slugify(data.title, { lower: true, strict: true }) || `post-${Date.now()}`

        let candidate = base
        let counter = 2
        // Append -2, -3, ... until we find an unused slug. Exclude the
        // current doc on update so a post doesn't clash with itself.
        while (true) {
          const where: Record<string, unknown> = { slug: { equals: candidate } }
          if (operation === 'update' && originalDoc?.id) {
            where.id = { not_equals: originalDoc.id }
          }
          const existing = await req.payload.find({
            collection: 'blog-posts',
            where: where as never,
            limit: 1,
            depth: 0,
          })
          if (existing.totalDocs === 0) break
          candidate = `${base}-${counter}`
          counter++
        }

        data.slug = candidate
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'update' && originalDoc?.slug && data?.slug && originalDoc.slug !== data.slug) {
          await upsertSlugRedirect(
            req.payload,
            `/blog/${originalDoc.slug}`,
            `/blog/${data.slug}`,
          )
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) =>
        revalidateBlogPost(
          doc as { slug?: string | null },
          previousDoc as { slug?: string | null } | undefined,
        ),
    ],
    afterDelete: [
      ({ doc }) => revalidateBlogPost(doc as { slug?: string | null }),
    ],
  },
}

export default BlogPosts
