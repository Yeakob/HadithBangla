import { ChevronLeft, ChevronRight, Minus, Plus, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { arabicSize, ArabicText, GradeCaution, HadithActions, HadithRow, TranslationCaution } from '../components/hadith/HadithParts'
import { ReadingProgress } from '../components/layout/Shell'
import { GradeBadge, Notice, Ornament, Skeleton } from '../components/ui/bits'
import { recordVisit } from '../hooks/useReadingHistory'
import { COLLECTION_BY_ID, getHadith, getNeighbours, hadithHref } from '../services/referenceResolver'
import { SUMMARIES } from '../services/summaryEngine'
import { loadTopicRows, rankRows, TOPIC_BY_ID } from '../services/topicEngine'
import type { HadithRecord, TopicRow } from '../types'
import { toBnDigits } from '../utils/textSearch'
import NotFound from './NotFound'

export default function HadithDetails({ id }: { id: string }) {
  const [r, setR] = useState<HadithRecord | null | undefined>(undefined)
  const [nb, setNb] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null })
  const [related, setRelated] = useState<TopicRow[]>([])
  const [showEn, setShowEn] = useState(false)
  const size = arabicSize.use()

  useEffect(() => {
    let alive = true
    setR(undefined); setRelated([])
    getHadith(id).then((x) => {
      if (!alive) return
      setR(x)
      if (!x) return
      recordVisit({ kind: 'hadith', id, label: `${COLLECTION_BY_ID[x.collection_id].bn} ${toBnDigits(x.hadith_number)}` })
      // related: the smallest topic this hadith is tagged with, sahih first, excluding itself
      const topics = [...x.topics].filter((t) => TOPIC_BY_ID[t]).sort((a, b) => TOPIC_BY_ID[a].count - TOPIC_BY_ID[b].count)
      if (topics[0]) loadTopicRows(topics[0]).then((rows) => alive && setRelated(rankRows(rows).filter((t) => t[0] !== id && t[3] === 'sahih').slice(0, 4)), () => {})
    }, () => alive && setR(null))
    getNeighbours(id).then((n) => alive && setNb(n), () => {})
    window.scrollTo({ top: 0 })
    return () => { alive = false }
  }, [id])

  if (r === null) return <NotFound what="এই হাদিসটি ডেটাবেসে পাওয়া যায়নি।" />
  const c = r ? COLLECTION_BY_ID[r.collection_id] : null
  const inSummaries = r ? SUMMARIES.filter((s) => s.hadith_ids.includes(r.id)) : []

  return (
    <>
      <ReadingProgress />
      <div className="wrap py-8 sm:py-12">
        <nav aria-label="অবস্থান" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><a className="hover:text-gold" href="#home">প্রথম পাতা</a></li><li aria-hidden>›</li>
            <li><a className="hover:text-gold" href="#collections">গ্রন্থাগার</a></li><li aria-hidden>›</li>
            {c && <><li><a className="hover:text-gold" href={`#collection-${c.id}`}>{c.bn}</a></li><li aria-hidden>›</li></>}
            <li aria-current="page" className="text-ink">হাদিস {r ? toBnDigits(r.hadith_number) : '…'}</li>
          </ol>
        </nav>

        {!r || !c ? <Skeleton lines={10} /> : (
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <article className="min-w-0">
              <header className="mb-6">
                <p className="eyebrow mb-2">{c.en} · <span lang="en">{r.book}</span></p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[clamp(1.7rem,3.6vw,2.5rem)] font-semibold">{c.bn}, হাদিস <span className="num">{toBnDigits(r.hadith_number)}</span></h1>
                  <GradeBadge grade={r.authenticity} className="text-sm" />
                </div>
                {r.narrator && <p className="mt-2 text-muted">বর্ণনাকারী: <span className="text-ink">{r.narrator}</span></p>}
              </header>

              <div className="space-y-3">
                <TranslationCaution r={r} />
                <GradeCaution grade={r.authenticity} />
              </div>

              {r.arabic_text && (
                <section className="card relative mt-5 overflow-hidden p-6 sm:p-9" aria-label="আরবি মূলপাঠ">
                  <div className="pattern-stars pointer-events-none absolute inset-0 opacity-[.08]" aria-hidden />
                  <div className="relative mb-4 flex items-center justify-between gap-3">
                    <span className="eyebrow">আরবি মূলপাঠ</span>
                    <div className="flex items-center gap-1" role="group" aria-label="আরবি লেখার আকার">
                      <Type size={16} className="text-muted" aria-hidden />
                      <button type="button" className="chip h-9 w-9 justify-center p-0" onClick={() => arabicSize.set(Math.max(0.8, +(size - 0.1).toFixed(2)))} aria-label="ছোট করুন"><Minus size={15} /></button>
                      <button type="button" className="chip h-9 w-9 justify-center p-0" onClick={() => arabicSize.set(Math.min(1.6, +(size + 0.1).toFixed(2)))} aria-label="বড় করুন"><Plus size={15} /></button>
                    </div>
                  </div>
                  <div className="relative"><ArabicText text={r.arabic_text} clamp={false} big /></div>
                </section>
              )}

              <Ornament className="my-8" />

              <section aria-label="বাংলা অনুবাদ">
                <h2 className="mb-3 text-[19px] font-semibold">বাংলা অনুবাদ</h2>
                {r.bangla_translation ? <p className="text-[18.5px] leading-[2]">{r.bangla_translation}</p> : <Notice>এই হাদিসের বাংলা অনুবাদ উৎসে নেই।</Notice>}
              </section>

              {r.english_translation && (
                <section className="mt-8" aria-label="English translation">
                  <button type="button" className="chip" aria-expanded={showEn} onClick={() => setShowEn(!showEn)}>
                    {showEn ? 'ইংরেজি অনুবাদ লুকান' : 'ইংরেজি অনুবাদ দেখুন (English)'}
                  </button>
                  {showEn && <p lang="en" className="mt-4 font-en text-[16px] leading-relaxed text-ink">{r.english_translation}</p>}
                </section>
              )}

              <div className="mt-8"><HadithActions r={r} /></div>

              <nav className="mt-10 grid grid-cols-2 gap-3" aria-label="আগের ও পরের হাদিস">
                {nb.prev ? <a href={hadithHref(nb.prev)} className="btn-ghost justify-start"><ChevronLeft size={17} aria-hidden /> আগের হাদিস</a> : <span />}
                {nb.next ? <a href={hadithHref(nb.next)} className="btn-ghost justify-end">পরের হাদিস <ChevronRight size={17} aria-hidden /></a> : <span />}
              </nav>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="card p-5">
                <h2 className="mb-3 font-semibold">তথ্যসূত্র</h2>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[14.5px]">
                  <dt className="text-muted">গ্রন্থ</dt><dd>{c.bn}</dd>
                  <dt className="text-muted">কিতাব</dt><dd lang="en" className="font-en text-[13.5px]">{r.book} <span className="text-muted">(#{r.book_number})</span></dd>
                  <dt className="text-muted">বাব (অধ্যায়)</dt><dd>{r.chapter ?? <span className="text-muted">উৎসে নেই</span>}</dd>
                  <dt className="text-muted">হাদিস নং</dt><dd className="num">{toBnDigits(r.hadith_number)}</dd>
                  {r.book_hadith_number != null && <><dt className="text-muted">কিতাবে ক্রম</dt><dd className="num">{toBnDigits(r.book_hadith_number)}</dd></>}
                  {r.riyad_as_salihin.length > 0 && <><dt className="text-muted">রিয়াদুস সালেহীন</dt><dd className="num">{toBnDigits(r.riyad_as_salihin.join(', '))}</dd></>}
                </dl>
                <a href={r.source_url} target="_blank" rel="noreferrer" className="mt-4 block break-all text-sm text-gold hover:underline">{r.source_url}</a>
              </div>
              <div className="card p-5">
                <h2 className="mb-1 font-semibold">হাদিসের মান</h2>
                <p className="mb-3 text-[13.5px] text-muted">{r.grading_source}</p>
                {r.grades.length > 0 ? (
                  <ul className="space-y-1.5 text-[14px]">
                    {r.grades.map((g) => <li key={g.grader} className="flex justify-between gap-3"><span className="font-en text-muted" lang="en">{g.grader}</span><span className="font-en" lang="en">{g.grade}</span></li>)}
                  </ul>
                ) : r.authenticity === 'sahih' ? <p className="text-sm">সংকলনটির সব হাদিস সহিহ হিসেবে গৃহীত।</p> : null}
              </div>
              {inSummaries.length > 0 && (
                <div className="card p-5">
                  <h2 className="mb-2 font-semibold">যে সারসংক্ষেপে ব্যবহৃত</h2>
                  <div className="flex flex-wrap gap-2">{inSummaries.map((s) => <a key={s.topic_id} className="chip" href={`#summary-${s.topic_id}`}>{s.title}</a>)}</div>
                </div>
              )}
              {r.topics.length > 0 && (
                <div className="card p-5">
                  <h2 className="mb-2 font-semibold">বিষয়</h2>
                  <div className="flex flex-wrap gap-2">
                    {r.topics
                      .filter((t) => TOPIC_BY_ID[t])
                      .map((t) => (
                        <a key={t} className="chip" href={`#topic-${t}`}>
                          {TOPIC_BY_ID[t].title}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="rel-h">
            <h2 id="rel-h" className="mb-4 text-[21px] font-semibold">সংশ্লিষ্ট হাদিস</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {related.map(([rid, cc, n, g, nar, sn]) => <HadithRow key={rid} id={rid} collection={cc} number={n} grade={g} narrator={nar} snippet={sn} />)}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
