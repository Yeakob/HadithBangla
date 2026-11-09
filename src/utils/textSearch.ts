const BN = '০১২৩৪৫৬৭৮৯'

export const toBnDigits = (v: string | number) => String(v).replace(/[0-9]/g, (d) => BN[+d])
export const toEnDigits = (v: string) => v.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))
export const bnNum = (n: number) => toBnDigits(n.toLocaleString('en-IN'))

/** Normalises Bangla/English text for matching: digits, quotes, zero-width chars, case, spacing. */
export function normalize(s: string): string {
  return toEnDigits(s)
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/[‘’`´']/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/্‌/g, '্')
    .replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export const tokens = (q: string) =>
  normalize(q)
    .replace(/[-–—]/g, ' ')
    .split(' ')
    .filter((t) => t.length > 0)

/** True when every token appears in the haystack (already normalised). */
export const matchesAll = (hay: string, toks: string[]) => toks.every((t) => hay.includes(t))

/** A short excerpt around the first matching token. */
export function excerpt(text: string, toks: string[], radius = 90): string {
  const n = normalize(text)
  let at = -1
  for (const t of toks) {
    at = n.indexOf(t)
    if (at >= 0) break
  }
  if (at < 0) return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '')
  const start = Math.max(0, at - radius)
  const end = Math.min(text.length, at + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}
