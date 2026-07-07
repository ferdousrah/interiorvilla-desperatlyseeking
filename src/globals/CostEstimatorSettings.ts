import { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'

const CostEstimatorSettings: GlobalConfig = {
  slug: 'cost-estimator-settings',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag('global_cost-estimator-settings')
        revalidatePath('/cost-estimator')
      },
    ],
  },
  admin: {
    description:
      'Controls everything on the public Cost Estimator wizard at /cost-estimator. Changes go live within seconds — no rebuild required.',
  },
  fields: [
    // -------- Wizard copy --------
    {
      type: 'collapsible',
      label: 'Wizard Copy',
      fields: [
        {
          name: 'heroTitle',
          type: 'text',
          defaultValue: 'Calculate Your Dream Space Cost Instantly',
        },
        {
          name: 'heroSubtitle',
          type: 'textarea',
          defaultValue:
            'Get an approximate cost for your interior design project in just a few steps.',
        },
        {
          name: 'welcomeButtonLabel',
          type: 'text',
          defaultValue: 'Get Started',
        },
        {
          name: 'finalButtonLabel',
          type: 'text',
          defaultValue: 'Show Me Total Cost',
        },
        {
          name: 'disclaimer',
          type: 'textarea',
          defaultValue:
            'These are indicative estimates based on Bangladesh market rates. Actual pricing depends on materials, scope, finishes, and site conditions.',
        },
        {
          name: 'resultTitle',
          type: 'text',
          defaultValue: 'Here is your estimated cost',
        },
        {
          name: 'resultSubtitle',
          type: 'textarea',
          defaultValue:
            "Thanks! We've also sent these details to our team — they'll be in touch within one business day with a detailed quote.",
        },
      ],
    },
    // -------- Per-sft rates by tier --------
    {
      type: 'collapsible',
      label: 'Rates per Square Foot (BDT)',
      admin: {
        description:
          'Base rates by package tier. The rates are applied after computing total area from selected rooms.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'standardLow', label: 'Standard — Low', type: 'number', required: true, min: 0, defaultValue: 1500, admin: { width: '50%' } },
            { name: 'standardHigh', label: 'Standard — High', type: 'number', required: true, min: 0, defaultValue: 2500, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'premiumLow', label: 'Premium — Low', type: 'number', required: true, min: 0, defaultValue: 3000, admin: { width: '50%' } },
            { name: 'premiumHigh', label: 'Premium — High', type: 'number', required: true, min: 0, defaultValue: 4500, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'signatureLow', label: 'Signature — Low', type: 'number', required: true, min: 0, defaultValue: 5000, admin: { width: '50%' } },
            { name: 'signatureHigh', label: 'Signature — High', type: 'number', required: true, min: 0, defaultValue: 8000, admin: { width: '50%' } },
          ],
        },
      ],
    },
    // -------- Multipliers --------
    {
      type: 'collapsible',
      label: 'Multipliers',
      admin: {
        description:
          'Applied on top of the base rate. Final cost = baseRate × area × cityMultiplier × projectTypeMultiplier.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'cityMultiplierDhakaPrime', label: 'Dhaka — Prime (Gulshan/Banani/Baridhara)', type: 'number', required: true, defaultValue: 1.1, admin: { width: '50%', step: 0.05 } },
            { name: 'cityMultiplierDhakaOther', label: 'Dhaka — Other', type: 'number', required: true, defaultValue: 1.0, admin: { width: '50%', step: 0.05 } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'cityMultiplierChittagong', label: 'Chittagong', type: 'number', required: true, defaultValue: 0.95, admin: { width: '33%', step: 0.05 } },
            { name: 'cityMultiplierSylhet', label: 'Sylhet', type: 'number', required: true, defaultValue: 0.9, admin: { width: '33%', step: 0.05 } },
            { name: 'cityMultiplierOther', label: 'Other', type: 'number', required: true, defaultValue: 0.85, admin: { width: '34%', step: 0.05 } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'projectTypeMultiplierResidential', label: 'Residential', type: 'number', required: true, defaultValue: 1.0, admin: { width: '25%', step: 0.05 } },
            { name: 'projectTypeMultiplierSingleRoom', label: 'Single Room', type: 'number', required: true, defaultValue: 1.0, admin: { width: '25%', step: 0.05 } },
            { name: 'projectTypeMultiplierOffice', label: 'Office', type: 'number', required: true, defaultValue: 1.1, admin: { width: '25%', step: 0.05 } },
            { name: 'projectTypeMultiplierCommercial', label: 'Commercial', type: 'number', required: true, defaultValue: 1.15, admin: { width: '25%', step: 0.05 } },
          ],
        },
      ],
    },
    // -------- Default sft per room type --------
    {
      type: 'collapsible',
      label: 'Default Square Feet per Room',
      admin: {
        description:
          'Used to compute total project area from the rooms the user selects on Step 3. Tune to match typical Bangladesh apartment sizes.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'sftLivingRoom', label: 'Living Room', type: 'number', required: true, min: 0, defaultValue: 200, admin: { width: '33%' } },
            { name: 'sftKitchen', label: 'Kitchen', type: 'number', required: true, min: 0, defaultValue: 80, admin: { width: '33%' } },
            { name: 'sftBedroom', label: 'Bedroom', type: 'number', required: true, min: 0, defaultValue: 140, admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'sftBathroom', label: 'Bathroom', type: 'number', required: true, min: 0, defaultValue: 50, admin: { width: '33%' } },
            { name: 'sftDining', label: 'Dining', type: 'number', required: true, min: 0, defaultValue: 120, admin: { width: '33%' } },
            { name: 'sftFoyer', label: 'Foyer & Lobby', type: 'number', required: true, min: 0, defaultValue: 60, admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'sftFamilyLiving', label: 'Family Living', type: 'number', required: true, min: 0, defaultValue: 150, admin: { width: '50%' } },
            { name: 'sftStudy', label: 'Study Room', type: 'number', required: true, min: 0, defaultValue: 100, admin: { width: '50%' } },
          ],
        },
      ],
    },
    // -------- Add-on flat costs (per package tier) --------
    {
      type: 'collapsible',
      label: 'Add-on Costs (BDT, by Tier)',
      admin: {
        description:
          'Each add-on adds a flat amount on top of the room cost. The amount depends on the package tier the user selects on Step 5.',
      },
      fields: [
        {
          name: 'addOns',
          type: 'array',
          admin: {
            description: 'Add or remove add-ons. Each is shown as a checkbox under the relevant room on Step 4.',
            initCollapsed: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'key', label: 'Internal Key (no spaces)', type: 'text', required: true, admin: { width: '40%', description: 'e.g. wooden-ceiling-living' } },
                { name: 'label', label: 'Display Label', type: 'text', required: true, admin: { width: '60%' } },
              ],
            },
            {
              name: 'roomScope',
              label: 'Applies to',
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
                { label: 'Whole Project', value: 'whole-project' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'priceStandard', label: 'Standard (BDT)', type: 'number', required: true, min: 0, defaultValue: 0, admin: { width: '33%' } },
                { name: 'pricePremium', label: 'Premium (BDT)', type: 'number', required: true, min: 0, defaultValue: 0, admin: { width: '33%' } },
                { name: 'priceSignature', label: 'Signature (BDT)', type: 'number', required: true, min: 0, defaultValue: 0, admin: { width: '34%' } },
              ],
            },
          ],
        },
      ],
    },
    // -------- Package tier presentation (for Step 5 cards) --------
    {
      type: 'collapsible',
      label: 'Package Tier Cards (Step 5)',
      admin: {
        description: 'Visual cards shown on the package selection step. Each tier maps to the per-sft rates above.',
      },
      fields: [
        {
          name: 'packageStandard',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', defaultValue: 'Standard' },
            { name: 'description', type: 'textarea', defaultValue: 'A range of essential home interior solutions that\'s perfect for all your needs.' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'features',
              type: 'array',
              fields: [{ name: 'feature', type: 'text', required: true }],
              defaultValue: [
                { feature: 'Affordable pricing' },
                { feature: 'Convenient designs' },
                { feature: 'Basic accessories' },
              ],
            },
          ],
        },
        {
          name: 'packagePremium',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', defaultValue: 'Premium' },
            { name: 'description', type: 'textarea', defaultValue: 'Superior home interior solutions that will take your interiors to the next level.' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'features',
              type: 'array',
              fields: [{ name: 'feature', type: 'text', required: true }],
              defaultValue: [
                { feature: 'Mid-range pricing' },
                { feature: 'Premium designs' },
                { feature: 'Wide range of accessories' },
              ],
            },
          ],
        },
        {
          name: 'packageSignature',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', defaultValue: 'Signature' },
            { name: 'description', type: 'textarea', defaultValue: 'Super premium solutions that will take your home to the premium level.' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'features',
              type: 'array',
              fields: [{ name: 'feature', type: 'text', required: true }],
              defaultValue: [
                { feature: 'High-range pricing' },
                { feature: 'State-of-art designs' },
                { feature: 'Rich range of accessories' },
              ],
            },
          ],
        },
      ],
    },
    // -------- FAQ --------
    {
      type: 'collapsible',
      label: 'FAQ Section',
      admin: { description: 'Shown below the wizard. Also used for FAQPage JSON-LD (SEO).' },
      fields: [
        {
          name: 'faqs',
          type: 'array',
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
        },
      ],
    },
    // -------- SEO --------
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', defaultValue: 'Interior Design Cost Estimator Bangladesh | Desperately Seeking', validate: validateMetaTitle },
        { name: 'metaDescription', type: 'textarea', defaultValue: 'Calculate the cost of your interior design project in Bangladesh. Free instant estimate for residential, commercial, and office spaces.', validate: validateMetaDescription },
      ],
    },
  ],
}

export default CostEstimatorSettings
