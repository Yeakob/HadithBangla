import { Bookmark, BookmarkCheck, ChevronDown, Copy, ExternalLink, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { CollectionId, Grade, HadithRecord } from '../../types'
import { useBookmarks } from '../../hooks/useBookmarks'
import { copyText } from '../../hooks/useToast'
import { createStore } from '../../hooks/store'
import { COLLECTION_BY_ID, hadithHref } from '../../services/referenceResolver'
import { toBnDigits } from '../../utils/textSearch'
import { GradeBadge, Notice } from '../ui/bits'

export const arabicSize = createStore<number>('hk.arabic-size.v1', 1)

/** Arabic text with proper RTL, adjustable size and an expand control for long texts with chains. */
export function ArabicText({ text, clamp = true, big = false }: { text: string; clamp?: boolean; big?: boolean }) {
  const size = arabicSize.use()
  const long = text.length > 320
  const [open, setOpen] = useState(!clamp || !long)
  const base = big ? 1.75 : 1.38
  return (
    <div>
      <p lang="ar" dir="rtl" className="arabic text-ink" style={{ fontSize: `${base * size}rem` }}>
        {open ? text : text.slice(0, 300).replace(/\s+\S*$/, '') + ' …'}
      </p>
      {long && clamp && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline" aria-expanded={open}>
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden />
          {open ? 'আরবি সংক্ষেপ করুন' : 'সম্পূর্ণ আরবি পাঠ (সনদসহ) দেখুন'}
        </button>
      )}
    </div>
  )
}

export function reference(r: Pick<HadithRecord, 'collection_id' | 'hadith_number'>) {
  return `${COLLECTION_BY_ID[r.collection_id].bn} — হাদিস ${toBnDigits(r.hadith_number)}`
}

export function HadithActions({ r, compact = false }: { r: HadithRecord; compact?: boolean }) {
  const { has, toggle } = useBookmarks()
  const marked = has(r.id)
  const link = `${location.href.split('#')[0]}${hadithHref(r.id)}`
  const cls = 'chip min-h-10'
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={cls} onClick={() => toggle(r)} aria-pressed={marked}>
        {marked ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
        {marked ? 'বুকমার্ক করা' : 'বুকমার্ক'}
      </button>
      {r.arabic_text && (
        <button type="button" className={cls} onClick={() => copyText(`${r.arabic_text}\n\n— ${reference(r)}`, 'আরবি পাঠ কপি হয়েছে')}>
          <Copy size={16} aria-hidden /> আরবি কপি
        </button>
      )}
      {r.bangla_translation && (
        <button type="button" className={cls} onClick={() => copyText(`${r.bangla_translation}\n\n— ${reference(r)}`, 'বাংলা অনুবাদ কপি হয়েছে')}>
          <Copy size={16} aria-hidden /> বাংলা কপি
        </button>
      )}
      {!compact && (
        <button type="button" className={cls} onClick={() => copyText(`${reference(r)}\n${link}`, 'লিংক কপি হয়েছে, এখন শেয়ার করুন')}>
          <Share2 size={16} aria-hidden /> শেয়ার
        </button>
      )}
      {!compact && (
        <a className={cls} href={r.source_url} target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden /> Sunnah.com
        </a>
      )}
    </div>
  )
}

export function TranslationCaution({ r }: { r: HadithRecord }) {
  if (r.translation_check !== 'flagged') return null
  return (
    <Notice tone="warn">
      স্বয়ংক্রিয় যাচাইয়ে এই রেকর্ডের বাংলা অনুবাদে উল্লিখিত বর্ণনাকারীকে আরবি বা ইংরেজি পাঠে মেলানো যায়নি। অনুবাদটি পাশের অন্য
      হাদিসের হতে পারে; আরবি মূলপাঠ ও Sunnah.com-এর সাথে মিলিয়ে পড়ুন।
    </Notice>
  )
}

export function GradeCaution({ grade }: { grade: Grade }) {
  if (grade === 'daif') return <Notice tone="warn">মুহাদ্দিসগণের মতে এই হাদিসটি যঈফ (দুর্বল)। আমল ও দলিলের ক্ষেত্রে সতর্কতা অবলম্বন করুন।</Notice>
  if (grade === 'rejected') return <Notice tone="warn">মুহাদ্দিসগণ এই বর্ণনাকে অত্যন্ত দুর্বল, মুনকার বা মাওযু (জাল) হিসেবে চিহ্নিত করেছেন। এটি রাসুলুল্লাহ ﷺ-এর বাণী হিসেবে প্রচার করা যাবে না।</Notice>
  if (grade === 'athar') return <Notice>এটি রাসুলুল্লাহ ﷺ-এর বাণী নয়; সাহাবি বা তাবেয়ির উক্তি/আমল (মাওকুফ/মাকতু)।</Notice>
  return null
}

/** Editorial card for one hadith: Arabic, Bangla, narrator, reference, grade and actions. */
export function HadithFull({ r, actions = true, headline }: { r: HadithRecord; actions?: boolean; headline?: string }) {
  return (
    <article className="card relative overflow-hidden p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <a href={hadithHref(r.id)} className="font-medium text-ink hover:text-gold">
          {headline ?? reference(r)}
        </a>
        <GradeBadge grade={r.authenticity} />
      </div>
      {r.arabic_text && <ArabicText text={r.arabic_text} />}
      <div className="my-4 h-px bg-gradient-to-r from-transparent via-goldsoft/50 to-transparent" aria-hidden />
      {r.narrator && <p className="mb-1 text-sm text-muted">বর্ণনাকারী: <span className="text-ink">{r.narrator}</span></p>}
      {r.bangla_translation ? (
        <p className="text-[17px] leading-[1.9] text-ink">{r.bangla_translation}</p>
      ) : (
        <p className="font-en text-[15.5px] text-ink" lang="en">{r.english_translation}</p>
      )}
      <div className="mt-4 space-y-3">
        <TranslationCaution r={r} />
        <GradeCaution grade={r.authenticity} />
      </div>
      {actions && <div className="mt-5"><HadithActions r={r} compact /></div>}
    </article>
  )
}

/** Compact list row used by topics, search, collections and bookmarks. */
export function HadithRow({ id, collection, number, grade, narrator, snippet, lang = 'bn', extra }: {
  id: string; collection: CollectionId; number: string; grade: Grade; narrator?: string | null; snippet: string; lang?: 'bn' | 'en'; extra?: React.ReactNode
}) {
  return (
    <li className="group relative rounded-xl border border-line/80 bg-surface p-4 transition hover:border-gold/60 hover:shadow-card">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-sm">
        <a href={hadithHref(id)} className="font-semibold text-ink after:absolute after:inset-0 group-hover:text-gold">
          {COLLECTION_BY_ID[collection].bn} <span className="num">{toBnDigits(number)}</span>
        </a>
        <GradeBadge grade={grade} />
        {narrator && <span className="text-muted">· {narrator}</span>}
      </div>
      <p className={`line-clamp-3 text-[15.5px] text-muted ${lang === 'en' ? 'font-en' : ''}`} lang={lang}>{snippet}</p>
      {extra && <div className="relative z-10 mt-2">{extra}</div>}
    </li>
  )
}
