import { describe, expect, it } from 'vitest'
import { wrap } from './wrap'

describe('wrap', () => {
  it.each`
    min     | max     | value    | expected | scenario
    ${0}    | ${360}  | ${10}    | ${10}    | ${'returns value already within an angle range'}
    ${0}    | ${360}  | ${370}   | ${10}    | ${'wraps a value past max back to min'}
    ${0}    | ${360}  | ${-90}   | ${270}   | ${'wraps a negative value up into range'}
    ${0}    | ${360}  | ${720}   | ${0}     | ${'wraps a multi-revolution value to min'}
    ${0}    | ${360}  | ${0}     | ${0}     | ${'returns min unchanged (inclusive lower bound)'}
    ${0}    | ${360}  | ${360}   | ${0}     | ${'wraps max to min (exclusive upper bound)'}
    ${-180} | ${180}  | ${190}   | ${-170}  | ${'wraps a longitude past the antimeridian'}
    ${-180} | ${180}  | ${-541}  | ${179}   | ${'wraps a large negative longitude'}
    ${0}    | ${360}  | ${370.5} | ${10.5}  | ${'preserves the fractional part when wrapping'}
    ${1}    | ${5}    | ${7}     | ${3}     | ${'wraps into a range whose min is non-zero'}
    ${0}    | ${1000} | ${-1}    | ${999}   | ${'wraps a negative timestamp remainder (used by roundMsToInterval)'}
  `('should $scenario', ({ min, max, value, expected }) => {
    expect(wrap(min, max, value)).toBe(expected)
  })

  it('throws a RangeError when min equals max', () => {
    expect(() => wrap(0, 0, 5)).toThrow(RangeError)
  })

  it('throws a RangeError when min exceeds max', () => {
    expect(() => wrap(360, 0, 10)).toThrow('min must be less than max')
  })
})
