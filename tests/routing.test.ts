import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseHash } from '../src/hooks/useRoute'

describe('routing parseHash', () => {
  it('parses empty and default home hashes', () => {
    assert.deepStrictEqual(parseHash(''), { page: 'home' })
    assert.deepStrictEqual(parseHash('#'), { page: 'home' })
    assert.deepStrictEqual(parseHash('#home'), { page: 'home' })
  })

  it('parses top-level section routes', () => {
    assert.deepStrictEqual(parseHash('#topics'), { page: 'topics' })
    assert.deepStrictEqual(parseHash('#collections'), { page: 'collections' })
    assert.deepStrictEqual(parseHash('#search'), { page: 'search' })
    assert.deepStrictEqual(parseHash('#bookmarks'), { page: 'bookmarks' })
    assert.deepStrictEqual(parseHash('#summary'), { page: 'summary', id: null })
    assert.deepStrictEqual(parseHash('#about'), { page: 'about', section: null })
  })

  it('parses parameterized routes correctly', () => {
    assert.deepStrictEqual(parseHash('#hadith-bukhari-6094'), { page: 'hadith', id: 'bukhari-6094' })
    assert.deepStrictEqual(parseHash('#hadith-muslim-774-2'), { page: 'hadith', id: 'muslim-774-2' })
    assert.deepStrictEqual(parseHash('#topic-honesty-trust'), { page: 'topic', id: 'honesty-trust' })
    assert.deepStrictEqual(parseHash('#summary-anger'), { page: 'summary', id: 'anger' })
    assert.deepStrictEqual(parseHash('#collection-muslim'), { page: 'collection', id: 'muslim' })
    assert.deepStrictEqual(parseHash('#about-sources'), { page: 'about', section: 'sources' })
  })

  it('returns notfound for unknown or malformed routes', () => {
    assert.deepStrictEqual(parseHash('#random-garbage'), { page: 'notfound' })
    assert.deepStrictEqual(parseHash('#hadith-invalid!'), { page: 'notfound' })
  })
})

