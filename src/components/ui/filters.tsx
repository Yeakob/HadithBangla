import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CollectionId, Grade } from '../../types'
import { COLLECTIONS } from '../../services/referenceResolver'
import { toBnDigits } from '../../utils/textSearch'
import { GRADE_BN } from './bits'

export function CollectionChips({ value, onChange, allowAll = true }: { value: CollectionId[]; onChange: (v: CollectionId[]) => void; allowAll?: boolean }) {
  const all = value.length === COLLECTIONS.length
  const toggle = (id: CollectionId) => {
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    if (next.length) onChange(next)
  }
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="গ্রন্থ">
      {allowAll && <button type="button" className="chip" aria-pressed={all} onClick={() => onChange(COLLECTIONS.map((c) => c.id))}>সব গ্রন্থ</button>}
      {COLLECTIONS.map((c) => (
        <button key={c.id} type="button" className="chip" aria-pressed={!all && value.includes(c.id)} onClick={() => (all ? onChange([c.id]) : toggle(c.id))}>
          {c.bn.replace('সহিহ ', '').replace('জামে ', '').replace('সুনানে ', '')}
        </button>
      ))}
    </div>
  )
}

export type GradeFilter = 'sahih' | 'sahih-hasan' | 'all'
export const gradeList = (g: GradeFilter): Grade[] | 'all' => (g === 'sahih' ? ['sahih'] : g === 'sahih-hasan' ? ['sahih', 'hasan'] : 'all')

export function GradeChips({ value, onChange }: { value: GradeFilter; onChange: (v: GradeFilter) => void }) {
  const opts: [GradeFilter, string][] = [['sahih', `শুধু ${GRADE_BN.sahih}`], ['sahih-hasan', 'সহিহ ও হাসান'], ['all', 'সব মান (যঈফসহ)']]
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="মান">
      {opts.map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  )
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="পাতা">
      <button type="button" className="chip h-11 w-11 justify-center p-0" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="আগের পাতা"><ChevronLeft size={18} /></button>
      <span className="num text-sm text-muted">পাতা {toBnDigits(page)} / {toBnDigits(pages)}</span>
      <button type="button" className="chip h-11 w-11 justify-center p-0" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="পরের পাতা"><ChevronRight size={18} /></button>
    </nav>
  )
}

export function PageHeader({ eyebrow, title, desc, crumbs }: { eyebrow: string; title: string; desc?: React.ReactNode; crumbs?: [string, string][] }) {
  return (
    <div className="relative overflow-hidden border-b border-line/70 bg-raised/40">
      <div className="pattern-stars pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden />
      <div className="wrap relative py-10 sm:py-14">
        {crumbs && (
          <nav aria-label="অবস্থান" className="mb-3 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              {crumbs.map(([l, h], i) => (
                <li key={h + l} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>›</span>}
                  {h ? <a className="hover:text-gold" href={h}>{l}</a> : <span aria-current="page" className="text-ink">{l}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold">{title}</h1>
        {desc && <div className="mt-2 max-w-3xl text-[16.5px] text-muted">{desc}</div>}
      </div>
    </div>
  )
}
