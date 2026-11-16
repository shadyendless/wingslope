<script setup lang="ts">
/** The title of a card. */
import styles from './styles.module.css'

defineSlots<{
  /** The title text. */
  default?: () => unknown
}>()
</script>

<template>
  <span :class="styles.cardTitle"><slot /></span>
</template>
