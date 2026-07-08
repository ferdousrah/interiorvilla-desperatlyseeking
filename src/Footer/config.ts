import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'headline',
      type: 'textarea',
      defaultValue: "Let's Work Together and\nCreate Something Extraordinary!",
      admin: {
        description: 'Big footer heading. Line breaks are preserved.',
      },
    },
    {
      name: 'quickLinks',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Quick Links' },
        {
          name: 'links',
          type: 'array',
          admin: { description: 'Leave empty to use the built-in defaults.' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'importantLinks',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Important Links' },
        {
          name: 'links',
          type: 'array',
          admin: { description: 'Leave empty to use the built-in defaults.' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'contactTitle',
      type: 'text',
      defaultValue: 'Contact Us',
    },
    {
      name: 'serviceAreasTitle',
      type: 'text',
      defaultValue: 'Service Areas',
    },
    {
      name: 'copyrightText',
      type: 'text',
      admin: {
        description:
          'Text after the © year. Leave empty to use the site name from Site Settings.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
