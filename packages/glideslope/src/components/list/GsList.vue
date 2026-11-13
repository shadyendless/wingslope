<script setup lang="ts">
/**
 * A keyboard-navigable list of rows (a grid list): arrow keys move between rows, type-ahead jumps
 * to a row, and rows can be selected (`selection-mode`, bound with `v-model`) or activated
 * (`@action` on `GsListItem`). Give the list an `aria-label`.
 *
 * Built on Reka UI's `TagGroup`, which implements grid-list semantics (`role="grid"` rows).
 *
 * @example
 * ```vue
 * <GsList v-model="selected" selection-mode="multiple" aria-label="Tracks">
 *   <GsListItem v-for="t in tracks" :key="t.id" :value="t.id" :label="t.callsign" />
 * </GsList>
 * ```
 */
import { TagGroupRoot, type AcceptableValue } from 'reka-ui'
import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { provideListContext } from './context'
import styles from './styles.module.css'
import type { GsListProps } from './types'

const { selectionMode = 'none', variant = 'cozy', disabled = false } = defineProps<GsListProps>()

/** Selected row value(s). */
const model = defineModel<AcceptableValue | AcceptableValue[]>()

defineSlots<{
  /** `GsListItem` rows. */
  default?: () => unknown
}>()

provideListContext({
  variant: computed(() => variant),
  selectable: computed(() => selectionMode !== 'none'),
  disabled: computed(() => disabled),
})
provideIconDefaults(() => ({ size: variant === 'cozy' ? 'large' : 'small' }))
</script>

<template>
  <TagGroupRoot
    v-model="model"
    :selection-mode="selectionMode"
    :disabled="disabled"
    :class="['group/list', styles.list]"
  >
    <slot />
  </TagGroupRoot>
</template>
