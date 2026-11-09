export type Grade = 'sahih' | 'hasan' | 'daif' | 'rejected' | 'athar' | 'ungraded'
export type CollectionId = 'bukhari' | 'muslim' | 'abudawud' | 'tirmidhi' | 'nasai' | 'ibnmajah'

export interface HadithRecord {
  id: string
  collection: string
  collection_id: CollectionId
  book: string
  book_number: number
  book_hadith_number: number | null
  chapter: string | null
  hadith_number: string
  sequence_number: string
  arabic_text: string | null
  bangla_translation: string | null
  english_translation: string | null
  narrator: string | null
  narrator_en: string | null
  authenticity: Grade
  authenticity_bn: string
  grades: { grader: string; grade: string }[]
  grading_source: string
  topics: string[]
  riyad_as_salihin: number[]
  source_url: string
  translation_check: 'passed' | 'flagged' | 'not_checked'
}

export interface ShardMeta { file: string; first: number; last: number; count: number }
export interface BookMeta { number: number; name: string; count: number; first: number }
export interface CollectionMeta {
  id: CollectionId
  en: string
  bn: string
  ar: string
  author_bn: string
  died: string
  desc_bn: string
  whole_sahih: boolean
  count: number
  grade_counts: Partial<Record<Grade, number>>
  books: BookMeta[]
  shards: ShardMeta[]
  search: { file: string; bytes: number }[]
}

export interface TopicMeta {
  id: string
  title: string
  title_en: string
  icon: string
  description: string
  keywords: string[]
  count: number
  sahih_count: number
  file: string
}
/** [id, collection, displayNumber, grade, narrator, snippet] */
export type TopicRow = [string, CollectionId, string, Grade, string | null, string]
/** [id, displayNumber, grade, bangla, englishLower] */
export type SearchRow = [string, string, Grade, string, string]

export interface CitedText { text: string; refs: string[] }
export interface Summary {
  topic_id: string
  title: string
  category_id: string
  aliases: string[]
  hadith_ids: string[]
  summary: {
    introduction: string
    combined_teachings: CitedText[]
    relationships: CitedText[]
    guidance: string[]
    warnings: string[]
    practical_lessons: string[]
    self_purification: string[]
    conclusion: string
  }
  review_status: 'reviewed' | 'pending_scholar_review'
}
