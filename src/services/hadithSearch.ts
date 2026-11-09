import type { CollectionId, Grade, SearchRow } from '../types'
import { excerpt, matchesAll, normalize, tokens, toEnDigits } from '../utils/textSearch'
import { loadJson } from './dataLoader'
import { COLLECTION_BY_ID, COLLECTIONS } from './referenceResolver'

export interface SearchHit { id: string; number: string; grade: Grade; collection: CollectionId; snippet: string; lang: 'bn' | 'en' }
export interface SearchProgress { done: number; total: number; hits: SearchHit[]; finished: boolean }

const NAME_ALIASES: Record<CollectionId, string[]> = {
  bukhari: ['বুখারি', 'বুখারী', 'bukhari', 'bukhary'],
  muslim: ['মুসলিম', 'muslim'],
  abudawud: ['আবু দাউদ', 'আবূ দাঊদ', 'আবু দাঊদ', 'abu dawud', 'abudawud', 'abu dawood'],
  tirmidhi: ['তিরমিজি', 'তিরমিযী', 'তিরমিযি', 'tirmidhi', 'tirmizi'],
  nasai: ['নাসাঈ', 'নাসায়ী', 'নাসাই', 'nasai', "nasa'i"],
  ibnmajah: ['ইবনে মাজাহ', 'ইবনু মাজাহ', 'ইবন মাজাহ', 'ibn majah', 'ibnmajah'],
}

/** "বুখারি ৬০৯৪" / "bukhari 6094" -> direct reference. Muslim uses Abdul-Baqi numbers (matched in shard). */
export function parseReference(q: string): { collection: CollectionId; number: string } | null {
  const n = normalize(q)
  for (const [cid, names] of Object.entries(NAME_ALIASES) as [CollectionId, string[]][]) {
    for (const name of names) {
      const m = new RegExp(`^${name.toLowerCase()}\\s*[:#\\-]?\\s*(\\d+)$`).exec(n)
      if (m) return { collection: cid, number: toEnDigits(m[1]) }
    }
  }
  return null
}

/**
 * Progressive full-text search over the selected collections' search shards.
 * Calls onProgress after every shard so results stream in. Returns a cancel function.
 */
export function searchHadith(
  query: string,
  opts: { collections: CollectionId[]; grades: Grade[] | 'all'; limit?: number },
  onProgress: (p: SearchProgress) => void,
): () => void {
  const toks = tokens(query)
  const limit = opts.limit ?? 300
  let cancelled = false
  const files = opts.collections.flatMap((c) => COLLECTION_BY_ID[c].search.map((s) => ({ c, file: s.file })))
  const hits: SearchHit[] = []
  ;(async () => {
    let done = 0
    for (const { c, file } of files) {
      if (cancelled) return
      try {
        const rows = await loadJson<SearchRow[]>(file)
        for (const [id, num, grade, bn, en] of rows) {
          if (hits.length >= limit) break
          if (opts.grades !== 'all' && !opts.grades.includes(grade)) continue
          const nb = normalize(bn)
          if (matchesAll(nb, toks)) {
            hits.push({ id, number: num, grade, collection: c, snippet: excerpt(bn, toks), lang: 'bn' })
          } else if (en && matchesAll(en, toks)) {
            hits.push({ id, number: num, grade, collection: c, snippet: excerpt(en, toks), lang: 'en' })
          }
        }
      } catch {
        /* a missing shard is reported through the progress count */
      }
      done++
      if (!cancelled) onProgress({ done, total: files.length, hits: [...hits], finished: done === files.length || hits.length >= limit })
      if (hits.length >= limit) return
    }
  })()
  return () => { cancelled = true }
}

/** Approximate download size (MB) for searching the given collections. */
export const searchSizeMb = (cs: CollectionId[]) =>
  Math.round(cs.reduce((n, c) => n + COLLECTION_BY_ID[c].search.reduce((m, s) => m + s.bytes, 0), 0) / 1e6)

export const ALL_COLLECTION_IDS = COLLECTIONS.map((c) => c.id)
