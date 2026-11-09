import { describe, it } from 'node:test'
import assert from 'node:assert'
import { isValidRecord, isSafeId } from '../src/utils/validation'

describe('validation utilities', () => {
  it('validates a correct HadithRecord', () => {
    const valid = {
      id: 'bukhari-1',
      collection: 'Sahih al-Bukhari',
      collection_id: 'bukhari',
      hadith_number: '1',
      authenticity: 'sahih',
      source_url: 'https://sunnah.com/bukhari:1',
      bangla_translation: 'সকল আমল নিয়তের ওপর নির্ভরশীল...',
      arabic_text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
      english_translation: 'Actions are according to intentions...',
    }
    assert.strictEqual(isValidRecord(valid), true)
  })

  it('rejects records with missing required fields', () => {
    const missingId = {
      collection: 'Sahih al-Bukhari',
      collection_id: 'bukhari',
      hadith_number: '1',
      authenticity: 'sahih',
      source_url: 'https://sunnah.com/bukhari:1',
      bangla_translation: 'অনুবাদ',
    }
    assert.strictEqual(isValidRecord(missingId), false)
  })

  it('rejects records with invalid or malicious source URLs', () => {
    const badUrl = {
      id: 'bukhari-1',
      collection: 'Sahih al-Bukhari',
      collection_id: 'bukhari',
      hadith_number: '1',
      authenticity: 'sahih',
      source_url: 'javascript:alert(1)',
      bangla_translation: 'অনুবাদ',
    }
    assert.strictEqual(isValidRecord(badUrl), false)
  })

  it('rejects records without any text in any language', () => {
    const noText = {
      id: 'bukhari-1',
      collection: 'Sahih al-Bukhari',
      collection_id: 'bukhari',
      hadith_number: '1',
      authenticity: 'sahih',
      source_url: 'https://sunnah.com/bukhari:1',
      bangla_translation: null,
      arabic_text: null,
      english_translation: null,
    }
    assert.strictEqual(isValidRecord(noText), false)
  })

  it('validates safe and malicious hash IDs with isSafeId', () => {
    assert.strictEqual(isSafeId('bukhari-1'), true)
    assert.strictEqual(isSafeId('muslim-774-2'), true)
    assert.strictEqual(isSafeId('../etc/passwd'), false)
    assert.strictEqual(isSafeId('<script>'), false)
    assert.strictEqual(isSafeId('bukhari; DROP TABLE'), false)
    assert.strictEqual(isSafeId(''), false)
  })
})

