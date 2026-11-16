<script setup lang="ts">
/**
 * @internal One editable part of a `GsCoordinateField` (degrees, minutes, a direction letter, a grid
 * zone…). It accepts only `allowedChars` up to `maxLength`, selects its text on focus, sizes
 * itself to its content, and asks the field to move focus at its edges.
 */
import { computed } from 'vue'
import type { GsCoordinateSegmentProps } from './types'
import { useTimeoutCleanup } from './use-timeout-cleanup'

const {
  value,
  label,
  segmentIndex,
  placeholder,
  maxLength,
  allowedChars,
  pad,
  disabled = false,
  readonly = false,
  required = false,
} = defineProps<GsCoordinateSegmentProps>()

const emit = defineEmits<{
  /** The segment's text changed. */
  change: [value: string]
  /** Focus should move to the next segment (the segment is full, or ArrowRight at its end). */
  advance: []
  /** Focus should move to the previous segment (Backspace when empty, or ArrowLeft at its start). */
  retreat: []
  /** A key the segment doesn't handle itself, for field-level navigation (Home, End). */
  navigate: [event: KeyboardEvent]
}>()

const { registerTimeout } = useTimeoutCleanup()

const allowedPattern = computed(() => (allowedChars ? new RegExp(`^${allowedChars}*$`, 'i') : null))

/** Fits the text, or the longest value while empty, plus padding. */
const width = computed(() => {
  if (maxLength === undefined) return undefined
  return `${(value.length > 0 ? value.length : maxLength) + (pad ?? 0.5)}ch`
})

const inputMode = computed(() => {
  if (!allowedChars?.includes('0-9')) return 'text'
  return allowedChars.includes('\\-\\.') ? 'decimal' : 'numeric'
})

function isAllowed(text: string) {
  return !allowedPattern.value || allowedPattern.value.test(text)
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const next = input.value

  if (!isAllowed(next) || (maxLength && next.length > maxLength)) {
    // Nothing re-renders for a rejected edit, so put the accepted text back by hand.
    const caret = Math.max(0, (input.selectionStart ?? next.length) - (next.length - value.length))
    input.value = value
    input.setSelectionRange(caret, caret)
    return
  }

  emit('change', next)

  if (maxLength && next.length === maxLength) {
    registerTimeout(setTimeout(() => emit('advance'), 0))
  }
}

function onPaste(event: ClipboardEvent) {
  // The field already took this paste as a whole coordinate.
  if (event.defaultPrevented) return

  const pastedText = event.clipboardData?.getData('text') ?? ''
  if (!isAllowed(pastedText)) {
    event.preventDefault()
    return
  }
  if (maxLength && pastedText.length > maxLength) {
    event.preventDefault()
    emit('change', pastedText.slice(0, maxLength))
  }
}

function onKeydown(event: KeyboardEvent) {
  const input = event.currentTarget as HTMLInputElement
  const atStart = input.selectionStart === 0
  const atEnd = input.selectionStart === value.length

  if ((event.key === 'Backspace' && value.length === 0) || (event.key === 'ArrowLeft' && atStart)) {
    event.preventDefault()
    emit('retreat')
    return
  }

  if (event.key === 'ArrowRight' && atEnd) {
    event.preventDefault()
    emit('advance')
    return
  }

  emit('navigate', event)
}

function onFocus(event: FocusEvent) {
  ;(event.target as HTMLInputElement).select()
}
</script>

<template>
  <input
    type="text"
    autocomplete="off"
    :value="value"
    :placeholder="placeholder"
    :maxlength="maxLength"
    :inputmode="inputMode"
    :readonly="readonly"
    :tabindex="readonly ? -1 : undefined"
    :disabled="disabled"
    :aria-label="label"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :data-segment-index="segmentIndex"
    :style="width ? { '--segment-width': width } : undefined"
    @input="onInput"
    @paste="onPaste"
    @keydown="onKeydown"
    @focus="onFocus"
  />
</template>
