import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BottomNav, Footer, Header } from './components/layout/Shell'
import { CommandPalette } from './components/navigation/CommandPalette'
import { Toasts } from './components/ui/bits'
import { useRoute, type Route } from './hooks/useRoute'
import About from './pages/About'
import Bookmarks from './pages/Bookmarks'
import CollectionDetails from './pages/CollectionDetails'
import Collections from './pages/Collections'
import HadithDetails from './pages/HadithDetails'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Search from './pages/Search'
import SummaryPage from './pages/Summary'
import TopicDetails from './pages/TopicDetails'
import Topics from './pages/Topics'

function Page({ route }: { route: Route }) {
  switch (route.page) {
    case 'home': return <Home />
    case 'topics': return <Topics />
    case 'topic': return <TopicDetails id={route.id} />
    case 'hadith': return <HadithDetails id={route.id} />
    case 'summary': return <SummaryPage id={route.id} />
    case 'collections': return <Collections />
    case 'collection': return <CollectionDetails id={route.id} />
    case 'search': return <Search />
    case 'bookmarks': return <Bookmarks />
    case 'about': return <About section={route.section} />
    default: return <NotFound />
  }
}

const TITLES: Partial<Record<Route['page'], string>> = {
  topics: 'বিষয়সমূহ', topic: 'বিষয়', hadith: 'হাদিস', summary: 'AI সারসংক্ষেপ', collections: 'গ্রন্থাগার',
  collection: 'গ্রন্থ', search: 'অনুসন্ধান', bookmarks: 'বুকমার্ক', about: 'আমাদের সম্পর্কে',
}

export default function App() {
  const { route, hash } = useRoute()
  const reduce = useReducedMotion()
  const [palette, setPalette] = useState(false)
  // pages keyed so that sub-anchors of the same page (about sections) don't remount it
  const key = route.page === 'about' ? 'about' : route.page === 'summary' ? 'summary' : hash

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setPalette(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (route.page !== 'about') window.scrollTo({ top: 0 })
    const t = TITLES[route.page]
    document.title = t ? `${t} · হাদিস জ্ঞান` : 'হাদিস জ্ঞান'
  }, [hash, route.page])

  return (
    <div className="flex min-h-full flex-col">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-goldsoft focus:px-4 focus:py-2 focus:text-night">
        মূল অংশে যান
      </a>
      <Header route={route} onPalette={() => setPalette(true)} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={key}
            initial={reduce ? false : { opacity: 0.4, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0.4, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}>
            <Page route={route} />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav route={route} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <Toasts />
    </div>
  )
}
