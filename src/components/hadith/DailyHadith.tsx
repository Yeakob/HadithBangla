import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import daily from '../../data/daily-hadith.json'
import { COLLECTION_BY_ID, getFeatured, hadithHref } from '../../services/referenceResolver'
import { toBnDigits } from '../../utils/textSearch'
import { GradeBadge, SectionHead } from '../ui/bits'
import { Reveal } from '../ui/motion'
import { ArabicText, HadithActions, reference } from './HadithParts'

const IDS = daily.hadith_ids as string[]
export const dayIndex = (offset = 0) => {
  const d = new Date()
  const days = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000)
  return (((days + offset) % IDS.length) + IDS.length) % IDS.length
}

export function DailyHadith() {
  const [offset, setOffset] = useState(0)
  const r = useMemo(() => getFeatured(IDS[dayIndex(offset)]), [offset])
  if (!r) return null
  const label = offset === 0 ? 'আজকের হাদিস' : offset < 0 ? `${toBnDigits(-offset)} দিন আগের হাদিস` : `${toBnDigits(offset)} দিন পরের হাদিস`
  return (
    <section className="wrap pt-20" aria-labelledby="daily-title">
      <SectionHead eyebrow="প্রতিদিন একটি সহিহ হাদিস" title={label} desc={daily.source}
        action={
          <div className="flex gap-2">
            <button type="button" className="chip h-11 w-11 justify-center p-0" onClick={() => setOffset((o) => o - 1)} aria-label="আগের দিনের হাদিস"><ChevronLeft size={18} /></button>
            <button type="button" className="chip px-4" onClick={() => setOffset(0)} disabled={offset === 0}>আজ</button>
            <button type="button" className="chip h-11 w-11 justify-center p-0" onClick={() => setOffset((o) => o + 1)} aria-label="পরের দিনের হাদিস"><ChevronRight size={18} /></button>
          </div>
        } />
      <Reveal>
        <article className="card relative overflow-hidden">
          <div className="pattern-stars pointer-events-none absolute inset-y-0 right-0 hidden w-48 opacity-50 md:block" aria-hidden />
          <div className="grid gap-0 md:grid-cols-[1fr_260px]">
            <div className="min-w-0 p-6 sm:p-9">
              <h3 id="daily-title" className="sr-only">{label}</h3>
              {r.arabic_text && <ArabicText text={r.arabic_text} big />}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-goldsoft/50 to-transparent" aria-hidden />
              <p className="text-[18.5px] leading-[1.95] text-ink">{r.bangla_translation}</p>
              <div className="mt-6"><HadithActions r={r} /></div>
            </div>
            <aside className="relative border-t border-line/70 bg-raised/60 p-6 md:border-l md:border-t-0 sm:p-7">
              <dl className="space-y-3.5 text-[14.5px]">
                <Meta k="গ্রন্থ" v={COLLECTION_BY_ID[r.collection_id]?.bn ?? r.collection} />
                <Meta k="অধ্যায় (কিতাব)" v={<span className="font-en text-[13.5px]" lang="en">{r.book}</span>} />
                <Meta k="হাদিস নম্বর" v={<span className="num">{toBnDigits(r.hadith_number)}</span>} />
                {r.narrator && <Meta k="বর্ণনাকারী" v={r.narrator} />}
                <Meta k="মান" v={<GradeBadge grade={r.authenticity} />} />
                {r.riyad_as_salihin.length > 0 && <Meta k="রিয়াদুস সালেহীন" v={<span className="num">{toBnDigits(r.riyad_as_salihin.join(', '))}</span>} />}
              </dl>
              <div className="mt-5 flex flex-col gap-2 text-sm">
                <a href={hadithHref(r.id)} className="font-medium text-gold hover:underline">বিস্তারিত পাতা খুলুন →</a>
                <a href={r.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-ink">
                  <ExternalLink size={14} aria-hidden /> {reference(r)} · Sunnah.com
                </a>
              </div>
            </aside>
          </div>
        </article>
      </Reveal>
    </section>
  )
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12.5px] text-muted">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  )
}
