import { describe, expect, it } from 'vite-plus/test'
import { toDecimalDegreesParts } from './formatter'

describe('toDecimalDegreesParts', () => {
  it('returns non-negative degrees and N for a positive latitude', () => {
    expect(toDecimalDegreesParts(12.345678, 'lat')).toEqual({
      degrees: 12.345678,
      hemisphere: 'N',
    })
  })

  it('returns non-negative degrees and W for a negative longitude', () => {
    expect(toDecimalDegreesParts(-77.0369, 'lon')).toEqual({
      degrees: 77.0369,
      hemisphere: 'W',
    })
  })

  it('maps 0 to N on the lat axis and E on the lon axis', () => {
    expect(toDecimalDegreesParts(0, 'lat')).toEqual({
      degrees: 0,
      hemisphere: 'N',
    })
    expect(toDecimalDegreesParts(0, 'lon')).toEqual({
      degrees: 0,
      hemisphere: 'E',
    })
  })

  it('rounds the magnitude to the requested precision', () => {
    expect(toDecimalDegreesParts(-12.3456789, 'lat', 2)).toEqual({
      degrees: 12.35,
      hemisphere: 'S',
    })
  })
})
