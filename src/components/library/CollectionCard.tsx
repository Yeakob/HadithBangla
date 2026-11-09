import type { CollectionMeta, Grade } from '../../types'
import { bnNum } from '../../utils/textSearch'
import { GRADE_BN } from '../ui/bits'
import { Tilt } from '../ui/motion'

const COVERS: Record<string, [string, string]> = {
  bukhari: ['#0b4a3b', '#c8a45d'], muslim: ['#5b1f1f', '#d8b46c'], abudawud: ['#1c3b5a', '#c8a45d'],
  tirmidhi: ['#3d3016', '#d6b878'], nasai: ['#22413b', '#b9c7a0'], ibnmajah: ['#41213d', '#d4b07a'],
}
const BAR: Record<Grade, string> = {
  sahih: 'rgb(var(--ok))', hasan: 'rgb(var(--goldsoft))', athar: 'rgb(var(--muted))', ungraded: 'rgb(var(--line))',
  daif: 'rgb(var(--warn))', rejected: 'rgb(var(--bad))',
}
const ORDER: Grade[] = ['sahih', 'hasan', 'athar', 'ungraded', 'daif', 'rejected']

/** Leather-bound cover drawn with CSS: tooled gold frame, star medallion and the Arabic title. */
export function BookCover({ c, small = false }: { c: CollectionMeta; small?: boolean }) {
  const [leather, gold] = COVERS[c.id]
  return (
    <div className={`relative overflow-hidden rounded-r-xl rounded-l-sm shadow-lift ${small ? 'h-40 w-28' : 'aspect-[3/4] w-full max-w-[220px]'}`}
      style={{ background: `linear-gradient(100deg, rgba(0,0,0,.45) 0 6%, transparent 9%), radial-gradient(circle at 50% 40%, ${leather}, #0a0f0d 140%)` }} aria-hidden>
      <div className="absolute inset-2.5 rounded-sm border" style={{ borderColor: `${gold}aa` }} />
      <div className="absolute inset-4 rounded-sm border border-dashed" style={{ borderColor: `${gold}55` }} />
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="absolute left-1/2 top-[38%] w-[44%] -translate-x-1/2 -translate-y-1/2" style={{ color: gold }}>
        <g fill="none" stroke="currentColor" strokeWidth=".06">
          <rect x="-.75" y="-.75" width="1.5" height="1.5" /><rect x="-.75" y="-.75" width="1.5" height="1.5" transform="rotate(45)" />
          <circle r=".38" />
        </g>
      </svg>
      <p className="arabic absolute inset-x-3 bottom-[16%] text-center" style={{ color: gold, fontSize: small ? '0.95rem' : '1.45rem', lineHeight: 1.5, textAlign: 'center' }}>{c.ar}</p>
    </div>
  )
}

export function GradeBar({ c }: { c: CollectionMeta }) {
  const total = c.count
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-raised" role="img" aria-label={ORDER.filter((g) => c.grade_counts[g]).map((g) => `${GRADE_BN[g]} ${bnNum(c.grade_counts[g]!)}`).join(', ')}>
        {ORDER.map((g) => c.grade_counts[g] ? <span key={g} style={{ width: `${(c.grade_counts[g]! / total) * 100}%`, background: BAR[g] }} /> : null)}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted">
        {ORDER.filter((g) => c.grade_counts[g]).map((g) => (
          <li key={g} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: BAR[g] }} />{GRADE_BN[g]} <span className="num">{bnNum(c.grade_counts[g]!)}</span></li>
        ))}
      </ul>
    </div>
  )
}

export function CollectionCard({ c }: { c: CollectionMeta }) {
  return (
    <Tilt className="relative h-full rounded-2xl" max={5}>
      <article className="card flex h-full flex-col gap-5 p-5 sm:flex-row">
        <BookCover c={c} small />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-[19px] font-semibold">{c.bn}</h3>
          <p className="font-en text-[13px] text-muted" lang="en">{c.en}</p>
          <p className="mt-1 text-[13px] text-muted">{c.author_bn} · মৃ. {c.died}</p>
          <p className="mt-2 line-clamp-3 text-[14.5px] text-muted">{c.desc_bn}</p>
          <div className="mt-3"><GradeBar c={c} /></div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <span className="num text-[14px] font-semibold text-gold">{bnNum(c.count)}টি হাদিস</span>
            <a href={`#collection-${c.id}`} className="btn-ghost min-h-10 px-4 text-sm">গ্রন্থটি পড়ুন →</a>
          </div>
        </div>
      </article>
    </Tilt>
  )
}
