<script setup lang="ts">
/**
 * The header of a `GsKanban` board: a `GsKanbanHeaderTitle` and `GsKanbanHeaderActions` on one
 * row. `GsKanbanCardHeader` uses the same layout inside a card.
 */
import styles from './styles.module.css'

defineSlots<{
  /** The title and actions. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.header"><slot /></div>
</template>
