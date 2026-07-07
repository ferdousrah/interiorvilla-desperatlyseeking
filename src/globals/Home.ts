import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { seoContentLexical } from '@/fields/seoContentLexical'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const Home: GlobalConfig = {
  slug: 'home',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_home')
        revalidatePath('/')
      },
    ],
  },
  fields: [
    {
      name: 'featuredWorks',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'sectionDescription', type: 'textarea' },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'aboutSection',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'shortDescription', type: 'textarea' },
        {
          name: 'beforeAfterImages',
          type: 'array',
          fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
        },
        {
          name: 'highlights',
          type: 'array',
          fields: [
            { name: 'text', type: 'text' },
            { name: 'desc', type: 'text' },
          ],
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'servicesSection',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'shortDescription', type: 'textarea' },
        {
          name: 'services',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'ourProcess',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'shortDescription', type: 'textarea' },
        {
          name: 'steps',
          type: 'array',
          fields: [
            { name: 'icon', type: 'upload', relationTo: 'media' },
            { name: 'title', type: 'text' },
          ],
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'clientStories',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text' },
        { name: 'shortDescription', type: 'textarea' },
        {
          name: 'testimonials',
          type: 'relationship',
          relationTo: 'testimonials',
          hasMany: true,
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'googleReviews',
      type: 'group',
      fields: [
        { name: 'sectionTitle', type: 'text', defaultValue: 'Google Reviews' },
        {
          name: 'shortDescription',
          type: 'textarea',
          defaultValue: 'See what our clients say about us on Google',
        },
        {
          name: 'overallRating',
          type: 'number',
          min: 0,
          max: 5,
          admin: { description: 'Overall Google rating (e.g. 4.8)', step: 0.1 },
        },
        {
          name: 'totalReviews',
          type: 'number',
          admin: { description: 'Total number of Google reviews' },
        },
        {
          name: 'googleReviewUrl',
          type: 'text',
          admin: {
            description: 'Link to your Google Business review page',
          },
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'faqSection',
      type: 'group',
      fields: [
        { name: 'sectionLabel', type: 'text', defaultValue: 'FAQ' },
        {
          name: 'titlePrimary',
          type: 'text',
          defaultValue: 'Frequently Asked',
          admin: { description: 'First part of the heading (rendered in dark text)' },
        },
        {
          name: 'titleHighlight',
          type: 'text',
          defaultValue: 'Questions',
          admin: { description: 'Highlighted part of the heading (rendered in accent color)' },
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            "Have questions about our interior design services? We've answered the most common ones below. Can't find what you're looking for?",
        },
        { name: 'viewAllLabel', type: 'text', defaultValue: 'View All FAQs' },
        { name: 'viewAllUrl', type: 'text', defaultValue: '/faq' },
        { name: 'askDirectlyLabel', type: 'text', defaultValue: 'Ask Us Directly' },
        { name: 'askDirectlyUrl', type: 'text', defaultValue: '/contact' },
        {
          name: 'faqs',
          type: 'array',
          admin: {
            description:
              'FAQs displayed on the home page. The first FAQ is open by default. Also used to render FAQPage JSON-LD for SEO.',
          },
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
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
          'Keyword-rich content shown at the bottom of the home page in a collapsible "Read More" section. Helps Google understand what this page is about. Supports H1–H6, paragraphs, lists, blockquote, and more.',
      },
    },
  ],
}

export default Home
