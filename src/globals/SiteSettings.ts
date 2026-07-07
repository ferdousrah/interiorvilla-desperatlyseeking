import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_site-settings')
        // Branding appears on every page (header, footer, JSON-LD, metadata)
        revalidatePath('/', 'layout')
      },
    ],
  },
  admin: {
    description:
      'Global branding & business info: site name, contact details, address, social links. Used across the whole site (SEO, structured data, footer, contact page).',
  },
  fields: [
    {
      name: 'brand',
      type: 'group',
      label: 'Brand',
      fields: [
        { name: 'name', type: 'text', defaultValue: 'Desperately Seeking', required: true },
        {
          name: 'tagline',
          type: 'text',
          defaultValue: 'Build Your Dream',
          admin: { description: 'Short tagline used as OG image subtitle and title suffix.' },
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'Desperately Seeking — discover our services, portfolio and stories.',
          admin: { description: 'Default meta/OG description and JSON-LD business description.' },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact',
      fields: [
        { name: 'phone', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'email', type: 'text' },
      ],
    },
    {
      name: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text', defaultValue: 'Dhaka' },
        { name: 'addressRegion', type: 'text', defaultValue: 'Dhaka' },
        { name: 'postalCode', type: 'text' },
        { name: 'addressCountry', type: 'text', defaultValue: 'BD' },
        {
          name: 'full',
          type: 'text',
          admin: { description: 'Full address as one line, shown on the contact page.' },
        },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      label: 'Map Location',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        {
          name: 'hasMap',
          type: 'text',
          admin: { description: 'Google Maps link to the business location.' },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Social Links',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'pinterest', type: 'text' },
      ],
    },
    {
      name: 'business',
      type: 'group',
      label: 'Business Info',
      fields: [
        {
          name: 'openingHours',
          type: 'text',
          defaultValue: 'Mo-Sa 10:00-19:00',
          admin: { description: 'schema.org format, e.g. "Mo-Sa 10:00-19:00".' },
        },
        { name: 'priceRange', type: 'text', defaultValue: '$$' },
        { name: 'areaServed', type: 'text', defaultValue: 'Bangladesh' },
      ],
    },
  ],
}

export default SiteSettings
