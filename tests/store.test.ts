import { describe, it } from 'node:test'
import assert from 'node:assert'
import { readLS, writeLS, createStore } from '../src/hooks/store'

describe('store and localStorage fallback', () => {
  it('reads fallback value when localStorage is unavailable or key is missing', () => {
    const val = readLS('hk.nonexistent.key', { foo: 'bar' })
    assert.deepStrictEqual(val, { foo: 'bar' })
  })

  it('safely handles writeLS without throwing exceptions', () => {
    assert.doesNotThrow(() => {
      writeLS('hk.test.key', { num: 42 })
    })
  })

  it('creates an observable store with get and set', () => {
    const countStore = createStore('hk.test.counter', 0)
    assert.strictEqual(countStore.get(), 0)

    countStore.set(5)
    assert.strictEqual(countStore.get(), 5)

    countStore.set((c) => c + 1)
    assert.strictEqual(countStore.get(), 6)
  })

  it('notifies subscribers on store updates and unsubscribes cleanly', () => {
    const s = createStore('hk.test.sub', 'initial')
    let calls = 0
    const unsub = s.subscribe(() => {
      calls++
    })

    s.set('updated')
    assert.strictEqual(calls, 1)

    unsub()
    s.set('updated again')
    assert.strictEqual(calls, 1)
  })
})

