import { CollectionConfig } from 'payload'

const Offices: CollectionConfig = {
  slug: 'offices',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'address', type: 'textarea', required: true },
    { name: 'latitude', type: 'number' },
    { name: 'longitude', type: 'number' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
  ],
}

export default Offices
