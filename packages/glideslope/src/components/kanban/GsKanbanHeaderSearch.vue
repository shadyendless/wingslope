<script setup lang="ts">
/**
 * A search field for the board's header: a `GsSearchField` in its `outline` variant, named
 * "Search" unless given an `aria-label`. Bind the text with `v-model` and filter the cards you
 * render with it; other attributes and the `submit` / `clear` events pass through to the field.
 *
 * @example
 * ```vue
 * <GsKanbanHeaderSearch v-model="query" placeholder="Search" />
 * ```
 */
import GsSearchField from '../text-field/GsSearchField.vue'
import type { GsKanbanHeaderSearchProps } from './types'

const {
  variant = 'outline',
  disabled = undefined,
  ...rest
} = defineProps<GsKanbanHeaderSearchProps>()

/** The search text. */
const query = defineModel<string>({ default: '' })
</script>

<template>
  <GsSearchField
    v-model="query"
    v-bind="rest"
    :variant="variant"
    :disabled="disabled"
    aria-label="Search"
  />
</template>
