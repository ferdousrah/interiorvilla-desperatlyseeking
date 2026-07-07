import { CollectionConfig } from 'payload'

const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  access: { read: () => true },
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
      required: true,
      unique: true,
    },
  ],
}

export default BlogCategories
