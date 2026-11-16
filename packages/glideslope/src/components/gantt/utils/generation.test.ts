import { describe, expect, it } from 'vitest'
import {
  BUFFERED_CHUNK_COUNT,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  TIMELINE_CHUNK_WIDTH_PX,
} from '../constants'
import { generateTimelineChunks } from './generation'
import type { GsGanttTimelineChunkObject } from '../types'

describe('generateTimelineChunks', () => {
  describe('empty viewable region', () => {
    it('should return empty array when viewableRegionWidth is 0', () => {
      const result = generateTimelineChunks(0, 0, MS_PER_HOUR, MS_PER_HOUR)
      expect(result).toEqual([])
    })
  })

  describe('chunk count calculation', () => {
    it('should generate odd number of chunks for typical viewport', () => {
      const viewableRegionWidth = 1600
      const msPerPx = MS_PER_HOUR / TIMELINE_CHUNK_WIDTH_PX
      const result = generateTimelineChunks(0, viewableRegionWidth, MS_PER_HOUR, msPerPx)

      expect(result.length % 2).toBe(1)
    })

    it('should generate enough chunks to fill viewport plus extras', () => {
      const viewableRegionWidth = 800
      const msPerPx = MS_PER_HOUR / TIMELINE_CHUNK_WIDTH_PX
      const result = generateTimelineChunks(0, viewableRegionWidth, MS_PER_HOUR, msPerPx)

      const expectedMinChunks =
        Math.ceil(viewableRegionWidth / TIMELINE_CHUNK_WIDTH_PX) + BUFFERED_CHUNK_COUNT
      expect(result.length).toBeGreaterThanOrEqual(expectedMinChunks)
    })
  })

  describe('chunk positioning with selected time interval', () => {
    const msPerPx = MS_PER_HOUR / TIMELINE_CHUNK_WIDTH_PX
    const viewableRegionWidth = 800

    it('should have evenly spaced chunks by selected time interval', () => {
      const currentPositionMs = new Date('2026-02-01T12:00:00.000Z').getTime()
      const result = generateTimelineChunks(
        currentPositionMs,
        viewableRegionWidth,
        MS_PER_HOUR,
        msPerPx,
      )

      const firstChunk = result[0] as GsGanttTimelineChunkObject

      result.forEach((chunk, index) => {
        const expectedTimestampMs = firstChunk.timestampMs + index * MS_PER_HOUR
        expect(chunk.timestampMs).toBe(expectedTimestampMs)
      })
    })
  })

  describe('edge cases', () => {
    const msPerPx = MS_PER_HOUR / TIMELINE_CHUNK_WIDTH_PX

    it('should handle very small viewable region', () => {
      const viewableRegionWidth = 10
      const currentPositionMs = new Date('2026-02-01T12:00:00.000Z').getTime()
      const result = generateTimelineChunks(
        currentPositionMs,
        viewableRegionWidth,
        MS_PER_HOUR,
        msPerPx,
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result.length % 2).toBe(1)
    })

    it('should handle very small msPerPx values', () => {
      const currentPositionMs = new Date('2026-02-01T12:00:00.000Z').getTime()
      const viewableRegionWidth = 800
      const smallMsPerPx = 0.001
      const result = generateTimelineChunks(
        currentPositionMs,
        viewableRegionWidth,
        MS_PER_MINUTE,
        smallMsPerPx,
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result.length % 2).toBe(1)
    })
  })
})
