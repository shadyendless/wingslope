import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import {
  deduplicateMatchesByLocation,
  isCompleteCoordinate,
  parseCoordinatePaste,
} from './coordinate-utils'
import type {
  GsCoordinateErrorContext,
  GsCoordinateSystem,
  GsCoordinateValue,
  GsParsedCoordinateMatch,
} from './types'

export interface UseCoordinatePasteOptions {
  /** Called with the coordinate a paste resolved to. */
  onValueApplied: (value: GsCoordinateValue) => void
  /** Called with `'Invalid coordinate format'` and `{ pastedText }` when no parser accepts a paste. */
  onError?: (message: string, context?: GsCoordinateErrorContext) => void
}

export interface UseCoordinatePasteResult {
  /** Different locations the last paste could mean, for the disambiguation dialog. */
  disambiguationMatches: ShallowRef<GsParsedCoordinateMatch[]>
  /** Whether the disambiguation dialog is open. Bind it to the dialog's `v-model:open`. */
  showDisambiguationModal: Ref<boolean>
  /** The interpretation chosen in the disambiguation dialog. */
  selectedDisambiguationFormat: Ref<GsCoordinateSystem | null>
  /** `paste` handler (use it in the capture phase) for the element containing the segments. */
  handleInputPaste: (event: ClipboardEvent) => void
  /** Applies the chosen interpretation and closes the dialog. */
  handleDisambiguationSelect: () => void
  /** Closes the dialog and forgets its matches. */
  cleanupDisambiguationModal: () => void
}

/**
 * Normalizes pasted MGRS text: uppercase letters, and a leading zero for a one-digit grid zone
 * (`6r yp 12345 67890` becomes `06R YP 12345 67890`).
 */
function normalizeMgrsInput(input: string): string {
  const normalized = input.toUpperCase()
  const zone = normalized.match(/^(\d)([A-Z])/)?.[1]
  return zone ? zone.padStart(2, '0') + normalized.slice(1) : normalized
}

/**
 * Handles a whole coordinate pasted into any segment: it tries every coordinate system's parser,
 * applies the result when all matches are the same location, and otherwise opens a dialog to
 * choose between them. Single values (e.g. `42`) paste into the segment as usual.
 *
 * @example
 * ```ts
 * const { handleInputPaste, showDisambiguationModal } = useCoordinatePaste({
 *   onValueApplied: (value) => applyPastedCoordinate(value),
 *   onError: (message) => (error.value = message),
 * })
 * ```
 */
export function useCoordinatePaste({
  onValueApplied,
  onError,
}: UseCoordinatePasteOptions): UseCoordinatePasteResult {
  const disambiguationMatches = shallowRef<GsParsedCoordinateMatch[]>([])
  const showDisambiguationModal = ref(false)
  const selectedDisambiguationFormat = ref<GsCoordinateSystem | null>(null)

  function handleCoordinatePaste(pastedText: string) {
    const allMatches = parseCoordinatePaste(pastedText)

    if (allMatches.length === 0) {
      onError?.('Invalid coordinate format', { pastedText })
      return
    }

    // Ask only when the matches are different locations.
    const matches = deduplicateMatchesByLocation(allMatches)
    const [firstMatch] = matches

    if (matches.length === 1 && firstMatch) {
      onValueApplied(firstMatch.value)
    } else if (firstMatch) {
      disambiguationMatches.value = matches
      selectedDisambiguationFormat.value = firstMatch.format
      showDisambiguationModal.value = true
    }
  }

  function handleInputPaste(event: ClipboardEvent) {
    const rawPastedText = event.clipboardData?.getData('text/plain')
    if (!rawPastedText) return

    const pastedText = normalizeMgrsInput(rawPastedText)
    if (isCompleteCoordinate(pastedText)) {
      event.preventDefault()
      handleCoordinatePaste(pastedText)
    }
  }

  function cleanupDisambiguationModal() {
    showDisambiguationModal.value = false
    disambiguationMatches.value = []
    selectedDisambiguationFormat.value = null
  }

  function handleDisambiguationSelect() {
    const match = disambiguationMatches.value.find(
      (candidate) => candidate.format === selectedDisambiguationFormat.value,
    )
    if (match) {
      onValueApplied(match.value)
    }
    cleanupDisambiguationModal()
  }

  return {
    disambiguationMatches,
    showDisambiguationModal,
    selectedDisambiguationFormat,
    handleInputPaste,
    handleDisambiguationSelect,
    cleanupDisambiguationModal,
  }
}
