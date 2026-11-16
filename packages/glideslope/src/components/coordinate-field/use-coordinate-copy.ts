import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import { getAllCoordinateFormats } from './coordinate-utils'
import type { GsCoordinateSystem, GsCoordinateValue } from './types'
import type { UseTimeoutCleanupResult } from './use-timeout-cleanup'

/** How long a copy button shows its confirmation, in milliseconds. */
const COPY_FEEDBACK_DURATION_MS = 2000

export interface UseCoordinateCopyOptions {
  /** The coordinate to copy, or `null`. */
  currentValue: MaybeRefOrGetter<GsCoordinateValue | null>
  /** Validation errors of the entered segments; copying is off while there are any. */
  validationErrors: MaybeRefOrGetter<string[]>
  /** Whether the field is disabled. */
  disabled: MaybeRefOrGetter<boolean>
  /** Registers timeouts to clear on unmount. */
  registerTimeout: UseTimeoutCleanupResult['registerTimeout']
}

export interface UseCoordinateCopyResult {
  /** The format just copied, for 2 seconds of visual feedback, or `null`. */
  copiedFormat: Ref<GsCoordinateSystem | null>
  /** Copies the coordinate, rendered in `formatToCopy`, to the clipboard. */
  handleCopyFormat: (formatToCopy: GsCoordinateSystem) => Promise<void>
  /** Whether there is a valid coordinate to show and copy. */
  isFormatButtonEnabled: ComputedRef<boolean>
}

/**
 * Copies a coordinate to the clipboard in any coordinate system, with `copiedFormat` as feedback.
 * Falls back to `document.execCommand('copy')` where the Clipboard API is unavailable.
 *
 * @example
 * ```ts
 * const { copiedFormat, handleCopyFormat, isFormatButtonEnabled } = useCoordinateCopy({
 *   currentValue,
 *   validationErrors,
 *   disabled: () => props.disabled,
 *   registerTimeout,
 * })
 * ```
 */
export function useCoordinateCopy({
  currentValue,
  validationErrors,
  disabled,
  registerTimeout,
}: UseCoordinateCopyOptions): UseCoordinateCopyResult {
  const copiedFormat = ref<GsCoordinateSystem | null>(null)

  function showCopied(formatToCopy: GsCoordinateSystem) {
    copiedFormat.value = formatToCopy
    registerTimeout(
      setTimeout(() => {
        copiedFormat.value = null
      }, COPY_FEEDBACK_DURATION_MS),
    )
  }

  /** Copies through an off-screen textarea, for browsers without `navigator.clipboard`. */
  function fallbackCopyToClipboard(text: string, formatToCopy: GsCoordinateSystem) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      showCopied(formatToCopy)
    } catch (error) {
      console.error('[CoordinateField] Fallback copy to clipboard failed', error)
    }

    document.body.removeChild(textArea)
  }

  async function handleCopyFormat(formatToCopy: GsCoordinateSystem) {
    const coordinate = toValue(currentValue)
    if (!coordinate) return

    const formatResult = getAllCoordinateFormats(coordinate)[formatToCopy]
    if (!formatResult.isValid) return

    try {
      await navigator.clipboard.writeText(formatResult.value)
      showCopied(formatToCopy)
    } catch {
      fallbackCopyToClipboard(formatResult.value, formatToCopy)
    }
  }

  const isFormatButtonEnabled = computed(
    () =>
      toValue(currentValue) !== null &&
      toValue(validationErrors).length === 0 &&
      !toValue(disabled),
  )

  return { copiedFormat, handleCopyFormat, isFormatButtonEnabled }
}
