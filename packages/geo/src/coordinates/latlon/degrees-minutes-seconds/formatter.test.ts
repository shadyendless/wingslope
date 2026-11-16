import { describe, expect, it } from 'vite-plus/test'
import { formatDegreesMinutesSeconds } from './formatter'

describe('formatDegreesMinutesSeconds', () => {
  it('formats typical coordinates', () => {
    expect(formatDegreesMinutesSeconds([37.7749, -122.4194])).toBe("37° 46' 29.64″, 122° 25' 9.84″")
  })

  it('carries into minutes when seconds round to 60', () => {
    // 40 + (30 * 60 + 59.999) / 3600 -> seconds 59.999 -> rounds to 60.00
    const value = 40 + (30 * 60 + 59.999) / 3600
    expect(formatDegreesMinutesSeconds([value, 0])).toBe("40° 31' 0.00″, 0° 0' 0.00″")
  })

  it('carries through minutes into degrees when both roll over', () => {
    // 40.99999999 -> 40° 59' 60.00″ without carrying -> must become 41° 0' 0.00″
    expect(formatDegreesMinutesSeconds([40.99999999, -74.006])).toBe("41° 0' 0.00″, 74° 0' 21.60″")
  })

  it('carries correctly at the pole boundary', () => {
    expect(formatDegreesMinutesSeconds([89.99999999, 179.99999999])).toBe(
      "90° 0' 0.00″, 180° 0' 0.00″",
    )
  })
})
