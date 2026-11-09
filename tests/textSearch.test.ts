import { describe, it } from 'node:test'
import assert from 'node:assert'
import { toBnDigits, toEnDigits, bnNum, normalize, tokens, matchesAll, excerpt } from '../src/utils/textSearch'

describe('textSearch utility', () => {
  it('converts digits correctly between English and Bengali', () => {
    assert.strictEqual(toBnDigits('1234567890'), '১২৩৪৫৬৭৮৯০')
    assert.strictEqual(toEnDigits('১২৩৪৫৬৭৮৯০'), '1234567890')
    assert.strictEqual(bnNum(10500), '১০,৫০০')
  })

  it('normalizes text and strips invisible/zero-width chars', () => {
    const raw = '  সহীহ\u200B \uFEFF হাদিস  '
    assert.strictEqual(normalize(raw), 'সহীহ হাদিস')
  })

  it('normalizes quotes and apostrophes', () => {
    assert.strictEqual(normalize('‘hello’ “world”'), '\'hello\' "world"')
  })

  it('extracts tokens properly', () => {
    const toks = tokens('নিয়্যত ও সততা')
    assert.deepStrictEqual(toks, ['নিয়্যত', 'ও', 'সততা'])
  })

  it('matches all tokens against haystack', () => {
    const hay = normalize('সকল আমল নিয়তের ওপর নির্ভরশীল')
    assert.strictEqual(matchesAll(hay, ['আমল', 'নিয়ত']), true)
    assert.strictEqual(matchesAll(hay, ['আমল', 'রোজা']), false)
  })

  it('generates excerpt around matching token', () => {
    const text = 'হযরত উমর ইবনুল খাত্তাব (রা.) বর্ণনা করেন: আমি রাসূলুল্লাহ (সা.)-কে বলতে শুনেছি, যাবতীয় কাজ নিয়তের উপর নির্ভরশীল।'
    const toks = ['নিয়ত']
    const ex = excerpt(text, toks, 20)
    assert.ok(ex.includes('নিয়ত'), 'Excerpt should contain token')
  })
})

