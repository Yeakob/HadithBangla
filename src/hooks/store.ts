import { useSyncExternalStore } from 'react'

/** Safe localStorage access: the artifact viewer can block storage, so every call is guarded. */
export function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
export function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: state stays in memory for this visit */
  }
}

/** Tiny persistent store shared by every component that uses it. */
export function createStore<T>(key: string, initial: T) {
  let state = readLS<T>(key, initial)
  const subs = new Set<() => void>()
  return {
    get: () => state,
    set(next: T | ((s: T) => T)) {
      state = typeof next === 'function' ? (next as (s: T) => T)(state) : next
      writeLS(key, state)
      subs.forEach((f) => f())
    },
    subscribe(f: () => void) {
      subs.add(f)
      return () => subs.delete(f)
    },
    use(): T {
      return useSyncExternalStore(this.subscribe.bind(this), this.get, this.get)
    },
  }
}
