import { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const GalleryCategories: CollectionConfig = {
  slug: 'gallery-categories',
  labels: {
    singular: 'Gallery Category',
    plural: 'Gallery Categories',
  },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    description:
      'Categories for the public /gallery page. Gallery items are assigned to these categories and shown as filter tabs.',
    defaultColumns: ['title', 'position', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Order of the category filter buttons. Lower numbers appear first.',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath('/gallery')],
    afterDelete: [() => revalidatePath('/gallery')],
  },
}

export default GalleryCategories
