import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      // Legacy template field — kept (hidden) so the DB table isn't dropped;
      // the live menu is driven by menuItems/megaMenu below.
      name: 'navItems',
      type: 'array',
      admin: { hidden: true },
      fields: [link({ appearances: false })],
      maxRows: 6,
    },
    {
      name: 'menuItems',
      type: 'array',
      admin: {
        description:
          'Main navigation links (desktop + mobile). Leave empty to use the built-in defaults.',
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', admin: { description: 'e.g. /about. Ignored if "has mega menu" is checked.' } },
        {
          name: 'hasMegaMenu',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show the mega menu (configured below) under this item.' },
        },
      ],
    },
    {
      name: 'megaMenu',
      type: 'group',
      admin: {
        description: 'The dropdown mega menu shown under the nav item marked "has mega menu".',
      },
      fields: [
        {
          name: 'sections',
          type: 'array',
          maxRows: 3,
          admin: {
            description: 'Columns of the mega menu. Leave empty to use the built-in defaults.',
          },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'text' },
            {
              name: 'color',
              type: 'text',
              admin: { description: 'Title/accent color hex, e.g. #75BF44. Optional.' },
            },
            {
              name: 'backgroundColor',
              type: 'text',
              admin: { description: 'Column background hex, e.g. #C7E9C0. Optional.' },
            },
            { name: 'viewAllUrl', type: 'text', admin: { description: 'Where the column title links to.' } },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        { name: 'helpText', type: 'text', defaultValue: 'Need help choosing?' },
        { name: 'helpLinkText', type: 'text', defaultValue: 'Contact our experts' },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Get Consultation' },
        { name: 'buttonUrl', type: 'text', defaultValue: '/contact' },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
