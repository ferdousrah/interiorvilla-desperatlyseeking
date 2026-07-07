'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Home,
  DoorOpen,
  Briefcase,
  Building2,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import {
  calculateEstimate,
  formatBdt,
  formatBdtCompact,
} from '@/utilities/calculateEstimate'
import type {
  CityKey,
  CostEstimatorSettings,
  EstimatorResult,
  FlatStatus,
  PackageTier,
  ProjectType,
  RoomType,
  WizardSelection,
} from '@/types/cost-estimator'
import { submitCostEstimateLead } from '../actions'

interface Props {
  settings: CostEstimatorSettings
}

// ---- Static step config ----
const STEPS = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'basics', label: 'Project' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'package', label: 'Package' },
  { key: 'details', label: 'Details' },
  { key: 'finish', label: 'Finish' },
] as const

const PROJECT_OPTIONS: {
  value: ProjectType
  label: string
  desc: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'full-home', label: 'Full Home', desc: 'Apartment / house — full interior package', Icon: Home },
  { value: 'single-room', label: 'Single Room', desc: 'Just one room — bedroom, kitchen, etc.', Icon: DoorOpen },
  { value: 'office', label: 'Office', desc: 'Corporate or co-working space', Icon: Briefcase },
  { value: 'commercial', label: 'Commercial', desc: 'Restaurant, retail, hotel, clinic', Icon: Building2 },
]

const FLAT_STATUS_OPTIONS: { value: FlatStatus; label: string }[] = [
  { value: 'ready', label: 'Ready for Interior' },
  { value: 'not-ready', label: 'Not Ready' },
  { value: 'under-construction', label: 'Under Construction' },
]

const CITY_OPTIONS: { value: CityKey; label: string }[] = [
  { value: 'dhaka-prime', label: 'Dhaka — Gulshan / Banani / Baridhara' },
  { value: 'dhaka-other', label: 'Dhaka — Other areas' },
  { value: 'chittagong', label: 'Chittagong' },
  { value: 'sylhet', label: 'Sylhet' },
  { value: 'other', label: 'Other city' },
]

const ROOM_OPTIONS: { value: RoomType; label: string }[] = [
  { value: 'living-room', label: 'Living Room' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'dining', label: 'Dining' },
  { value: 'foyer', label: 'Foyer & Lobby' },
  { value: 'family-living', label: 'Family Living' },
  { value: 'study', label: 'Study Room' },
]

const ROOM_LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  ROOM_OPTIONS.map((r) => [r.value, r.label]),
)
ROOM_LABEL_BY_KEY['whole-project'] = 'Whole Project'

