import { CollectionConfig } from 'payload'

const GoogleReviews: CollectionConfig = {
  slug: 'google-reviews',
  access: { read: () => true },
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'rating', 'reviewDate'],
  },
  fields: [
    { name: 'reviewerName', type: 'text', required: true },
    {
      name: 'reviewerPhoto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile photo of the reviewer',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Star rating (1-5)',
      },
    },
    {
      name: 'reviewText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'reviewDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
  ],
}

export default GoogleReviews
