import { useSyncExternalStore } from 'react'

interface Toast { id: number; text: string }
let toasts: Toast[] = []
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export function toast(text: string) {
  const id = Date.now() + Math.random()
  toasts = [...toasts, { id, text }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 2600)
}

export const useToasts = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => toasts, () => toasts)

/** Copy text; falls back to a hidden textarea + execCommand where the clipboard API is refused. */
export async function copyText(text: string, done = 'কপি হয়েছে') {
  try {
    await navigator.clipboard.writeText(text)
    toast(done)
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      toast(ok ? done : 'কপি করা যায়নি; লেখাটি নির্বাচন করে কপি করুন')
    } catch {
      toast('কপি করা যায়নি; লেখাটি নির্বাচন করে কপি করুন')
    }
  }
}