// ---- Component ----
export default function CostEstimatorWizard({ settings }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [isPending, startTransition] = useTransition()

  const [projectType, setProjectType] = useState<ProjectType>('full-home')
  const [flatStatus, setFlatStatus] = useState<FlatStatus | undefined>('ready')
  const [city, setCity] = useState<CityKey>('dhaka-other')
  const [rooms, setRooms] = useState<Record<RoomType, number>>({
    'living-room': 1,
    kitchen: 1,
    bedroom: 1,
    bathroom: 1,
    dining: 0,
    foyer: 0,
    'family-living': 0,
    study: 0,
  })
  const [manualSft, setManualSft] = useState<number>(1200)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [packageTier, setPackageTier] = useState<PackageTier>('premium')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [notes, setNotes] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [serverResult, setServerResult] = useState<EstimatorResult | null>(null)

  const usesRooms = projectType === 'full-home' || projectType === 'single-room'

  // Selection assembled for calc + submission
  const selection: WizardSelection = useMemo(
    () => ({
      projectType,
      flatStatus,
      city,
      packageTier,
      rooms: usesRooms
        ? ROOM_OPTIONS.map((r) => ({ roomType: r.value, count: rooms[r.value] || 0 })).filter(
            (r) => r.count > 0,
          )
        : [],
      addOns: Array.from(selectedAddOns),
      manualSft: usesRooms ? undefined : manualSft,
    }),
    [projectType, flatStatus, city, packageTier, usesRooms, rooms, selectedAddOns, manualSft],
  )

  // Live (client-side) preview — for the small running estimate. Never shown
  // until the server returns its own number on the result step.
  const livePreview = useMemo(
    () => calculateEstimate(selection, settings),
    [selection, settings],
  )

  // Available add-ons grouped by room (only show rooms that have count > 0)
  const addOnsByRoom = useMemo(() => {
    const defs = settings.addOns ?? []
    const groups: Record<string, typeof defs> = {}
    for (const def of defs) {
      if (!def?.key) continue
      const scope = def.roomScope
      // Hide room-specific add-ons when that room isn't selected
      if (
        scope !== 'whole-project' &&
        usesRooms &&
        (rooms[scope as RoomType] ?? 0) === 0
      ) {
        continue
      }
      if (!groups[scope]) groups[scope] = []
      groups[scope].push(def)
    }
    return groups
  }, [settings.addOns, rooms, usesRooms])

  const totalRoomsCount = usesRooms
    ? Object.values(rooms).reduce((s, n) => s + n, 0)
    : manualSft > 0
      ? 1
      : 0

  // ---- Step navigation with validation ----
  const validateStep = (): string | null => {
    const step = STEPS[stepIdx]?.key
    switch (step) {
      case 'welcome':
        if (!projectType) return 'Please select a project type'
        return null
      case 'basics':
        if (!city) return 'Please select your city'
        return null
      case 'rooms':
        if (usesRooms && totalRoomsCount === 0)
          return 'Please add at least one room'
        if (!usesRooms && manualSft < 50)
          return 'Please enter a valid area (50–50,000 sft)'
        return null
      case 'package':
        if (!packageTier) return 'Please pick a package'
        return null
      default:
        return null
    }
  }

  const goNext = () => {
    const err = validateStep()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitError(null)
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
  }
  const goBack = () => {
    setSubmitError(null)
    setStepIdx((i) => Math.max(0, i - 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSubmitError(null)
    startTransition(async () => {
      const pageUrl =
        typeof window !== 'undefined' ? window.location.href : undefined
      const res = await submitCostEstimateLead({
        ...selection,
        name,
        phone,
        email: email || undefined,
        location: location || undefined,
        smsConsent,
        notes: notes || undefined,
        pageUrl,
      })
      if (res.ok) {
        setServerResult(res.result)
        setStepIdx(STEPS.length - 1) // jump to finish step
      } else {
        setSubmitError(res.error)
        if (res.fieldErrors) setFieldErrors(res.fieldErrors)
      }
    })
  }

  const stepKey = STEPS[stepIdx]?.key ?? 'welcome'

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-10 max-w-4xl mx-auto [font-family:'Fahkwang',Helvetica,sans-serif]"
    >
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const done = i < stepIdx
            const active = i === stepIdx
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                      done
                        ? 'bg-primary text-white'
                        : active
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <div
                    className={`hidden sm:block text-[10px] mt-1 ${
                      active ? 'text-primary font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                      i < stepIdx ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="min-h-[320px]"
        >
          {/* ---- Step 1: Welcome ---- */}
          {stepKey === 'welcome' && (
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                What are we designing for you?
              </h2>
              <p className="text-center text-[#626161] mb-8">
                Pick the type of space and we'll guide you through the rest.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_OPTIONS.map(({ value, label, desc, Icon }) => {
                  const active = projectType === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProjectType(value)}
                      className={`text-left p-5 rounded-xl border-2 transition-colors ${
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-primary/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            active ? 'bg-primary text-white' : 'bg-gray-100 text-[#626161]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-base font-semibold text-[#01190c]">
                          {label}
                        </div>
                      </div>
                      <div className="text-sm text-[#626161]">{desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ---- Step 2: Basics ---- */}
          {stepKey === 'basics' && (
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                Tell us about the project
              </h2>
              <p className="text-center text-[#626161] mb-8">
                Pricing varies by location and the current state of the space.
              </p>
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-2">
                    Location <span className="text-secondary">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as CityKey)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    {CITY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {usesRooms && (
                  <div>
                    <label className="block text-sm font-semibold text-[#01190c] mb-2">
                      Flat status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {FLAT_STATUS_OPTIONS.map((opt) => {
                        const active = flatStatus === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFlatStatus(opt.value)}
                            className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                              active
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-100 hover:border-primary/30 text-[#01190c]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- Step 3: Rooms (or manual sft) ---- */}
          {stepKey === 'rooms' && (
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                {usesRooms ? 'How many rooms?' : 'How big is the space?'}
              </h2>
              <p className="text-center text-[#626161] mb-8">
                {usesRooms
                  ? 'Select the rooms you want designed.'
                  : 'Enter the total floor area in square feet.'}
              </p>
              {usesRooms ? (
                <div className="space-y-3 max-w-xl mx-auto">
                  {ROOM_OPTIONS.map((r) => (
                    <div
                      key={r.value}
                      className="flex items-center justify-between bg-[#f7f9fb] rounded-xl px-4 py-3"
                    >
                      <span className="text-sm font-medium text-[#01190c]">
                        {r.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setRooms((prev) => ({
                              ...prev,
                              [r.value]: Math.max(0, (prev[r.value] || 0) - 1),
                            }))
                          }
                          className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#01190c] hover:border-primary disabled:opacity-40"
                          disabled={(rooms[r.value] || 0) === 0}
                          aria-label={`Decrease ${r.label}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-[#01190c]">
                          {rooms[r.value] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRooms((prev) => ({
                              ...prev,
                              [r.value]: Math.min(20, (prev[r.value] || 0) + 1),
                            }))
                          }
                          className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#01190c] hover:border-primary"
                          aria-label={`Increase ${r.label}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-semibold text-[#01190c] mb-2 text-center">
                    Total area in square feet
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={200}
                      max={20000}
                      step={50}
                      value={manualSft}
                      onChange={(e) => setManualSft(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <div className="flex items-center gap-1 min-w-[120px]">
                      <input
                        type="number"
                        min={50}
                        max={50000}
                        value={manualSft}
                        onChange={(e) =>
                          setManualSft(
                            Math.max(50, Math.min(50000, Number(e.target.value) || 0)),
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right text-sm font-semibold text-[#01190c]"
                      />
                      <span className="text-sm text-[#626161]">sft</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- Step 4: Add-ons ---- */}
          {stepKey === 'addons' && (
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                Customise your design
              </h2>
              <p className="text-center text-[#626161] mb-8">
                Pick the extras you want included. You can change these later.
              </p>
              {Object.keys(addOnsByRoom).length === 0 ? (
                <div className="text-center text-[#626161] py-8">
                  No add-ons configured yet — your admin can add some in <em>Cost Estimator Settings</em>.
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(addOnsByRoom).map(([scope, defs]) => (
                    <div key={scope} className="bg-[#f7f9fb] rounded-xl p-4 sm:p-5">
                      <div className="text-sm font-semibold text-[#01190c] mb-3">
                        {ROOM_LABEL_BY_KEY[scope] ?? scope}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {defs.map((def) => {
                          const checked = selectedAddOns.has(def.key)
                          return (
                            <label
                              key={def.key}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                                checked
                                  ? 'border-primary bg-primary/5 text-[#01190c]'
                                  : 'border-gray-100 bg-white hover:border-primary/30 text-[#626161]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedAddOns((prev) => {
                                    const next = new Set(prev)
                                    if (next.has(def.key)) next.delete(def.key)
                                    else next.add(def.key)
                                    return next
                                  })
                                }}
                                className="accent-primary"
                              />
                              <span>{def.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---- Step 5: Package ---- */}
          {stepKey === 'package' && (
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                Pick your package
              </h2>
              <p className="text-center text-[#626161] mb-8">
                We have packages for every budget and style preference.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(
                  [
                    ['standard', settings.packageStandard],
                    ['premium', settings.packagePremium],
                    ['signature', settings.packageSignature],
                  ] as const
                ).map(([tier, pkg]) => {
                  const active = packageTier === tier
                  const imgUrl =
                    typeof pkg?.image === 'object' && pkg?.image
                      ? pkg.image.sizes?.medium?.url ?? pkg.image.url ?? null
                      : null
                  const title = pkg?.title ?? tier
                  const description = pkg?.description ?? ''
                  const features = (pkg?.features ?? []) as { feature: string }[]
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setPackageTier(tier)}
                      className={`text-left rounded-2xl border-2 overflow-hidden transition-colors ${
                        active
                          ? 'border-primary shadow-lg'
                          : 'border-gray-100 hover:border-primary/30'
                      }`}
                    >
                      {imgUrl && (
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <Image
                            src={imgUrl}
                            alt={title || tier}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="text-lg font-bold text-[#01190c] mb-2 capitalize">
                          {title}
                        </div>
                        <div className="text-sm text-[#626161] mb-3 leading-relaxed">
                          {description}
                        </div>
                        <ul className="space-y-1.5">
                          {features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-[#01190c]"
                            >
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{f.feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ---- Step 6: Contact (gating step) ---- */}
          {stepKey === 'details' && (
            <form onSubmit={handleSubmit}>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] text-center mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                Your estimate is almost ready
              </h2>
              <p className="text-center text-[#626161] mb-8">
                Provide your contact details to see the final estimate.
              </p>
              <div className="max-w-xl mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-1">
                    Name <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    placeholder="Your full name"
                  />
                  {fieldErrors.name && (
                    <div className="text-xs text-secondary mt-1">{fieldErrors.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-1">
                    Phone <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    placeholder="+8801XXXXXXXXX"
                  />
                  {fieldErrors.phone && (
                    <div className="text-xs text-secondary mt-1">{fieldErrors.phone}</div>
                  )}
                  <div className="text-xs text-[#626161] mt-1">We may contact you to follow up.</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-1">
                    Email <span className="text-[#626161] font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <div className="text-xs text-secondary mt-1">{fieldErrors.email}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-1">
                    Location <span className="text-[#626161] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Banani, Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#01190c] mb-1">
                    Project notes <span className="text-[#626161] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="Anything specific about your timeline or must-haves…"
                  />
                </div>
                <label className="flex items-start gap-2 cursor-pointer text-sm text-[#626161]">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="mt-1 accent-primary"
                  />
                  <span>Send me design tips and offers via SMS / WhatsApp.</span>
                </label>
                {submitError && (
                  <div className="text-sm text-secondary bg-secondary/5 border border-secondary/20 rounded-xl px-4 py-3">
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {settings.finalButtonLabel || 'Show Me Total Cost'}
                </button>
              </div>
            </form>
          )}

          {/* ---- Step 7: Finish ---- */}
          {stepKey === 'finish' && serverResult && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary text-white flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#01190c] mb-2"
                style={{ fontFamily: "'Fahkwang', Helvetica, sans-serif" }}
              >
                {settings.resultTitle || 'Here is your estimated cost'}
              </h2>
              <div className="text-3xl md:text-4xl font-bold text-primary mt-6 mb-1">
                {formatBdtCompact(serverResult.minBdt)} – {formatBdtCompact(serverResult.maxBdt)}
              </div>
              <div className="text-sm text-[#626161] mb-2">
                {formatBdt(serverResult.minBdt)} – {formatBdt(serverResult.maxBdt)}
              </div>
              <div className="text-xs text-[#626161] mb-6">
                Based on {serverResult.totalSft.toLocaleString('en-IN')} sft &middot; {' '}
                {packageTier.charAt(0).toUpperCase() + packageTier.slice(1)} package
              </div>
              {settings.resultSubtitle && (
                <p className="text-sm text-[#626161] max-w-xl mx-auto leading-relaxed mb-6">
                  {settings.resultSubtitle}
                </p>
              )}
              {settings.disclaimer && (
                <p className="text-xs text-[#626161] max-w-xl mx-auto leading-relaxed mb-6 italic">
                  {settings.disclaimer}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/contact"
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Book a free consultation
                </a>
                <a
                  href="/portfolio"
                  className="px-6 py-3 border border-[#01190c] text-[#01190c] font-semibold rounded-xl hover:bg-[#01190c] hover:text-white transition-colors"
                >
                  Browse our portfolio
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Step navigation */}
      {stepKey !== 'details' && stepKey !== 'finish' && (
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIdx === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#01190c] border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-xs text-[#626161] hidden sm:block">
            {stepKey !== 'welcome' && (
              <>Running estimate (preview):{' '}
                <span className="font-semibold text-[#01190c]">
                  {formatBdtCompact(livePreview.minBdt)} – {formatBdtCompact(livePreview.maxBdt)}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 flex items-center gap-2"
          >
            {stepKey === 'welcome' ? settings.welcomeButtonLabel || 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {stepKey === 'details' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={goBack}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#626161] hover:text-[#01190c] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to package
          </button>
        </div>
      )}
    </div>
  )
}
