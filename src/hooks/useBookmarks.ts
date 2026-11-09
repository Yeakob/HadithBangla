import type { HadithRecord } from '../types'
import { createStore } from './store'
import { toast } from './useToast'

export interface Bookmark { id: string; collection_id: HadithRecord['collection_id']; number: string; grade: HadithRecord['authenticity']; snippet: string; at: number }

const store = createStore<Bookmark[]>('hk.bookmarks.v1', [])

export function useBookmarks() {
  const list = store.use()
  const has = (id: string) => list.some((b) => b.id === id)
  const toggle = (r: HadithRecord) => {
    if (has(r.id)) {
      store.set((l) => l.filter((b) => b.id !== r.id))
      toast('বুকমার্ক থেকে সরানো হয়েছে')
    } else {
      const snippet = (r.bangla_translation ?? r.english_translation ?? '').slice(0, 220)
      store.set((l) => [{ id: r.id, collection_id: r.collection_id, number: r.hadith_number, grade: r.authenticity, snippet, at: Date.now() }, ...l])
      toast('বুকমার্ক করা হয়েছে')
    }
  }
  const remove = (id: string) => store.set((l) => l.filter((b) => b.id !== id))
  const clear = () => store.set([])
  return { list, has, toggle, remove, clear }
}
