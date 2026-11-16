import { describe, expect, it } from 'vite-plus/test'
import { _identifyErrors, _identifyPieces } from './parser'

describe('DDM identifyPieces', () => {
  it('returns undefined for empty array', () => {
    expect(_identifyPieces([])).toBeUndefined()
  })

  it('returns undefined for array exceeding max length', () => {
    expect(_identifyPieces(['45', '30.5', 'N', 'extra'])).toBeUndefined()
  })

  it('propagates undefined accumulator from prior iteration', () => {
    // Force acc to become undefined: fill deg and min, then add a non-matching
    // token that exhausts available keys
    const result = _identifyPieces(['45', '30.5', '99'])
    // All three slots (deg, min) are filled by first two; third has no key -> undefined
    expect(result).toBeUndefined()
  })

  it('assigns deg, min, and bear correctly', () => {
    expect(_identifyPieces(['45', '30.5', 'N'])).toEqual({
      bear: 'N',
      deg: '45',
      min: '30.5',
    })
  })

  it('assigns single token as deg', () => {
    expect(_identifyPieces(['45'])).toEqual({ bear: '', deg: '45', min: '' })
  })

  it('assigns two tokens as deg and min', () => {
    expect(_identifyPieces(['45', '30.5'])).toEqual({
      bear: '',
      deg: '45',
      min: '30.5',
    })
  })
})

describe('DDM identifyErrors', () => {
  const latlon = _identifyErrors('LATLON')

  it('returns error for undefined arg', () => {
    const [tokens, errors] = latlon(undefined, 0)
    expect(tokens).toEqual([])
    expect(errors).toEqual(['Invalid coordinate value.'])
  })

  it('assigns bearing from negative sign when no explicit bearing', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '-45', min: '30.5' }, 0)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['45', '30.5', 'S'])
  })

  it('assigns positive bearing when no explicit bearing and positive value', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '45', min: '30.5' }, 0)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['45', '30.5', 'N'])
  })

  it('assigns negative bearing for longitude with negative sign', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '-75', min: '20.3' }, 1)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['75', '20.3', 'W'])
  })

  it('defaults deg and min to 0 when nullish', () => {
    const [tokens, errors] = latlon(
      // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- testing nullish values
      { bear: 'N', deg: undefined as any, min: undefined as any },
      0,
    )
    expect(errors).toEqual([])
    expect(tokens).toEqual(['0', '0', 'N'])
  })
})
