<script setup lang="ts">
/** The content of a card, below its header. */
import styles from './styles.module.css'

defineSlots<{
  /** The card's content. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.cardBody"><slot /></div>
</template>
