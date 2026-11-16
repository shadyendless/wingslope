import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { TIMESCALE_MAPPING } from '../constants'
import { selectors, type GanttStore } from '../store'
import { getMsPerPx } from '../utils/conversions'
import { keepIfEqual } from '../utils/equality'
import { generateTimelineChunks } from '../utils/generation'
import { getRenderedRegionBoundsMs, getViewableRegionWidth } from '../utils/helpers'
import { useResizeIntersectionEffect } from './use-resize-intersection-effect'
import type { TemporalDataContext } from '../context'
import type {
  GsGanttMetThresholdData,
  GsGanttThreshold,
  GsGanttTimeBounds,
  GsGanttTimescale,
} from '../types'

export interface UseTemporalDataOptions {
  store: GanttStore
  headerElement: Readonly<Ref<HTMLElement | null>>
  timescale: MaybeRefOrGetter<GsGanttTimescale>
  totalBounds: MaybeRefOrGetter<GsGanttTimeBounds>
  threshold: MaybeRefOrGetter<GsGanttThreshold | undefined>
  currentTimeMs: MaybeRefOrGetter<number>
  onThresholdMet: (metThresholds: GsGanttMetThresholdData[]) => void
}

/**
 * Builds the timeline: the scale, the chunks rendered around the scroll position (horizontal
 * virtualization) and the time range they cover. This is the Design Toolkit's
 * `TemporalDataProvider`; `GsGantt` provides the result.
 *
 * The chunks only change when the scroll position crosses a timescale interval
 * (`roundedCurrentPositionMs`) or the visible width changes, not on every scroll frame. Object
 * values are kept while their contents are unchanged, so their dependents don't update for
 * nothing.
 */
export function useTemporalData({
  store,
  headerElement,
  timescale,
  totalBounds,
  threshold,
  currentTimeMs,
  onThresholdMet,
}: UseTemporalDataOptions): TemporalDataContext {
  const timescaleValue = computed(() => toValue(timescale))
  const msPerPx = computed(() => getMsPerPx(timescaleValue.value))
  const selectedTimeIntervalMs = computed(() => TIMESCALE_MAPPING[timescaleValue.value])

  const roundedTimestampMs = computed(() =>
    selectors.roundedCurrentPositionMs(selectedTimeIntervalMs.value)(store.state),
  )

  // Bumped when the header has probably changed width. The Design Toolkit re-renders the provider
  // instead, which reads the width again; the width also follows the rounded position, as the
  // provider re-renders when that changes.
  const layoutTick = shallowRef(0)
  const viewableRegionWidth = computed(() => {
    void layoutTick.value
    void roundedTimestampMs.value

    return getViewableRegionWidth(headerElement.value)
  })

  const timelineChunks = computed(() =>
    generateTimelineChunks(
      roundedTimestampMs.value,
      viewableRegionWidth.value,
      selectedTimeIntervalMs.value,
      msPerPx.value,
    ),
  )

  const renderedRegionBounds = computed<GsGanttTimeBounds>((previous) =>
    keepIfEqual(getRenderedRegionBoundsMs(timelineChunks.value, msPerPx.value), previous),
  )

  useResizeIntersectionEffect({
    timelineContainerElement: headerElement,
    timelineChunks,
    onLayoutChange: () => {
      layoutTick.value++
    },
  })

  // The chunk observers above need chunks to watch. A chart mounted while hidden (a closed tab, a
  // collapsed drawer) measures a 0px header and renders none, so also measure again whenever the
  // header's width stops matching the last measurement. The Design Toolkit gets this from its root
  // re-rendering on resize, which re-reads the width.
  watch(
    headerElement,
    (element, _, onCleanup) => {
      if (!element || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => {
        if (getViewableRegionWidth(element) !== viewableRegionWidth.value) layoutTick.value++
      })
      observer.observe(element)
      onCleanup(() => observer.disconnect())
    },
    { immediate: true },
  )

  return {
    msPerPx,
    renderedRegionBounds,
    timescale: timescaleValue,
    totalBounds: computed<GsGanttTimeBounds>((previous) =>
      keepIfEqual(toValue(totalBounds), previous),
    ),
    timelineChunks,
    // Compared by value, so an inline `:threshold="{ … }"` doesn't re-examine on every render.
    threshold: computed<GsGanttThreshold | undefined>((previous) =>
      keepIfEqual(toValue(threshold), previous),
    ),
    currentTimeMs: computed(() => toValue(currentTimeMs)),
    onThresholdMet,
  }
}
