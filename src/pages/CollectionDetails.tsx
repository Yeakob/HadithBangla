import { useEffect, useMemo, useState } from 'react'
import { HadithRow } from '../components/hadith/HadithParts'
import { BookCover, GradeBar } from '../components/library/CollectionCard'
import { Notice, Skeleton } from '../components/ui/bits'
import { GradeChips, gradeList, PageHeader, Pager, type GradeFilter } from '../components/ui/filters'
import { COLLECTION_BY_ID, loadShard } from '../services/referenceResolver'
import type { CollectionId, HadithRecord } from '../types'
import { bnNum, normalize, toBnDigits } from '../utils/textSearch'
import NotFound from './NotFound'

const PER = 25

export default function CollectionDetails({ id }: { id: string }) {
  const c = COLLECTION_BY_ID[id as CollectionId]
  const [book, setBook] = useState<number | null>(c?.books[0]?.number ?? null)
  const [rows, setRows] = useState<HadithRecord[] | null>(null)
  const [err, setErr] = useState(false)
  const [grade, setGrade] = useState<GradeFilter>(c?.whole_sahih ? 'all' : 'sahih-hasan')
  const [bq, setBq] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { if (c) { setBook(c.books[0]?.number ?? null); setGrade(c.whole_sahih ? 'all' : 'sahih-hasan') } }, [c])

  useEffect(() => {
    if (!c || book == null) return
    let alive = true
    setRows(null); setErr(false); setPage(1)
    const i = c.books.findIndex((b) => b.number === book)
    if (i < 0) return
    const start = c.books[i].first
    const end = c.books[i + 1]?.first ?? Infinity
    const shards = c.shards.filter((s) => s.last >= start && s.first < end)
    Promise.all(shards.map((s) => loadShard(s.file)))
      .then((parts) => alive && setRows(parts.flat().filter((r) => r.book_number === book)))
      .catch(() => alive && setErr(true))
    return () => { alive = false }
  }, [c, book])

  const books = useMemo(() => {
    const n = normalize(bq)
    return c ? (n ? c.books.filter((b) => normalize(b.name).includes(n) || String(b.number) === n) : c.books) : []
  }, [c, bq])
  const filtered = useMemo(() => {
    const gl = gradeList(grade)
    return (rows ?? []).filter((r) => gl === 'all' || gl.includes(r.authenticity))
  }, [rows, grade])
  useEffect(() => setPage(1), [grade])

  if (!c) return <NotFound />
  const cur = c.books.find((b) => b.number === book)
  return (
    <>
      <PageHeader eyebrow={c.en} title={c.bn} crumbs={[['প্রথম পাতা', '#home'], ['গ্রন্থাগার', '#collections'], [c.bn, '']]}
        desc={<>{c.author_bn} (মৃ. {c.died}) · {bnNum(c.count)}টি হাদিস · {toBnDigits(c.books.length)}টি কিতাব</>} />
      <div className="wrap grid gap-8 py-10 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block"><BookCover c={c} /></div>
          <p className="text-[14.5px] text-muted">{c.desc_bn}</p>
          <GradeBar c={c} />
          <div>
            <label htmlFor="book-q" className="mb-2 block text-sm font-semibold">কিতাব (অধ্যায়) বেছে নিন</label>
            <input id="book-q" className="input mb-2" value={bq} onChange={(e) => setBq(e.target.value)} placeholder="কিতাবের নাম বা নম্বর (ইংরেজিতে)" />
            <ul className="max-h-[46vh] space-y-1 overflow-y-auto rounded-xl border border-line bg-surface p-1.5" role="listbox" aria-label="কিতাব">
              {books.map((b) => (
                <li key={b.number}>
                  <button type="button" role="option" aria-selected={b.number === book} onClick={() => setBook(b.number)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[14px] ${b.number === book ? 'bg-emerald text-ivory' : 'hover:bg-raised'}`}>
                    <span className="num w-7 shrink-0 opacity-70">{toBnDigits(b.number)}</span>
                    <span lang="en" className="min-w-0 flex-1 font-en text-[13.5px]">{b.name || 'কিতাবের নাম উৎসে নেই'}</span>
                    <span className="num shrink-0 text-xs opacity-70">{toBnDigits(b.count)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">কিতাব {cur ? toBnDigits(cur.number) : ''}</p>
              <h2 lang="en" className="font-en text-[22px] font-semibold">{cur?.name || 'কিতাবের নাম উৎসে নেই'}</h2>
            </div>
            <GradeChips value={grade} onChange={setGrade} />
          </div>
          {grade === 'all' && !c.whole_sahih && <div className="mb-4"><Notice tone="warn">যঈফ ও জাল হিসেবে চিহ্নিত বর্ণনাও দেখানো হচ্ছে; প্রতিটির মান পাশে লেখা আছে।</Notice></div>}
          {err ? <Notice tone="warn">এই কিতাবটি লোড করা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।</Notice> : !rows ? <Skeleton lines={8} /> : (
            <>
              <p className="mb-3 text-sm text-muted">{toBnDigits(filtered.length)}টি হাদিস</p>
              {filtered.length === 0 ? <p className="text-muted">এই ফিল্টারে কোনো হাদিস নেই।</p> : (
                <ul className="space-y-3">
                  {filtered.slice((page - 1) * PER, page * PER).map((r) => (
                    <HadithRow key={r.id} id={r.id} collection={r.collection_id} number={r.hadith_number} grade={r.authenticity} narrator={r.narrator}
                      snippet={r.bangla_translation ?? r.english_translation ?? ''} lang={r.bangla_translation ? 'bn' : 'en'} />
                  ))}
                </ul>
              )}
              <Pager page={page} pages={Math.ceil(filtered.length / PER)} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
