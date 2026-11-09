import { useSyncExternalStore } from 'react'

/**
 * Hash router using plain "#name" fragments (ASCII letters, digits, hyphens) so links
 * survive the artifact viewer: #topics, #topic-parents, #hadith-bukhari-6094, #summary-anger.
 */
export type Route =
  | { page: 'home' }
  | { page: 'topics' }
  | { page: 'topic'; id: string }
  | { page: 'hadith'; id: string }
  | { page: 'summary'; id: string | null }
  | { page: 'collections' }
  | { page: 'collection'; id: string }
  | { page: 'search' }
  | { page: 'bookmarks' }
  | { page: 'about'; section: string | null }
  | { page: 'notfound' }

export function parseHash(h: string): Route {
  const s = h.replace(/^#/, '')
  if (!s || s === 'home') return { page: 'home' }
  if (s === 'topics') return { page: 'topics' }
  if (s === 'collections') return { page: 'collections' }
  if (s === 'search') return { page: 'search' }
  if (s === 'bookmarks') return { page: 'bookmarks' }
  if (s === 'summary') return { page: 'summary', id: null }
  if (s === 'about') return { page: 'about', section: null }
  let m: RegExpExecArray | null
  if ((m = /^topic-([a-z-]+)$/.exec(s))) return { page: 'topic', id: m[1] }
  if ((m = /^hadith-([a-z]+-\d+(?:-\d+)?)$/.exec(s))) return { page: 'hadith', id: m[1] }
  if ((m = /^summary-([a-z-]+)$/.exec(s))) return { page: 'summary', id: m[1] }
  if ((m = /^collection-([a-z]+)$/.exec(s))) return { page: 'collection', id: m[1] }
  if ((m = /^about-([a-z]+)$/.exec(s))) return { page: 'about', section: m[1] }
  return { page: 'notfound' }
}

const subscribe = (f: () => void) => {
  window.addEventListener('hashchange', f)
  return () => window.removeEventListener('hashchange', f)
}
const getHash = () => window.location.hash

export function useRoute(): { route: Route; hash: string } {
  const hash = useSyncExternalStore(subscribe, getHash, getHash)
  return { route: parseHash(hash), hash }
}

export function navigate(hash: string) {
  if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'))
  else window.location.hash = hash
}

/** Search text handed from other pages (home hero, command palette) to the search page. */
let pendingQuery = ''
export const setPendingQuery = (q: string) => { pendingQuery = q }
export const takePendingQuery = () => { const q = pendingQuery; pendingQuery = ''; return q }

/** Summary topic handed from other pages (home summary panel) to the summary page. */
let pendingSummary = ''
export const setPendingSummary = (q: string) => { pendingSummary = q }
export const takeSummaryQuery = () => { const q = pendingSummary; pendingSummary = ''; return q }
