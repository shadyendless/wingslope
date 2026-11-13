<script setup lang="ts">
/**
 * A compact label for a category, status or filter. On its own it is static content; inside a
 * `GsChipList` (give it a `value`) it becomes part of the list's keyboard navigation.
 *
 * @example
 * ```vue
 * <GsChip color="normal">Online</GsChip>
 * ```
 */
import { TagGroupItem, TagGroupItemText } from 'reka-ui'
import { injectInChipList } from './defaults'
import styles from './styles.module.css'
import type { GsChipProps } from './types'
import { useChipStyle } from './use-chip-style'
import { useId } from 'vue'

const { value, textValue, color: colorProp, size: sizeProp } = defineProps<GsChipProps>()

defineSlots<{
  /** Chip content: text, optionally with a `GsIcon`. */
  default?: () => unknown
}>()

const inList = injectInChipList()
// Name the row from its text only, not from the remove button inside it.
const textId = useId()
const { color, size } = useChipStyle(() => ({ color: colorProp, size: sizeProp }))
</script>

<template>
  <TagGroupItem
    v-if="inList && value !== undefined"
    :value="value"
    :text-value="textValue"
    :aria-labelledby="textValue ? undefined : textId"
    :class="['group/chip', styles.chip]"
    :data-color="color"
    :data-size="size"
  >
    <TagGroupItemText :id="textId"><slot /></TagGroupItemText>
  </TagGroupItem>
  <div v-else :class="['group/chip', styles.chip]" :data-color="color" :data-size="size">
    <slot />
  </div>
</template>
