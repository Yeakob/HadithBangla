import { motion } from 'framer-motion'
import { ArrowRight, Search as SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HadithRow } from '../components/hadith/HadithParts'
import { Notice } from '../components/ui/bits'
import { CollectionChips, GradeChips, gradeList, PageHeader, type GradeFilter } from '../components/ui/filters'
import { takePendingQuery } from '../hooks/useRoute'
import { parseReference, searchHadith, searchSizeMb, type SearchProgress } from '../services/hadithSearch'
import { COLLECTION_BY_ID } from '../services/referenceResolver'
import muslimIndex from '../data/muslim-index.json'
import { matchSummary } from '../services/summaryEngine'
import type { CollectionId } from '../types'
import { toBnDigits } from '../utils/textSearch'

const EXAMPLES = ['প্রতিবেশী', 'নিয়্যত', 'মায়ের', 'রাগ করো না', 'বুখারি ১', 'মুসলিম ৯১', 'patience']

export default function Search() {
  const [q, setQ] = useState(() => takePendingQuery())
  const [active, setActive] = useState(q)
  const [cols, setCols] = useState<CollectionId[]>(['bukhari', 'muslim'])
  const [grade, setGrade] = useState<GradeFilter>('sahih-hasan')
  const [prog, setProg] = useState<SearchProgress | null>(null)
  const [direct, setDirect] = useState<{ id: string; label: string } | 'missing' | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { input.current?.focus() }, [])

  useEffect(() => {
    setDirect(null)
    if (!active.trim()) { setProg(null); return }
    const ref = parseReference(active)
    if (ref) {
      const c = COLLECTION_BY_ID[ref.collection]
      // Muslim uses Abdul-Baqi numbers, so look the number up in the shards; others map 1:1 to ids
      if (ref.collection === 'muslim') {
        const hit = (muslimIndex as Record<string, string>)[ref.number]
        setDirect(hit ? { id: hit, label: `${c.bn} ${toBnDigits(ref.number)}` } : 'missing')
      } else {
        const id = `${ref.collection}-${ref.number}`
        const has = c.shards.some((s) => +ref.number >= s.first && +ref.number <= s.last)
        setDirect(has ? { id, label: `${c.bn} ${toBnDigits(ref.number)}` } : 'missing')
      }
    }
    setProg({ done: 0, total: 1, hits: [], finished: false })
    return searchHadith(active, { collections: cols, grades: gradeList(grade), limit: 300 }, setProg)
  }, [active, cols, grade])

  const summary = active ? matchSummary(active) : null
  const pct = prog ? Math.round((prog.done / Math.max(1, prog.total)) * 100) : 0

  return (
    <>
      <PageHeader eyebrow="অনুসন্ধান" title="হাদিস খুঁজুন" crumbs={[['প্রথম পাতা', '#home'], ['অনুসন্ধান', '']]}
        desc="বাংলা বা ইংরেজি শব্দ লিখুন, অথবা সরাসরি নম্বর দিন (যেমন “বুখারি ৬০৯৪”)। একাধিক শব্দ দিলে সবগুলো আছে এমন হাদিস দেখানো হবে।" />
      <div className="wrap py-10">
        <form onSubmit={(e) => { e.preventDefault(); setActive(q.trim()) }} role="search" className="mb-5">
          <label htmlFor="search-q" className="sr-only">অনুসন্ধানের শব্দ</label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input id="search-q" ref={input} className="input pl-11 text-[17px]" value={q} onChange={(e) => setQ(e.target.value)} placeholder="শব্দ, বাক্যাংশ বা হাদিস নম্বর" />
            </div>
            <button className="btn-primary px-6" type="submit">খুঁজুন</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">উদাহরণ:</span>
            {EXAMPLES.map((e) => <button key={e} type="button" className="chip min-h-8 text-[13px]" onClick={() => { setQ(e); setActive(e) }}>{e}</button>)}
          </div>
        </form>

        <div className="mb-6 grid gap-4 rounded-2xl border border-line/80 bg-raised/40 p-4 md:grid-cols-2">
          <div><p className="mb-2 text-sm font-semibold">কোন গ্রন্থে খুঁজবেন</p><CollectionChips value={cols} onChange={setCols} /></div>
          <div>
            <p className="mb-2 text-sm font-semibold">মান</p><GradeChips value={grade} onChange={setGrade} />
            <p className="mt-2 text-[12.5px] text-muted">প্রথমবার খুঁজতে নির্বাচিত গ্রন্থগুলোর প্রায় {toBnDigits(searchSizeMb(cols))} MB ডেটা লোড হবে; পরে এই ভিজিটে আবার লাগবে না।</p>
          </div>
        </div>

        {direct && direct !== 'missing' && (
          <a href={`#hadith-${direct.id}`} className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-goldsoft/10 p-4 font-semibold hover:border-gold">
            সরাসরি যান: {direct.label} <ArrowRight size={18} aria-hidden />
          </a>
        )}
        {direct === 'missing' && <div className="mb-5"><Notice tone="warn">এই নম্বরের হাদিস ডেটাবেসে পাওয়া যায়নি।</Notice></div>}
        {summary && (
          <a href={`#summary-${summary.topic_id}`} className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-gold/60">
            <span>“{summary.title}” বিষয়ে একাধিক সহিহ হাদিসের সম্মিলিত সারসংক্ষেপ আছে</span><ArrowRight size={18} aria-hidden />
          </a>
        )}

        {prog && (
          <div aria-live="polite">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted">
              <span>{toBnDigits(prog.hits.length)}টি ফলাফল{prog.hits.length >= 300 ? ' (প্রথম ৩০০টি দেখানো হচ্ছে; শব্দ যোগ করে নির্দিষ্ট করুন)' : ''}</span>
              {!prog.finished && <span>খোঁজা হচ্ছে… {toBnDigits(pct)}%</span>}
            </div>
            <div className="mb-5 h-1 overflow-hidden rounded-full bg-raised">
              <motion.div className="h-full bg-goldsoft" animate={{ width: `${prog.finished ? 100 : pct}%` }} />
            </div>
            {prog.finished && prog.hits.length === 0 && (
              <Notice>নির্বাচিত গ্রন্থ ও মানে “{active}” পাওয়া যায়নি। বানান বদলে, অন্য শব্দে বা সব গ্রন্থে খুঁজে দেখুন।</Notice>
            )}
            <ul className="space-y-3">
              {prog.hits.map((h) => <HadithRow key={h.id} id={h.id} collection={h.collection} number={h.number} grade={h.grade} snippet={h.snippet} lang={h.lang} />)}
            </ul>
          </div>
        )}
        {!prog && <p className="text-muted">উপরে একটি শব্দ লিখে খুঁজুন।</p>}
      </div>
    </>
  )
}
