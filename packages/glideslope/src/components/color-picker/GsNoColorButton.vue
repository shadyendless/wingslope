<script setup lang="ts">
/**
 * An icon button for choosing "no color", as used by `GsColorPicker` with `allow-empty`. Use it to
 * build your own color controls; handle `@click` to clear the color.
 *
 * @example
 * ```vue
 * <GsNoColorButton :active="color === undefined" @click="color = undefined" />
 * ```
 */
import NoneIcon from '@wingbrace/glideslope-icons/none'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'
import type { GsNoColorButtonProps } from './types'

const { active = undefined, disabled = false } = defineProps<GsNoColorButtonProps>()
</script>

<template>
  <GsButton
    variant="icon"
    size="xsmall"
    aria-label="No color"
    :aria-pressed="active"
    :disabled="disabled"
    :class="styles.customTrigger"
  >
    <GsIcon><NoneIcon /></GsIcon>
  </GsButton>
</template>
