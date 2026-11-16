import { toValue, type MaybeRefOrGetter } from 'vue'
import { GANTT_CONTAINER_TOP_PX } from '../constants'
import { injectGanttContext, injectTemporalDataContext } from '../context'
import { selectors } from '../store'
import { deriveCurrentTimeTranslateX } from '../utils/layout'
import { useLayoutSubscription } from './use-layout-subscription'

export interface UseCurrentTimeLayoutOptions {
  currentTimeElement: MaybeRefOrGetter<HTMLElement | null>
  currentTimeMs: MaybeRefOrGetter<number>
  labelElement: MaybeRefOrGetter<HTMLElement | null>
  indicatorElement: MaybeRefOrGetter<HTMLElement | null>
}

function calculateIndicatorHeight(
  headerElement: HTMLElement | null,
  labelElement: HTMLElement | null,
  verticalScrollElement: HTMLElement | null,
  horizontalScrollElement: HTMLElement | null,
  translateX = 0,
) {
  const ganttHeaderHeight = headerElement?.clientHeight ?? 0
  const scrollWidth = horizontalScrollElement?.clientWidth ?? 0
  const scrollHeight = verticalScrollElement?.clientHeight ?? 0
  const labelHeight = labelElement?.offsetHeight ?? 0

  // Distance between vertical scrollbar and bottom of label element. Used as the indicator height
  // when the indicator is visually located above the vertical scrollbar so that the indicator
  // dashes aren't overlaid on the scrollbar
  const indicatorHeightOffset = ganttHeaderHeight - (GANTT_CONTAINER_TOP_PX + labelHeight)

  // Default indicator height when the indicator is not visually located above the vertical
  // scrollbar.
  const totalIndicatorHeight = scrollHeight + indicatorHeightOffset

  return translateX >= scrollWidth ? indicatorHeightOffset : totalIndicatorHeight
}

/**
 * Positions the current-time marker against the horizontal scroll position, every frame, and
 * sizes its dashed line to run down to the bottom of the visible rows.
 */
export function useCurrentTimeLayout({
  currentTimeElement,
  currentTimeMs,
  labelElement,
  indicatorElement,
}: UseCurrentTimeLayoutOptions) {
  const { rootElement, ganttContentElement, headerElement } = injectGanttContext()
  const { msPerPx } = injectTemporalDataContext()

  useLayoutSubscription({
    selector: selectors.currentPositionMs,
    callback: (currentPositionMs) => {
      const element = toValue(currentTimeElement)

      if (!element) {
        return
      }

      const translateX = deriveCurrentTimeTranslateX(
        toValue(currentTimeMs),
        msPerPx.value,
        currentPositionMs,
      )
      const indicatorHeight = calculateIndicatorHeight(
        headerElement.value,
        toValue(labelElement),
        rootElement.value,
        ganttContentElement.value,
        translateX,
      )

      element.style.setProperty('--translate-x', `${translateX}px`)

      const indicator = toValue(indicatorElement)
      if (indicator) {
        indicator.style.height = `${indicatorHeight}px`
      }
    },
    sources: [
      () => toValue(currentTimeElement),
      () => toValue(currentTimeMs),
      () => toValue(indicatorElement),
      msPerPx,
      headerElement,
      rootElement,
      ganttContentElement,
    ],
  })
}
