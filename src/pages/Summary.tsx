import { Bot, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ComposedSummary, NotFoundSummary, PreparedSummary } from '../components/summary/SummaryView'
import { takeSummaryQuery } from '../components/summary/SummaryPanel'
import { Notice, Skeleton } from '../components/ui/bits'
import { PageHeader } from '../components/ui/filters'
import { recordVisit } from '../hooks/useReadingHistory'
import { navigate } from '../hooks/useRoute'
import { aiProvider } from '../services/aiProvider'
import type { SummaryResult } from '../services/summaryEngine'
import { runSummary, SUMMARIES, SUMMARY_BY_ID } from '../services/summaryEngine'
import { TOPICS } from '../services/topicEngine'

export default function SummaryPage({ id }: { id: string | null }) {
  const [q, setQ] = useState('')
  const [query, setQuery] = useState<string>(() => takeSummaryQuery() || id || SUMMARIES[0].topic_id)
  const [res, setRes] = useState<SummaryResult | null>(null)

  useEffect(() => { if (id) setQuery(id) }, [id])
  useEffect(() => {
    let alive = true
    setRes(null)
    runSummary(query).then((r) => {
      if (!alive) return
      setRes(r)
      if (r.kind === 'prepared') recordVisit({ kind: 'summary', id: r.summary.topic_id, label: `সারসংক্ষেপ: ${r.summary.title}` })
    })
    return () => { alive = false }
  }, [query])

  const current = res?.kind === 'prepared' ? res.summary.topic_id : res?.kind === 'composed' ? res.category.id : null
  const choose = (topicId: string) => (SUMMARY_BY_ID[topicId] ? navigate(`#summary-${topicId}`) : setQuery(topicId))

  return (
    <>
      <PageHeader eyebrow="AI বিশ্লেষণ কক্ষ" title="একাধিক হাদিসের সম্মিলিত সারসংক্ষেপ" crumbs={[['প্রথম পাতা', '#home'], ['AI সারসংক্ষেপ', '']]}
        desc="একটি বিষয় বেছে নিন: সংশ্লিষ্ট সহিহ হাদিস, সেগুলোর সম্মিলিত শিক্ষা, পারস্পরিক সম্পর্ক ও বাস্তব প্রয়োগ এক জায়গায়।" />
      <div className="wrap grid gap-8 py-10 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) setQuery(q.trim()) }} role="search">
            <label htmlFor="sum-q" className="mb-2 block text-sm font-semibold">যেকোনো বিষয় লিখুন</label>
            <div className="flex gap-2">
              <input id="sum-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="যেমন: রাগ, মা, সদকা" />
              <button className="btn-primary px-4" type="submit" aria-label="বিশ্লেষণ করুন"><Search size={18} /></button>
            </div>
          </form>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Sparkles size={15} className="text-gold" aria-hidden /> প্রস্তুতকৃত সারসংক্ষেপ</p>
            <div className="flex flex-wrap gap-2">
              {SUMMARIES.map((s) => <button key={s.topic_id} type="button" className="chip" aria-pressed={current === s.topic_id} onClick={() => choose(s.topic_id)}>{s.title}</button>)}
            </div>
          </div>
          <details className="group" open={typeof matchMedia === 'function' && matchMedia('(min-width: 1024px)').matches}>
            <summary className="mb-2 cursor-pointer list-none text-sm font-semibold marker:hidden">
              অন্যান্য বিষয় (হাদিস সংকলন) <span className="text-muted group-open:hidden">· দেখুন</span>
            </summary>
            <div className="flex flex-wrap gap-2">
              {TOPICS.filter((t) => !SUMMARIES.some((s) => s.category_id === t.id)).map((t) => (
                <button key={t.id} type="button" className="chip text-[13px]" aria-pressed={current === t.id} onClick={() => choose(t.id)}>{t.title}</button>
              ))}
            </div>
          </details>
          <div className="rounded-xl border border-line bg-raised/50 p-4 text-[13.5px] text-muted">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink"><Bot size={15} aria-hidden /> কীভাবে কাজ করে</p>
            {aiProvider.enabled ? `সংযুক্ত মডেল: ${aiProvider.name}। ` : 'এখানে কোনো লাইভ AI মডেল যুক্ত নেই। '}ইঞ্জিনটি স্থানীয় JSON থেকে বিষয়ের প্রস্তুতকৃত ব্যাখ্যা পড়ে, উল্লিখিত প্রতিটি হাদিস ডেটাবেসে আছে কি না ও সহিহ কি না যাচাই করে, তারপর সাজিয়ে দেখায়। নতুন কোনো বিধান বা উদ্ধৃতি তৈরি করে না।
          </div>
        </aside>
        <div className="min-w-0">
          {!res ? <Skeleton lines={12} /> : res.kind === 'prepared' ? <PreparedSummary result={res} /> : res.kind === 'composed' ? <ComposedSummary result={res} /> : <NotFoundSummary query={res.query} />}
          {res && res.kind !== 'not_found' && res.related.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
              <p className="mb-3 font-semibold">সংশ্লিষ্ট বিষয়</p>
              <div className="flex flex-wrap gap-2">{res.related.map((s) => <a key={s.topic_id} className="chip" href={`#summary-${s.topic_id}`}>{s.title}</a>)}</div>
            </div>
          )}
          {res?.kind === 'not_found' && <div className="mt-6"><Notice>প্রস্তুতকৃত বিষয়: {SUMMARIES.map((s) => s.title).join(', ')}</Notice></div>}
        </div>
      </div>
    </>
  )
}
