import { CollectionConfig } from 'payload'

const CostEstimates: CollectionConfig = {
  slug: 'cost-estimates',
  labels: {
    singular: 'Cost Estimate Lead',
    plural: 'Cost Estimate Leads',
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'phone',
      'projectType',
      'packageTier',
      'estimatedMaxBdt',
      'status',
      'createdAt',
    ],
    description:
      'Leads submitted through the public Cost Estimator wizard at /cost-estimator. Estimated values are calculated server-side from current admin rates.',
  },
  fields: [
    // ----- Contact -----
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: 120 },
        { name: 'phone', type: 'text', required: true, maxLength: 32 },
        { name: 'email', type: 'email', required: false, admin: { description: 'Optional.' } },
        { name: 'location', type: 'text', required: false, maxLength: 200, admin: { description: 'Free-form, e.g. "Banani, Dhaka".' } },
        { name: 'smsConsent', type: 'checkbox', defaultValue: false, label: 'Opted in to SMS updates' },
      ],
    },
    // ----- Project Scope -----
    {
      type: 'collapsible',
      label: 'Project',
      fields: [
        {
          name: 'projectType',
          type: 'select',
          required: true,
          options: [
            { label: 'Full Home', value: 'full-home' },
            { label: 'Single Room', value: 'single-room' },
            { label: 'Office', value: 'office' },
            { label: 'Commercial', value: 'commercial' },
          ],
        },
        {
          name: 'flatStatus',
          type: 'select',
          required: false,
          options: [
            { label: 'Ready for Interior', value: 'ready' },
            { label: 'Not Ready', value: 'not-ready' },
            { label: 'Under Construction', value: 'under-construction' },
          ],
        },
        {
          name: 'city',
          type: 'select',
          required: true,
          options: [
            { label: 'Dhaka — Gulshan / Banani / Baridhara', value: 'dhaka-prime' },
            { label: 'Dhaka — Other', value: 'dhaka-other' },
            { label: 'Chittagong', value: 'chittagong' },
            { label: 'Sylhet', value: 'sylhet' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'packageTier',
          type: 'select',
          required: true,
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Premium', value: 'premium' },
            { label: 'Signature', value: 'signature' },
          ],
        },
        {
          name: 'rooms',
          type: 'array',
          required: false,
          admin: { description: 'Rooms the user selected on Step 3.' },
          fields: [
            {
              name: 'roomType',
              type: 'select',
              required: true,
              options: [
                { label: 'Living Room', value: 'living-room' },
                { label: 'Kitchen', value: 'kitchen' },
                { label: 'Bedroom', value: 'bedroom' },
                { label: 'Bathroom', value: 'bathroom' },
                { label: 'Dining', value: 'dining' },
                { label: 'Foyer & Lobby', value: 'foyer' },
                { label: 'Family Living', value: 'family-living' },
                { label: 'Study Room', value: 'study' },
              ],
            },
            { name: 'count', type: 'number', required: true, min: 0, max: 20 },
          ],
        },
        {
          name: 'addOns',
          type: 'array',
          required: false,
          admin: { description: 'Add-on keys the user selected on Step 4.' },
          fields: [
            { name: 'key', type: 'text', required: true },
            { name: 'label', type: 'text', required: false },
          ],
        },
        {
          name: 'totalSft',
          type: 'number',
          required: false,
          admin: { readOnly: true, description: 'Computed total area in sft (server-calculated).' },
        },
        {
          name: 'notes',
          type: 'textarea',
          required: false,
          maxLength: 2000,
        },
      ],
    },
    // ----- Estimate (server-computed) -----
    {
      type: 'collapsible',
      label: 'Estimate',
      fields: [
        { name: 'estimatedMinBdt', type: 'number', required: true, min: 0, admin: { readOnly: true } },
        { name: 'estimatedMaxBdt', type: 'number', required: true, min: 0, admin: { readOnly: true } },
      ],
    },
    // ----- Workflow status (sidebar) -----
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Converted', value: 'converted' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    // ----- Tracking -----
    {
      type: 'collapsible',
      label: 'Tracking',
      admin: { initCollapsed: true },
      fields: [
        { name: 'pageUrl', type: 'text', required: false, admin: { readOnly: true } },
        { name: 'ipAddress', type: 'text', required: false, admin: { readOnly: true } },
        { name: 'userAgent', type: 'text', required: false, admin: { readOnly: true } },
      ],
    },
  ],
  timestamps: true,
}

export default CostEstimates
