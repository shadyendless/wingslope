import { describe, expect, it } from 'vite-plus/test'
import { formatDegreesDecimalMinutes } from './formatter'

describe('formatDegreesDecimalMinutes', () => {
  it('formats typical coordinates', () => {
    expect(formatDegreesDecimalMinutes([37.7749, -122.4194])).toBe("37° 46.4940', 122° 25.1640'")
  })

  it('formats whole-degree values with zero minutes', () => {
    expect(formatDegreesDecimalMinutes([45, -122])).toBe("45° 0.0000', 122° 0.0000'")
  })

  it('carries into degrees when minutes round to 60', () => {
    // 40.9999995 -> minutes 59.99997 -> rounds to 60.0000 -> must carry
    expect(formatDegreesDecimalMinutes([40.9999995, -74.006])).toBe("41° 0.0000', 74° 0.3600'")
  })

  it('carries correctly at the pole/antimeridian boundary', () => {
    expect(formatDegreesDecimalMinutes([89.99999999, 179.99999999])).toBe(
      "90° 0.0000', 180° 0.0000'",
    )
  })
})
