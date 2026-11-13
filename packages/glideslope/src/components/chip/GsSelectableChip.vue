<script setup lang="ts">
/**
 * A chip that can be selected, for filters and toggles. Use inside a `GsChipList` with
 * `selection-mode="single"` or `"multiple"`; the list's `v-model` holds the selected values.
 */
import { TagGroupItem, TagGroupItemText } from 'reka-ui'
import styles from './styles.module.css'
import type { GsChipItemProps } from './types'
import { useChipStyle } from './use-chip-style'
import { useId } from 'vue'

const {
  value,
  disabled = false,
  textValue,
  color: colorProp,
  size: sizeProp,
} = defineProps<GsChipItemProps>()

defineSlots<{
  /** Chip content. */
  default?: () => unknown
}>()

// Name the row from its text only, not from the remove button inside it.
const textId = useId()
const { color, size } = useChipStyle(() => ({ color: colorProp, size: sizeProp }))
</script>

<template>
  <TagGroupItem
    :value="value"
    :disabled="disabled"
    :text-value="textValue"
    :aria-labelledby="textValue ? undefined : textId"
    :class="['group/chip', styles.chip, styles.selectable]"
    :data-color="color"
    :data-size="size"
  >
    <TagGroupItemText :id="textId"><slot /></TagGroupItemText>
  </TagGroupItem>
</template>
