import { useMemo, useState } from 'react'
import { TopicCard } from '../components/topics/TopicCard'
import { PageHeader } from '../components/ui/filters'
import { TOPICS } from '../services/topicEngine'
import { normalize, toBnDigits } from '../utils/textSearch'

export default function Topics() {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const n = normalize(q)
    return n ? TOPICS.filter((t) => normalize(t.title + ' ' + t.title_en + ' ' + t.description).includes(n)) : TOPICS
  }, [q])
  return (
    <>
      <PageHeader eyebrow="বিষয় সূচি" title="ইসলামী বিষয়সমূহ" crumbs={[['প্রথম পাতা', '#home'], ['বিষয়সমূহ', '']]}
        desc={`${toBnDigits(TOPICS.length)}টি বিষয়। প্রতিটি হাদিসের ইংরেজি অনুবাদে বিষয়ের মূল শব্দ খুঁজে সূচিটি তৈরি; এটি খুঁজে পাওয়ার সহায়ক, হাদিসের মানের প্রমাণ নয়।`} />
      <div className="wrap py-10">
        <label htmlFor="topic-filter" className="sr-only">বিষয় খুঁজুন</label>
        <input id="topic-filter" className="input mb-8 max-w-md" placeholder="বিষয় খুঁজুন…" value={q} onChange={(e) => setQ(e.target.value)} />
        {list.length === 0 ? <p className="text-muted">এই নামে কোনো বিষয় নেই।</p> : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((t) => <TopicCard key={t.id} t={t} i={TOPICS.indexOf(t)} />)}
          </div>
        )}
      </div>
    </>
  )
}
