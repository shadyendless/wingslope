import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { GsGanttTimelineChunkObject } from '../types'

export interface UseResizeIntersectionEffectOptions {
  timelineContainerElement: MaybeRefOrGetter<HTMLElement | null>
  timelineChunks: MaybeRefOrGetter<GsGanttTimelineChunkObject[]>
  /**
   * Called when the container has probably changed width, so the visible width should be measured
   * again. The Design Toolkit re-renders its provider at this point; here the caller bumps a
   * reactive tick that the width measurement depends on.
   */
  onLayoutChange: () => void
}

function getResizeElementsToObserve(
  timelineChunks: GsGanttTimelineChunkObject[],
  timelineContainerElement: HTMLElement,
): [Element | null, Element | null] {
  if (timelineChunks.length < 3) {
    return [null, null]
  }

  const expansionThresholdChunk = timelineChunks[timelineChunks.length - 1]
  const contractionThresholdChunk = timelineChunks[timelineChunks.length - 3]

  const expansionThresholdElement = timelineContainerElement.querySelector(
    `[data-timestamp="${expansionThresholdChunk?.timestampMs}"]`,
  )
  const contractionThresholdElement = timelineContainerElement.querySelector(
    `[data-timestamp="${contractionThresholdChunk?.timestampMs}"]`,
  )

  return [expansionThresholdElement, contractionThresholdElement]
}

/**
 * Detects a change in the timeline's visible width with an `IntersectionObserver` on two chunks
 * near its end: the last chunk coming into view means the container grew, and the third-to-last
 * one leaving view means it shrank. Either calls `onLayoutChange`.
 */
export function useResizeIntersectionEffect({
  timelineContainerElement,
  timelineChunks,
  onLayoutChange,
}: UseResizeIntersectionEffectOptions) {
  watch(
    [() => toValue(timelineContainerElement), () => toValue(timelineChunks)],
    ([containerElement, chunks], _, onCleanup) => {
      if (!containerElement || typeof IntersectionObserver === 'undefined') {
        return
      }

      const [expansionElement, contractionElement] = getResizeElementsToObserve(
        chunks,
        containerElement,
      )

      if (!expansionElement || !contractionElement) {
        return
      }

      // IntersectionObserver fires an initial callback on observe(). This does not cause a loop
      // because a layout change re-measures the container width, producing new chunks whose
      // expansion element is offscreen (not intersecting) and whose contraction element is
      // onscreen (intersecting): neither condition triggers another change.
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const isExpansionElement = entry.target === expansionElement
            const isContractionElement = entry.target === contractionElement

            if (
              (isExpansionElement && entry.isIntersecting) ||
              (isContractionElement && !entry.isIntersecting)
            ) {
              onLayoutChange()
            }
          }
        },
        { root: containerElement, threshold: 0 },
      )

      intersectionObserver.observe(expansionElement)
      intersectionObserver.observe(contractionElement)

      onCleanup(() => {
        intersectionObserver.disconnect()
      })
    },
    // After the DOM update, so the new chunks' elements exist (the Design Toolkit's `useEffect`).
    { immediate: true, flush: 'post' },
  )
}
