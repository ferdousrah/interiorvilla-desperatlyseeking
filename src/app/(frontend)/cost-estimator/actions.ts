'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { calculateEstimate } from '@/utilities/calculateEstimate'
import type {
  CityKey,
  CostEstimatorSettings,
  FlatStatus,
  PackageTier,
  ProjectType,
  RoomType,
  SubmitLeadInput,
  SubmitLeadResult,
} from '@/types/cost-estimator'

const PROJECT_TYPES: ProjectType[] = [
  'full-home',
  'single-room',
  'office',
  'commercial',
]
const FLAT_STATUSES: FlatStatus[] = ['ready', 'not-ready', 'under-construction']
const CITIES: CityKey[] = [
  'dhaka-prime',
  'dhaka-other',
  'chittagong',
  'sylhet',
  'other',
]
const PACKAGE_TIERS: PackageTier[] = ['standard', 'premium', 'signature']
const ROOM_TYPES: RoomType[] = [
  'living-room',
  'kitchen',
  'bedroom',
  'bathroom',
  'dining',
  'foyer',
  'family-living',
  'study',
]

const PHONE_RE = /^\+?[0-9 ()-]{6,32}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const setErr = (
  errors: Record<string, string>,
  field: string,
  message: string,
) => {
  if (!errors[field]) errors[field] = message
}

export async function submitCostEstimateLead(
  raw: SubmitLeadInput,
): Promise<SubmitLeadResult> {
  const fieldErrors: Record<string, string> = {}

  // ----- Contact validation -----
  const name = String(raw.name ?? '').trim()
  if (!name) setErr(fieldErrors, 'name', 'Name is required')
  else if (name.length > 120)
    setErr(fieldErrors, 'name', 'Name is too long')

  const phone = String(raw.phone ?? '').trim()
  if (!phone) setErr(fieldErrors, 'phone', 'Phone is required')
  else if (!PHONE_RE.test(phone))
    setErr(fieldErrors, 'phone', 'Phone format looks invalid')

  const email = raw.email ? String(raw.email).trim() : ''
  if (email && !EMAIL_RE.test(email))
    setErr(fieldErrors, 'email', 'Email format looks invalid')

  // ----- Wizard validation -----
  if (!PROJECT_TYPES.includes(raw.projectType))
    setErr(fieldErrors, 'projectType', 'Invalid project type')

  if (raw.flatStatus && !FLAT_STATUSES.includes(raw.flatStatus))
    setErr(fieldErrors, 'flatStatus', 'Invalid flat status')

  if (!CITIES.includes(raw.city))
    setErr(fieldErrors, 'city', 'Invalid city')

  if (!PACKAGE_TIERS.includes(raw.packageTier))
    setErr(fieldErrors, 'packageTier', 'Invalid package tier')

  // Sanitise rooms
  const rooms = Array.isArray(raw.rooms)
    ? raw.rooms
        .filter(
          (r) =>
            r &&
            ROOM_TYPES.includes(r.roomType as RoomType) &&
            Number.isFinite(r.count) &&
            r.count >= 0 &&
            r.count <= 20,
        )
        .map((r) => ({ roomType: r.roomType as RoomType, count: Math.floor(r.count) }))
    : []

  // Sanitise add-on keys (max 50 entries)
  const addOnKeys = Array.isArray(raw.addOns)
    ? raw.addOns
        .filter((k): k is string => typeof k === 'string')
        .slice(0, 50)
    : []

  // Manual sft (optional)
  let manualSft: number | undefined
  if (typeof raw.manualSft === 'number' && raw.manualSft > 0) {
    manualSft = Math.max(50, Math.min(50000, Math.round(raw.manualSft)))
  }

  const totalRoomsCount = rooms.reduce((s, r) => s + r.count, 0)
  if (
    !manualSft &&
    totalRoomsCount === 0 &&
    (raw.projectType === 'full-home' || raw.projectType === 'single-room')
  ) {
    setErr(fieldErrors, 'rooms', 'Please select at least one room')
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: 'Please fix the highlighted fields',
      fieldErrors,
    }
  }

  // ----- Load settings + recalculate server-side -----
  let settings: CostEstimatorSettings
  try {
    const payload = await getPayload({ config: configPromise })
    settings = (await payload.findGlobal({
      slug: 'cost-estimator-settings',
      depth: 1,
    })) as unknown as CostEstimatorSettings
  } catch (err) {
    console.error('[cost-estimator] failed to load settings', err)
    return {
      ok: false,
      error: 'Unable to compute estimate. Please try again.',
    }
  }

  const result = calculateEstimate(
    {
      projectType: raw.projectType,
      flatStatus: raw.flatStatus,
      city: raw.city,
      packageTier: raw.packageTier,
      rooms,
      addOns: addOnKeys,
      manualSft,
    },
    settings,
  )

  // Resolve add-on labels for the saved lead (so admin sees readable names)
  const addOnDefs = settings.addOns ?? []
  const addOnsForLead = addOnKeys.map((key) => {
    const def = addOnDefs.find((d) => d?.key === key)
    return { key, label: def?.label ?? key }
  })

  // ----- Tracking metadata -----
  const hdrs = await headers()
  const userAgent = hdrs.get('user-agent') ?? undefined
  const ipAddress =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    undefined

  // ----- Persist lead -----
  try {
    const payload = await getPayload({ config: configPromise })
    const created = await payload.create({
      collection: 'cost-estimates',
      data: {
        name,
        phone,
        email: email || null,
        location: raw.location ? String(raw.location).slice(0, 200) : null,
        smsConsent: Boolean(raw.smsConsent),
        projectType: raw.projectType,
        flatStatus: raw.flatStatus ?? null,
        city: raw.city,
        packageTier: raw.packageTier,
        rooms,
        addOns: addOnsForLead,
        totalSft: result.totalSft,
        notes: raw.notes ? String(raw.notes).slice(0, 2000) : null,
        estimatedMinBdt: result.minBdt,
        estimatedMaxBdt: result.maxBdt,
        pageUrl: raw.pageUrl ? String(raw.pageUrl).slice(0, 500) : null,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 45) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        status: 'new',
      } as never,
    })
    return { ok: true, leadId: created.id, result }
  } catch (err) {
    console.error('[cost-estimator] failed to save lead', err)
    return {
      ok: false,
      error: 'Could not save your request right now. Please try again.',
    }
  }
}
