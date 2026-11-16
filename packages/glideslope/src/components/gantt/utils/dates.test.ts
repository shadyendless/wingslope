import { describe, expect, it } from 'vite-plus/test'
import { MS_PER_HOUR, MS_PER_MINUTE } from '../constants'
import { roundMsToInterval } from './dates'

describe('roundMsToInterval', () => {
  describe('hours intervals', () => {
    it('should round down to nearest 1 hour interval', () => {
      const timestampMs = new Date('2026-01-30T14:35:42.123Z').getTime()
      const result = roundMsToInterval(timestampMs, MS_PER_HOUR)
      expect(result).toBe(new Date('2026-01-30T14:00:00.000Z').getTime())
    })

    it('should handle timestamp already aligned to 1 hour interval', () => {
      const timestampMs = new Date('2026-01-30T10:00:00.000Z').getTime()
      const result = roundMsToInterval(timestampMs, MS_PER_HOUR)
      expect(result).toBe(timestampMs)
    })
  })

  describe('minutes intervals', () => {
    it('should round down to nearest 1 minute interval', () => {
      const timestampMs = new Date('2026-01-30T14:35:42.123Z').getTime()
      const result = roundMsToInterval(timestampMs, MS_PER_MINUTE)
      expect(result).toBe(new Date('2026-01-30T14:35:00.000Z').getTime())
    })

    it('should handle timestamp already aligned to 1 minute interval', () => {
      const timestampMs = new Date('2026-01-30T14:35:00.000Z').getTime()
      const result = roundMsToInterval(timestampMs, MS_PER_MINUTE)
      expect(result).toBe(timestampMs)
    })
  })

  describe('edge cases', () => {
    it('should handle end of year for 24 hour interval', () => {
      const timestampMs = new Date('2025-12-31T23:59:59.999Z').getTime()
      const result = roundMsToInterval(timestampMs, MS_PER_HOUR * 24)
      expect(result).toBe(new Date('2025-12-31T00:00:00.000Z').getTime())
    })

    it('should throw for unrecognized interval', () => {
      const timestampMs = new Date('2026-01-30T14:35:42.123Z').getTime()
      expect(() => roundMsToInterval(timestampMs, 12345)).toThrow(RangeError)
    })
  })
})
