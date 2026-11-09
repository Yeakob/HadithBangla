import { useEffect } from 'react'
import refs from '../data/references.json'
import { GRADE_BN, Notice } from '../components/ui/bits'
import { PageHeader } from '../components/ui/filters'
import { COLLECTIONS, TOTAL_HADITH } from '../services/referenceResolver'
import { SUMMARIES } from '../services/summaryEngine'
import type { Grade } from '../types'
import { bnNum, toBnDigits } from '../utils/textSearch'

export default function About({ section }: { section: string | null }) {
  useEffect(() => {
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    else window.scrollTo({ top: 0 })
  }, [section])
  const grades = COLLECTIONS.reduce<Record<string, number>>((acc, c) => {
    Object.entries(c.grade_counts).forEach(([g, n]) => { acc[g] = (acc[g] ?? 0) + (n ?? 0) })
    return acc
  }, {})
  return (
    <>
      <PageHeader eyebrow="আমাদের সম্পর্কে" title="হাদিস জ্ঞান কী এবং কীভাবে তৈরি" crumbs={[['প্রথম পাতা', '#home'], ['আমাদের সম্পর্কে', '']]}
        desc="“হাদিস হবে মূল উৎস, JSON হবে জ্ঞানভান্ডার, AI হবে ব্যাখ্যার সহায়ক।”" />
      <div className="wrap grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="এই পাতায়">
          <ul className="space-y-2 text-[15px]">
            {[['about', 'পরিচিতি'], ['authenticity', 'বিশুদ্ধতা নীতি'], ['methodology', 'কনটেন্ট পদ্ধতি'], ['disclaimer', 'দায়মুক্তি'], ['sources', 'উৎস ও কৃতজ্ঞতা']].map(([id, l]) => (
              <li key={id}><a className="text-muted hover:text-gold" href={`#about-${id}`}>{l}</a></li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[68ch] space-y-14 text-[16.5px] leading-[1.9]">
          <section id="about" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold">পরিচিতি</h2>
            <p>হাদিস জ্ঞান একটি বাংলা-প্রধান ডিজিটাল হাদিস গ্রন্থাগার। এতে কুতুবুস সিত্তাহর ছয়টি গ্রন্থের মোট {bnNum(TOTAL_HADITH)}টি হাদিস আরবি মূলপাঠ, বাংলা ও ইংরেজি অনুবাদসহ রয়েছে।
              প্রতিটি হাদিসের সাথে তার মান, গ্রেডদাতা মুহাদ্দিস ও Sunnah.com-এ মূল উৎসের লিংক দেওয়া আছে।</p>
            <p className="mt-3">পুরো সাইটটি ব্রাউজারেই চলে: কোনো সার্ভার, ডেটাবেস বা লগইন নেই। বুকমার্ক ও পড়ার ইতিহাস শুধু আপনার ব্রাউজারে থাকে।</p>
          </section>

          <section id="authenticity" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold">বিশুদ্ধতা নীতি</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><b>সহিহ বুখারি ও সহিহ মুসলিম:</b> মুহাদ্দিসগণের সর্বসম্মত মত অনুযায়ী এদের সব হাদিস সহিহ।</li>
              <li><b>চারটি সুনান গ্রন্থ</b> (আবু দাউদ, তিরমিজি, নাসাঈ, ইবনে মাজাহ): প্রতিটি হাদিসের মান আলাদাভাবে দেখানো হয়েছে। প্রধান মান হিসেবে শায়খ নাসিরুদ্দীন আলবানীর গ্রেড
                নেওয়া হয়েছে, এবং অন্য মুহাদ্দিসদের গ্রেডও হাদিসের পাতায় দেখানো হয়।</li>
              <li>যঈফ, মুনকার ও মাওযু (জাল) বর্ণনা মুছে ফেলা হয়নি, কারণ সেগুলো গ্রন্থের অংশ; তবে স্পষ্ট সতর্কবার্তা দিয়ে চিহ্নিত এবং অনুসন্ধান ও বিষয় পাতায় ডিফল্টভাবে লুকানো।</li>
              <li>সারসংক্ষেপ ও দৈনিক হাদিসে শুধু সহিহ বুখারি ও সহিহ মুসলিমের হাদিস ব্যবহার করা হয়েছে।</li>
            </ul>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[15px]">
                <thead><tr className="border-b border-line text-muted"><th className="py-2 font-medium">মান</th><th className="py-2 text-right font-medium">হাদিস সংখ্যা (ছয় গ্রন্থ)</th></tr></thead>
                <tbody>
                  {(['sahih', 'hasan', 'daif', 'rejected', 'athar', 'ungraded'] as Grade[]).filter((g) => grades[g]).map((g) => (
                    <tr key={g} className="border-b border-line/60"><td className="py-2">{GRADE_BN[g]}</td><td className="num py-2 text-right">{bnNum(grades[g])}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="methodology" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold">কনটেন্ট পদ্ধতি</h2>
            <ol className="list-decimal space-y-3 pl-5">
              <li>আরবি, বাংলা ও ইংরেজি পাঠ একই সংখ্যাভিত্তিক সংস্করণ থেকে নেওয়া হয়েছে, যাতে একটি রেকর্ডের তিন ভাষার পাঠ একই হাদিসের হয়।</li>
              <li><b>অনুবাদ মিল যাচাই:</b> বাংলা অনুবাদে যে সাহাবির নাম আছে, সেটি একই রেকর্ডের আরবি বা ইংরেজি পাঠে আছে কি না, তা স্বয়ংক্রিয়ভাবে মেলানো হয়েছে। যেগুলো মেলেনি
                (প্রায় ১%), সেগুলোর পাতায় সতর্কবার্তা দেখানো হয়।</li>
              <li><b>রিয়াদুস সালেহীন ক্রস-রেফারেন্স:</b> ইমাম নববী যে হাদিসগুলোকে বুখারি/মুসলিমের বলে উল্লেখ করেছেন, সেগুলোর আরবি পাঠ বুখারি ও মুসলিমের পাঠের সাথে শব্দ ও বর্ণনাকারী
                মিলিয়ে নির্দিষ্ট নম্বর বের করা হয়েছে। মিলে যাওয়া রেকর্ডে রিয়াদুস সালেহীনের নম্বর দেখানো হয়।</li>
              <li><b>বিষয় সূচি:</b> ইংরেজি অনুবাদে প্রতিটি বিষয়ের মূল শব্দ খুঁজে তৈরি। এটি খুঁজে পাওয়ার সহায়ক; কোনো হাদিসের মান বা মূল বিষয়ের প্রমাণ নয়।</li>
              <li><b>“AI সারসংক্ষেপ”:</b> {toBnDigits(SUMMARIES.length)}টি বিষয়ের ব্যাখ্যা আগে থেকে লেখা ও JSON-এ সংরক্ষিত। প্রতিটি শিক্ষার পাশে যে হাদিসের ওপর তা ভিত্তি করে তার নম্বর আছে,
                এবং সাইট চালুর সময় যাচাই হয় যে উদ্ধৃত প্রতিটি হাদিস ডেটাবেসে আছে ও সহিহ। লেখাগুলো একটি AI সহকারী হাদিসের পাঠ থেকে খসড়া করেছে এবং এখনো আলেমের পর্যালোচনার
                অপেক্ষায়, যা প্রতিটি সারসংক্ষেপে চিহ্নিত। সাইটে কোনো লাইভ ভাষা-মডেল যুক্ত নেই।</li>
            </ol>
          </section>

          <section id="disclaimer" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold">দায়মুক্তি</h2>
            <Notice tone="warn">
              ডেটা উন্মুক্ত ডিজিটাল সংস্করণ থেকে নেওয়া এবং যত্নের সাথে স্বয়ংক্রিয়ভাবে যাচাই করা হয়েছে, তবু টাইপিং বা মিলের ভুল থাকতে পারে। ব্যাখ্যামূলক সারসংক্ষেপ সরাসরি হাদিসের ভাষ্য নয়।
              ফতোয়া, আমল বা কোনো ধর্মীয় সিদ্ধান্তের জন্য যোগ্য আলেমের পরামর্শ নিন এবং প্রয়োজনে মূল গ্রন্থের সাথে মিলিয়ে নিন।
            </Notice>
          </section>

          <section id="sources" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold">উৎস ও কৃতজ্ঞতা</h2>
            <ul className="space-y-2">
              {refs.texts.map((t) => (
                <li key={t.url}><a className="font-medium text-gold hover:underline" href={t.url} target="_blank" rel="noreferrer">{t.name}</a> — {t.use}</li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] text-muted">গ্রেডদাতা: <span lang="en" className="font-en">{refs.graders.join(', ')}</span></p>
            <p className="mt-2 text-[15px] text-muted">নম্বর পদ্ধতি: বুখারি — {refs.numbering.bukhari}; মুসলিম — {refs.numbering.muslim}; অন্যান্য — {refs.numbering.others}।</p>
          </section>
        </div>
      </div>
    </>
  )
}
