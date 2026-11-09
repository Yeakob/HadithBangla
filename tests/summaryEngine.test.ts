import { describe, it } from 'node:test'
import assert from 'node:assert'
import { SUMMARIES, SUMMARY_BY_ID, matchSummary } from '../src/services/summaryEngine'

describe('summaryEngine service', () => {
  it('loads all 10 prepared summaries with proper structure', () => {
    assert.strictEqual(SUMMARIES.length, 10)
    for (const s of SUMMARIES) {
      assert.ok(s.topic_id)
      assert.ok(s.title)
      assert.ok(s.category_id)
      assert.ok(s.hadith_ids.length > 0)
      assert.ok(s.summary.introduction)
      assert.ok(s.summary.combined_teachings.length > 0)
      assert.ok(s.summary.conclusion)
      assert.strictEqual(SUMMARY_BY_ID[s.topic_id], s)
    }
  })

  it('matches free text queries to summaries via aliases', () => {
    const sAnger = matchSummary('রাগ সংবরণ')
    assert.ok(sAnger)
    assert.strictEqual(sAnger?.topic_id, 'anger')

    const sParents = matchSummary('পিতা মাতা')
    assert.ok(sParents)
    assert.strictEqual(sParents?.topic_id, 'parents')

    const sHonesty = matchSummary('সততা ও আমানতদারিতা')
    assert.ok(sHonesty)
    assert.strictEqual(sHonesty?.topic_id, 'honesty')
  })
})

