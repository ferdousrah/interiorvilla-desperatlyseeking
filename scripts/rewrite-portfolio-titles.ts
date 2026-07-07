/**
 * One-time: fix keyword cannibalization between portfolio (project) pages and
 * service pages by giving every portfolio project a UNIQUE, project-identity
 * title + SEO meta. The URL (slug) of each project is NOT touched.
 *
 * Run on the SERVER (where the real DB + media live), from the project root:
 *
 *   pnpm payload run scripts/rewrite-portfolio-titles.ts          # apply
 *   DRY=1 pnpm payload run scripts/rewrite-portfolio-titles.ts    # preview only
 *
 * Idempotent — safe to re-run. After running: rebuild + pm2 restart so the
 * pages re-render, then "Validate fix" the "Crawled - currently not indexed"
 * issue in Google Search Console.
 *
 * Notes baked in (per the SEO rules of this project):
 *  - The root layout applies the title template "%s | Desperately Seeking", so the
 *    metaTitle values here EXCLUDE "Desperately Seeking" to avoid duplication.
 *  - metaTitle is kept short enough that  metaTitle + " | Desperately Seeking"
 *    stays within Google's ~60-char display limit (validateMetaTitle caps the
 *    field at 60; we cap the BASE at 60 - 17 = 43 so the DISPLAYED title fits).
 *  - metaDescription is capped at 160 (Google truncation; validateMetaDescription).
 *  - The slug stays fixed: Projects.beforeValidate only regenerates the slug
 *    when there is none, and this script never sends a slug field.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const SUFFIX = ' | Desperately Seeking' // appended by the layout title template
const TITLE_DISPLAY_MAX = 60
const META_TITLE_BASE_MAX = TITLE_DISPLAY_MAX - SUFFIX.length // 43
const META_DESC_MAX = 160

type Row = {
  slug: string // URL — must already exist, NEVER changed
  title: string // H1 / breadcrumb (the visible project name)
  metaTitle: string // base, WITHOUT "| Desperately Seeking"
  type: string // used to build the meta description
  location?: string
  size?: string // e.g. "7,600" (sft appended automatically)
  year?: string
}

// type → which service page it now defers to (kept here for reference only)
const rows: Row[] = [
  // ── Office / Corporate → /services/.../corporate-and-office-interior-design
  { slug: 'best-corporate-office-interior-design-company-in-bangladesh', title: 'Corporate Office Fit-out — Dhanmondi, Dhaka (7,600 sft)', metaTitle: 'Corporate Office Fit-out — Dhanmondi', type: 'Corporate office', location: 'Dhanmondi, Dhaka', size: '7,600', year: '2025' },
  { slug: 'corporate-it-office-interior-7000-sft', title: 'Tulip Tech IT Office — Badda, Dhaka (7,000 sft)', metaTitle: 'Tulip Tech IT Office — Badda, Dhaka', type: 'IT office', location: 'Badda, Dhaka', size: '7,000', year: '2025' },
  { slug: 'corporate-office-interior-with-zoning-magic', title: 'Zoning Magic Office — Badda, Dhaka (7,000 sft)', metaTitle: 'Zoning Magic Office — Badda, Dhaka', type: 'Corporate office', location: 'Badda, Dhaka', size: '7,000', year: '2025' },
  { slug: 'dhaka-wash-corporate-office-interior-design', title: 'Dhaka Wash Corporate Office — Dhaka (7,000 sft)', metaTitle: 'Dhaka Wash Corporate Office — Dhaka', type: 'Corporate office', location: 'Dhaka', size: '7,000', year: '2026' },
  { slug: 'grameen-solar-corporate-office-interior-design-dhaka', title: 'Grameen Solar Corporate Office — Dhaka', metaTitle: 'Grameen Solar Office — Dhaka', type: 'Corporate office', location: 'Dhaka', year: '2025' },
  { slug: 'reachsavvy-call-center-and-it-office-interior-design-dhaka', title: 'ReachSavvy Call Center & IT Office — Dhaka', metaTitle: 'ReachSavvy Call Center Office — Dhaka', type: 'Call center & IT office', location: 'Dhaka' },
  { slug: 'buying-house-office-interior-design', title: 'Buying-House Office — Uttara, Dhaka (3,180 sft)', metaTitle: 'Buying-House Office — Uttara, Dhaka', type: 'Buying-house office', location: 'Uttara, Dhaka', size: '3,180', year: '2025' },

  // ── Apartment → /services/residential/apartment-interior-design
  { slug: 'apartment-interiors-that-reflect-your-lifestyle', title: "Mr. Borhan's Apartment — Chattogram (1,800 sft)", metaTitle: 'Apartment Interior — Chattogram', type: 'Apartment', location: 'Chattogram', size: '1,800', year: '2022' },
  { slug: 'modern-interiors-for-modern-apartment-living', title: "Mr. Assaduzzaman's Apartment — Adabor (2,500 sft)", metaTitle: 'Apartment Interior — Adabor, Dhaka', type: 'Apartment', location: 'Adabor, Dhaka', size: '2,500', year: '2021' },
  { slug: 'modern-apartment-interior-design', title: 'Modern Apartment — Royel Moor, Khulna (1,350 sft)', metaTitle: 'Modern Apartment — Royel Moor, Khulna', type: 'Apartment', location: 'Royel Moor, Khulna', size: '1,350', year: '2025' },
  { slug: 'mr-alvi-apartment-interior-adabor', title: "Mr. Alvi's Apartment — Adabor, Dhaka", metaTitle: "Mr. Alvi's Apartment — Adabor, Dhaka", type: 'Apartment', location: 'Adabor, Dhaka', year: '2026' },
  { slug: 'mr-khandakar-fahim-apartment-jigatala', title: "Mr. Fahim's Apartment — Jigatala, Dhaka", metaTitle: "Mr. Fahim's Apartment — Jigatala", type: 'Apartment', location: 'Jigatala, Dhaka', year: '2026' },
  { slug: 'mr-juwel-luxury-apartment-gulshan-2', title: "Mr. Juwel's Luxury Apartment — Gulshan 2", metaTitle: "Mr. Juwel's Apartment — Gulshan 2", type: 'Luxury apartment', location: 'Gulshan 2, Dhaka', year: '2026' },
  { slug: 'mr-ronne-luxury-apartment-gulshan-2', title: "Mr. Ronne's Luxury Apartment — Gulshan 2", metaTitle: "Mr. Ronne's Apartment — Gulshan 2", type: 'Luxury apartment', location: 'Gulshan 2, Dhaka' },

  // ── Home / Living / Bedroom → /services/residential/home-interior-design
  { slug: 'luxury-home-interior-design', title: 'Luxury Home — Sylhet (2,100 sft)', metaTitle: 'Luxury Home Interior — Sylhet', type: 'Luxury home', location: 'Sylhet', size: '2,100', year: '2024' },
  { slug: 'living-room-interior-design', title: 'Living Room — Adabor, Dhaka (750 sft)', metaTitle: 'Living Room Interior — Adabor, Dhaka', type: 'Living room', location: 'Adabor, Dhaka', size: '750', year: '2024' },
  { slug: 'modern-living-and-dining-space-interior-design', title: 'Living & Dining — Dhanmondi (2,350 sft)', metaTitle: 'Living & Dining — Dhanmondi, Dhaka', type: 'Living & dining', location: 'Dhanmondi, Dhaka', size: '2,350', year: '2018' },
  { slug: 'modern-and-luxury-bedroom-interior-design', title: 'Luxury Bedroom — Gulshan (2,700 sft)', metaTitle: 'Luxury Bedroom — Gulshan, Dhaka', type: 'Luxury bedroom', location: 'Gulshan, Dhaka', size: '2,700', year: '2022' },
  { slug: 'modern-child-bedroom-interior-design', title: "Modern Child's Bedroom Interior", metaTitle: "Modern Child's Bedroom Interior", type: "Child's bedroom" },

  // ── Duplex → /services/residential/duplex-interior-design
  { slug: 'duplex-home-interior-design', title: "Mr. Rassel's Duplex — Narayanganj (3,600 sft)", metaTitle: 'Duplex Home — Narayanganj', type: 'Duplex home', location: 'Narayanganj', size: '3,600', year: '2024' },
  { slug: 'duplex-living-room-design', title: 'Duplex Living Room — Jashore (3,400 sft)', metaTitle: 'Duplex Living Room — Jashore', type: 'Duplex living room', location: 'Jashore', size: '3,400', year: '2025' },
  { slug: 'duplex-home-interior-design-coxs-bazar', title: "Duplex Home — Cox's Bazar", metaTitle: "Duplex Home Interior — Cox's Bazar", type: 'Duplex home', location: "Cox's Bazar" },

  // ── Hotel → /services/.../hotel-and-hospitality-interior-design
  { slug: '5-star-hotel-interior-design', title: "5-Star Hotel — Cox's Bazar (72,000 sft)", metaTitle: "5-Star Hotel — Cox's Bazar", type: '5-star hotel', location: "Cox's Bazar", size: '72,000', year: '2025' },
  { slug: 'modern-and-luxury-hotel-room-interior-design', title: "Luxury Hotel Rooms — Cox's Bazar (65,000 sft)", metaTitle: "Luxury Hotel Rooms — Cox's Bazar", type: 'Luxury hotel room', location: "Cox's Bazar", size: '65,000', year: '2025' },

  // ── Restaurant / Café → /services/.../restaurant-and-cafe-interior-design
  { slug: 'restaurant-and-cafe-interior-design', title: 'Restaurant — Savar, Dhaka (1,750 sft)', metaTitle: 'Restaurant Interior — Savar, Dhaka', type: 'Restaurant', location: 'Savar, Dhaka', size: '1,750', year: '2023' },
  { slug: 'cafe-interior-design', title: 'Café — Uttara, Dhaka (2,150 sft)', metaTitle: 'Café Interior — Uttara, Dhaka', type: 'Café', location: 'Uttara, Dhaka', size: '2,150', year: '2019' },

  // ── Salon / Parlor → mens-salon-... / spa-and-beauty-parlor-...
  { slug: 'mens-salon-interior-design', title: "Men's Salon — Dhanmondi (1,700 sft)", metaTitle: "Men's Salon — Dhanmondi, Dhaka", type: "Men's salon", location: 'Dhanmondi, Dhaka', size: '1,700', year: '2022' },
  { slug: 'barber-shop-interior-design', title: 'Barber Shop — Chattogram (1,100 sft)', metaTitle: 'Barber Shop — Chattogram', type: 'Barber shop', location: 'Chattogram', size: '1,100', year: '2020' },
  { slug: 'minimalist-beauty-parlor-interior-design', title: 'Beauty Parlor — Narayanganj (750 sft)', metaTitle: 'Beauty Parlor — Narayanganj', type: 'Beauty parlor', location: 'Narayanganj', size: '750', year: '2018' },

  // ── Medical / Retail / Travel → respective service pages
  { slug: 'dental-clinic-interior-design', title: "Dr. Touhidul's Dental Chamber — Mirpur, Dhaka", metaTitle: 'Dental Chamber — Mirpur, Dhaka', type: 'Dental chamber', location: 'Mirpur, Dhaka', size: '1,250', year: '2025' },
  { slug: 'priti-pharmacy-interior-design-mohakhali-dhaka', title: 'Priti Pharmacy — Mohakhali, Dhaka', metaTitle: 'Priti Pharmacy — Mohakhali, Dhaka', type: 'Pharmacy', location: 'Mohakhali, Dhaka' },
  { slug: 'healthcare-and-hospital-interior-design', title: 'Hospital Project — Kushtia (21,000 sft)', metaTitle: 'Hospital Interior — Kushtia', type: 'Hospital', location: 'Kushtia', size: '21,000', year: '2024' },
  { slug: 'brand-showroom-interior-design', title: 'Brand Showroom — Banasree, Dhaka (1,390 sft)', metaTitle: 'Brand Showroom — Banasree, Dhaka', type: 'Brand showroom', location: 'Banasree, Dhaka', size: '1,390', year: '2025' },
  { slug: 'fashion-showroom-interior-design-wari-dhaka', title: 'Fashion Showroom — Wari, Dhaka (480 sft)', metaTitle: 'Fashion Showroom — Wari, Dhaka', type: 'Fashion showroom', location: 'Wari, Dhaka', size: '480', year: '2025' },
  { slug: 'fitness-center-interior-design', title: 'Fitness Center — Gulshan, Dhaka (7,000 sft)', metaTitle: 'Fitness Center — Gulshan, Dhaka', type: 'Fitness center', location: 'Gulshan, Dhaka', size: '7,000', year: '2023' },
  { slug: 'tours-and-travels-office-interior-design', title: 'Travel Agency Office — Banani (2,200 sft)', metaTitle: 'Travel Agency Office — Banani, Dhaka', type: 'Travel agency office', location: 'Banani, Dhaka', size: '2,200', year: '2025' },
  { slug: 'speck-up-coxs-bazar', title: "Speck Up — Cox's Bazar", metaTitle: "Speck Up Interior — Cox's Bazar", type: 'Commercial', location: "Cox's Bazar" },
]

// process.exit() drops buffered stdout/stderr when output is a pipe/file
// (non-TTY). Flush both streams before exiting so logs are never lost.
async function flushAndExit(code: number): Promise<never> {
  await Promise.all([
    new Promise<void>((r) => process.stdout.write('', () => r())),
    new Promise<void>((r) => process.stderr.write('', () => r())),
  ])
  process.exit(code)
}

function clamp(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/[\s—,-]+$/, '') + '…'
}

function buildDescription(r: Row): string {
  let d = `${r.type} interior project by Desperately Seeking`
  if (r.location) d += ` in ${r.location}`
  const detail = [r.size ? `${r.size} sft` : null, r.year ? `completed ${r.year}` : null]
    .filter(Boolean)
    .join(', ')
  if (detail) d += ` — ${detail}`
  d += '. Explore the layout, design and finishes.'
  return clamp(d, META_DESC_MAX)
}

async function run() {
  // `payload run` does not forward script argv, so dry mode is an env var:
  //   DRY=1 pnpm payload run scripts/rewrite-portfolio-titles.ts
  const dryRun = process.env.DRY === '1'
  const payload = await getPayload({ config })

  // Guard against accidental duplicate slugs in the table above.
  const seen = new Set<string>()
  for (const r of rows) {
    if (seen.has(r.slug)) throw new Error(`Duplicate slug in table: ${r.slug}`)
    seen.add(r.slug)
  }

  let updated = 0
  let missing = 0
  let warnings = 0

  for (const r of rows) {
    const found = await payload.find({
      collection: 'projects',
      where: { slug: { equals: r.slug } },
      limit: 1,
      depth: 0,
    })
    const doc = found.docs[0]
    if (!doc) {
      console.warn(`✗ NOT FOUND, skipped: ${r.slug}`)
      missing++
      continue
    }

    const metaTitle = clamp(r.metaTitle, META_TITLE_BASE_MAX)
    const metaDescription = buildDescription(r)
    const displayTitle = metaTitle + SUFFIX

    if (displayTitle.length > TITLE_DISPLAY_MAX) {
      console.warn(`  ⚠ display title ${displayTitle.length} chars: "${displayTitle}"`)
      warnings++
    }

    console.log(`${dryRun ? '·' : '✓'} ${r.slug}`)
    console.log(`    H1    : ${r.title}`)
    console.log(`    title : ${displayTitle}  (${displayTitle.length})`)
    console.log(`    desc  : ${metaDescription}  (${metaDescription.length})`)

    if (!dryRun) {
      const originalSlug = (doc as { slug?: string }).slug
      await payload.update({
        collection: 'projects',
        id: doc.id,
        data: {
          title: r.title,
          // preserve existing ogImage / metaKey / custom JSON-LD in the group
          seoDetails: {
            ...((doc as { seoDetails?: Record<string, unknown> }).seoDetails || {}),
            metaTitle,
            metaDescription,
          },
        },
      })

      // SAFETY: confirm the slug did NOT change. It will only change if the
      // Projects.beforeValidate slug-decouple fix is NOT deployed on this
      // machine. If so, restore the slug and abort before damaging more rows.
      const after = await payload.findByID({ collection: 'projects', id: doc.id, depth: 0 })
      const newSlug = (after as { slug?: string }).slug
      if (originalSlug && newSlug && newSlug !== originalSlug) {
        await payload.update({
          collection: 'projects',
          id: doc.id,
          data: { slug: originalSlug }, // no title sent → slug is left as given
        })
        console.error(
          `\n✗ ABORT: slug changed "${originalSlug}" → "${newSlug}" (restored).\n` +
            `  The slug-decouple fix in src/collections/Projects.ts is NOT on this\n` +
            `  server yet. Upload the updated Projects.ts, then re-run this script.`,
        )
        await flushAndExit(1)
      }
      updated++
    }
  }

  console.log(
    `\n${dryRun ? 'DRY RUN — nothing written.' : `Done. Updated ${updated}.`}` +
      ` Skipped (not found): ${missing}. Title-length warnings: ${warnings}.`,
  )
  await flushAndExit(0)
}

// Top-level await (not run().catch(...)) so `payload run` waits for the whole
// async job to finish before exiting — otherwise it ends at module load and
// kills the work mid-flight.
try {
  await run()
} catch (err) {
  console.error(err)
  await flushAndExit(1)
}
