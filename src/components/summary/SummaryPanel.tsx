import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { SummaryResult } from '../../services/summaryEngine'
import { NOT_FOUND, NOT_INTERPRETATION, runSummary, SUMMARIES } from '../../services/summaryEngine'
import { COLLECTION_BY_ID, hadithHref } from '../../services/referenceResolver'
import { navigate } from '../../hooks/useRoute'
import { toBnDigits } from '../../utils/textSearch'
import { Notice, Skeleton } from '../ui/bits'
import { hasWebGL } from '../../utils/device'
import { useInView } from '../../hooks/useInView'
import { ReviewBadge } from './SummaryView'

const GeoStar = lazy(() => import('../three-d/GeoStar'))

/** Home-page "one topic, many hadith" panel: pick a topic and see the combined teaching instantly. */
export function SummaryPanel() {
  const reduce = useReducedMotion() ?? false
  const [ref, inView] = useInView<HTMLDivElement>()
  const webgl = useMemo(() => hasWebGL(), [])
  const [topic, setTopic] = useState(SUMMARIES[0].topic_id)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<SummaryResult | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    setBusy(true)
    runSummary(topic).then((r) => { if (alive) { setRes(r); setBusy(false) } })
    return () => { alive = false }
  }, [topic])

  return (
    <section ref={ref} className="relative mt-24 overflow-hidden bg-forest text-ivory" aria-labelledby="ai-title">
      <div className="pattern-stars pointer-events-none absolute inset-0 opacity-[.12]" aria-hidden />
      <div className="wrap relative grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <p className="mb-3 flex items-center gap-2 font-en text-[11px] font-semibold uppercase tracking-[0.22em] text-goldsoft"><Sparkles size={14} aria-hidden /> AI সারসংক্ষেপ</p>
          <h2 id="ai-title" className="text-[clamp(1.7rem,3.4vw,2.6rem)] font-semibold leading-tight">একটি বিষয়, একাধিক সহিহ হাদিসের সম্মিলিত শিক্ষা</h2>
          <p className="mt-3 max-w-lg text-[17px] text-ivory/75">বিভিন্ন সহিহ হাদিসের আলোকে একটি বিষয়ের পূর্ণাঙ্গ শিক্ষা জানুন।</p>
          <div className="relative mx-auto mt-6 h-44 w-44 sm:h-52 sm:w-52 lg:mx-0" aria-hidden>
            {webgl ? (
              <Suspense fallback={null}><GeoStar still={reduce} active={inView} /></Suspense>
            ) : (
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="h-full w-full text-goldsoft"><path fill="currentColor" d="M0-1L.29-.71.71-.71.71-.29 1 0 .71.29.71.71.29.71 0 1-.29.71-.71.71-.71.29-1 0-.71-.29-.71-.71-.29-.71z" /></svg>
            )}
          </div>
          <form className="mt-4" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { setPending(q.trim()); navigate('#summary') } }} role="search">
            <label htmlFor="ai-q" className="sr-only">বিষয় লিখুন</label>
            <div className="flex items-center gap-2 rounded-2xl border border-ivory/15 bg-night/50 p-1.5 pl-4 focus-within:border-goldsoft/60">
              <Search size={18} className="text-goldsoft" aria-hidden />
              <input id="ai-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="যেকোনো বিষয় লিখুন, যেমন: সততা"
                className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-ivory outline-none placeholder:text-ivory/45" />
              <button className="btn-gold h-11 px-4" type="submit">বিশ্লেষণ</button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="বিষয় নির্বাচন">
            {SUMMARIES.map((s) => (
              <button key={s.topic_id} type="button" onClick={() => setTopic(s.topic_id)} aria-pressed={topic === s.topic_id}
                className={`rounded-full border px-3.5 py-1.5 text-[14px] transition ${topic === s.topic_id ? 'border-goldsoft bg-goldsoft text-night' : 'border-ivory/20 text-ivory/85 hover:border-goldsoft/60'}`}>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-ivory/10 bg-surface p-6 text-ink shadow-lift sm:p-8">
          <AnimatePresence mode="wait">
            {busy || !res ? (
              <motion.div key="load" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} exit={{ opacity: 0.6 }}><Skeleton lines={6} /></motion.div>
            ) : res.kind === 'prepared' ? (
              <motion.div key={res.summary.topic_id} initial={{ y: 10 }} animate={{ y: 0 }} exit={{ y: -6 }} transition={{ duration: 0.3 }}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="mr-1 text-[22px] font-semibold">{res.summary.title}</h3>
                  <ReviewBadge s={res.summary} />
                </div>
                <p className="text-[16px] leading-relaxed text-muted">{res.summary.summary.introduction}</p>
                <ul className="mt-5 space-y-3">
                  {res.summary.summary.combined_teachings.slice(0, 3).map((t) => (
                    <li key={t.text} className="flex gap-3 text-[15.5px] leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-goldsoft" aria-hidden />
                      <span>{t.text}{' '}
                        {t.refs.map((id) => {
                          const h = res.hadith.find((x) => x.id === id)
                          return h ? <a key={id} href={hadithHref(id)} className="whitespace-nowrap text-[13px] text-gold hover:underline">[{COLLECTION_BY_ID[h.collection_id].bn} {toBnDigits(h.hadith_number)}]</a> : null
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5"><Notice>{NOT_INTERPRETATION}</Notice></div>
                <a href={`#summary-${res.summary.topic_id}`} className="btn-primary mt-5">পূর্ণ বিশ্লেষণ দেখুন (ক–ঞ) <ArrowRight size={17} aria-hidden /></a>
              </motion.div>
            ) : (
              <motion.p key="nf" className="text-[16px]">{NOT_FOUND}</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

let pending = ''
const setPending = (q: string) => { pending = q }
export const takeSummaryQuery = () => { const q = pending; pending = ''; return q }
