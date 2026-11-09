import type { Grade } from '../types'

export type GradeFilter = 'sahih' | 'sahih-hasan' | 'all'

export const gradeList = (g: GradeFilter): Grade[] | 'all' =>
  g === 'sahih' ? ['sahih'] : g === 'sahih-hasan' ? ['sahih', 'hasan'] : 'all'

export const GRADE_STYLE: Record<Grade, string> = {
  sahih: 'border-ok/40 bg-ok/10 text-ok',
  hasan: 'border-gold/45 bg-goldsoft/10 text-gold',
  daif: 'border-warn/50 bg-warn/10 text-warn',
  rejected: 'border-bad/50 bg-bad/10 text-bad',
  athar: 'border-line bg-raised text-muted',
  ungraded: 'border-line bg-raised text-muted',
}

export const GRADE_BN: Record<Grade, string> = {
  sahih: 'সহিহ',
  hasan: 'হাসান',
  daif: 'যঈফ',
  rejected: 'অত্যন্ত দুর্বল/জাল',
  athar: 'সাহাবি/তাবেয়ির উক্তি',
  ungraded: 'মান উল্লেখ নেই',
}

