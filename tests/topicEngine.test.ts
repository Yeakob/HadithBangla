import { describe, it } from 'node:test'
import assert from 'node:assert'
import { TOPICS, TOPIC_BY_ID, filterRows, rankRows, matchTopic } from '../src/services/topicEngine'
import type { TopicRow } from '../src/types'

describe('topicEngine service', () => {
  it('loads all defined topics', () => {
    assert.ok(TOPICS.length >= 10)
    for (const t of TOPICS) {
      assert.ok(t.id)
      assert.ok(t.title)
      assert.ok(t.file)
      assert.strictEqual(TOPIC_BY_ID[t.id], t)
    }
  })

  it('matches topics from Bengali and English terms', () => {
    const tParents = matchTopic('পিতা-মাতার সম্মান')
    assert.ok(tParents)
    assert.strictEqual(tParents?.id, 'parents')

    const tPatience = matchTopic('patience')
    assert.ok(tPatience)
    assert.strictEqual(tPatience?.id, 'patience-gratitude')
  })

  it('filters rows according to collections and grades', () => {
    const rows: TopicRow[] = [
      ['bukhari-1', 'bukhari', '1', 'sahih', 'উমর (রা.)', 'সকল আমল...'],
      ['abudawud-20', 'abudawud', '20', 'daif', 'বর্ণনাকারী', 'দুর্বল হাদিস...'],
      ['muslim-50', 'muslim', '50', 'sahih', 'আবু হুরায়রা (রা.)', 'আরেকটি বর্ণনা...'],
    ]

    const sahihOnly = filterRows(rows, { collections: 'all', grades: ['sahih'] })
    assert.strictEqual(sahihOnly.length, 2)
    assert.ok(sahihOnly.every((r) => r[3] === 'sahih'))

    const bukhariOnly = filterRows(rows, { collections: ['bukhari'], grades: 'all' })
    assert.strictEqual(bukhariOnly.length, 1)
    assert.strictEqual(bukhariOnly[0][0], 'bukhari-1')
  })

  it('ranks rows with Sahih first and Bukhari/Muslim priority', () => {
    const rows: TopicRow[] = [
      ['tirmidhi-1', 'tirmidhi', '1', 'hasan', null, 'তিরমিজি হাসান'],
      ['bukhari-2', 'bukhari', '2', 'sahih', null, 'বুখারি সহিহ'],
      ['abudawud-1', 'abudawud', '1', 'daif', null, 'আবু দাউদ যঈফ'],
      ['muslim-1', 'muslim', '1', 'sahih', null, 'মুসলিম সহিহ'],
    ]

    const ranked = rankRows(rows)
    assert.strictEqual(ranked[0][0], 'bukhari-2')
    assert.strictEqual(ranked[1][0], 'muslim-1')
    assert.strictEqual(ranked[2][0], 'tirmidhi-1')
    assert.strictEqual(ranked[3][0], 'abudawud-1')
  })
})
