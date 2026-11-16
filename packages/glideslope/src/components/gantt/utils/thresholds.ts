import { TIMESCALE_MAPPING } from '../constants'
import type {
  GsGanttDerivedThresholdValue,
  GsGanttMetThresholdData,
  GsGanttRegion,
  GsGanttThreshold,
  GsGanttTimeBounds,
  GsGanttTimescale,
} from '../types'

/**
 * Derives the total data region from the total row count and bounds.
 */
export function deriveTotalDataRegion(
  totalRowsCount: number,
  totalBounds: GsGanttTimeBounds,
): GsGanttRegion {
  return {
    startMs: totalBounds.startMs,
    endMs: totalBounds.endMs,
    startRowIndex: 0,
    endRowIndex: totalRowsCount - 1,
  }
}

/**
 * Derives the rendered region from the rendered slice and bounds.
 */
export function deriveRenderedRegion(
  renderedSlice: { start: number; end: number },
  renderedRegionBounds: GsGanttTimeBounds,
): GsGanttRegion {
  return {
    startMs: renderedRegionBounds.startMs,
    endMs: renderedRegionBounds.endMs,
    startRowIndex: renderedSlice.start,
    endRowIndex: renderedSlice.end - 1, // End index is exclusive in slice
  }
}

/**
 * Derives temporal threshold values from the threshold object and total data region.
 * Returns null if the threshold values are invalid.
 */
export function deriveTemporalThresholds(
  threshold: GsGanttThreshold,
  totalDataRegion: GsGanttRegion,
  timescale: GsGanttTimescale,
): GsGanttDerivedThresholdValue | null {
  if (threshold.timescaleMultipleDistance < 0) {
    return null
  }

  const timescaleMs = TIMESCALE_MAPPING[timescale]
  const relativeValue = threshold.timescaleMultipleDistance * timescaleMs

  const startThreshold = totalDataRegion.startMs + relativeValue
  const endThreshold = totalDataRegion.endMs - relativeValue

  // Validate thresholds
  if (startThreshold > endThreshold) {
    return null
  }

  return {
    start: startThreshold,
    end: endThreshold,
  }
}

/**
 * Derives row index threshold values from the threshold object and total data region.
 * Returns null if the threshold values are invalid.
 */
export function deriveRowIndexThresholds(
  threshold: GsGanttThreshold,
  totalDataRegion: GsGanttRegion,
): GsGanttDerivedThresholdValue | null {
  if (threshold.rowIndexBoundaryDistance < 0) {
    return null
  }

  const startThreshold = totalDataRegion.startRowIndex + threshold.rowIndexBoundaryDistance
  const endThreshold = totalDataRegion.endRowIndex - threshold.rowIndexBoundaryDistance

  // Validate thresholds
  if (startThreshold > endThreshold) {
    return null
  }

  return {
    start: startThreshold,
    end: endThreshold,
  }
}

/**
 * Examines if any thresholds have been met by comparing the rendered region
 * against the derived threshold values.
 * Returns an array of GsGanttMetThresholdData objects for thresholds that have been met.
 */
export function examineThresholds(
  renderedRegion: GsGanttRegion,
  temporalThresholds: GsGanttDerivedThresholdValue | null,
  rowIndexThresholds: GsGanttDerivedThresholdValue | null,
): GsGanttMetThresholdData[] {
  const metThresholds: GsGanttMetThresholdData[] = []

  // Check temporal thresholds if they are valid
  if (temporalThresholds) {
    if (renderedRegion.startMs <= temporalThresholds.start) {
      metThresholds.push({
        axis: 'horizontal',
        direction: 'start',
        value: temporalThresholds.start,
      })
    }

    if (renderedRegion.endMs >= temporalThresholds.end) {
      metThresholds.push({
        axis: 'horizontal',
        direction: 'end',
        value: temporalThresholds.end,
      })
    }
  }

  // Check row index thresholds if they are valid
  if (rowIndexThresholds) {
    if (renderedRegion.startRowIndex <= rowIndexThresholds.start) {
      metThresholds.push({
        axis: 'vertical',
        direction: 'start',
        value: rowIndexThresholds.start,
      })
    }

    if (renderedRegion.endRowIndex >= rowIndexThresholds.end) {
      metThresholds.push({
        axis: 'vertical',
        direction: 'end',
        value: rowIndexThresholds.end,
      })
    }
  }

  return metThresholds
}

/**
 * Validates if the threshold examination should proceed based on input parameters.
 * Returns true if examination should proceed, false otherwise.
 */
export function shouldExamineThresholds(
  totalRowsCount: number,
  verticalScrollElement: { clientHeight: number } | null,
  threshold: GsGanttThreshold | undefined,
): boolean {
  if (!threshold) {
    return false
  }

  if (totalRowsCount <= 0) {
    return false
  }

  if (!verticalScrollElement || verticalScrollElement.clientHeight <= 0) {
    return false
  }

  if (threshold.timescaleMultipleDistance < 0 || threshold.rowIndexBoundaryDistance < 0) {
    return false
  }

  return true
}
