<script setup lang="ts">
/** The body of a `GsDialog`. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
