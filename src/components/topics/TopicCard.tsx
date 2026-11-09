import { ArrowUpRight } from 'lucide-react'
import type { TopicMeta } from '../../types'
import { SUMMARIES } from '../../services/summaryEngine'
import { bnNum } from '../../utils/textSearch'
import { TopicIcon } from '../ui/bits'
import { Tilt } from '../ui/motion'

const HUES = ['#0d5a49', '#5a4310', '#13403a', '#6b3a1e', '#1d4d5c', '#3d4a1a']

/** A raised 3D tile: an embossed medallion with the topic icon, tilting toward the pointer. */
export function TopicCard({ t, i }: { t: TopicMeta; i: number }) {
  const hasSummary = SUMMARIES.some((s) => s.category_id === t.id)
  const hue = HUES[i % HUES.length]
  return (
    <Tilt className="relative h-full rounded-2xl">
      <a href={`#topic-${t.id}`} className="group relative flex h-full flex-col rounded-2xl border border-line/80 bg-surface p-5 shadow-card transition hover:border-gold/60 hover:shadow-lift">
        <div className="flex items-start justify-between gap-3" style={{ transform: 'translateZ(30px)' }}>
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_10px_20px_-10px_rgba(0,0,0,.5)]"
            style={{ background: `linear-gradient(145deg, ${hue}, #071d19)` }}>
            <span className="absolute inset-1 rounded-xl border border-goldsoft/40" aria-hidden />
            <TopicIcon name={t.icon} className="h-6 w-6 text-goldsoft" />
          </span>
          <ArrowUpRight size={18} className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
        </div>
        <h3 className="mt-4 text-[18px] font-semibold text-ink" style={{ transform: 'translateZ(20px)' }}>{t.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] text-muted">{t.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[13px]">
          <span className="num font-semibold text-gold">{bnNum(t.count)}টি হাদিস</span>
          <span className="text-muted">সহিহ {bnNum(t.sahih_count)}</span>
          {hasSummary && <span className="rounded-full bg-goldsoft/15 px-2 py-0.5 text-[11.5px] text-gold">সারসংক্ষেপ আছে</span>}
        </div>
      </a>
    </Tilt>
  )
}
