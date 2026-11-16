import { TIMELINE_CHUNK_WIDTH_PX } from '../constants'
import type { GsGanttTimeBounds, GsGanttTimelineChunkObject } from '../types'

export function getViewableRegionWidth(element: HTMLElement | null) {
  if (!element) {
    return 0
  }

  return element.clientWidth
}

/** The scroll container's horizontal scroll offset, from its `scroll` event. */
export function getHorizontalScrolledPixels(event: Pick<Event, 'currentTarget'>) {
  return (event.currentTarget as Element).scrollLeft
}

/** The scroll container's vertical scroll offset, from its `scroll` event. */
export function getVerticalScrolledPixels(event: Pick<Event, 'currentTarget'>) {
  return (event.currentTarget as Element).scrollTop
}

export function getRenderedRegionBoundsMs(
  timeMarkers: GsGanttTimelineChunkObject[],
  msPerPx: number,
): GsGanttTimeBounds {
  if (timeMarkers.length === 0) {
    return { startMs: 0, endMs: 0 }
  }

  const firstMarker = timeMarkers[0] as GsGanttTimelineChunkObject
  const lastMarker = timeMarkers[timeMarkers.length - 1] as GsGanttTimelineChunkObject

  return {
    startMs: firstMarker.timestampMs,
    endMs: lastMarker.timestampMs + TIMELINE_CHUNK_WIDTH_PX * msPerPx,
  }
}

export function shouldRenderRangeElement(
  renderedRegionBoundary: GsGanttTimeBounds,
  rangeElementTimeBounds: GsGanttTimeBounds,
) {
  const { startMs: rangeStartMs, endMs: rangeEndMs } = rangeElementTimeBounds
  const { startMs, endMs } = renderedRegionBoundary

  const startsBeforeRegionStart = rangeStartMs < startMs && rangeEndMs > startMs
  const isEntirelyWithinRegion = rangeStartMs >= startMs && rangeEndMs <= endMs
  const endsAfterRegionEnd = rangeStartMs < endMs && rangeEndMs > endMs
  return startsBeforeRegionStart || isEntirelyWithinRegion || endsAfterRegionEnd
}

export function timestampWithinBounds(timestampMs: number, bounds: GsGanttTimeBounds) {
  return timestampMs >= bounds.startMs && timestampMs <= bounds.endMs
}

export function shouldRenderCurrentTime(
  currentTimeMs: number,
  renderedRegionBounds: GsGanttTimeBounds,
) {
  return timestampWithinBounds(currentTimeMs, renderedRegionBounds)
}
