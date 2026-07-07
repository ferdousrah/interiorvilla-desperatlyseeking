// Local types for the Cost Estimator wizard. Mirrors the
// `cost-estimator-settings` global and the `cost-estimates` collection.

export type ProjectType = 'full-home' | 'single-room' | 'office' | 'commercial'

export type FlatStatus = 'ready' | 'not-ready' | 'under-construction'

export type CityKey =
  | 'dhaka-prime'
  | 'dhaka-other'
  | 'chittagong'
  | 'sylhet'
  | 'other'

export type PackageTier = 'standard' | 'premium' | 'signature'

export type RoomType =
  | 'living-room'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'dining'
  | 'foyer'
  | 'family-living'
  | 'study'

export type AddOnRoomScope = RoomType | 'whole-project'

export type AddOnDefinition = {
  key: string
  label: string
  roomScope: AddOnRoomScope
  priceStandard: number
  pricePremium: number
  priceSignature: number
}

export type PackageCard = {
  title?: string | null
  description?: string | null
  image?:
    | {
        url?: string | null
        alt?: string | null
        sizes?: { medium?: { url?: string | null } | null } | null
      }
    | number
    | null
  features?: { feature: string; id?: string | null }[] | null
}

export type CostEstimatorSettings = {
  // Wizard copy
  heroTitle?: string | null
  heroSubtitle?: string | null
  welcomeButtonLabel?: string | null
  finalButtonLabel?: string | null
  disclaimer?: string | null
  resultTitle?: string | null
  resultSubtitle?: string | null
  // Per-sft rates by tier
  standardLow: number
  standardHigh: number
  premiumLow: number
  premiumHigh: number
  signatureLow: number
  signatureHigh: number
  // Multipliers
  cityMultiplierDhakaPrime: number
  cityMultiplierDhakaOther: number
  cityMultiplierChittagong: number
  cityMultiplierSylhet: number
  cityMultiplierOther: number
  projectTypeMultiplierResidential: number
  projectTypeMultiplierSingleRoom: number
  projectTypeMultiplierOffice: number
  projectTypeMultiplierCommercial: number
  // Default sft per room
  sftLivingRoom: number
  sftKitchen: number
  sftBedroom: number
  sftBathroom: number
  sftDining: number
  sftFoyer: number
  sftFamilyLiving: number
  sftStudy: number
  // Add-ons
  addOns?: (AddOnDefinition & { id?: string | null })[] | null
  // Packages (visual cards)
  packageStandard?: PackageCard | null
  packagePremium?: PackageCard | null
  packageSignature?: PackageCard | null
  // FAQ
  faqs?: { question: string; answer: string; id?: string | null }[] | null
  // SEO
  metaTitle?: string | null
  metaDescription?: string | null
}

export type WizardSelection = {
  projectType: ProjectType
  flatStatus?: FlatStatus
  city: CityKey
  rooms: { roomType: RoomType; count: number }[]
  addOns: string[] // selected add-on keys
  packageTier: PackageTier
  // commercial/office can supply a manual sft instead of room counts
  manualSft?: number
}

export type EstimatorResult = {
  totalSft: number
  baseRateLow: number
  baseRateHigh: number
  cityMultiplier: number
  projectTypeMultiplier: number
  addOnsTotalBdt: number
  minBdt: number
  maxBdt: number
  midBdt: number
}

export type SubmitLeadInput = WizardSelection & {
  name: string
  phone: string
  email?: string
  location?: string
  smsConsent?: boolean
  notes?: string
  pageUrl?: string
}

export type SubmitLeadResult =
  | {
      ok: true
      leadId: number | string
      result: EstimatorResult
    }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string>
    }
