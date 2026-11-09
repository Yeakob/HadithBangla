import { CollectionCard } from '../components/library/CollectionCard'
import { Notice } from '../components/ui/bits'
import { PageHeader } from '../components/ui/filters'
import { Reveal } from '../components/ui/motion'
import { COLLECTIONS, TOTAL_HADITH } from '../services/referenceResolver'
import { bnNum } from '../utils/textSearch'

export default function Collections() {
  return (
    <>
      <PageHeader eyebrow="ডিজিটাল গ্রন্থাগার" title="হাদিস গ্রন্থসমূহ" crumbs={[['প্রথম পাতা', '#home'], ['গ্রন্থাগার', '']]}
        desc={`কুতুবুস সিত্তাহর ছয়টি গ্রন্থ, মোট ${bnNum(TOTAL_HADITH)}টি হাদিস, আরবি মূলপাঠ, বাংলা ও ইংরেজি অনুবাদসহ।`} />
      <div className="wrap py-10">
        <div className="mb-8">
          <Notice>
            সহিহ বুখারি ও সহিহ মুসলিমের সব হাদিস মুহাদ্দিসগণের সর্বসম্মত মতে সহিহ। সুনান আবু দাউদ, তিরমিজি, নাসাঈ ও ইবনে মাজাহতে সহিহ, হাসান, যঈফ এবং
            কিছু জাল বর্ণনাও রয়েছে; প্রতিটির পাশে শায়খ আলবানীসহ অন্যান্য মুহাদ্দিসের গ্রেড দেখানো হয়েছে।
          </Notice>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {COLLECTIONS.map((c) => <Reveal key={c.id}><CollectionCard c={c} /></Reveal>)}
        </div>
      </div>
    </>
  )
}
