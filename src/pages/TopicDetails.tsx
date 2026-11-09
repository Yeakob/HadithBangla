import { Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { HadithRow } from '../components/hadith/HadithParts'
import { Notice, Skeleton, TopicIcon } from '../components/ui/bits'
import { CollectionChips, GradeChips, gradeList, PageHeader, Pager, type GradeFilter } from '../components/ui/filters'
import { recordVisit } from '../hooks/useReadingHistory'
import { COLLECTIONS } from '../services/referenceResolver'
import { SUMMARIES } from '../services/summaryEngine'
import { filterRows, loadTopicRows, rankRows, TOPIC_BY_ID } from '../services/topicEngine'
import type { CollectionId, TopicRow } from '../types'
import { bnNum, normalize, toBnDigits } from '../utils/textSearch'
import NotFound from './NotFound'

const PER = 20

export default function TopicDetails({ id }: { id: string }) {
  const t = TOPIC_BY_ID[id]
  const [rows, setRows] = useState<TopicRow[] | null>(null)
  const [err, setErr] = useState(false)
  const [cols, setCols] = useState<CollectionId[]>(COLLECTIONS.map((c) => c.id))
  const [grade, setGrade] = useState<GradeFilter>('sahih')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!t) return
    setRows(null); setErr(false); setPage(1)
    recordVisit({ kind: 'topic', id, label: `বিষয়: ${t.title}` })
    loadTopicRows(id).then((r) => setRows(rankRows(r)), () => setErr(true))
  }, [id, t])

  const filtered = useMemo(() => {
    if (!rows) return []
    const f = filterRows(rows, { collections: cols, grades: gradeList(grade) })
    const n = normalize(q)
    return n ? f.filter((r) => normalize(r[5] + ' ' + (r[4] ?? '')).includes(n)) : f
  }, [rows, cols, grade, q])
  useEffect(() => setPage(1), [cols, grade, q])

  if (!t) return <NotFound />
  const summary = SUMMARIES.find((s) => s.category_id === id)
  const pages = Math.ceil(filtered.length / PER)
  return (
    <>
      <PageHeader eyebrow={t.title_en} title={t.title} crumbs={[['প্রথম পাতা', '#home'], ['বিষয়সমূহ', '#topics'], [t.title, '']]}
        desc={<span className="flex items-center gap-2"><TopicIcon name={t.icon} className="h-5 w-5 text-gold" />{t.description} মোট {bnNum(t.count)}টি, সহিহ {bnNum(t.sahih_count)}টি।</span>} />
      <div className="wrap grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {summary && (
            <a href={`#summary-${summary.topic_id}`} className="block rounded-2xl border border-gold/40 bg-goldsoft/10 p-4 hover:border-gold">
              <p className="flex items-center gap-2 font-semibold text-gold"><Sparkles size={16} aria-hidden /> সম্মিলিত সারসংক্ষেপ</p>
              <p className="mt-1 text-sm text-muted">“{summary.title}” বিষয়ে একাধিক সহিহ হাদিসের সম্মিলিত শিক্ষা পড়ুন।</p>
            </a>
          )}
          <div><p className="mb-2 text-sm font-semibold">মান</p><GradeChips value={grade} onChange={setGrade} /></div>
          <div><p className="mb-2 text-sm font-semibold">গ্রন্থ</p><CollectionChips value={cols} onChange={setCols} /></div>
          <div>
            <label htmlFor="topic-q" className="mb-2 block text-sm font-semibold">এই বিষয়ের মধ্যে খুঁজুন</label>
            <input id="topic-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="শব্দ বা বর্ণনাকারী" />
          </div>
        </aside>
        <div className="min-w-0">
          {grade === 'all' && <div className="mb-4"><Notice tone="warn">যঈফ ও জাল হিসেবে চিহ্নিত বর্ণনাও দেখানো হচ্ছে; প্রতিটির মান পাশে লেখা আছে।</Notice></div>}
          {err ? <Notice tone="warn">বিষয়ের তালিকা লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে পাতাটি আবার খুলুন।</Notice> : !rows ? <Skeleton lines={8} /> : (
            <>
              <p className="mb-3 text-sm text-muted">{toBnDigits(filtered.length)}টি ফলাফল · সহিহ ও বুখারি-মুসলিমের হাদিস আগে</p>
              {filtered.length === 0 ? <p className="text-muted">এই ফিল্টারে কোনো হাদিস নেই।</p> : (
                <ul className="space-y-3">
                  {filtered.slice((page - 1) * PER, page * PER).map(([rid, c, n, g, nar, sn]) => <HadithRow key={rid} id={rid} collection={c} number={n} grade={g} narrator={nar} snippet={sn} />)}
                </ul>
              )}
              <Pager page={page} pages={pages} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
