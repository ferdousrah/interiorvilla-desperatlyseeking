/**
 * Match a free-text project `location` (e.g. "Gulshan 2, Dhaka",
 * "Jigatala, Dhanmondi area, Dhaka") to the most relevant service-area
 * document, for building contextual internal links between portfolio
 * projects and their service-area pages.
 *
 * Rules:
 *  - Prefer the most SPECIFIC area: a neighbourhood (Gulshan, Wari, Badda)
 *    wins over the parent city ("Dhaka"), which is only used as a fallback.
 *  - Tolerate common spelling variants seen in the `location` free text
 *    (Jessore→Jashore, Chattagram→Chattogram, Kustia→Kushtia, …).
 */

type AreaLike = { areaName?: string | null; slug?: string | null }

// Generic parent cities — only linked when no specific neighbourhood matches.
const GENERIC_PARENTS = new Set(['dhaka'])

// Spelling variants found in project `location` text → canonical area spelling.
const LOCATION_ALIASES: Record<string, string> = {
  jessore: 'jashore',
  chattagram: 'chattogram',
  chittagong: 'chattogram',
  kustia: 'kushtia',
  comilla: 'cumilla',
  barisal: 'barishal',
  bogra: 'bogura',
}

function normalize(s: string): string {
  let out = s.toLowerCase()
  for (const [from, to] of Object.entries(LOCATION_ALIASES)) {
    out = out.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }
  return out
}

export function matchServiceArea<T extends AreaLike>(
  location: string | null | undefined,
  areas: T[],
): T | null {
  if (!location) return null
  const haystack = normalize(location)

  const matches = areas.filter((a) => {
    const name = (a.areaName || '').toLowerCase().trim()
    return name.length > 1 && Boolean(a.slug) && haystack.includes(name)
  })
  if (matches.length === 0) return null

  // Prefer specific neighbourhoods over the generic parent city.
  const specific = matches.filter(
    (a) => !GENERIC_PARENTS.has((a.areaName || '').toLowerCase().trim()),
  )
  const pool = specific.length > 0 ? specific : matches

  // Most specific = longest area name (e.g. "Banani DOHS" over "Banani").
  const sorted = pool.slice().sort((a, b) => (b.areaName || '').length - (a.areaName || '').length)
  return sorted[0] ?? null
}
