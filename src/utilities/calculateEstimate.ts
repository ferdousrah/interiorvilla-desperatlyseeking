import type {
  CityKey,
  CostEstimatorSettings,
  EstimatorResult,
  PackageTier,
  ProjectType,
  RoomType,
  WizardSelection,
} from '@/types/cost-estimator'

const cityMultiplierFor = (
  s: CostEstimatorSettings,
  city: CityKey,
): number => {
  switch (city) {
    case 'dhaka-prime':
      return s.cityMultiplierDhakaPrime
    case 'dhaka-other':
      return s.cityMultiplierDhakaOther
    case 'chittagong':
      return s.cityMultiplierChittagong
    case 'sylhet':
      return s.cityMultiplierSylhet
    case 'other':
      return s.cityMultiplierOther
  }
}

const projectTypeMultiplierFor = (
  s: CostEstimatorSettings,
  type: ProjectType,
): number => {
  switch (type) {
    case 'full-home':
      return s.projectTypeMultiplierResidential
    case 'single-room':
      return s.projectTypeMultiplierSingleRoom
    case 'office':
      return s.projectTypeMultiplierOffice
    case 'commercial':
      return s.projectTypeMultiplierCommercial
  }
}

const tierRates = (
  s: CostEstimatorSettings,
  tier: PackageTier,
): { low: number; high: number } => {
  switch (tier) {
    case 'standard':
      return { low: s.standardLow, high: s.standardHigh }
    case 'premium':
      return { low: s.premiumLow, high: s.premiumHigh }
    case 'signature':
      return { low: s.signatureLow, high: s.signatureHigh }
  }
}

const roomDefaultSft = (s: CostEstimatorSettings, room: RoomType): number => {
  switch (room) {
    case 'living-room':
      return s.sftLivingRoom
    case 'kitchen':
      return s.sftKitchen
    case 'bedroom':
      return s.sftBedroom
    case 'bathroom':
      return s.sftBathroom
    case 'dining':
      return s.sftDining
    case 'foyer':
      return s.sftFoyer
    case 'family-living':
      return s.sftFamilyLiving
    case 'study':
      return s.sftStudy
  }
}

const addOnPriceForTier = (
  addOn: NonNullable<CostEstimatorSettings['addOns']>[number],
  tier: PackageTier,
): number => {
  switch (tier) {
    case 'standard':
      return addOn.priceStandard ?? 0
    case 'premium':
      return addOn.pricePremium ?? 0
    case 'signature':
      return addOn.priceSignature ?? 0
  }
}

/**
 * Pure calculation. Runs on the client during the wizard for a "running
 * estimate" preview, and on the server when the lead is submitted (so users
 * can't tamper with the values via DevTools).
 */
export function calculateEstimate(
  input: WizardSelection,
  settings: CostEstimatorSettings,
): EstimatorResult {
  // Total sft: prefer manual sft (commercial/office/single-room) if provided,
  // otherwise sum room defaults × room count.
  let totalSft = 0
  if (typeof input.manualSft === 'number' && input.manualSft > 0) {
    totalSft = Math.round(input.manualSft)
  } else if (input.rooms?.length) {
    totalSft = input.rooms.reduce((sum, r) => {
      const sft = roomDefaultSft(settings, r.roomType) || 0
      return sum + sft * Math.max(0, r.count || 0)
    }, 0)
  }
  // Floor: minimum 100 sft to avoid degenerate zero estimates
  totalSft = Math.max(100, totalSft)

  const rates = tierRates(settings, input.packageTier)
  const cityMul = cityMultiplierFor(settings, input.city)
  const typeMul = projectTypeMultiplierFor(settings, input.projectType)

  const baseMin = rates.low * totalSft * cityMul * typeMul
  const baseMax = rates.high * totalSft * cityMul * typeMul

  // Add-ons: flat amount per selected add-on at the chosen tier.
  let addOnsTotal = 0
  const addOnDefs = settings.addOns ?? []
  const selected = new Set(input.addOns ?? [])
  for (const def of addOnDefs) {
    if (selected.has(def.key)) {
      addOnsTotal += addOnPriceForTier(def, input.packageTier)
    }
  }

  const minBdt = Math.round(baseMin + addOnsTotal)
  const maxBdt = Math.round(baseMax + addOnsTotal)

  return {
    totalSft,
    baseRateLow: rates.low,
    baseRateHigh: rates.high,
    cityMultiplier: cityMul,
    projectTypeMultiplier: typeMul,
    addOnsTotalBdt: Math.round(addOnsTotal),
    minBdt,
    maxBdt,
    midBdt: Math.round((minBdt + maxBdt) / 2),
  }
}

/** "৳12,34,567" — Indian/Bangladesh grouping. */
export function formatBdt(amount: number): string {
  return `৳${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`
}

/** "৳18.00 Lakh" / "৳2.50 Crore" / "৳45,000" — compact. */
export function formatBdtCompact(amount: number): string {
  if (amount >= 10000000) {
    return `৳${(amount / 10000000).toFixed(2)} Crore`
  }
  if (amount >= 100000) {
    return `৳${(amount / 100000).toFixed(2)} Lakh`
  }
  return formatBdt(amount)
}
