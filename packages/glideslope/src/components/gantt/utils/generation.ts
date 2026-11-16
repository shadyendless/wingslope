import { BUFFERED_CHUNK_COUNT, TIMELINE_CHUNK_WIDTH_PX } from '../constants'
import { getMsRepresentedInViewableRegion } from './conversions'
import { roundMsToInterval } from './dates'
import type { GsGanttTimelineChunkObject } from '../types'

export function generateTimelineChunks(
  currentPositionMs: number,
  viewableRegionWidth: number,
  selectedTimeIntervalMs: number,
  msPerPx: number,
): GsGanttTimelineChunkObject[] {
  if (viewableRegionWidth === 0) {
    return []
  }

  const offsetMs = getMsRepresentedInViewableRegion(viewableRegionWidth, msPerPx) / 2

  const proposedChunkCount =
    Math.ceil(viewableRegionWidth / TIMELINE_CHUNK_WIDTH_PX) + BUFFERED_CHUNK_COUNT

  const chunksInViewableRegion =
    proposedChunkCount % 2 === 0 ? proposedChunkCount + 1 : proposedChunkCount

  const midpointMs = currentPositionMs + offsetMs
  const midpointIndex = Math.floor(chunksInViewableRegion / 2)

  const roundedMidpointMs = roundMsToInterval(midpointMs, selectedTimeIntervalMs)

  const chunks: GsGanttTimelineChunkObject[] = []

  for (let i = 0; i < chunksInViewableRegion; i++) {
    const chunkTimestampMs = roundedMidpointMs + selectedTimeIntervalMs * (i - midpointIndex)

    chunks.push({
      timestampMs: chunkTimestampMs,
    })
  }

  return chunks
}
