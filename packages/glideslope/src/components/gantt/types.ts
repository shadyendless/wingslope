/** Shorthand strings for hour-based timeline intervals. */
export type GsGanttHoursTimescale = '1h' | '2h' | '6h' | '12h' | '24h'

/** Shorthand strings for minute-based timeline intervals. */
export type GsGanttMinutesTimescale = '1m' | '5m' | '10m' | '30m'

/**
 * Timeline interval: the time between two labelled tick marks on the timeline. Determines the
 * granularity (zoom level) of the timeline.
 */
export type GsGanttTimescale = GsGanttHoursTimescale | GsGanttMinutesTimescale

/** @internal One labelled chunk of the timeline header. */
export interface GsGanttTimelineChunkObject {
  /** Epoch milliseconds at this chunk's position. */
  timestampMs: number
}

/** @internal A time range. */
export interface GsGanttTimeBounds {
  /** Start of the range in epoch milliseconds. */
  startMs: number
  /** End of the range in epoch milliseconds. */
  endMs: number
}

/**
 * Color of a row element (block, spacer, marker, icon marker or bracket). Maps to the design
 * tokens' color scales.
 */
export type GsGanttRowElementColor = 'serious' | 'accent' | 'critical'

/**
 * When the rendered region gets this close to the edges of the data (the total time range and the
 * rows), `GsGantt` emits `threshold-met` so the app can load more data.
 */
export interface GsGanttThreshold {
  /** Distance from a timeline boundary, in multiples of the timescale, that meets a threshold. */
  timescaleMultipleDistance: number
  /** Distance from the first or last row, in rows, that meets a threshold. */
  rowIndexBoundaryDistance: number
}

/** @internal A threshold derived for one axis. */
export interface GsGanttDerivedThresholdValue {
  /** Threshold at the start of the axis. */
  start: number
  /** Threshold at the end of the axis. */
  end: number
}

/** A threshold the rendered region has entered, as emitted by `threshold-met`. */
export interface GsGanttMetThresholdData {
  /** The axis the threshold was met on: time (`horizontal`) or rows (`vertical`). */
  axis: 'horizontal' | 'vertical'
  /** Whether the threshold was met at the beginning or the end of the axis. */
  direction: 'start' | 'end'
  /** The timestamp (horizontal) or row index (vertical) of the threshold. */
  value: number
}

/** @internal A region of the chart: a time range and a range of row indexes. */
export interface GsGanttRegion {
  startMs: number
  endMs: number
  startRowIndex: number
  endRowIndex: number
}

export interface GsGanttProps {
  /** Start of the timeline's total range, in epoch milliseconds. */
  startTimeMs: number
  /** End of the timeline's total range, in epoch milliseconds. Must not be before `startTimeMs`. */
  endTimeMs: number
  /** Time between two labelled tick marks on the timeline. */
  timescale?: GsGanttTimescale
  /**
   * The current time, in epoch milliseconds. It is marked on the timeline, and elements before it
   * are styled as elapsed.
   */
  currentTimeMs: number
  /**
   * Turns on `threshold-met` events: how close the rendered region may get to the edges of the
   * data before the chart asks for more.
   */
  threshold?: GsGanttThreshold
  /** Height of every row, in pixels. Panel rows and content rows share it. */
  rowHeightPx?: number
}

/** Props of the range elements, `GsGanttBlock` and `GsGanttSpacer`. */
export interface GsGanttRangeProps {
  /** Start of the element, in epoch milliseconds. */
  startTimeMs: number
  /** End of the element, in epoch milliseconds. */
  endTimeMs: number
  /** Color variant. */
  color?: GsGanttRowElementColor
}

/**
 * Props of the point elements: `GsGanttMarker`, `GsGanttIconMarker`, `GsGanttBracketOpen` and
 * `GsGanttBracketClose`.
 */
export interface GsGanttPointProps {
  /** Position of the element on the timeline, in epoch milliseconds. */
  timeMs: number
  /** Color variant. */
  color?: GsGanttRowElementColor
}
