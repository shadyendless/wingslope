import {
  computed,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import {
  areAllSegmentsFilled,
  convertDDToDisplaySegments,
  convertDisplaySegmentsToDD,
  validateCoordinateSegments,
} from './coordinate-utils'
import { getSegmentConfigs } from './segment-configs'
import type {
  GsCoordinateErrorContext,
  GsCoordinateSegmentConfig,
  GsCoordinateSystem,
  GsCoordinateValue,
} from './types'
import type { UseTimeoutCleanupResult } from './use-timeout-cleanup'

/** Delay before a fully entered coordinate is validated, in milliseconds. */
const VALIDATION_DELAY_MS = 400

export interface UseCoordinateFieldStateOptions {
  /**
   * The coordinate (`null` while empty, incomplete or invalid), usually the component's `v-model`.
   * Written when the user completes, clears or pastes a coordinate; changes from outside are
   * converted to segments.
   */
  value: Ref<GsCoordinateValue | null>
  /** Coordinate system of the segments. */
  format: MaybeRefOrGetter<GsCoordinateSystem>
  /** Called with `'Invalid coordinate value'` and its context when entered segments don't validate. */
  onError?: (message: string, context?: GsCoordinateErrorContext) => void
  /** Registers timeouts to clear on unmount. */
  registerTimeout?: UseTimeoutCleanupResult['registerTimeout']
}

export interface UseCoordinateFieldStateResult {
  /** The current coordinate, or `null`. */
  currentValue: ComputedRef<GsCoordinateValue | null>
  /** Text of each editable segment. */
  segmentValues: Ref<string[]>
  /** Validation errors of the entered segments. */
  validationErrors: Ref<string[]>
  /** Every segment of the format, literals included. */
  segmentConfigs: ComputedRef<GsCoordinateSegmentConfig[]>
  /** The editable segments of the format. */
  editableSegmentConfigs: ComputedRef<GsCoordinateSegmentConfig[]>
  /** Updates one segment; validates (debounced) once every segment is filled. */
  handleSegmentChange: (index: number, newValue: string) => void
  /** Normalizes a segment when it loses focus (pads a one-digit MGRS zone). */
  handleSegmentBlur: (index: number) => void
  /** The first validation error, or `null`. */
  effectiveErrorMessage: ComputedRef<string | null>
  /** Shows a pasted coordinate in the segments and sets it as the value. */
  applyPastedCoordinate: (pastedValue: GsCoordinateValue) => void
  /** Runs a pending debounced validation now (on blur). */
  flushPendingValidation: () => void
}

/**
 * Keeps a coordinate's segment texts, validation and value in sync for one coordinate system.
 * The building block of `GsCoordinateField`, for building a custom coordinate input.
 *
 * Segments are converted from `value` when it changes from outside or when `format` changes.
 * Edits write `value` back: the decimal-degrees coordinate once every segment is filled and valid
 * (after a 400 ms pause, or on `flushPendingValidation`), otherwise `null`.
 *
 * @example
 * ```ts
 * const value = ref<GsCoordinateValue | null>(null)
 * const { registerTimeout } = useTimeoutCleanup()
 * const { segmentValues, editableSegmentConfigs, handleSegmentChange, validationErrors } =
 *   useCoordinateFieldState({ value, format: 'ddm', registerTimeout })
 * ```
 */
export function useCoordinateFieldState({
  value,
  format,
  onError,
  registerTimeout,
}: UseCoordinateFieldStateOptions): UseCoordinateFieldStateResult {
  const validationErrors = ref<string[]>([])
  let validationTimeout: ReturnType<typeof setTimeout> | null = null
  // Last value written to `value`; `undefined` means nothing written yet.
  let lastEmittedValue: GsCoordinateValue | null | undefined

  const currentValue = computed(() => value.value)
  const segmentConfigs = computed(() => getSegmentConfigs(toValue(format)))
  const editableSegmentConfigs = computed(() =>
    segmentConfigs.value.filter((config) => config.type !== 'literal'),
  )

  function emptySegments() {
    return Array.from({ length: editableSegmentConfigs.value.length }, () => '')
  }

  function toSegments(coordinate: GsCoordinateValue | null) {
    return (
      (coordinate && convertDDToDisplaySegments(coordinate, toValue(format))) || emptySegments()
    )
  }

  const segmentValues = ref<string[]>(toSegments(value.value))

  function clearValidationTimeout() {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
      validationTimeout = null
    }
  }

  function handleChange(newValue: GsCoordinateValue | null) {
    lastEmittedValue = newValue
    value.value = newValue
  }

  function convertValueToSegmentsOrClear(coordinate: GsCoordinateValue | null) {
    clearValidationTimeout()
    segmentValues.value = toSegments(coordinate)
    validationErrors.value = []
  }

  watch(
    () => toValue(format),
    () => convertValueToSegmentsOrClear(value.value),
  )

  watch(value, (next) => {
    // Skip the echo of our own write: re-converting it would wipe an in-progress edit (an emptied
    // segment or an invalid entry writes `null`) and the validation error that was just set.
    const isEchoOfEmit =
      lastEmittedValue !== undefined &&
      (next === lastEmittedValue ||
        (next !== null &&
          lastEmittedValue !== null &&
          next.lat === lastEmittedValue.lat &&
          next.lon === lastEmittedValue.lon))

    if (!isEchoOfEmit) {
      convertValueToSegmentsOrClear(next)
    }
  })

  function validateAndUpdateCoordinate(updatedValues: string[]) {
    const currentFormat = toValue(format)
    const errors = validateCoordinateSegments(updatedValues, currentFormat)

    if (errors.length > 0) {
      validationErrors.value = errors
      onError?.('Invalid coordinate value', {
        errors,
        format: currentFormat,
        segments: updatedValues,
      })
      handleChange(null)
      return
    }

    const ddValue = convertDisplaySegmentsToDD(updatedValues, currentFormat)
    if (!ddValue) {
      const message = 'Invalid coordinate value'
      validationErrors.value = [message]
      onError?.(message, { format: currentFormat, segments: updatedValues })
      handleChange(null)
      return
    }

    validationErrors.value = []
    handleChange(ddValue)
  }

  function handleSegmentChange(index: number, newValue: string) {
    const updatedValues = [...segmentValues.value]

    // MGRS band and grid square letters are always uppercase.
    updatedValues[index] =
      toValue(format) === 'mgrs' && (index === 1 || index === 2) && /^[a-zA-Z]+$/.test(newValue)
        ? newValue.toUpperCase()
        : newValue

    segmentValues.value = updatedValues

    if (areAllSegmentsFilled(updatedValues)) {
      clearValidationTimeout()
      const capturedValues = [...updatedValues]
      const timeoutId = setTimeout(() => {
        validationTimeout = null
        validateAndUpdateCoordinate(capturedValues)
      }, VALIDATION_DELAY_MS)
      validationTimeout = timeoutId
      registerTimeout?.(timeoutId)
    } else {
      clearValidationTimeout()
      validationErrors.value = []
      if (value.value !== null) {
        handleChange(null)
      }
    }
  }

  function handleSegmentBlur(index: number) {
    // A one-digit MGRS zone gets its leading zero.
    const zone = segmentValues.value[0]
    if (toValue(format) === 'mgrs' && index === 0 && zone && /^\d$/.test(zone)) {
      const updatedValues = [...segmentValues.value]
      updatedValues[0] = zone.padStart(2, '0')
      segmentValues.value = updatedValues
    }
  }

  function applyPastedCoordinate(pastedValue: GsCoordinateValue) {
    clearValidationTimeout()
    const segments = convertDDToDisplaySegments(pastedValue, toValue(format))
    if (segments) {
      segmentValues.value = segments
      validationErrors.value = []
      handleChange(pastedValue)
    }
  }

  function flushPendingValidation() {
    if (validationTimeout) {
      clearValidationTimeout()
      if (areAllSegmentsFilled(segmentValues.value)) {
        validateAndUpdateCoordinate(segmentValues.value)
      }
    }
  }

  const effectiveErrorMessage = computed(() => validationErrors.value[0] ?? null)

  return {
    currentValue,
    segmentValues,
    validationErrors,
    segmentConfigs,
    editableSegmentConfigs,
    handleSegmentChange,
    handleSegmentBlur,
    effectiveErrorMessage,
    applyPastedCoordinate,
    flushPendingValidation,
  }
}
