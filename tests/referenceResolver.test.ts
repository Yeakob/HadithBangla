import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  COLLECTIONS,
  COLLECTION_BY_ID,
  TOTAL_HADITH,
  parseId,
  shardFor,
  citeBn,
  hadithHref,
  getFeatured,
} from '../src/services/referenceResolver'

describe('referenceResolver service', () => {
  it('loads all 6 Kutub al-Sittah collections with correct total count', () => {
    assert.strictEqual(COLLECTIONS.length, 6)
    assert.strictEqual(TOTAL_HADITH, 34229)
    assert.ok(COLLECTION_BY_ID.bukhari)
    assert.ok(COLLECTION_BY_ID.muslim)
    assert.ok(COLLECTION_BY_ID.abudawud)
    assert.ok(COLLECTION_BY_ID.tirmidhi)
    assert.ok(COLLECTION_BY_ID.nasai)
    assert.ok(COLLECTION_BY_ID.ibnmajah)
  })

  it('correctly parses hadith IDs', () => {
    assert.deepStrictEqual(parseId('bukhari-1'), { collection: 'bukhari', seq: 1 })
    assert.deepStrictEqual(parseId('muslim-774-2'), { collection: 'muslim', seq: 774.2 })
    assert.deepStrictEqual(parseId('tirmidhi-1234'), { collection: 'tirmidhi', seq: 1234 })
    assert.strictEqual(parseId('unknown-1'), null)
    assert.strictEqual(parseId('invalid'), null)
  })

  it('resolves the correct shard file for a given id', () => {
    const s1 = shardFor('bukhari-1')
    assert.ok(s1)
    assert.strictEqual(s1?.file, 'data/hadith/bukhari/0.json')

    const sLate = shardFor('bukhari-7500')
    assert.ok(sLate)
    assert.ok(sLate?.file.startsWith('data/hadith/bukhari/'))
  })

  it('formats citations and hrefs properly in Bengali', () => {
    const dummy = { collection_id: 'bukhari' as const, hadith_number: '1' }
    assert.strictEqual(citeBn(dummy), 'সহিহ আল-বুখারি, হাদিস ১')
    assert.strictEqual(hadithHref('bukhari-1'), '#hadith-bukhari-1')
  })

  it('resolves featured hadith synchronously from bundled data', () => {
    const f = getFeatured('bukhari-6094')
    assert.ok(f)
    assert.strictEqual(f?.id, 'bukhari-6094')
    assert.strictEqual(f?.authenticity, 'sahih')
  })
})
