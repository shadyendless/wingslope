import { describe, expect, it } from 'vite-plus/test'
import { MS_PER_HOUR, MS_PER_MINUTE, TIMELINE_CHUNK_WIDTH_PX } from '../constants'
import {
  getMsPerPx,
  getMsRepresentedInViewableRegion,
  getTotalTimelineMs,
  getTotalTimelineWidth,
} from './conversions'

describe('getMsPerPx', () => {
  it('should calculate milliseconds per pixel for 1 hour timescale', () => {
    const timescale = '1h'
    const result = getMsPerPx(timescale)
    expect(result).toBe(MS_PER_HOUR / TIMELINE_CHUNK_WIDTH_PX)
  })
})

describe('getTotalTimelineMs', () => {
  it('should handle same start and end time', () => {
    const startTimeMs = 1000
    const endTimeMs = 1000
    const result = getTotalTimelineMs(startTimeMs, endTimeMs)
    expect(result).toBe(0)
  })

  it('should calculate duration across days', () => {
    const startTimeMs = new Date('2026-01-01T12:00:00Z').getTime()
    const endTimeMs = new Date('2026-01-03T18:00:00Z').getTime()
    const result = getTotalTimelineMs(startTimeMs, endTimeMs)
    expect(result).toBe(MS_PER_HOUR * 54)
  })
})

describe('getTotalTimelineWidth', () => {
  it('should calculate width for 24 hour timeline', () => {
    const totalTimelineMs = MS_PER_HOUR * 24
    const msPerPx = MS_PER_HOUR
    const result = getTotalTimelineWidth(totalTimelineMs, msPerPx)
    expect(result).toBe(24)
  })
})

describe('getMsRepresentedInViewableRegion', () => {
  it('should calculate milliseconds for typical viewport width', () => {
    const viewableRegionWidth = 1920
    const msPerPx = MS_PER_MINUTE
    const result = getMsRepresentedInViewableRegion(viewableRegionWidth, msPerPx)
    expect(result).toBe(1920 * MS_PER_MINUTE)
  })
})
