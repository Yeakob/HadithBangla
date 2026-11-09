/** Fetches local JSON files (relative to the page) once and caches them in memory. */
const cache = new Map<string, Promise<unknown>>()

export function loadJson<T>(path: string): Promise<T> {
  let p = cache.get(path)
  if (!p) {
    p = fetch(path).then((r) => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`)
      return r.json()
    })
    p.catch(() => cache.delete(path)) // allow a retry after a failure
    cache.set(path, p)
  }
  return p as Promise<T>
}

export const isCached = (path: string) => cache.has(path)
