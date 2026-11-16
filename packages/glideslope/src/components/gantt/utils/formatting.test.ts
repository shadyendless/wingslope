import { describe, expect, it } from 'vitest'
import { formatTimestampLabel } from './formatting'

describe('formatTimestampLabel', () => {
  describe('date formatting (midnight)', () => {
    it('should format midnight as date with day and month', () => {
      const timestamp = new Date('2026-01-30T00:00:00.000Z').getTime()
      const result = formatTimestampLabel(timestamp)
      expect(result).toBe('30 JAN')
    })

    it('should pad single digit days with leading zero', () => {
      const timestamp = new Date('2026-03-05T00:00:00.000Z').getTime()
      const result = formatTimestampLabel(timestamp)
      expect(result).toBe('05 MAR')
    })
  })

  describe('time formatting (non-midnight)', () => {
    it('should format time as HH:MM when not midnight', () => {
      const timestamp = new Date('2026-01-30T14:30:00.000Z').getTime()
      const result = formatTimestampLabel(timestamp)
      expect(result).toBe('14:30')
    })

    it('should pad both hours and minutes when single digit', () => {
      const timestamp = new Date('2026-01-30T08:07:00.000Z').getTime()
      const result = formatTimestampLabel(timestamp)
      expect(result).toBe('08:07')
    })

    it('should format time with only minutes past midnight', () => {
      const timestamp = new Date('2026-01-30T00:15:00.000Z').getTime()
      const result = formatTimestampLabel(timestamp)
      expect(result).toBe('00:15')
    })
  })
})
