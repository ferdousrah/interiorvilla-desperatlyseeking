import { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'
import { revalidateProject } from '@/utilities/revalidateCollection'
import { upsertSlugRedirect } from '@/utilities/slugRedirect'

const Projects: CollectionConfig = {
  slug: 'projects',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title', // 👈 this tells Payload to show the title in dropdowns
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: false,
      admin: {
        readOnly: false, // prevents manual editing in admin panel
      },
    },
    { name: 'category', type: 'relationship', relationTo: 'project-categories' },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'year', type: 'text' },
    { name: 'size', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'client', type: 'text' },
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
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    // 👇 New field: Featured on Home
    {
      name: 'featuredOnHome',
      label: 'Featured on Home',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar', // optional: keeps it visible in the sidebar
        description: 'Check if this project should appear on the homepage',
      },
    },
    {
      name: 'isResidential',
      label: 'Is Residential?',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar', // optional: keeps it visible in the sidebar
        description: 'Check if this project parent is a residential project',
      },
    },
    {
      name: 'isCommercial',
      label: 'Is Commercial?',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar', // optional: keeps it visible in the sidebar
        description: 'Check if this project parent is a commercial project',
      },
    },
    {
      name: 'isArchitectural',
      label: 'Is Architectural?',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar', // optional: keeps it visible in the sidebar
        description: 'Check if this project parent is a architectural project',
      },
    },
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Use for ordering projects on the homepage. Lower numbers appear first.',
        position: 'sidebar',
      },
    },
    {
      name: 'portfolioPosition',
      type: 'number',
      admin: {
        description: 'Use for ordering projects on the portfolio page. Lower numbers appear first.',
        position: 'sidebar',
      },
    },
    {
      name: 'beforeAfterImages',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    { name: 'details', type: 'richText', editor: seoContentLexical },
    {
      name: 'gallery',
      type: 'group',
      fields: [
        {
          name: 'photos',
          type: 'array',
          fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
        },
        { name: 'videos', type: 'array', fields: [{ name: 'videoUrl', type: 'text' }] },
        {
          name: 'plans',
          type: 'array',
          fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        // Generate the slug from the title ONLY when there is no slug yet
        // (i.e. on create). After creation the slug is stable — editing the
        // title will NOT change the URL. This lets us rewrite titles/H1s to
        // fix keyword cannibalization without churning indexed URLs.
        // To intentionally rename a slug, edit the slug field directly; the
        // beforeChange hook below records a redirect from the old path.
        if (data?.title && !data?.slug && !originalDoc?.slug) {
          data.slug = slugify(data.title, { lower: true, strict: true })
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        // Auto-track slug renames so every old URL keeps working.
        if (operation === 'update' && originalDoc?.slug && data?.slug && originalDoc.slug !== data.slug) {
          await upsertSlugRedirect(
            req.payload,
            `/portfolio/${originalDoc.slug}`,
            `/portfolio/${data.slug}`,
          )
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) =>
        revalidateProject(
          doc as { slug?: string | null; featuredOnHome?: boolean | null },
          previousDoc as { slug?: string | null } | undefined,
        ),
    ],
    afterDelete: [
      ({ doc }) =>
        revalidateProject(doc as { slug?: string | null; featuredOnHome?: boolean | null }),
    ],
  },
}

export default Projects
