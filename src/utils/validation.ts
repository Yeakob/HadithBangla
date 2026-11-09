import type { HadithRecord } from '../types'

const REQUIRED: (keyof HadithRecord)[] = ['id', 'collection', 'collection_id', 'hadith_number', 'authenticity', 'source_url']

/** Runtime guard for records loaded from JSON. A record that fails is never shown. */
export function isValidRecord(r: unknown): r is HadithRecord {
  if (!r || typeof r !== 'object') return false
  const o = r as Record<string, unknown>
  if (!REQUIRED.every((k) => typeof o[k] === 'string' && (o[k] as string).length > 0)) return false
  if (!o.arabic_text && !o.bangla_translation && !o.english_translation) return false
  return String(o.source_url).startsWith('https://sunnah.com/')
}

/** Hash-route safe id (ASCII letters, digits, hyphens). */
export const isSafeId = (id: string) => /^[a-z]+-[0-9]+(-[0-9]+)?$/.test(id)
