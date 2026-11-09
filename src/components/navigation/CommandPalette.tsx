import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Hash, LayoutGrid, Library, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { navigate, setPendingQuery } from '../../hooks/useRoute'
import { parseReference } from '../../services/hadithSearch'
import { COLLECTION_BY_ID, COLLECTIONS } from '../../services/referenceResolver'
import { SUMMARIES } from '../../services/summaryEngine'
import { TOPICS } from '../../services/topicEngine'
import { normalize, toBnDigits } from '../../utils/textSearch'

interface Item { label: string; hint: string; href: string; icon: typeof Search; onPick?: () => void }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 30) }
  }, [open])

  const items = useMemo<Item[]>(() => {
    const n = normalize(q)
    const out: Item[] = []
    const ref = parseReference(q)
    if (ref) {
      const c = COLLECTION_BY_ID[ref.collection]
      if (c) {
        out.push({ label: `${c.bn} ${toBnDigits(ref.number)}`, hint: 'সরাসরি হাদিসে যান', href: '#search', icon: Hash, onPick: () => setPendingQuery(q) })
      }
    }
    const m = (s: string) => !n || normalize(s).includes(n)
    SUMMARIES.filter((s) => m(s.title) || s.aliases.some(m)).forEach((s) => out.push({ label: s.title, hint: 'AI সারসংক্ষেপ', href: `#summary-${s.topic_id}`, icon: Sparkles }))
    TOPICS.filter((t) => m(t.title) || m(t.title_en)).forEach((t) => out.push({ label: t.title, hint: `বিষয় · ${toBnDigits(t.count)}টি হাদিস`, href: `#topic-${t.id}`, icon: LayoutGrid }))
    COLLECTIONS.filter((c) => m(c.bn) || m(c.en)).forEach((c) => out.push({ label: c.bn, hint: 'গ্রন্থ', href: `#collection-${c.id}`, icon: Library }))
    // the generic full-text search goes after direct matches, so Enter opens the best match
    if (n) out.splice(ref ? 1 : Math.min(out.length, 6), 0, { label: `“${q}” খুঁজুন`, hint: 'পূর্ণ অনুসন্ধান', href: '#search', icon: Search, onPick: () => setPendingQuery(q) })
    return out.slice(0, 12)
  }, [q])

  const pick = (it: Item) => {
    it.onPick?.()
    navigate(it.href)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-start justify-center bg-night/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose} role="dialog" aria-modal aria-label="দ্রুত খুঁজুন">
          <motion.div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
            initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, opacity: 0 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-muted" aria-hidden />
              <input id="palette-input" ref={input} value={q} onChange={(e) => { setQ(e.target.value); setSel(0) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)) }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
                  if (e.key === 'Enter' && items[sel]) pick(items[sel])
                  if (e.key === 'Escape') onClose()
                }}
                className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-muted" placeholder="বিষয়, গ্রন্থ, বা “বুখারি ১” লিখুন…" aria-label="অনুসন্ধান" />
            </div>
            <ul className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
              {items.length === 0 && <li className="p-4 text-sm text-muted">কিছু পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন।</li>}
              {items.map((it, i) => {
                const I = it.icon
                return (
                  <li key={it.href + it.label} role="option" aria-selected={i === sel}>
                    <button type="button" onMouseEnter={() => setSel(i)} onClick={() => pick(it)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === sel ? 'bg-raised' : ''}`}>
                      <I size={18} className="shrink-0 text-gold" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      <span className="text-xs text-muted">{it.hint}</span>
                      <ArrowRight size={15} className="text-muted" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
