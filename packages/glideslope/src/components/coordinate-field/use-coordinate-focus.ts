import { ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { GsCoordinateSegmentConfig } from './types'

export interface UseCoordinateFocusOptions {
  /** The element that contains the segment inputs, each marked with `data-segment-index`. */
  container: MaybeRefOrGetter<HTMLElement | null | undefined>
  /** The editable segments, in order. */
  editableSegmentConfigs: MaybeRefOrGetter<GsCoordinateSegmentConfig[]>
}

export interface UseCoordinateFocusResult {
  /** Index of the focused segment, or -1. Set it from the segments' `focus` and `blur`. */
  focusedSegmentIndex: Ref<number>
  /** Focuses the segment at `index`, if there is one. */
  focusSegment: (index: number) => void
  /** Focuses the segment after `currentIndex`. */
  focusNextSegment: (currentIndex: number) => void
  /** Focuses the segment before `currentIndex`. */
  focusPreviousSegment: (currentIndex: number) => void
  focusFirstSegment: () => void
  focusLastSegment: () => void
  /** Moves to the first segment on Home and to the last on End. */
  handleSegmentKeyDown: (index: number, event: KeyboardEvent) => void
}

/**
 * Moves focus between a coordinate's segment inputs, which are found in `container` by their
 * `data-segment-index` attribute.
 *
 * @example
 * ```ts
 * const control = useTemplateRef<HTMLElement>('control')
 * const { focusNextSegment, handleSegmentKeyDown } = useCoordinateFocus({
 *   container: control,
 *   editableSegmentConfigs,
 * })
 * ```
 */
export function useCoordinateFocus({
  container,
  editableSegmentConfigs,
}: UseCoordinateFocusOptions): UseCoordinateFocusResult {
  const focusedSegmentIndex = ref(-1)

  function focusSegment(index: number) {
    if (index < 0 || index >= toValue(editableSegmentConfigs).length) return
    toValue(container)?.querySelector<HTMLElement>(`[data-segment-index="${index}"]`)?.focus()
  }

  const focusNextSegment = (currentIndex: number) => focusSegment(currentIndex + 1)
  const focusPreviousSegment = (currentIndex: number) => focusSegment(currentIndex - 1)
  const focusFirstSegment = () => focusSegment(0)
  const focusLastSegment = () => focusSegment(toValue(editableSegmentConfigs).length - 1)

  function handleSegmentKeyDown(_index: number, event: KeyboardEvent) {
    if (event.key === 'Home') {
      event.preventDefault()
      focusFirstSegment()
    } else if (event.key === 'End') {
      event.preventDefault()
      focusLastSegment()
    }
  }

  return {
    focusedSegmentIndex,
    focusSegment,
    focusNextSegment,
    focusPreviousSegment,
    focusFirstSegment,
    focusLastSegment,
    handleSegmentKeyDown,
  }
}
