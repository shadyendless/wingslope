import { toValue, type MaybeRefOrGetter } from 'vue'
import { selectors } from '../store'
import { deriveTranslateXValue } from '../utils/layout'
import { useLayoutSubscription } from './use-layout-subscription'
import type { GsGanttTimelineChunkObject } from '../types'

export interface UseTimelineTransformOptions {
  timelineElement: MaybeRefOrGetter<HTMLElement | null>
  msPerPx: MaybeRefOrGetter<number>
  timelineChunks: MaybeRefOrGetter<GsGanttTimelineChunkObject[]>
}

/** Slides the timeline's chunks with the horizontal scroll position, every frame. */
export function useTimelineTransform({
  timelineElement,
  msPerPx,
  timelineChunks,
}: UseTimelineTransformOptions) {
  useLayoutSubscription({
    selector: selectors.currentPositionMs,
    callback: (currentPositionMs) => {
      const element = toValue(timelineElement)

      if (!element) {
        return
      }

      const translateX = deriveTranslateXValue(
        toValue(msPerPx),
        toValue(timelineChunks),
        currentPositionMs,
      )

      element.style.setProperty('--translate-x', `${translateX}px`)
    },
    sources: [
      () => toValue(timelineElement),
      () => toValue(msPerPx),
      () => toValue(timelineChunks),
    ],
  })
}
