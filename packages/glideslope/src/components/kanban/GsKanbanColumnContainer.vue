<script setup lang="ts">
/** The row of `GsKanbanColumn`s on a board. It scrolls sideways when the columns don't fit. */
import styles from './styles.module.css'

defineSlots<{
  /** The columns. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.columnItems"><slot /></div>
</template>
