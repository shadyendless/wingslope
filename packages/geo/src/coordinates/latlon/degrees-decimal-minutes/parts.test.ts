import { describe, expect, it } from 'vite-plus/test'
import { toDdmParts } from './formatter'

describe('toDdmParts', () => {
  it('returns degrees/minutes and N for a positive latitude', () => {
    expect(toDdmParts(12.576, 'lat')).toEqual({
      degrees: 12,
      minutes: 34.56,
      hemisphere: 'N',
    })
  })

  it('returns non-negative parts and W for a negative longitude', () => {
    expect(toDdmParts(-122.4194, 'lon')).toEqual({
      degrees: 122,
      minutes: 25.164,
      hemisphere: 'W',
    })
  })

  it('maps 0 to N on the lat axis and E on the lon axis', () => {
    expect(toDdmParts(0, 'lat')).toEqual({
      degrees: 0,
      minutes: 0,
      hemisphere: 'N',
    })
    expect(toDdmParts(0, 'lon')).toEqual({
      degrees: 0,
      minutes: 0,
      hemisphere: 'E',
    })
  })

  it('carries into degrees when minutes round to 60', () => {
    // 40.9999995 -> minutes 59.99997 -> rounds to 60.0000 -> must carry
    const parts = toDdmParts(40.9999995, 'lat')

    expect(parts).toEqual({ degrees: 41, minutes: 0, hemisphere: 'N' })
    expect(parts.minutes).toBeLessThan(60)
  })

  it('keeps minutes below 60 at an explicit precision override', () => {
    const parts = toDdmParts(40.9999995, 'lat', 2)

    expect(parts.minutes).toBeLessThan(60)
    expect(parts).toEqual({ degrees: 41, minutes: 0, hemisphere: 'N' })
  })
})
