import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseReference, searchSizeMb, ALL_COLLECTION_IDS } from '../src/services/hadithSearch'

describe('hadithSearch service', () => {
  it('parses Bengali and English direct references', () => {
    assert.deepStrictEqual(parseReference('বুখারি ৬০৯৪'), { collection: 'bukhari', number: '6094' })
    assert.deepStrictEqual(parseReference('বুখারী ১'), { collection: 'bukhari', number: '1' })
    assert.deepStrictEqual(parseReference('bukhari 1'), { collection: 'bukhari', number: '1' })
    assert.deepStrictEqual(parseReference('মুসলিম ৯১'), { collection: 'muslim', number: '91' })
    assert.deepStrictEqual(parseReference('আবু দাউদ ৪৩৪'), { collection: 'abudawud', number: '434' })
    assert.deepStrictEqual(parseReference('তিরমিযী ১০'), { collection: 'tirmidhi', number: '10' })
    assert.deepStrictEqual(parseReference('নাসাঈ ২০'), { collection: 'nasai', number: '20' })
    assert.deepStrictEqual(parseReference('ইবনে মাজাহ ৩০'), { collection: 'ibnmajah', number: '30' })
  })

  it('returns null for generic queries or non-references', () => {
    assert.strictEqual(parseReference('সকল আমল নিয়তের ওপর'), null)
    assert.strictEqual(parseReference('patience and prayer'), null)
    assert.strictEqual(parseReference(''), null)
  })

  it('calculates approximate search size in MB', () => {
    const sizeAll = searchSizeMb(ALL_COLLECTION_IDS)
    assert.ok(sizeAll > 0, 'Total search size should be greater than 0 MB')
    assert.ok(sizeAll < 100, 'Total search size should be reasonable (< 100 MB)')
  })
})

