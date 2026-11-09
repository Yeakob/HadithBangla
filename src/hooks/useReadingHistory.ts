import { createStore } from './store'

export interface HistoryItem { kind: 'hadith' | 'topic' | 'summary'; id: string; label: string; at: number }

const store = createStore<HistoryItem[]>('hk.history.v1', [])

export function recordVisit(item: Omit<HistoryItem, 'at'>) {
  store.set((l) => [{ ...item, at: Date.now() }, ...l.filter((x) => !(x.kind === item.kind && x.id === item.id))].slice(0, 30))
}

export function useReadingHistory() {
  const list = store.use()
  return { list, clear: () => store.set([]) }
}
