import { useEffect, useState } from 'react'
import type { SummaryResult } from '../../services/summaryEngine'
import { runSummary, SUMMARIES } from '../../services/summaryEngine'
import { COLLECTION_BY_ID, hadithHref } from '../../services/referenceResolver'
import { toBnDigits } from '../../utils/textSearch'
import { GradeBadge, SectionHead, Skeleton } from '../ui/bits'

/** Three hadith on one topic, connected on a line, with shared teachings and their differing contexts. */
export function RelatedExplorer() {
  const [topic, setTopic] = useState('neighbours')
  const [res, setRes] = useState<Extract<SummaryResult, { kind: 'prepared' }> | null>(null)
  useEffect(() => {
    let alive = true
    runSummary(topic).then((r) => { if (alive && r.kind === 'prepared') setRes(r) })
    return () => { alive = false }
  }, [topic])

  const three = res?.hadith.slice(0, 3) ?? []
  return (
    <section className="wrap pt-24" aria-labelledby="rel-title">
      <SectionHead eyebrow="সংশ্লিষ্ট হাদিস এক্সপ্লোরার" title="একই বিষয়ের হাদিসগুলো পাশাপাশি" desc="কোন শিক্ষা সবগুলোতে আছে, কোনটি একে অপরকে পূর্ণ করে, আর প্রতিটির প্রেক্ষাপট কোথায় আলাদা।" />
      <div id="rel-title" className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="বিষয়">
        {SUMMARIES.map((s) => (
          <button key={s.topic_id} type="button" role="tab" aria-selected={topic === s.topic_id} aria-pressed={topic === s.topic_id} onClick={() => setTopic(s.topic_id)} className="chip">
            {s.title}
          </button>
        ))}
      </div>
      {!res ? <Skeleton lines={5} /> : (
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          <ol className="relative space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-gradient-to-b before:from-goldsoft before:via-goldsoft/50 before:to-transparent">
            {three.map((h, i) => (
              <li key={h.id} className="relative flex gap-4">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-goldsoft bg-surface font-semibold text-gold">{toBnDigits(i + 1)}</span>
                <a href={hadithHref(h.id)} className="card block min-w-0 flex-1 p-4 transition hover:border-gold/60">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">হাদিস {toBnDigits(i + 1)} · {COLLECTION_BY_ID[h.collection_id].bn} {toBnDigits(h.hadith_number)}</span>
                    <GradeBadge grade={h.authenticity} />
                  </div>
                  <p className="line-clamp-4 text-[15px] text-muted">{h.bangla_translation}</p>
                </a>
              </li>
            ))}
          </ol>
          <div className="space-y-5">
            <Box title="সমন্বিত শিক্ষা">
              {res.summary.summary.combined_teachings.filter((t) => t.refs.some((r) => three.some((h) => h.id === r))).slice(0, 3).map((t) => <P key={t.text}>{t.text}</P>)}
            </Box>
            <Box title="পরিপূরক শিক্ষা">
              {res.summary.summary.relationships.map((t) => <P key={t.text}>{t.text}</P>)}
            </Box>
            <Box title="প্রেক্ষাপটের ভিন্নতা">
              <ul className="space-y-1.5 text-[14.5px]">
                {three.map((h, i) => (
                  <li key={h.id}><span className="text-gold">হাদিস {toBnDigits(i + 1)}:</span> <span className="font-en text-[13.5px]" lang="en">{h.book}</span>{h.narrator ? ` · বর্ণনাকারী ${h.narrator}` : ''}</li>
                ))}
              </ul>
            </Box>
            <a href={`#summary-${res.summary.topic_id}`} className="btn-ghost">পূর্ণ সারসংক্ষেপ →</a>
          </div>
        </div>
      )}
    </section>
  )
}

const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-line/80 bg-raised/50 p-5">
    <h3 className="mb-2 text-[16px] font-semibold text-gold">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
)
const P = ({ children }: { children: React.ReactNode }) => <p className="text-[15px] leading-relaxed">{children}</p>
