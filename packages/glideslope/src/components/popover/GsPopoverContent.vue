<script setup lang="ts">
/** Body text of a `GsPopover`. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
