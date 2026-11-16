import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { injectGanttContext, injectTemporalDataContext } from '../context'
import { injectGanttStore, selectors } from '../store'
import { deriveRenderedSlice } from '../utils/layout'
import {
  deriveRenderedRegion,
  deriveRowIndexThresholds,
  deriveTemporalThresholds,
  deriveTotalDataRegion,
  examineThresholds,
  shouldExamineThresholds,
} from '../utils/thresholds'
import type { GsGanttMetThresholdData } from '../types'

function toThresholdKey(item: GsGanttMetThresholdData): string {
  return `${item.axis}:${item.direction}:${item.value}`
}

/** Remembers the thresholds met last time, to report only newly entered ones. */
function createThresholdProjection() {
  const state = new Set<string>()

  function update(metThresholds: GsGanttMetThresholdData[]): GsGanttMetThresholdData[] {
    const keys: string[] = []
    const newlyEntered: GsGanttMetThresholdData[] = []

    for (const item of metThresholds) {
      const key = toThresholdKey(item)
      keys.push(key)
      if (!state.has(key)) {
        newlyEntered.push(item)
      }
    }

    state.clear()
    for (const key of keys) {
      state.add(key)
    }

    return newlyEntered
  }

  function reset() {
    state.clear()
  }

  return { update, reset }
}

export interface UseTotalDataRegionThresholdsOptions {
  totalRowsCount: MaybeRefOrGetter<number>
  verticalScrollElement: MaybeRefOrGetter<HTMLElement | null>
}

/**
 * Tells the chart's user when the rendered region nears the edges of the data being virtualized,
 * so they can, for example, fetch more data for the chart.
 *
 * It compares the rendered region (the rendered timeline chunks and rows) with thresholds derived
 * from `GsGantt`'s `threshold` prop, on both the time (horizontal) and row (vertical) axes, and
 * calls `onThresholdMet` (`GsGantt`'s `threshold-met` event) with the thresholds that are newly
 * met: a threshold that stays met with the same value is reported once, until it is left and
 * entered again or its value changes (because the bounds, timescale or threshold changed).
 *
 * Nothing is examined without a `threshold`, with no rows, before the scroll element has a
 * height, or with negative or contradictory threshold values. The store's position starts at the
 * middle of the total range, so the start threshold isn't met on mount.
 */
export function useTotalDataRegionThresholds({
  totalRowsCount,
  verticalScrollElement,
}: UseTotalDataRegionThresholdsOptions) {
  const projection = createThresholdProjection()
  const store = injectGanttStore()
  const { totalBounds, renderedRegionBounds, threshold, onThresholdMet, timescale } =
    injectTemporalDataContext()
  const { rowHeightPx } = injectGanttContext()
  const roundedCurrentRowScrollPx = computed(() =>
    selectors.roundedCurrentRowScrollPx(rowHeightPx.value)(store.state),
  )

  watch(
    [
      () => toValue(totalRowsCount),
      totalBounds,
      renderedRegionBounds,
      threshold,
      timescale,
      roundedCurrentRowScrollPx,
      () => toValue(verticalScrollElement),
      rowHeightPx,
    ],
    ([
      rowsCount,
      totalBoundsValue,
      renderedRegionBoundsValue,
      thresholdValue,
      timescaleValue,
      rowScrollPx,
      scrollElement,
      rowHeight,
    ]) => {
      if (!thresholdValue || !shouldExamineThresholds(rowsCount, scrollElement, thresholdValue)) {
        projection.reset()
        return
      }

      const totalDataRegion = deriveTotalDataRegion(rowsCount, totalBoundsValue)
      const renderedSlice = deriveRenderedSlice(
        rowScrollPx,
        rowHeight,
        scrollElement?.clientHeight ?? 0,
      )
      const renderedRegion = deriveRenderedRegion(renderedSlice, renderedRegionBoundsValue)
      const temporalThresholds = deriveTemporalThresholds(
        thresholdValue,
        totalDataRegion,
        timescaleValue,
      )
      const rowIndexThresholds = deriveRowIndexThresholds(thresholdValue, totalDataRegion)
      const metThresholds = examineThresholds(
        renderedRegion,
        temporalThresholds,
        rowIndexThresholds,
      )

      const newlyMet = projection.update(metThresholds)

      // A side effect that may change the parent's state, so it runs after rendering, as the
      // Design Toolkit's `useEffect` does.
      if (newlyMet.length > 0) {
        onThresholdMet(newlyMet)
      }
    },
    { immediate: true, flush: 'post' },
  )
}
