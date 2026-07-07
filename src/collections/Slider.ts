import { CollectionConfig } from 'payload'

const Slider: CollectionConfig = {
  slug: 'slider',
  access: { read: () => true },
  fields: [
    {
      name: 'slider',
      type: 'group',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'textarea' },
        { name: 'position', type: 'text' },
        {
          name: 'ctaButton1',
          type: 'group',
          label: 'Primary CTA Button',
          fields: [
            { name: 'label', type: 'text', label: 'Button Label' },
            { name: 'url', type: 'text', label: 'Button URL' },
          ],
        },
        {
          name: 'ctaButton2',
          type: 'group',
          label: 'Secondary CTA Button',
          fields: [
            { name: 'label', type: 'text', label: 'Button Label' },
            { name: 'url', type: 'text', label: 'Button URL' },
          ],
        },
      ],
    },
  ],
}

export default Slider
