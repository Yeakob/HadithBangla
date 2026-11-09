import { Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { HadithRow } from '../components/hadith/HadithParts'
import { Notice } from '../components/ui/bits'
import { PageHeader } from '../components/ui/filters'
import { useBookmarks } from '../hooks/useBookmarks'
import { useReadingHistory } from '../hooks/useReadingHistory'
import { copyText } from '../hooks/useToast'
import { COLLECTION_BY_ID } from '../services/referenceResolver'
import { toBnDigits } from '../utils/textSearch'

export default function Bookmarks() {
  const { list, remove, clear } = useBookmarks()
  const history = useReadingHistory()
  const [confirm, setConfirm] = useState(false)
  const asText = list.map((b) => `${COLLECTION_BY_ID[b.collection_id].bn} ${toBnDigits(b.number)}: ${b.snippet}`).join('\n\n')
  return (
    <>
      <PageHeader eyebrow="আমার সংগ্রহ" title="বুকমার্ক ও পড়ার ইতিহাস" crumbs={[['প্রথম পাতা', '#home'], ['বুকমার্ক', '']]}
        desc="বুকমার্ক ও ইতিহাস শুধু এই ব্রাউজারে সংরক্ষিত থাকে; অন্য কোথাও পাঠানো হয় না।" />
      <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0" aria-labelledby="bm-h">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="bm-h" className="text-[20px] font-semibold">বুকমার্ক ({toBnDigits(list.length)})</h2>
            {list.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="chip" onClick={() => copyText(asText, 'সব বুকমার্ক কপি হয়েছে')}><Copy size={15} aria-hidden /> সব কপি করুন</button>
                {!confirm ? (
                  <button type="button" className="chip" onClick={() => setConfirm(true)}><Trash2 size={15} aria-hidden /> সব মুছুন</button>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-bad/40 bg-bad/10 px-3 py-1 text-sm">
                    নিশ্চিত?
                    <button type="button" className="font-semibold text-bad" onClick={() => { clear(); setConfirm(false) }}>হ্যাঁ, মুছুন</button>
                    <button type="button" className="text-muted" onClick={() => setConfirm(false)}>না</button>
                  </span>
                )}
              </div>
            )}
          </div>
          {list.length === 0 ? (
            <Notice>এখনো কোনো বুকমার্ক নেই। যেকোনো হাদিসের নিচে “বুকমার্ক” বোতাম চাপলে তা এখানে জমা হবে। শুরু করতে <a className="text-gold underline" href="#home">আজকের হাদিস</a> দেখুন।</Notice>
          ) : (
            <ul className="space-y-3">
              {list.map((b) => (
                <HadithRow key={b.id} id={b.id} collection={b.collection_id} number={b.number} grade={b.grade} snippet={b.snippet}
                  extra={<button type="button" className="text-sm text-muted hover:text-bad" onClick={() => remove(b.id)}>সরিয়ে দিন</button>} />
              ))}
            </ul>
          )}
        </section>
        <aside aria-labelledby="hist-h">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="hist-h" className="text-[20px] font-semibold">সম্প্রতি দেখা</h2>
            {history.list.length > 0 && <button type="button" className="text-sm text-muted hover:text-ink" onClick={history.clear}>ইতিহাস মুছুন</button>}
          </div>
          {history.list.length === 0 ? <p className="text-sm text-muted">কিছু দেখা হয়নি।</p> : (
            <ul className="space-y-2">
              {history.list.map((h) => (
                <li key={h.kind + h.id}>
                  <a className="block rounded-xl border border-line/70 bg-surface px-3.5 py-2.5 text-[15px] hover:border-gold/60"
                    href={h.kind === 'hadith' ? `#hadith-${h.id}` : h.kind === 'topic' ? `#topic-${h.id}` : `#summary-${h.id}`}>{h.label}</a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  )
}
