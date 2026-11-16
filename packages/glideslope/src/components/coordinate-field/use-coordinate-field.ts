import { computed, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { GsCoordinateErrorContext, GsCoordinateSystem, GsCoordinateValue } from './types'
import { useCoordinateCopy, type UseCoordinateCopyResult } from './use-coordinate-copy'
import {
  useCoordinateFieldState,
  type UseCoordinateFieldStateResult,
} from './use-coordinate-field-state'
import { useCoordinateFocus, type UseCoordinateFocusResult } from './use-coordinate-focus'
import { useCoordinatePaste, type UseCoordinatePasteResult } from './use-coordinate-paste'
import { useTimeoutCleanup, type UseTimeoutCleanupResult } from './use-timeout-cleanup'

/** Focus moves after a paste once the new segment values are rendered. */
const FOCUS_DELAY_MS = 0

export interface UseCoordinateFieldOptions {
  /** The coordinate, usually the component's `v-model`. See `useCoordinateFieldState`. */
  value: Ref<GsCoordinateValue | null>
  /** Coordinate system of the segments. */
  format: MaybeRefOrGetter<GsCoordinateSystem>
  /** The element that contains the segment inputs. See `useCoordinateFocus`. */
  container: MaybeRefOrGetter<HTMLElement | null | undefined>
  /** An error message from outside; it takes precedence over validation errors. */
  errorMessage?: MaybeRefOrGetter<string | undefined>
  /** Marks the field invalid from outside. */
  invalid?: MaybeRefOrGetter<boolean>
  /** Whether the field is disabled (turns copying off). */
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * Called with `'Invalid coordinate value'` when entered segments don't validate, and with
   * `'Invalid coordinate format'` when a pasted coordinate can't be parsed.
   */
  onError?: (message: string, context?: GsCoordinateErrorContext) => void
}

export interface UseCoordinateFieldResult {
  state: UseCoordinateFieldStateResult
  focus: UseCoordinateFocusResult
  paste: UseCoordinatePasteResult
  copy: UseCoordinateCopyResult
  /** Registers timeouts to clear on unmount. */
  registerTimeout: UseTimeoutCleanupResult['registerTimeout']
  /** `errorMessage`, else the first validation error, else `null`. */
  effectiveErrorMessage: ComputedRef<string | null>
  /** Whether the field is invalid: marked so, or showing an error. */
  invalid: ComputedRef<boolean>
}

/**
 * Combines the coordinate field composables: segment state and validation, focus movement,
 * paste handling and copying. `GsCoordinateField` is built on it; use it to build a custom
 * coordinate input. Labels and ARIA wiring come from the surrounding field (`GsFieldLayout` or
 * a Reka UI `FieldRoot`), not from this composable.
 *
 * @example
 * ```ts
 * const value = defineModel<GsCoordinateValue | null>({ default: null })
 * const control = useTemplateRef<HTMLElement>('control')
 * const { state, focus, paste, copy, invalid } = useCoordinateField({
 *   value,
 *   format: 'dms',
 *   container: control,
 * })
 * ```
 */
export function useCoordinateField({
  value,
  format,
  container,
  errorMessage,
  invalid,
  disabled,
  onError,
}: UseCoordinateFieldOptions): UseCoordinateFieldResult {
  const { registerTimeout } = useTimeoutCleanup()

  const state = useCoordinateFieldState({ value, format, onError, registerTimeout })

  const focus = useCoordinateFocus({
    container,
    editableSegmentConfigs: state.editableSegmentConfigs,
  })

  const paste = useCoordinatePaste({
    onValueApplied: (pastedValue) => {
      state.applyPastedCoordinate(pastedValue)
      // Focus once the pasted segments are rendered.
      registerTimeout(setTimeout(focus.focusFirstSegment, FOCUS_DELAY_MS))
    },
    onError,
  })

  const copy = useCoordinateCopy({
    currentValue: state.currentValue,
    validationErrors: state.validationErrors,
    disabled: () => toValue(disabled) ?? false,
    registerTimeout,
  })

  const effectiveErrorMessage = computed(
    () => toValue(errorMessage) || state.effectiveErrorMessage.value,
  )

  const isInvalid = computed(() => !!toValue(invalid) || effectiveErrorMessage.value !== null)

  return {
    state,
    focus,
    paste,
    copy,
    registerTimeout,
    effectiveErrorMessage,
    invalid: isInvalid,
  }
}
