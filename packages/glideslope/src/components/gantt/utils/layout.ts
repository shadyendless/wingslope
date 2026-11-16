import { ROW_VIRTUALIZATION_OVERSCAN } from '../constants'
import type { GsGanttTimeBounds, GsGanttTimelineChunkObject } from '../types'

export function deriveTranslateXValue(
  msPerPx: number,
  timelineChunks: GsGanttTimelineChunkObject[],
  currentPositionMs: number,
) {
  const firstTimelineChunk = timelineChunks[0]

  if (!firstTimelineChunk) {
    return 0
  }

  const timeOutsideViewableRegion = firstTimelineChunk.timestampMs - currentPositionMs

  return timeOutsideViewableRegion / msPerPx
}

function deriveElementTranslateX(
  renderedRegionBounds: GsGanttTimeBounds,
  elementStartMs: number,
  totalBounds: GsGanttTimeBounds,
  msPerPx: number,
) {
  const distanceFromTimelineStart = (elementStartMs - totalBounds.startMs) / msPerPx
  const offsetMs = renderedRegionBounds.startMs - elementStartMs
  const offsetPx = offsetMs > 0 ? offsetMs / msPerPx : 0

  return distanceFromTimelineStart + offsetPx
}

export function deriveCurrentTimeTranslateX(
  currentTimeMs: number,
  msPerPx: number,
  currentPositionMs: number,
) {
  return (currentTimeMs - currentPositionMs) / msPerPx
}

export function deriveRangeElementLayout(
  renderedRegionBounds: GsGanttTimeBounds,
  rangeElementBounds: GsGanttTimeBounds,
  totalBounds: GsGanttTimeBounds,
  msPerPx: number,
) {
  const renderedStartMs = Math.max(renderedRegionBounds.startMs, rangeElementBounds.startMs)
  const renderedEndMs = Math.min(renderedRegionBounds.endMs, rangeElementBounds.endMs)

  const translateX = deriveElementTranslateX(
    renderedRegionBounds,
    rangeElementBounds.startMs,
    totalBounds,
    msPerPx,
  )

  const widthPx = (renderedEndMs - renderedStartMs) / msPerPx

  return { translateX, widthPx }
}

export function derivePointElementLayout(
  renderedRegionBounds: GsGanttTimeBounds,
  pointElementMs: number,
  totalBounds: GsGanttTimeBounds,
  msPerPx: number,
) {
  const translateX = deriveElementTranslateX(
    renderedRegionBounds,
    pointElementMs,
    totalBounds,
    msPerPx,
  )

  return { translateX }
}

export function deriveRenderedSlice(
  scrollPx: number,
  rowHeightPx: number,
  viewableRegionHeightPx: number,
) {
  const startIndex = Math.floor(scrollPx / rowHeightPx)

  const viewableItems = Math.ceil(viewableRegionHeightPx / rowHeightPx)

  const proposedRenderedItemsCount = viewableItems + ROW_VIRTUALIZATION_OVERSCAN

  const itemsCountEven = proposedRenderedItemsCount % 2 === 0
  const itemsCount = itemsCountEven ? proposedRenderedItemsCount + 1 : proposedRenderedItemsCount

  return {
    start: startIndex,
    end: startIndex + itemsCount,
  }
}

export function deriveHorizontalScrollPosition(
  timestampMs: number,
  msPerPx: number,
  totalBounds: GsGanttTimeBounds,
): number {
  return (timestampMs - totalBounds.startMs) / msPerPx
}
