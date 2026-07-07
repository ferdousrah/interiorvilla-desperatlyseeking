/**
 * Reusable Payload field-level validators for SEO fields.
 *
 * Usage:
 *   import { validateMetaDescription, validateMetaTitle } from '@/fields/seoValidators'
 *
 *   { name: 'metaDescription', type: 'textarea', validate: validateMetaDescription }
 */

/**
 * Recommend 50–160 chars for meta descriptions. Google truncates around
 * 155–160 chars on desktop and ~120 on mobile. Anything longer is allowed
 * but the editor sees a warning.
 *
 * Returns true on valid, a string on invalid.
 */
export const validateMetaDescription = (
  value: unknown,
): true | string => {
  if (typeof value !== 'string' || value.length === 0) return true
  if (value.length > 160) {
    return `Meta description is ${value.length} characters. Keep it under 160 — Google truncates longer descriptions in search results.`
  }
  return true
}

/**
 * Recommend keeping titles ≤ 60 chars. Google truncates around 60 on
 * desktop. Anything longer is allowed but the editor sees a warning.
 */
export const validateMetaTitle = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.length === 0) return true
  if (value.length > 60) {
    return `Meta title is ${value.length} characters. Keep it under 60 — Google truncates longer titles in search results.`
  }
  return true
}
