import { CollectionConfig } from 'payload'

const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title', // 👈 this tells Payload to show the title in dropdowns
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text' },
    { name: 'pslug', type: 'text' },
  ],
}

export default ProjectCategories
