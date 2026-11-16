import { describe, expect, it } from 'vite-plus/test'
import { _identifyErrors, _identifyPieces } from './parser'

describe('DD identifyPieces', () => {
  it('returns undefined for empty array', () => {
    expect(_identifyPieces([])).toBeUndefined()
  })

  it('returns undefined for array exceeding max length', () => {
    expect(_identifyPieces(['45.5', 'N', 'extra'])).toBeUndefined()
  })

  it('returns undefined when deg is already set and a non-bearing token appears', () => {
    expect(_identifyPieces(['45.5', '30.2'])).toBeUndefined()
  })

  it('returns undefined when acc becomes undefined from prior iteration', () => {
    // Two numeric tokens: first sets deg, second hits acc.deg truthy -> returns undefined
    // The undefined then propagates if there were more iterations (tested via >2 case above)
    const result = _identifyPieces(['45.5', '30.2'])
    expect(result).toBeUndefined()
  })

  it('assigns bearing and degree correctly', () => {
    expect(_identifyPieces(['45.5', 'N'])).toEqual({
      bear: 'N',
      deg: '45.5',
    })
  })

  it('assigns bearing first then degree', () => {
    expect(_identifyPieces(['N', '45.5'])).toEqual({
      bear: 'N',
      deg: '45.5',
    })
  })

  it('assigns single numeric token as deg', () => {
    expect(_identifyPieces(['45.5'])).toEqual({ bear: '', deg: '45.5' })
  })
})

describe('DD identifyErrors', () => {
  const latlon = _identifyErrors('LATLON')

  it('returns error for undefined arg', () => {
    const [tokens, errors] = latlon(undefined, 0)
    expect(tokens).toEqual([])
    expect(errors).toEqual(['Invalid coordinate value.'])
  })

  it('assigns bearing from negative sign when no explicit bearing', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '-45.5' }, 0)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['45.5', 'S'])
  })

  it('assigns positive bearing when no explicit bearing and positive value', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '45.5' }, 0)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['45.5', 'N'])
  })

  it('assigns negative bearing for longitude with negative sign', () => {
    const [tokens, errors] = latlon({ bear: '', deg: '-75.3' }, 1)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['75.3', 'W'])
  })

  it('defaults deg to 0 when nullish', () => {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- testing nullish deg
    const [tokens, errors] = latlon({ bear: 'N', deg: undefined as any }, 0)
    expect(errors).toEqual([])
    expect(tokens).toEqual(['0', 'N'])
  })
})
