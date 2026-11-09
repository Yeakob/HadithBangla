import { Clock, Compass, Lightbulb, ScrollText } from 'lucide-react'
import { DailyHadith, dayIndex } from '../components/hadith/DailyHadith'
import { Hero } from '../components/hero/Hero'
import { CollectionCard } from '../components/library/CollectionCard'
import { RelatedExplorer } from '../components/summary/RelatedExplorer'
import { SummaryPanel } from '../components/summary/SummaryPanel'
import { TopicCard } from '../components/topics/TopicCard'
import { SectionHead } from '../components/ui/bits'
import { Reveal } from '../components/ui/motion'
import { useReadingHistory } from '../hooks/useReadingHistory'
import { COLLECTIONS } from '../services/referenceResolver'
import { SUMMARIES } from '../services/summaryEngine'
import { TOPICS } from '../services/topicEngine'

export default function Home() {
  return (
    <>
      <Hero />
      <DailyHadith />
      <SummaryPanel />

      <section className="wrap pt-24" aria-labelledby="topics-h">
        <SectionHead eyebrow="বিষয়ভিত্তিক সূচি" title="ইসলামী বিষয়সমূহ ঘুরে দেখুন" desc="প্রতিটি বিষয়ের সংখ্যা ডেটাবেস থেকে গোনা। সূচিটি শব্দভিত্তিক, তাই একটি হাদিস একাধিক বিষয়ে থাকতে পারে।"
          action={<a href="#topics" className="btn-ghost">সব বিষয় →</a>} />
        <h2 id="topics-h" className="sr-only">বিষয়সমূহ</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.slice(0, 8).map((t, i) => <TopicCard key={t.id} t={t} i={i} />)}
        </div>
      </section>

      <section className="wrap pt-24" aria-labelledby="lib-h">
        <SectionHead eyebrow="ডিজিটাল গ্রন্থাগার" title="কুতুবুস সিত্তাহ: ছয়টি প্রধান হাদিস গ্রন্থ"
          desc="সহিহ বুখারি ও সহিহ মুসলিমের সব হাদিস সহিহ। বাকি চারটি সুনান গ্রন্থে প্রতিটি হাদিসের মান মুহাদ্দিসদের গ্রেড অনুযায়ী আলাদাভাবে দেখানো হয়েছে।"
          action={<a href="#collections" className="btn-ghost">গ্রন্থাগার →</a>} />
        <h2 id="lib-h" className="sr-only">হাদিস গ্রন্থ</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {COLLECTIONS.map((c) => <Reveal key={c.id}><CollectionCard c={c} /></Reveal>)}
        </div>
      </section>

      <RelatedExplorer />
      <DailyLearning />
    </>
  )
}

function DailyLearning() {
  const { list } = useReadingHistory()
  const s = SUMMARIES[dayIndex() % SUMMARIES.length]
  const others = SUMMARIES.filter((x) => x.topic_id !== s.topic_id).slice(0, 4)
  return (
    <section className="wrap pt-24" aria-labelledby="learn-h">
      <SectionHead eyebrow="প্রতিদিনের ইসলামী শিক্ষা" title="আজকের পাঠ" />
      <h2 id="learn-h" className="sr-only">আজকের পাঠ</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        <article className="card p-6 lg:col-span-2">
          <p className="mb-2 flex items-center gap-2 text-sm text-gold"><ScrollText size={16} aria-hidden /> আজকের বিষয়: {s.title}</p>
          <p className="text-[18px] leading-[1.9]">{s.summary.conclusion}</p>
          <h3 className="mt-5 flex items-center gap-2 text-[16px] font-semibold"><Lightbulb size={17} className="text-gold" aria-hidden /> গুরুত্বপূর্ণ নৈতিক শিক্ষা</h3>
          <ul className="mt-2 space-y-1.5 text-[15.5px] text-muted">
            {s.summary.guidance.map((g) => <li key={g} className="flex gap-2"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />{g}</li>)}
          </ul>
          <a href={`#summary-${s.topic_id}`} className="btn-primary mt-5">পুরো পাঠ পড়ুন</a>
        </article>
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Compass size={17} className="text-gold" aria-hidden /> প্রস্তাবিত বিষয়</h3>
            <div className="flex flex-wrap gap-2">{others.map((o) => <a key={o.topic_id} className="chip" href={`#summary-${o.topic_id}`}>{o.title}</a>)}</div>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold"><Clock size={17} className="text-gold" aria-hidden /> সম্প্রতি দেখা</h3>
            {list.length === 0 ? (
              <p className="text-sm text-muted">আপনি যে হাদিস, বিষয় বা সারসংক্ষেপ দেখবেন তা এখানে জমা থাকবে (শুধু এই ব্রাউজারে)।</p>
            ) : (
              <ul className="space-y-1.5 text-[15px]">
                {list.slice(0, 6).map((h) => (
                  <li key={h.kind + h.id}><a className="hover:text-gold" href={h.kind === 'hadith' ? `#hadith-${h.id}` : h.kind === 'topic' ? `#topic-${h.id}` : `#summary-${h.id}`}>{h.label}</a></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
