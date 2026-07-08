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
        {
          name: 'sectionTitle',
          type: 'text',
          defaultValue: 'Services We Offer',
          admin: { description: 'The last word is rendered in the accent color.' },
        },
        {
          name: 'shortDescription',
          type: 'textarea',
          defaultValue:
            "From consultation to installation, we handle all your interior design needs, whether it's your home, office, or a large-scale project.",
        },
        {
          name: 'cards',
          type: 'array',
          maxRows: 3,
          admin: {
            description:
              'The 3 service cards. Leave empty to use the built-in defaults. Icon and hover video are optional.',
          },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'link', type: 'text', admin: { description: 'e.g. /services/residential-interior' } },
            { name: 'icon', type: 'upload', relationTo: 'media' },
            {
              name: 'videoUrl',
              type: 'text',
              admin: { description: 'Optional background video shown on hover, e.g. /videos/residential.mp4' },
            },
          ],
        },
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
        {
          name: 'sectionTitle',
          type: 'text',
          defaultValue: 'Our Process',
          admin: { description: 'The last word is rendered in the accent color.' },
        },
        {
          name: 'shortDescription',
          type: 'textarea',
          defaultValue:
            'Follow our proven 5-step journey that transforms your vision into extraordinary reality',
        },
        {
          name: 'steps',
          type: 'array',
          admin: {
            description: 'Process steps. Leave empty to use the built-in 5 defaults.',
          },
          fields: [
            { name: 'icon', type: 'upload', relationTo: 'media' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            {
              name: 'color',
              type: 'text',
              admin: { description: 'Accent color hex, e.g. #6366F1. Optional.' },
            },
          ],
        },
        { name: 'backgroundColor', type: 'text' },
      ],
    },
    {
      name: 'clientStories',
      type: 'group',
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          defaultValue: 'Client Stories',
          admin: { description: 'The last word is rendered in the accent color.' },
        },
        {
          name: 'shortDescription',
          type: 'textarea',
          defaultValue: 'We create spaces that inspire and reflect your unique lifestyle',
        },
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
      name: 'blogSection',
      type: 'group',
      fields: [
        { name: 'sectionLabel', type: 'text', defaultValue: 'BLOG' },
        {
          name: 'sectionTitle',
          type: 'text',
          defaultValue: 'Latest Stories',
          admin: { description: 'The last word is rendered in the accent color.' },
        },
        { name: 'viewAllLabel', type: 'text', defaultValue: 'View All Blogs' },
        { name: 'viewAllUrl', type: 'text', defaultValue: '/blog' },
      ],
    },
    {
      name: 'ctaSection',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Ready to Transform Your Space?',
        },
        {
          name: 'highlightWord',
          type: 'text',
          defaultValue: 'Transform',
          admin: {
            description: 'This word inside the title is rendered in the accent color.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            "Whether you're renovating, building from scratch, or simply looking to refresh your space, our team is ready to bring your vision to life.",
        },
        { name: 'primaryButtonLabel', type: 'text', defaultValue: 'Book an Appointment' },
        { name: 'primaryButtonUrl', type: 'text', defaultValue: '/book-appointment' },
        { name: 'secondaryButtonLabel', type: 'text', defaultValue: 'Contact Us' },
        { name: 'secondaryButtonUrl', type: 'text', defaultValue: '/contact' },
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
