/**
 * Splits a section title so the last word can be rendered in the accent color,
 * matching the design pattern used across home page sections
 * (e.g. "Client Stories" → primary: "Client", highlight: "Stories").
 */
export function splitTitle(title: string): { primary: string; highlight: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { primary: '', highlight: words[0] || '' }
  const highlight = words.pop() as string
  return { primary: words.join(' '), highlight }
}
