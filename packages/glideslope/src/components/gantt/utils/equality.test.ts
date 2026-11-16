import { describe, expect, it } from 'vitest'
import { keepIfEqual, shallowEqual } from './equality'

describe('shallowEqual', () => {
  it.each([
    ['equal primitives', 1, 1, true],
    ['different primitives', 1, 2, false],
    ['NaN and NaN', Number.NaN, Number.NaN, true],
    ['arrays with the same items', [1, 2], [1, 2], true],
    ['arrays with different items', [1, 2], [1, 3], false],
    ['arrays of different lengths', [1], [1, 2], false],
    ['objects with the same entries', { a: 1, b: 2 }, { b: 2, a: 1 }, true],
    ['objects with a different entry', { a: 1 }, { a: 2 }, false],
    ['nested objects (compared by identity)', { a: {} }, { a: {} }, false],
    ['an array and an object', [], {}, false],
    ['null and an object', null, {}, false],
  ])('%s', (_description, a, b, expected) => {
    expect(shallowEqual(a, b)).toBe(expected)
  })
})

describe('keepIfEqual', () => {
  it('keeps the previous value when the next one is shallowly equal', () => {
    const previous = { startMs: 1, endMs: 2 }

    expect(keepIfEqual({ startMs: 1, endMs: 2 }, previous)).toBe(previous)
  })

  it('returns the next value when it differs or there is no previous value', () => {
    const next = { startMs: 1, endMs: 3 }

    expect(keepIfEqual(next, { startMs: 1, endMs: 2 })).toBe(next)
    expect(keepIfEqual(next, undefined)).toBe(next)
  })
})
