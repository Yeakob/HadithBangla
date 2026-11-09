import {
  AlertTriangle, Baby, Ban, BookOpen, Feather, Flame, Gem, Hand, HandCoins, HandHelping, HeartHandshake, Home,
  Hourglass, Info, Landmark, MoonStar, Mountain, Scale, ShieldCheck, Sparkles, Store, Users, type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Grade } from '../../types'
import { useToasts } from '../../hooks/useToast'

export const ICONS: Record<string, LucideIcon> = {
  ShieldCheck, Landmark, MoonStar, HandCoins, HeartHandshake, Home, Baby, Users, Scale, Sparkles, Mountain, Feather,
  BookOpen, Store, Ban, Gem, Hourglass, Flame, Hand, HandHelping,
}
export function TopicIcon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? BookOpen
  return <I className={className} strokeWidth={1.6} aria-hidden />
}

const GRADE_STYLE: Record<Grade, string> = {
  sahih: 'border-ok/40 bg-ok/10 text-ok',
  hasan: 'border-gold/45 bg-goldsoft/10 text-gold',
  daif: 'border-warn/50 bg-warn/10 text-warn',
  rejected: 'border-bad/50 bg-bad/10 text-bad',
  athar: 'border-line bg-raised text-muted',
  ungraded: 'border-line bg-raised text-muted',
}
export const GRADE_BN: Record<Grade, string> = {
  sahih: 'সহিহ', hasan: 'হাসান', daif: 'যঈফ', rejected: 'অত্যন্ত দুর্বল/জাল', athar: 'সাহাবি/তাবেয়ির উক্তি', ungraded: 'মান উল্লেখ নেই',
}
export function GradeBadge({ grade, className = '' }: { grade: Grade; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12.5px] font-medium ${GRADE_STYLE[grade]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {GRADE_BN[grade]}
    </span>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  const I = tone === 'warn' ? AlertTriangle : Info
  return (
    <div className={`flex gap-3 rounded-xl border p-3.5 text-[14.5px] leading-relaxed ${tone === 'warn' ? 'border-warn/40 bg-warn/[.07]' : 'border-gold/35 bg-goldsoft/[.08]'}`} role="note">
      <I className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${tone === 'warn' ? 'text-warn' : 'text-gold'}`} size={18} aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3" aria-label="লোড হচ্ছে">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 rounded bg-raised" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  )
}

export function Toasts() {
  const list = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[70] flex flex-col items-center gap-2" style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }} aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-full bg-night px-4 py-2 text-sm text-ivory shadow-lift ring-1 ring-goldsoft/30">
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function SectionHead({ eyebrow, title, desc, action }: { eyebrow: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="text-[clamp(1.6rem,3.2vw,2.35rem)] font-semibold text-ink">{title}</h2>
        {desc && <p className="mt-2 text-[16.5px] text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

/** Small ornamental divider: a star between two gold hairlines. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-goldsoft ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-goldsoft/60" />
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3 6.5L22 9l-5 5 1.2 7L12 17.8 5.8 21 7 14 2 9l7-1.5z" /></svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-goldsoft/60" />
    </div>
  )
}
