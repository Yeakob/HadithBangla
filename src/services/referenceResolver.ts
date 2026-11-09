import collectionsJson from '../data/collections.json'
import featuredJson from '../data/featured.json'
import type { CollectionId, CollectionMeta, HadithRecord } from '../types'
import { isValidRecord } from '../utils/validation'
import { toBnDigits } from '../utils/textSearch'
import { loadJson } from './dataLoader'

export const COLLECTIONS = collectionsJson as unknown as CollectionMeta[]
export const COLLECTION_BY_ID = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c])) as Record<CollectionId, CollectionMeta>
const FEATURED = featuredJson as unknown as Record<string, HadithRecord>

export const TOTAL_HADITH = COLLECTIONS.reduce((n, c) => n + c.count, 0)

/** "bukhari-774-2" -> { collection: 'bukhari', seq: 774.2 } */
export function parseId(id: string): { collection: CollectionId; seq: number } | null {
  const m = /^([a-z]+)-(\d+)(?:-(\d+))?$/.exec(id)
  if (!m || !(m[1] in COLLECTION_BY_ID)) return null
  return { collection: m[1] as CollectionId, seq: Number(m[3] ? `${m[2]}.${m[3]}` : m[2]) }
}

export function shardFor(id: string) {
  const p = parseId(id)
  if (!p) return null
  const c = COLLECTION_BY_ID[p.collection]
  return c.shards.find((s) => p.seq >= s.first && p.seq <= s.last) ?? null
}

export function loadShard(file: string) {
  return loadJson<HadithRecord[]>(file)
}

/** Resolves one record: featured bundle first (instant), otherwise its data shard. */
export async function getHadith(id: string): Promise<HadithRecord | null> {
  if (FEATURED[id]) return FEATURED[id]
  const shard = shardFor(id)
  if (!shard) return null
  const rows = await loadShard(shard.file)
  const r = rows.find((x) => x.id === id)
  return r && isValidRecord(r) ? r : null
}

export const getFeatured = (id: string) => FEATURED[id] ?? null

/** Neighbouring records in the same collection (for previous / next). */
export async function getNeighbours(id: string): Promise<{ prev: string | null; next: string | null }> {
  const p = parseId(id)
  if (!p) return { prev: null, next: null }
  const c = COLLECTION_BY_ID[p.collection]
  const idx = c.shards.findIndex((s) => p.seq >= s.first && p.seq <= s.last)
  if (idx < 0) return { prev: null, next: null }
  const rows = await loadShard(c.shards[idx].file)
  const i = rows.findIndex((r) => r.id === id)
  let prev = i > 0 ? rows[i - 1].id : null
  let next = i >= 0 && i < rows.length - 1 ? rows[i + 1].id : null
  if (i === 0 && idx > 0) {
    const before = await loadShard(c.shards[idx - 1].file)
    prev = before[before.length - 1]?.id ?? null
  }
  if (i === rows.length - 1 && idx < c.shards.length - 1) next = (await loadShard(c.shards[idx + 1].file))[0]?.id ?? null
  return { prev, next }
}

export const citeBn = (r: Pick<HadithRecord, 'collection_id' | 'hadith_number'>) =>
  `${COLLECTION_BY_ID[r.collection_id].bn}, হাদিস ${toBnDigits(r.hadith_number)}`

export function reference(r: Pick<HadithRecord, 'collection_id' | 'hadith_number'>) {
  return `${COLLECTION_BY_ID[r.collection_id].bn} — হাদিস ${toBnDigits(r.hadith_number)}`
}

export const hadithHref = (id: string) => `#hadith-${id}`
