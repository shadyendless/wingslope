<script setup lang="ts">
/**
 * @internal Small "clear value" button used inside fields (inputs, search, combobox).
 *
 * Kept out of the tab order: keyboard users clear a field with its own keyboard interaction
 * (e.g. Escape), so the button would be a redundant tab stop.
 */
import CancelFillIcon from '@wingbrace/glideslope-icons/cancel-fill'
import GsIcon from '../icon/GsIcon.vue'
import styles from './clear.module.css'

const { label = 'Clear' } = defineProps<{
  /** Accessible label. */
  label?: string
}>()
</script>

<template>
  <button type="button" tabindex="-1" :aria-label="label" :class="styles.clearButton">
    <GsIcon size="small"><CancelFillIcon /></GsIcon>
  </button>
</template>
