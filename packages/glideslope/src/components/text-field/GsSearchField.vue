<script setup lang="ts">
/**
 * A rounded search input. Enter emits `submit`; Escape or the clear button empties it and emits
 * `clear`. Give it an accessible name with `aria-label` (or a visible label pointing at its `id`).
 *
 * `class` and `style` apply to the wrapper; other attributes go to the `<input>`.
 * `provideSearchFieldDefaults()` sets defaults for every search field below the calling component.
 *
 * @example
 * ```vue
 * <GsSearchField v-model="query" aria-label="Search tracks" @submit="search" />
 * ```
 */
import CancelFillIcon from '@wingbrace/glideslope-icons/cancel-fill'
import LoopIcon from '@wingbrace/glideslope-icons/loop'
import SearchIcon from '@wingbrace/glideslope-icons/search'
import { computed, useTemplateRef } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideIconDefaults } from '../icon/defaults'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { injectSearchFieldDefaults } from './defaults'
import styles from './search.module.css'
import type { GsSearchFieldProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  variant,
  placeholder,
  disabled = undefined,
  loading = false,
  classes,
} = defineProps<GsSearchFieldProps>()

const emit = defineEmits<{
  /** Enter was pressed. Receives the current text. */
  submit: [value: string]
  /** The text was cleared with Escape or the clear button. */
  clear: []
}>()

/** The search text. */
const model = defineModel<string>({ default: '' })

const { rootAttrs, controlAttrs } = useSplitAttrs()
const input = useTemplateRef<HTMLInputElement>('input')

const defaults = injectSearchFieldDefaults()
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'outline')
const isDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)
const resolvedClasses = computed(() => classes ?? defaults.value.classes)
const isEmpty = computed(() => model.value === '')

function clear() {
  model.value = ''
  emit('clear')
  input.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.key === 'Enter') {
    emit('submit', model.value)
  } else if (event.key === 'Escape' && !isEmpty.value) {
    event.preventDefault()
    clear()
  }
}

provideIconDefaults({ size: 'small' })
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="['group/search-field', styles.field, styles[resolvedVariant]]"
    :data-disabled="isDisabled ? '' : undefined"
    :data-empty="isEmpty ? '' : undefined"
  >
    <GsIcon :class="[styles.search, resolvedClasses?.search]"><SearchIcon /></GsIcon>
    <input
      v-bind="controlAttrs"
      ref="input"
      v-model="model"
      type="search"
      :class="[styles.input, resolvedClasses?.input]"
      :placeholder="placeholder"
      :disabled="isDisabled"
      @keydown="onKeydown"
    />
    <GsIcon
      v-if="loading"
      :class="[styles.loading, resolvedClasses?.loading]"
      role="status"
      aria-label="Loading"
    >
      <LoopIcon />
    </GsIcon>
    <button
      v-else
      type="button"
      tabindex="-1"
      aria-label="Clear search"
      :class="[styles.clear, resolvedClasses?.clear]"
      :disabled="isDisabled"
      @click="clear"
    >
      <GsIcon><CancelFillIcon /></GsIcon>
    </button>
  </div>
</template>
