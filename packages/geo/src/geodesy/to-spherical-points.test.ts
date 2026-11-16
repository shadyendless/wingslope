import { describe, expect, it } from 'vite-plus/test'
import { toSphericalPoints } from './to-spherical-points'

describe('toSphericalPoints', () => {
  describe('conversion', () => {
    it('returns origin then destination as latitude/longitude points', () => {
      const [originPoint, destinationPoint] = toSphericalPoints([10, 20], [30, 40], 'caller')

      expect([originPoint.lat, originPoint.lon]).toEqual([20, 10])
      expect([destinationPoint.lat, destinationPoint.lon]).toEqual([40, 30])
    })
  })

  describe('input validation', () => {
    it.each([
      ['NaN origin longitude', [Number.NaN, 0], [1, 1]],
      ['NaN origin latitude', [0, Number.NaN], [1, 1]],
      ['NaN destination longitude', [0, 0], [Number.NaN, 1]],
      ['NaN destination latitude', [0, 0], [1, Number.NaN]],
      ['Infinity origin longitude', [Number.POSITIVE_INFINITY, 0], [1, 1]],
      ['Infinity origin latitude', [0, Number.POSITIVE_INFINITY], [1, 1]],
      ['Infinity destination longitude', [0, 0], [Number.POSITIVE_INFINITY, 1]],
      ['Infinity destination latitude', [0, 0], [1, Number.POSITIVE_INFINITY]],
      ['-Infinity origin longitude', [Number.NEGATIVE_INFINITY, 0], [1, 1]],
      ['-Infinity origin latitude', [0, Number.NEGATIVE_INFINITY], [1, 1]],
      ['-Infinity destination longitude', [0, 0], [Number.NEGATIVE_INFINITY, 1]],
      ['-Infinity destination latitude', [0, 0], [1, Number.NEGATIVE_INFINITY]],
    ] as const)(
      'throws RangeError naming the caller for %s',
      (_description, origin, destination) => {
        expect(() => toSphericalPoints(origin, destination, 'someFunction')).toThrow(RangeError)
        expect(() => toSphericalPoints(origin, destination, 'someFunction')).toThrow(
          'someFunction requires finite [longitude, latitude] coordinates.',
        )
      },
    )
  })
})
