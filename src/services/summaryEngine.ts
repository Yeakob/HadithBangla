import summariesJson from '../data/summaries.json'
import type { HadithRecord, Summary, TopicMeta, TopicRow } from '../types'
import { normalize, tokens } from '../utils/textSearch'
import { getFeatured, getHadith } from './referenceResolver'
import { loadTopicRows, matchTopic, rankRows, TOPIC_BY_ID } from './topicEngine'

export const SUMMARIES = summariesJson as Summary[]
export const SUMMARY_BY_ID = Object.fromEntries(SUMMARIES.map((s) => [s.topic_id, s])) as Record<string, Summary>

export const NOT_INTERPRETATION =
  'এটি একাধিক সহিহ হাদিসের আলোকে প্রস্তুতকৃত ব্যাখ্যামূলক সারসংক্ষেপ; সরাসরি হাদিসের ভাষ্য নয়।'
export const NOT_FOUND = 'এই বিষয়ে পর্যাপ্ত যাচাইকৃত হাদিস বর্তমানে ডেটাবেসে পাওয়া যায়নি।'

export type SummaryResult =
  | { kind: 'prepared'; summary: Summary; hadith: HadithRecord[]; missing: string[]; related: Summary[]; category: TopicMeta | null }
  | { kind: 'composed'; category: TopicMeta; rows: TopicRow[]; related: Summary[] }
  | { kind: 'not_found'; query: string }

/** Maps free text to a prepared summary through its aliases. */
export function matchSummary(q: string): Summary | null {
  const n = normalize(q)
  if (!n) return null
  const toks = tokens(n)

  // 1. Exact alias match
  const exact = SUMMARIES.find((s) => s.aliases.some((a) => normalize(a) === n))
  if (exact) return exact

  // 2. Full token / word match (e.g. token 'মা' or 'সততা' matches alias 'মা' or 'সততা')
  const tokenMatch = SUMMARIES.find((s) =>
    s.aliases.some((a) => {
      const na = normalize(a)
      return toks.includes(na) || tokens(na).every((t) => toks.includes(t))
    }),
  )
  if (tokenMatch) return tokenMatch

  // 3. Substring match for longer phrases (minimum 4 characters) to avoid false positives on short words
  return (
    SUMMARIES.find((s) =>
      s.aliases.some((a) => {
        const na = normalize(a)
        if (na.length < 4) return false
        return n.includes(na) || na.includes(n)
      }),
    ) ?? null
  )
}

function relatedFor(s: { topic_id?: string; category_id?: string }): Summary[] {
  return SUMMARIES.filter((x) => x.topic_id !== s.topic_id).sort(
    (a, b) => Number(b.category_id === s.category_id) - Number(a.category_id === s.category_id),
  ).slice(0, 4)
}

/**
 * The summary engine: reads the topic, resolves every cited hadith ID against the local
 * database, drops (and reports) anything missing, and attaches related topics.
 * For categories with no prepared summary it composes a template view from verified records
 * only, without writing any new teaching.
 */
export async function runSummary(query: string): Promise<SummaryResult> {
  const s = SUMMARY_BY_ID[query] ?? matchSummary(query)
  if (s) {
    const resolved = await Promise.all(s.hadith_ids.map(async (id) => getFeatured(id) ?? (await getHadith(id))))
    const hadith = resolved.filter((r): r is HadithRecord => !!r && r.authenticity === 'sahih')
    const missing = s.hadith_ids.filter((id) => !hadith.some((h) => h.id === id))
    if (hadith.length === 0) return { kind: 'not_found', query }
    return { kind: 'prepared', summary: s, hadith, missing, related: relatedFor(s), category: TOPIC_BY_ID[s.category_id] ?? null }
  }
  const cat = TOPIC_BY_ID[query] ?? matchTopic(query)
  if (cat) {
    const rows = rankRows(await loadTopicRows(cat.id)).filter((r) => r[3] === 'sahih' && (r[1] === 'bukhari' || r[1] === 'muslim'))
    if (rows.length === 0) return { kind: 'not_found', query }
    const prepared = SUMMARIES.find((x) => x.category_id === cat.id)
    if (prepared) return runSummary(prepared.topic_id)
    return { kind: 'composed', category: cat, rows: rows.slice(0, 8), related: relatedFor({ category_id: cat.id }) }
  }
  return { kind: 'not_found', query }
}
