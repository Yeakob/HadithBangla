import { useEffect, useState } from 'react'
import { createStore } from './store'

type Pref = 'system' | 'light' | 'dark'
const store = createStore<Pref>('hk.theme.v1', 'system')
const mq = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null)

function apply(p: Pref) {
  const root = document.documentElement
  if (p === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', p)
}
apply(store.get())

export function useTheme() {
  const pref = store.use()
  const [sysDark, setSysDark] = useState(() => mq()?.matches ?? false)
  useEffect(() => {
    const m = mq()
    if (!m) return
    const f = () => setSysDark(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  const isDark = pref === 'dark' || (pref === 'system' && sysDark)
  const toggle = () => {
    const next: Pref = isDark ? 'light' : 'dark'
    store.set(next)
    apply(next)
  }
  return { pref, isDark, toggle }
}
