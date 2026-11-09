import topicsJson from '../data/topics.json'
import type { CollectionId, Grade, TopicMeta, TopicRow } from '../types'
import { normalize } from '../utils/textSearch'
import { loadJson } from './dataLoader'

export const TOPICS = topicsJson as TopicMeta[]
export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<string, TopicMeta>

export const loadTopicRows = (id: string) => loadJson<TopicRow[]>(TOPIC_BY_ID[id].file)

export interface TopicFilter { collections: CollectionId[] | 'all'; grades: Grade[] | 'all' }

export function filterRows(rows: TopicRow[], f: TopicFilter) {
  return rows.filter(
    ([, c, , g]) => (f.collections === 'all' || f.collections.includes(c)) && (f.grades === 'all' || f.grades.includes(g)),
  )
}

/** Sahih first, Bukhari/Muslim first, then original order. */
export function rankRows(rows: TopicRow[]) {
  const gw: Record<Grade, number> = { sahih: 0, hasan: 1, athar: 2, ungraded: 3, daif: 4, rejected: 5 }
  const cw = (c: CollectionId) => (c === 'bukhari' ? 0 : c === 'muslim' ? 1 : 2)
  return rows.map((r, i) => ({ r, i })).sort((a, b) => gw[a.r[3]] - gw[b.r[3]] || cw(a.r[1]) - cw(b.r[1]) || a.i - b.i).map((x) => x.r)
}

/** Finds a browse category from free text (Bangla title, English title or keyword stem). */
export function matchTopic(q: string): TopicMeta | null {
  const n = normalize(q)
  if (!n) return null
  return (
    TOPICS.find((t) => normalize(t.title) === n || normalize(t.title_en) === n) ??
    TOPICS.find((t) => normalize(t.title).includes(n) || n.includes(normalize(t.title).split(' ')[0])) ??
    TOPICS.find((t) =>
      t.keywords.some((k) => {
        try {
          return new RegExp(`^(?:${k})$`, 'i').test(n)
        } catch {
          return false
        }
      }),
    ) ??
    null
  )
}
