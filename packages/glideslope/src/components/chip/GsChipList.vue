<script setup lang="ts">
/**
 * A keyboard-navigable group of chips (arrow keys move between them). Bind selected chips with
 * `v-model` when `selection-mode` is set, and remove deletable chips by handling `@remove`.
 * Give the list an accessible name with `aria-label` or `aria-labelledby`.
 *
 * @example
 * ```vue
 * <GsChipList v-model="filters" selection-mode="multiple" aria-label="Filters">
 *   <GsSelectableChip value="air">Air</GsSelectableChip>
 *   <GsSelectableChip value="sea">Sea</GsSelectableChip>
 * </GsChipList>
 *
 * <GsChipList aria-label="Assignees" @remove="(values) => drop(values)">
 *   <GsDeletableChip v-for="name in assignees" :key="name" :value="name">{{ name }}</GsDeletableChip>
 * </GsChipList>
 * ```
 */
import { TagGroupRoot, type AcceptableValue } from 'reka-ui'
import { computed, getCurrentInstance } from 'vue'
import { provideChipDefaults, provideInChipList } from './defaults'
import styles from './styles.module.css'
import type { GsChipListProps } from './types'

const {
  selectionMode = 'none',
  disabled = false,
  color,
  size = 'small',
} = defineProps<GsChipListProps>()

const emit = defineEmits<{
  /** The user removed chips (remove button, Backspace or Delete). Remove them from your data. */
  remove: [values: AcceptableValue[]]
}>()

/** The selected chip value(s). */
const model = defineModel<AcceptableValue | AcceptableValue[]>()

defineSlots<{
  /** `GsChip`, `GsSelectableChip` or `GsDeletableChip` items. */
  default?: () => unknown
}>()

// Reka UI only makes chips removable when `remove` has a listener, so forward ours conditionally.
const instance = getCurrentInstance()
const removeListener = computed(() =>
  instance?.vnode.props?.onRemove
    ? { onRemove: (values: AcceptableValue[]) => emit('remove', values) }
    : {},
)

provideInChipList()
provideChipDefaults(() => ({ color, size }))
</script>

<template>
  <TagGroupRoot
    v-model="model"
    v-bind="removeListener"
    :selection-mode="selectionMode"
    :disabled="disabled"
    :class="['group/chip-list', styles.list]"
  >
    <slot />
  </TagGroupRoot>
</template>
