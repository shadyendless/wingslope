<script setup lang="ts">
/**
 * A chip with a remove button. Use inside a `GsChipList` that listens to `@remove`; removing is
 * also possible with Backspace or Delete when the chip has focus.
 */
import CancelFillIcon from '@wingbrace/glideslope-icons/cancel-fill'
import { TagGroupItem, TagGroupItemDelete, TagGroupItemText } from 'reka-ui'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'
import type { GsDeletableChipProps } from './types'
import { useChipStyle } from './use-chip-style'
import { useId } from 'vue'

const {
  value,
  disabled = false,
  textValue,
  color: colorProp,
  size: sizeProp,
  classes,
} = defineProps<GsDeletableChipProps>()

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
    :class="['group/chip', styles.chip, styles.deletable]"
    :data-color="color"
    :data-size="size"
  >
    <TagGroupItemText :id="textId"><slot /></TagGroupItemText>
    <TagGroupItemDelete as-child>
      <GsButton
        variant="icon"
        color="mono-muted"
        :size="size"
        :class="[styles.remove, classes?.remove]"
      >
        <GsIcon :size="size === 'small' ? 'xsmall' : 'small'"><CancelFillIcon /></GsIcon>
      </GsButton>
    </TagGroupItemDelete>
  </TagGroupItem>
</template>
