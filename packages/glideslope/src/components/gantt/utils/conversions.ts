import { TIMELINE_CHUNK_WIDTH_PX, TIMESCALE_MAPPING } from '../constants'
import type { GsGanttTimescale } from '../types'

export function getMsPerPx(timescale: GsGanttTimescale) {
  return TIMESCALE_MAPPING[timescale] / TIMELINE_CHUNK_WIDTH_PX
}

/** @throws {RangeError} If endTimeMs < startTimeMs. */
export function getTotalTimelineMs(startTimeMs: number, endTimeMs: number) {
  if (endTimeMs < startTimeMs) {
    throw new RangeError(`endTimeMs (${endTimeMs}) must be >= startTimeMs (${startTimeMs})`)
  }

  return endTimeMs - startTimeMs
}

export function getTotalTimelineWidth(totalTimelineMs: number, msPerPx: number) {
  return totalTimelineMs / msPerPx
}

export function getMsRepresentedInViewableRegion(viewableRegionWidth: number, msPerPx: number) {
  return viewableRegionWidth * msPerPx
}
