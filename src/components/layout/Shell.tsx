import { Bookmark, BookOpen, Home, LayoutGrid, Library, Moon, Search, Sparkles, Sun } from 'lucide-react'
import { motion, useScroll, useSpring } from 'framer-motion'
import type { Route } from '../../hooks/useRoute'
import { useTheme } from '../../hooks/useTheme'
import { COLLECTIONS, TOTAL_HADITH } from '../../services/referenceResolver'
import { TOPICS } from '../../services/topicEngine'
import { bnNum } from '../../utils/textSearch'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2.5" aria-label="হাদিস জ্ঞান — প্রথম পাতা">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <g fill="none" stroke="rgb(var(--goldsoft))" strokeWidth="1.6">
          <rect x="9" y="9" width="22" height="22" rx="1.5" />
          <rect x="9" y="9" width="22" height="22" rx="1.5" transform="rotate(45 20 20)" />
        </g>
        <circle cx="20" cy="20" r="5.2" fill="rgb(var(--goldsoft))" />
      </svg>
      <span className="leading-none">
        <span className={`block text-[19px] font-bold ${light ? 'text-ivory' : 'text-ink'}`}>হাদিস জ্ঞান</span>
        <span className={`font-en text-[9.5px] font-semibold tracking-[0.26em] ${light ? 'text-goldsoft' : 'text-gold'}`}>HADITH KNOWLEDGE</span>
      </span>
    </a>
  )
}

const NAV = [
  { href: '#home', label: 'প্রথম পাতা', page: 'home', icon: Home },
  { href: '#topics', label: 'বিষয়সমূহ', page: 'topics', icon: LayoutGrid },
  { href: '#summary', label: 'AI সারসংক্ষেপ', page: 'summary', icon: Sparkles },
  { href: '#collections', label: 'গ্রন্থাগার', page: 'collections', icon: Library },
  { href: '#search', label: 'অনুসন্ধান', page: 'search', icon: Search },
  { href: '#bookmarks', label: 'বুকমার্ক', page: 'bookmarks', icon: Bookmark },
] as const

const active = (route: Route, page: string) =>
  route.page === page || (page === 'topics' && route.page === 'topic') || (page === 'collections' && route.page === 'collection')

export function Header({ route, onPalette }: { route: Route; onPalette: () => void }) {
  const { isDark, toggle } = useTheme()
  const overHero = route.page === 'home'
  return (
    <header
      className={`sticky z-50 border-b backdrop-blur-xl ${overHero ? 'border-goldsoft/15 bg-night/80' : 'border-line/70 bg-bg/85'}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <Logo light={overHero} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="প্রধান মেনু">
          {NAV.slice(0, 5).map((n) => (
            <a key={n.href} href={n.href} aria-current={active(route, n.page) ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-[15px] transition ${overHero ? 'text-ivory/85 hover:text-ivory' : 'text-muted hover:text-ink'} ${active(route, n.page) ? (overHero ? 'bg-ivory/10 text-ivory' : 'bg-raised text-ink') : ''}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onPalette}
            className={`hidden min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm sm:inline-flex ${overHero ? 'border-ivory/20 text-ivory/80 hover:border-goldsoft/60' : 'border-line text-muted hover:border-gold/60'}`}>
            <Search size={16} aria-hidden /> দ্রুত খুঁজুন <kbd className="font-en text-[11px] opacity-70">Ctrl K</kbd>
          </button>
          <button type="button" onClick={onPalette} className={`grid h-11 w-11 place-items-center rounded-full sm:hidden ${overHero ? 'text-ivory' : 'text-ink'}`} aria-label="দ্রুত খুঁজুন">
            <Search size={20} />
          </button>
          <a href="#bookmarks" className={`hidden h-11 w-11 place-items-center rounded-full lg:grid ${overHero ? 'text-ivory hover:bg-ivory/10' : 'text-ink hover:bg-raised'}`} aria-label="বুকমার্ক">
            <Bookmark size={19} />
          </a>
          <button type="button" onClick={toggle} className={`grid h-11 w-11 place-items-center rounded-full ${overHero ? 'text-ivory hover:bg-ivory/10' : 'text-ink hover:bg-raised'}`}
            aria-label={isDark ? 'আলো মোড চালু করুন' : 'অন্ধকার মোড চালু করুন'}>
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export function BottomNav({ route }: { route: Route }) {
  const items = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-surface/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}
      aria-label="নিচের মেনু">
      <ul className="grid grid-cols-5">
        {items.map((n) => {
          const on = active(route, n.page)
          const I = n.icon
          return (
            <li key={n.href}>
              <a href={n.href} aria-current={on ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11.5px] ${on ? 'text-gold' : 'text-muted'}`}>
                <I size={21} strokeWidth={on ? 2.2 : 1.7} aria-hidden />
                {n.label.replace('AI সারসংক্ষেপ', 'সারসংক্ষেপ').replace('প্রথম পাতা', 'হোম')}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div className="fixed inset-x-0 z-[55] h-[3px] origin-left bg-goldsoft" style={{ scaleX: x, top: 'calc(64px + env(safe-area-inset-top, 0px))' }} aria-hidden />
  )
}

export function Footer() {
  return (
    <footer className="mt-24 bg-night pb-28 pt-16 text-ivory/80 lg:pb-14">
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-4 text-[15px] leading-relaxed">“সহিহ হাদিসের আলোকে জীবন গড়ি” — জানুন, বুঝুন, জীবনে প্রয়োগ করুন।</p>
            <p className="mt-3 text-sm text-ivory/60">
              কুতুবুস সিত্তাহর {bnNum(TOTAL_HADITH)}টি হাদিস, প্রতিটির মানসহ। সম্পূর্ণ ফ্রন্টএন্ড; কোনো সার্ভার বা লগইন নেই।
            </p>
          </div>
          <FooterCol title="গ্রন্থাগার" links={COLLECTIONS.map((c) => [c.bn, `#collection-${c.id}`])} />
          <FooterCol title="বিষয় সূচি" links={TOPICS.slice(0, 7).map((t) => [t.title, `#topic-${t.id}`]).concat([['সব বিষয় দেখুন', '#topics']])} />
          <FooterCol title="প্ল্যাটফর্ম" links={[
            ['আমাদের সম্পর্কে', '#about'], ['বিশুদ্ধতা নীতি', '#about-authenticity'], ['কনটেন্ট পদ্ধতি', '#about-methodology'],
            ['দায়মুক্তি', '#about-disclaimer'], ['উৎস ও কৃতজ্ঞতা', '#about-sources'], ['বুকমার্ক', '#bookmarks'],
          ]} />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-[13px] text-ivory/55">
          <p>“হাদিস হবে মূল উৎস, JSON হবে জ্ঞানভান্ডার, AI হবে ব্যাখ্যার সহায়ক।”</p>
          <p className="flex items-center gap-1.5"><BookOpen size={14} aria-hidden /> ধর্মীয় বিষয়ে চূড়ান্ত সিদ্ধান্তের জন্য যোগ্য আলেমের পরামর্শ নিন।</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-goldsoft">{title}</p>
      <ul className="space-y-2 text-[15px]">
        {links.map(([l, h]) => <li key={h}><a className="hover:text-ivory" href={h}>{l}</a></li>)}
      </ul>
    </div>
  )
}
