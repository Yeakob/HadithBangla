import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, Info, Link2 } from 'lucide-react'
import type { HadithRecord, Summary } from '../../types'
import type { SummaryResult } from '../../services/summaryEngine'
import { NOT_FOUND, NOT_INTERPRETATION } from '../../services/summaryEngine'
import { COLLECTION_BY_ID, hadithHref } from '../../services/referenceResolver'
import { toBnDigits } from '../../utils/textSearch'
import { HadithFull, HadithRow, reference } from '../hadith/HadithParts'
import { GradeBadge, Notice } from '../ui/bits'

const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']

/** Footnote-style marker that links a teaching to the hadith it rests on. */
function Refs({ refs, order }: { refs: string[]; order: string[] }) {
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
      {refs.map((id) => (
        <a key={id} href={`#cite-${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`cite-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
          className="num rounded-md border border-gold/40 bg-goldsoft/10 px-1.5 text-[12px] font-semibold text-gold hover:bg-goldsoft/20"
          title="সূত্র দেখুন">
          {toBnDigits(order.indexOf(id) + 1)}
        </a>
      ))}
    </span>
  )
}

function Section({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.section initial={reduce ? false : { y: 14 }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}
      className="relative border-t border-line/70 py-7 first:border-t-0">
      <h3 className="mb-3 flex items-center gap-3 text-[20px] font-semibold text-ink">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/50 text-[16px] text-gold">{letter}</span>
        {title}
      </h3>
      <div className="pl-0 sm:pl-12">{children}</div>
    </motion.section>
  )
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((t) => (
      <li key={t} className="flex gap-2.5 text-[16.5px] leading-relaxed"><CheckCircle2 size={18} className="mt-1 shrink-0 text-gold" aria-hidden /> {t}</li>
    ))}
  </ul>
)

export function ReviewBadge({ s }: { s: Summary }) {
  return s.review_status === 'reviewed' ? (
    <span className="rounded-full border border-ok/40 bg-ok/10 px-2.5 py-0.5 text-xs text-ok">আলেম কর্তৃক পর্যালোচিত</span>
  ) : (
    <span className="rounded-full border border-warn/40 bg-warn/10 px-2.5 py-0.5 text-xs text-warn">আলেমের পর্যালোচনার অপেক্ষায়</span>
  )
}

export function PreparedSummary({ result }: { result: Extract<SummaryResult, { kind: 'prepared' }> }) {
  const { summary: s, hadith, missing } = result
  const order = s.hadith_ids.filter((id) => hadith.some((h) => h.id === id))
  const byId = Object.fromEntries(hadith.map((h) => [h.id, h])) as Record<string, HadithRecord>
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold">{s.title}</h2>
        <ReviewBadge s={s} />
        <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{toBnDigits(hadith.length)}টি সহিহ হাদিসের ভিত্তিতে</span>
      </div>
      <Notice>{NOT_INTERPRETATION}</Notice>
      {missing.length > 0 && (
        <div className="mt-3"><Notice tone="warn">উল্লিখিত {toBnDigits(missing.length)}টি হাদিস ডেটাবেসে পাওয়া যায়নি বলে বাদ দেওয়া হয়েছে।</Notice></div>
      )}

      <div className="mt-4">
        <Section letter={LETTERS[0]} title="বিষয় পরিচিতি"><p className="text-[17px] leading-[1.9]">{s.summary.introduction}</p></Section>
        <Section letter={LETTERS[1]} title="সংশ্লিষ্ট সহিহ হাদিস">
          <ol className="space-y-4">
            {order.map((id, i) => (
              <li key={id} id={`cite-${id}`} className="scroll-mt-28">
                <HadithFull r={byId[id]} headline={`${toBnDigits(i + 1)}. ${reference(byId[id])}`} />
              </li>
            ))}
          </ol>
        </Section>
        <Section letter={LETTERS[2]} title="একাধিক হাদিসের সম্মিলিত শিক্ষা">
          <ul className="space-y-3">
            {s.summary.combined_teachings.map((t) => (
              <li key={t.text} className="rounded-xl border border-line/70 bg-raised/50 p-4 text-[16.5px] leading-relaxed">{t.text}<Refs refs={t.refs} order={order} /></li>
            ))}
          </ul>
        </Section>
        <Section letter={LETTERS[3]} title="হাদিসগুলোর পারস্পরিক সম্পর্ক">
          <ul className="relative space-y-4 border-l-2 border-goldsoft/40 pl-5">
            {s.summary.relationships.map((t) => (
              <li key={t.text} className="relative text-[16.5px] leading-relaxed">
                <span className="absolute -left-[27px] top-2 h-3 w-3 rounded-full border-2 border-goldsoft bg-surface" aria-hidden />
                <Link2 size={15} className="mr-1 inline text-gold" aria-hidden />{t.text}<Refs refs={t.refs} order={order} />
              </li>
            ))}
          </ul>
        </Section>
        <Section letter={LETTERS[4]} title="মূল ইসলামী নির্দেশনা"><Bullets items={s.summary.guidance} /></Section>
        <Section letter={LETTERS[5]} title="গুরুত্বপূর্ণ সতর্কবার্তা">
          <ul className="space-y-2.5">
            {s.summary.warnings.map((t) => <li key={t} className="rounded-xl border border-warn/30 bg-warn/[.06] p-3.5 text-[16px]">{t}</li>)}
          </ul>
        </Section>
        <Section letter={LETTERS[6]} title="বাস্তব জীবনে প্রয়োগ"><Bullets items={s.summary.practical_lessons} /></Section>
        <Section letter={LETTERS[7]} title="আত্মশুদ্ধির শিক্ষা"><Bullets items={s.summary.self_purification} /></Section>
        <Section letter={LETTERS[8]} title="সংক্ষিপ্ত উপসংহার">
          <blockquote className="border-l-4 border-goldsoft bg-raised/50 p-5 text-[17.5px] leading-[1.9]">{s.summary.conclusion}</blockquote>
        </Section>
        <Section letter={LETTERS[9]} title="ব্যবহৃত সব হাদিসের রেফারেন্স">
          <ol className="space-y-2">
            {order.map((id, i) => {
              const r = byId[id]
              return (
                <li key={id} className="flex flex-wrap items-center gap-2 text-[15.5px]">
                  <span className="num w-6 text-gold">{toBnDigits(i + 1)}.</span>
                  <a className="font-medium hover:text-gold" href={hadithHref(id)}>{COLLECTION_BY_ID[r.collection_id].bn}, হাদিস {toBnDigits(r.hadith_number)}</a>
                  <span className="font-en text-[13px] text-muted" lang="en">({r.collection} {r.hadith_number} · {r.book})</span>
                  <GradeBadge grade={r.authenticity} />
                  <a href={r.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-sm text-muted hover:text-ink">Sunnah.com <ArrowUpRight size={13} aria-hidden /></a>
                </li>
              )
            })}
          </ol>
        </Section>
      </div>
    </div>
  )
}

