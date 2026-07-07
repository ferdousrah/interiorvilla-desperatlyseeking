import { CollectionConfig } from 'payload'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'shortDetails', type: 'textarea' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'Paste the video URL (YouTube, Vimeo, etc.)',
      },
    },
  ],
}

export default Testimonials
