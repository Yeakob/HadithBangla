import { useReducedMotion } from 'framer-motion'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { navigate, setPendingQuery } from '../../hooks/useRoute'
import { matchSummary, SUMMARIES } from '../../services/summaryEngine'
import { COLLECTIONS, TOTAL_HADITH } from '../../services/referenceResolver'
import { TOPICS } from '../../services/topicEngine'
import { bnNum, toBnDigits } from '../../utils/textSearch'
import { hasWebGL, isLiteDevice } from '../../utils/device'
import { useInView } from '../../hooks/useInView'
import { Magnetic } from '../ui/motion'

const HeroScene = lazy(() => import('../three-d/HeroScene'))

/** Static stand-in drawn with CSS/SVG: shown before the 3D scene loads and where WebGL is unavailable. */
function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#f3d39a_0%,#a07a3e_18%,#0c3a31_46%,#061a16_80%)]" aria-hidden>
      <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice">
        <defs>
          <mask id="arches">
            <rect width="800" height="500" fill="white" />
            {[160, 400, 640].map((x) => <path key={x} d={`M${x - 70} 420 V220 Q${x - 70} 140 ${x} 120 Q${x + 70} 140 ${x + 70} 220 V420 Z`} fill="black" />)}
          </mask>
        </defs>
        <rect width="800" height="500" fill="#0b332b" mask="url(#arches)" opacity=".92" />
        <g fill="#5a3219" opacity=".95">
          <path d="M300 470 L400 380 L500 470 L488 474 L400 396 L312 474Z" />
          <path d="M318 360 Q360 344 398 372 L398 386 Q360 360 318 376Z" fill="#efe2c2" />
          <path d="M482 360 Q440 344 402 372 L402 386 Q440 360 482 376Z" fill="#efe2c2" />
        </g>
      </svg>
    </div>
  )
}

export function Hero() {
  const reduce = useReducedMotion() ?? false
  const [ref, inView] = useInView<HTMLDivElement>('0px')
  const webgl = useMemo(() => hasWebGL(), [])
  const lite = useMemo(() => isLiteDevice(), [])
  const [ready, setReady] = useState(false)
  const [q, setQ] = useState('')

  const suggestions = useMemo(() => {
    if (!q.trim()) return SUMMARIES.slice(0, 6).map((s) => ({ label: s.title, href: `#summary-${s.topic_id}`, kind: 'সারসংক্ষেপ' }))
    const s = matchSummary(q)
    const out = s ? [{ label: s.title, href: `#summary-${s.topic_id}`, kind: 'সারসংক্ষেপ' }] : []
    TOPICS.filter((t) => t.title.includes(q.trim())).slice(0, 4).forEach((t) => out.push({ label: t.title, href: `#topic-${t.id}`, kind: 'বিষয়' }))
    return out
  }, [q])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    setPendingQuery(q.trim())
    navigate('#search')
  }

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-night text-ivory">
      {/* phones: the scene gets its own band at the top; desktop: it fills the hero behind the text */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[400px] lg:inset-0 lg:h-auto">
        <HeroFallback />
        {webgl && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <Suspense fallback={null}>
              <HeroScene lite={lite} still={reduce} active={inView} onReady={() => setReady(true)} />
            </Suspense>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night to-transparent lg:hidden" />
        {/* reading-side scrim keeps text legible over the scene */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent lg:bg-gradient-to-r lg:from-night lg:via-night/75 lg:to-transparent" />
      </div>

      <div className="wrap relative grid grid-cols-[minmax(0,1fr)] items-center gap-10 pb-16 pt-14 lg:min-h-[660px] lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="min-w-0 max-w-xl pt-[300px] lg:pt-0">
          <p className="mb-4 flex items-center gap-2 font-en text-[11px] font-semibold uppercase tracking-[0.24em] text-goldsoft">
            <span className="h-px w-8 bg-goldsoft/70" /> কুতুবুস সিত্তাহ · আরবি · বাংলা · English
          </p>
          <h1 className="text-[clamp(2.2rem,5.4vw,3.9rem)] font-bold leading-[1.15] text-ivory">
            সহিহ হাদিসের আলোকে <span className="text-goldsoft">জীবন গড়ি</span>
          </h1>
          <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-ivory/80">
            রাসুলুল্লাহ ﷺ-এর শিক্ষা জানুন, বুঝুন এবং জীবনে প্রয়োগ করুন।
          </p>

          <form onSubmit={submit} className="relative mt-8" role="search">
            <label htmlFor="hero-search" className="sr-only">হাদিস অনুসন্ধান</label>
            <div className="flex items-center gap-2 rounded-2xl border border-ivory/15 bg-night/70 p-1.5 pl-4 shadow-lift ring-1 ring-goldsoft/10 backdrop-blur-md focus-within:border-goldsoft/60">
              <Search size={19} className="shrink-0 text-goldsoft" aria-hidden />
              <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
                className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-ivory outline-none placeholder:text-ivory/45"
                placeholder="যেমন: ধৈর্য, প্রতিবেশী, বুখারি ৬০৯৪" />
              <button type="submit" className="btn-gold h-12 shrink-0 px-5">খুঁজুন</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="প্রস্তাবিত বিষয়">
              {suggestions.map((s) => (
                <a key={s.href} href={s.href} className="rounded-full border border-ivory/15 bg-ivory/[.06] px-3 py-1.5 text-[13.5px] text-ivory/85 transition hover:border-goldsoft/60 hover:text-ivory">
                  {s.label} <span className="text-ivory/45">· {s.kind}</span>
                </a>
              ))}
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href="#search" className="btn-gold">হাদিস অনুসন্ধান করুন <ArrowRight size={17} aria-hidden /></a></Magnetic>
            <Magnetic><a href="#summary" className="btn border border-ivory/25 text-ivory hover:border-goldsoft/70"><Sparkles size={17} aria-hidden /> AI সারসংক্ষেপ দেখুন</a></Magnetic>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden />
      </div>

      <div className="relative border-t border-ivory/10 bg-night/70 backdrop-blur">
        <dl className="wrap grid grid-cols-2 gap-y-4 py-5 text-center sm:grid-cols-4">
          {[
            [bnNum(TOTAL_HADITH), 'হাদিস, প্রতিটির মানসহ'],
            [toBnDigits(COLLECTIONS.length), 'প্রধান হাদিস গ্রন্থ'],
            [toBnDigits(TOPICS.length), 'বিষয়ভিত্তিক সূচি'],
            [toBnDigits(SUMMARIES.length), 'সম্মিলিত সারসংক্ষেপ'],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd className="num text-[22px] font-semibold text-goldsoft">{n}</dd>
              <dd className="text-[13px] text-ivory/65">{l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