export function ComposedSummary({ result }: { result: Extract<SummaryResult, { kind: 'composed' }> }) {
  const { category, rows } = result
  return (
    <div>
      <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold">{category.title}</h2>
      <Notice>
        এই বিষয়ে এখনো প্রস্তুতকৃত সম্মিলিত ব্যাখ্যা নেই। নতুন কোনো শিক্ষা বা বিধান তৈরি না করে, ডেটাবেস থেকে সহিহ বুখারি ও সহিহ মুসলিমের সংশ্লিষ্ট
        হাদিসগুলো সাজিয়ে দেখানো হলো। বিষয়সূচি শব্দভিত্তিক; একটি হাদিস মূলত অন্য বিষয়েরও হতে পারে।
      </Notice>
      <section className="mt-6">
        <h3 className="mb-2 text-[19px] font-semibold">বিষয় পরিচিতি</h3>
        <p className="text-[16.5px] text-muted">{category.description} ডেটাবেসে এই সূচিতে মোট {toBnDigits(category.count)}টি হাদিস, যার মধ্যে {toBnDigits(category.sahih_count)}টি সহিহ।</p>
      </section>
      <section className="mt-6">
        <h3 className="mb-3 text-[19px] font-semibold">সংশ্লিষ্ট সহিহ হাদিস (বুখারি ও মুসলিম)</h3>
        <ul className="space-y-3">
          {rows.map(([id, c, n, g, nar, sn]) => <HadithRow key={id} id={id} collection={c} number={n} grade={g} narrator={nar} snippet={sn} />)}
        </ul>
        <a href={`#topic-${category.id}`} className="btn-ghost mt-5">এই বিষয়ের সব হাদিস দেখুন →</a>
      </section>
    </div>
  )
}

export function NotFoundSummary({ query }: { query: string }) {
  return (
    <div className="card p-6">
      <p className="mb-3 flex items-center gap-2 font-semibold"><Info size={18} className="text-gold" aria-hidden /> “{query}”</p>
      <p className="text-[16.5px]">{NOT_FOUND}</p>
      <p className="mt-2 text-sm text-muted">নিচের প্রস্তাবিত বিষয়গুলো দেখুন, অথবা পূর্ণ অনুসন্ধানে শব্দটি খুঁজে দেখুন।</p>
      <a href="#search" className="btn-ghost mt-4">পূর্ণ অনুসন্ধানে যান</a>
    </div>
  )
}
